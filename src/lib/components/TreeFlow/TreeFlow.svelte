<script lang="ts">
	import { onDestroy, onMount } from "svelte";
	import EdgeCanvas from "../Canvas/EdgeCanvas.svelte";
	import NodeCanvas from "../Canvas/NodeCanvas.svelte";
	import { Edge } from "../Edge";
	import { edgeStore, edgelinkSize, nodeStore } from "../stores";
	import { getEventPosition, type EdgeData, type NodeData, type XYPosition, EdgeLinkTypes, ResizeDirection, type Size } from "../types";
	import { getEdgeEndpoint, isRightMB, updateAllEdgeEndpoints } from "../types/dom";
	import { newNode } from "$lib/interaction/newNode";
	import { DefaultNode } from "../Node";
	import type { ResizableContainer } from "../Container";
    
	export let width: number = 0;
	export let height: number = 0;

	let container: HTMLDivElement;
	let containerBounds: DOMRect | null = null;
	let nodes: NodeData[];
	let edges: EdgeData[];
	let newNodeTemplate: NodeData = newNode();

	let selectedNodeIds: string[] = [];
	let newEdge: EdgeData | null = null;
	
	let offsetX = 0;
	let offsetY = 0;
	let dragNode = false;
	let dragEdgeLink = false;
	let dragContainer = false;
	let resizeDirection: ResizeDirection = ResizeDirection.None;
	let newEdgeCandidate: EdgeData | null = null;

	const unsubscribeNodeStore = nodeStore.subscribe((value) => {
		nodes = value;

		// TODO: OPTIMIZED: if a node without edge is moved
		if (edges && edges.length) {
			const updated = updateAllEdgeEndpoints(edges, nodes);
			edgeStore.set(updated);
		}
	});

	const unsubscribeEdgeStore = edgeStore.subscribe((value) => {
		edges = value;
	});

	onDestroy(() => {
		unsubscribeNodeStore();
		unsubscribeEdgeStore();
	});

	onMount(() => {
        if (edges && nodes) {
            const updated = updateAllEdgeEndpoints(edges, nodes);
			edgeStore.set(updated);
        }
    });

	const dragNodeStart = (event: CustomEvent<{ node: NodeData; event: MouseEvent | TouchEvent; }>) => {
		event.detail.event.stopPropagation();
		if (isRightMB(event.detail.event as MouseEvent) || dragEdgeLink || dragContainer)
			return ;
		containerBounds = container.getBoundingClientRect();
		dragNode = true;
		selectNode(event.detail.node);
		let nodeSelected = event.detail.node;
		let pos = getEventPosition(event.detail.event, containerBounds);
		offsetX = pos.x - nodeSelected.position.x;
		offsetY = pos.y - nodeSelected.position.y;
		document.onmousemove = dragNodeMove;
		document.onmouseleave = handleMouseleave;
	}

	const handleMouseleave = (event: MouseEvent | TouchEvent) => {
		event.stopPropagation();
		document.onmousemove = null;
		document.onmouseenter = handleMouseEnter;
	}

	const handleMouseEnter = (event: MouseEvent | TouchEvent) => {
		event.stopPropagation();
		if((event.type === 'mousedown' || event.type === 'touchstart') && selectedNodeIds.length) {
			document.onmousemove = dragNodeMove;
		}
	}

	const updateNodePosition = (pos: XYPosition) => {
		if (selectedNodeIds.length) {
			let selected: NodeData = nodes.filter((node) => selectedNodeIds.includes(node.id!)).pop()!;
			nodeStore.set(nodes.map((node) => {
				if (selected.id === node.id) {
					return {
						...node,
						position: {
							x: pos.x - offsetX,
							y: pos.y - offsetY,
						}
					} as NodeData; // Explicitly define the type here
				}
				return node;
			}));
		}
	}

	const updateNewEdge = (pos: XYPosition) => {
		if (newEdge) {
			if (newEdge.from) {
				newEdge.to = {
					x: pos.x,
					y: pos.y,
				};
			} else {
				newEdge.from = {
					x: pos.x,
					y: pos.y,
				};
			}
		}
	}

	const dragNodeMove = ( event: MouseEvent | TouchEvent) => {
		event.stopPropagation();
		containerBounds = container.getBoundingClientRect();
		let pos = getEventPosition(event, containerBounds);
		if (dragEdgeLink && newEdge) {
			updateNewEdge(pos);
		}
		else if (dragNode) {
			updateNodePosition(pos);
		}
	}

	const selectNode = (node: NodeData) => {
		selectedNodeIds = [node.id!];
	};

	const dragNodeStop = () => {
		dragNode = false;
		dragEdgeLink = false;
		document.onmousemove = null;
		document.onmouseleave = null;
		document.onmouseenter = null;
		selectedNodeIds = [];
		if (newEdge) {
			newEdge = null;
		}
	}

	const linkEdgeStart = (event: CustomEvent<{ node: NodeData; type: EdgeLinkTypes; event: MouseEvent | TouchEvent; }>) => {
		dragEdgeLink = true;

		//selectNode(e.detail.node);
		event.detail.event.stopPropagation();
		containerBounds = container.getBoundingClientRect();
		if (event.detail.type === EdgeLinkTypes.Start) {
			newEdge = {
				id: 'new',
				fromId: event.detail.node.id,
				fromType: EdgeLinkTypes.Start,
				from: {
					... getEdgeEndpoint(event.detail.node, EdgeLinkTypes.Start)
				},
				data: {
					label: 'edge 1',
				}
			};	
		} else {
			newEdge = {
				id: 'new',
				toId: event.detail.node.id,
				toType: EdgeLinkTypes.End,
				to: {
					... getEdgeEndpoint(event.detail.node, EdgeLinkTypes.End)
				},
				data: {
					label: 'edge 1',
				}
			};
		}

		let pos = getEventPosition(event.detail.event, containerBounds);
		offsetX = pos.x - event.detail.node.position.x;
		offsetY = pos.y - event.detail.node.position.y;

		document.onmousemove = dragNodeMove;
		document.onmouseleave = handleMouseleave;
		document.onmouseup = dragNodeStop;
	}

	const linkEdgeEnd = (event: CustomEvent<{ node: NodeData; type: EdgeLinkTypes; event: MouseEvent | TouchEvent; }>) => {
		dragEdgeLink = false;
		//selectNode(e.detail.node);
		event.detail.event.stopPropagation();
		document.onmousemove = null;
		document.onmouseleave = null;
		document.onmouseenter = null;
		newEdge = null;
		if (newEdgeCandidate) {
			edgeStore.set([...edges, newEdgeCandidate]);
			nodeStore.set(nodes);
			newEdgeCandidate = null;
		}
	}

	const linkEdgeEnter = (event: CustomEvent<{ node: NodeData; type: EdgeLinkTypes; event: MouseEvent | TouchEvent; }>) => {
		event.detail.event.stopPropagation();
		if (dragEdgeLink && newEdge) {
			if (newEdge.fromId !== event.detail.node.id) {
				if (newEdge.fromId && event.detail.type === EdgeLinkTypes.End) {
					// assign toId
					newEdgeCandidate = {
						...newEdge,
						id: newEdge.fromId + '-' + event.detail.node.id,
						toId: event.detail.node.id,
						toType: EdgeLinkTypes.End,
						to: {
							... getEdgeEndpoint(event.detail.node, event.detail.type)
						}
					};
				} else if (newEdge.toId && event.detail.type === EdgeLinkTypes.Start) {
					// assign fromId
					newEdgeCandidate = {
						...newEdge,
						id: newEdge.fromId + '-' + event.detail.node.id,
						fromId: event.detail.node.id,
						fromType: EdgeLinkTypes.Start,
						from: {
							... getEdgeEndpoint(event.detail.node, event.detail.type)
						}
					};
				}
			}
		}
	}

	const resizeStart = (event: CustomEvent<{ nodeId: string, direction: ResizeDirection, event: MouseEvent | TouchEvent; }>) => {
		dragContainer = true;

		event.detail.event.stopPropagation();
		resizeDirection = event.detail.direction;
		selectedNodeIds = [event.detail.nodeId];
		let selected: NodeData = nodes.filter((node) => selectedNodeIds.includes(node.id!)).pop()!;

		containerBounds = container.getBoundingClientRect();

		let pos = getEventPosition(event.detail.event, containerBounds);
		offsetX = pos.x - selected.position.x - selected.size.width;
		offsetY = pos.y - containerBounds.y;

		console.log("start", selected);

		document.onmousemove = resizeMove;
		//document.onmouseleave = handleMouseleave;
		document.onmouseup = resizeStop;
	}

	const resizeMove = ( event: MouseEvent | TouchEvent) => {
		event.stopPropagation();
		console.log((event as MouseEvent).clientX, (event as MouseEvent).clientY);
		containerBounds = container.getBoundingClientRect();
		let pos = getEventPosition(event, containerBounds);
		console.log(pos.x - offsetX);
		if (dragContainer) {
			switch(resizeDirection) {
				case ResizeDirection.Top:
					// update node's y and height
					break;
				case ResizeDirection.Bottom:
					// update node's height
					break;
				case ResizeDirection.Left:
					// update node's x and width
					break;
				case ResizeDirection.Right:
					// update node's width
					updateNodePosAndSize(pos);
					break;
				default:
					break;
			}
		}
	}

	const updateNodePosAndSize = (pos: XYPosition) => {
		if (selectedNodeIds.length) {
			let selected: NodeData = nodes.filter((node) => selectedNodeIds.includes(node.id!)).pop()!;
			nodeStore.set(nodes.map((node) => {
				if (selected.id === node.id) {
					console.log(node);
					return {
						...node,
						size: {
							width: pos.x - offsetX - node.position.x,
							height: node.size.height,
						}
					} as NodeData; // Explicitly define the type here
				}
				return node;
			}));
		}
	}
	
	const resizeStop = () => {
		dragContainer = false;
		document.onmousemove = null;
		document.onmouseleave = null;
		document.onmouseenter = null;
	}

	export const addNode = (parent?: NodeData): NodeData => {
		const newNode = {...newNodeTemplate,
			id: 'node' + (nodes.length + 1),
			data: {
				label: 'node ' + (nodes.length + 1),
			},
			parent: parent?.id,
		};
		nodeStore.set([...nodes, newNode]);
		return newNode;
	}

	const addChild = (node: NodeData): NodeData => {
		const newNode = addNode(node);
		if (node.children && node.children.length > 0) {
			node.children.push(newNode.id!);
		} else {
			node.children = [newNode.id!];
		}
		return newNode;
	}

</script>

<div>
	<div bind:this={container} style="position: relative; width: {width}px; height: {height}px;">
		<EdgeCanvas {width} {height} hasBackground={true}>
			{#each edges as edge}
				<Edge edge={edge} />
			{/each}
			{#if newEdge}
				<Edge edge={newEdge} />
			{/if}
		</EdgeCanvas>
		<NodeCanvas initWidth={width} initHeight={height}>
			{#each nodes as node}
			{#if node.parent === undefined}
				<DefaultNode 
					{node} 
					selected={selectedNodeIds.includes(node.id)}
					on:nodedragstart={dragNodeStart}
					on:nodedragstop={dragNodeStop}
					handleMousedown={dragNodeStart}
					{linkEdgeStart}
					{linkEdgeEnd}
					{linkEdgeEnter}
					{resizeStart}
					{addChild}
					/>
			{/if}
			{/each}
		</NodeCanvas>  
	</div>
</div>
