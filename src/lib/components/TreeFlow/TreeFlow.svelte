<script lang="ts">
	import { onDestroy, onMount } from "svelte";
	import EdgeCanvas from "../Canvas/EdgeCanvas.svelte";
	import NodeCanvas from "../Canvas/NodeCanvas.svelte";
	import { Edge } from "../Edge";
	import DefaultNode from "../Node/DefaultNode.svelte";
	import { edgeStore, edgelinkSize, nodeStore } from "../stores";
	import { getEventPosition, type EdgeData, type NodeData, type XYPosition, EdgeLinkTypes } from "../types";
	import { getEdgeEndpoint, isRightMB, updateAllEdgeEndpoints } from "../types/dom";
	import { newNode } from "$lib/interaction/newNode";
    
	export let width: number = 0;
	export let height: number = 0;

	let container: HTMLDivElement;
	let containerBounds: DOMRect | null = null;
	let nodes: NodeData[];
	let edges: EdgeData[];
	let newNodeTemplate: NodeData = newNode();

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

	let selectedNodeIds: string[] = [];
	let newEdge: EdgeData | null = null;
	
	let offsetX = 0;
	let offsetY = 0;
	let dragNode = false;
	let dragEdgeLink = false;
	let newEdgeCandidate: EdgeData | null = null;

	let dragStart: XYPosition = { x: 0, y: 0 };

	const handleMousedown = (event: CustomEvent<{ node: NodeData; event: MouseEvent | TouchEvent; }>) => {
		event.detail.event.stopPropagation();
		if (isRightMB(event.detail.event as MouseEvent) || dragEdgeLink)
			return ;
		containerBounds = container.getBoundingClientRect();
		dragNode = true;
		selectNode(event.detail.node);
		let nodeSelected = event.detail.node;
		let pos = getEventPosition(event.detail.event, containerBounds);
		offsetX = pos.x - nodeSelected.position.x;
		offsetY = pos.y - nodeSelected.position.y;
		dragStart = pos;
		document.onmousemove = handleMousemove;
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
			document.onmousemove = handleMousemove;
		}
	}

	const updateNodes = (pos: XYPosition) => {
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

	const handleMousemove = ( event: MouseEvent | TouchEvent) => {
		event.stopPropagation();
		containerBounds = container.getBoundingClientRect();
		let pos = getEventPosition(event, containerBounds);
		if (dragEdgeLink && newEdge) {
			updateNewEdge(pos);
		}
		else if (dragNode) {
			updateNodes(pos);
		}
	}

	const selectNode = (node: NodeData) => {
		selectedNodeIds = [node.id!];
	};

	const handleMouseup = () => {
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

	const edgeLinkStart = (event: CustomEvent<{ node: NodeData; type: EdgeLinkTypes; event: MouseEvent | TouchEvent; }>) => {
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

		document.onmousemove = handleMousemove;
		document.onmouseleave = handleMouseleave;
		document.onmouseup = handleMouseup;
	}

	const edgeLinkEnd = (event: CustomEvent<{ node: NodeData; type: EdgeLinkTypes; event: MouseEvent | TouchEvent; }>) => {
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

	const edgeLinkEnter = (event: CustomEvent<{ node: NodeData; type: EdgeLinkTypes; event: MouseEvent | TouchEvent; }>) => {
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
					on:nodedragstart={handleMousedown}
					on:nodedragstop={handleMouseup}
					{handleMousedown}
					{handleMouseup}
					{edgeLinkStart}
					{edgeLinkEnd}
					{edgeLinkEnter}
					{addChild}
					/>
			{/if}
			{/each}
		</NodeCanvas>  
	</div>
</div>
