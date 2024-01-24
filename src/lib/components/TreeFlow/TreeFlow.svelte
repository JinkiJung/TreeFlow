<script lang="ts">
	import { onDestroy, onMount } from "svelte";
	import EdgeCanvas from "../Canvas/EdgeCanvas.svelte";
	import NodeCanvas from "../Canvas/NodeCanvas.svelte";
	import { Edge } from "../Edge";
	import { edgeStore, sectionHeight, nodeStore } from "../stores";
	import { getEventPosition, type EdgeData, type NodeData, type XYPosition, EdgeLinkTypes, ResizeDirection, type Size } from "../types";
	import { getEdgeEndpoint, isRightMB, updateAllEdgeEndpoints } from "../types/dom";
	import { newNode } from "$lib/interaction/newNode";
	import { DefaultNode } from "../Node";
	import type { ResizableContainer } from "../Container";
	import type { Container } from "../types/container";
	import { NODECANVAS_SURFIX } from "../constant";
    
	export let width: number = 0;
	export let height: number = 0;

	let container: HTMLDivElement;
	let containerBounds: DOMRect | null = null;
	let nodes: NodeData[];
	let edges: EdgeData[];
	let newNodeTemplate: NodeData = newNode();

	let selectedNodeIds: string[] = [];
	let newEdge: EdgeData | null = null;
	let hoveredNodeCanvas: HTMLElement | null = null;

	let offsetX = 0;
	let offsetY = 0;
	let offsetXPlain = 0;
	let offsetYPlain = 0;
	let offsetWidth = 0;
	let offsetHeight = 0;
	let dragNode = false;
	let dragEdgeLink = false;
	let dragContainer = false;
	let resizeDirection: ResizeDirection = ResizeDirection.None;
	let newEdgeCandidate: EdgeData | null = null;
	let nodeCanvasColor: string = 'rgba(230,230,230,0.0)';

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

	const dragNodeMove = ( event: MouseEvent | TouchEvent) => {
		event.stopPropagation();
		containerBounds = container.getBoundingClientRect();
		let pos = getEventPosition(event, containerBounds);
		if (dragEdgeLink && newEdge) {
			updateNewEdge(pos);
		}
		else if (dragNode) {
			updateNodePosition(pos);
			showParent(event as MouseEvent);
		}
	}

	const showParent = ( event: MouseEvent) => {
		event.stopPropagation();
		containerBounds = container.getBoundingClientRect();
		let pos = getEventPosition(event, containerBounds);
		// pick top overlaid nodecanvas
		const nodeCanvas = pickTopNodeCanvas(event.clientX, event.clientY, selectedNodeIds[0]);
		// change nodeCanvas background color to blue
		if (nodeCanvas) {
			if (hoveredNodeCanvas !== nodeCanvas) {
				hoveredNodeCanvas?.style.setProperty('box-shadow', '0px 0px 0px 0px #f00');
			}
			nodeCanvas?.style.setProperty('box-shadow', '0px 0px 0px 4px #f00');
			hoveredNodeCanvas = nodeCanvas;
		}
	}

	// filter currently dragging element
	const isNotMyNodeCanvas = (id: string, nodeCanvas: HTMLElement) => {
		return nodeCanvas.getAttribute('id') !== NODECANVAS_SURFIX + id;
	}

	const pickTopNodeCanvas = (offsetX: number, offsetY: number, id: string): HTMLElement | undefined => {
		// filter elements that are not nodecanvas
		const elements = document.elementsFromPoint(offsetX, offsetY);
		return Array.from(elements).filter((element) => isNotMyNodeCanvas(id, element as HTMLElement) && element.classList.contains('nodecanvas')).shift() as HTMLElement;
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
		if (hoveredNodeCanvas) {
			console.log(hoveredNodeCanvas.getAttribute('id'));
			hoveredNodeCanvas.style.setProperty('box-shadow', '0px 0px 0px 0px #f00');
			hoveredNodeCanvas = null;
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

	const linkEdgeOverlap = (event: CustomEvent<{ node: NodeData; type: EdgeLinkTypes; event: MouseEvent | TouchEvent; }>) => {
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
		offsetY = pos.y - selected.position.y - selected.size.height;
		offsetYPlain = pos.y;
		offsetHeight = selected.size.height;
		offsetXPlain = pos.x;
		offsetWidth = selected.size.width;

		document.onmousemove = resizeMove;
		//document.onmouseleave = handleMouseleave;
		document.onmouseup = resizeStop;
	}

	const resizeMove = ( event: MouseEvent | TouchEvent) => {
		event.stopPropagation();
		containerBounds = container.getBoundingClientRect();
		let pos = getEventPosition(event, containerBounds);
		if (dragContainer) {
			let selected: NodeData = nodes.filter((node) => selectedNodeIds.includes(node.id!)).pop()!;
			switch(resizeDirection) {
				case ResizeDirection.Top:
					// update node's y and height
					updateNodePosAndSize(selected, {
							width:  selected.size.width,
							height: offsetHeight - (pos.y - offsetYPlain),
						},
						{
							x: selected.position.x,
							y: pos.y - offsetY - offsetHeight,
						}
						);
					break;
				case ResizeDirection.Bottom:
					// update node's height
					updateNodePosAndSize(selected, {
							width:  selected.size.width,
							height: pos.y - offsetY - selected.position.y,
						});
					break;
				case ResizeDirection.Left:
					// update node's x and width
					updateNodePosAndSize(selected, {
							width:  offsetWidth - (pos.x - offsetXPlain),
							height: selected.size.height,
						},
						{
							x: pos.x - offsetX - offsetWidth,
							y: selected.position.y,
						}
						);
					break;
				case ResizeDirection.Right:
					// update node's width
					updateNodePosAndSize(selected, {
							width: pos.x - offsetX - selected.position.x,
							height: selected.size.height,
						});
					break;
				default:
					break;
			}
		}
	}

	const updateNodePosAndSize = (selected: NodeData, size: Size, pos?: XYPosition) => {
		if (selectedNodeIds.length) {
			nodeStore.set(nodes.map((node) => {
				if (selected.id === node.id) {
					return {
						...selected,
						position: pos? pos : selected.position,
						size,
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
			depth: parent?.depth ? parent.depth + 1 : 0,	
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
				<Edge {edge} />
			{/each}
			{#if newEdge}
				<Edge edge={newEdge} />
			{/if}
		</EdgeCanvas>
		<NodeCanvas backgroundColor={nodeCanvasColor} owningNode={'root'} height={height}>
			{#each nodes as node}
				{#if node.parent === undefined}
					<DefaultNode
						{node}
						selected={selectedNodeIds.includes(node.id? node.id : '')}
						on:nodedragstart={dragNodeStart}
						on:nodedragstop={dragNodeStop}
						handleMousedown={dragNodeStart}
						{linkEdgeStart}
						{linkEdgeEnd}
						{linkEdgeOverlap}
						{resizeStart}
						{addChild}
					/>
				{/if}
			{/each}
		</NodeCanvas>
	</div>
</div>
