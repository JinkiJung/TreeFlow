<script lang="ts">
	import { onDestroy, onMount } from "svelte";
	import EdgeCanvas from "../Canvas/EdgeCanvas.svelte";
	import NodeCanvas from "../Canvas/NodeCanvas.svelte";
	import { Edge } from "../Edge";
	import DefaultNode from "../Node/DefaultNode.svelte";
	import { edgeStore, edgelinkSize, nodeStore } from "../stores";
	import { getEventPosition, type EdgeData, type NodeData, type XYPosition, EdgeLinkTypes } from "../types";
	import { getEdgeEndpoint, isRightMB, pauseEvent, updateAllEdgeEndpoints } from "../types/dom";

    //type $$Props = HiergramProps;
    
	export let width: number = 0;
	export let height: number = 0;

	let container: HTMLDivElement;
	let containerBounds: DOMRect | null = null;
	let nodes: NodeData[];
	let edges: EdgeData[];
	let newNodeTemplate: NodeData = {
		position: {
			x: 0,
			y: 0,
		},
		size: {
			width: 160,
			height: 60,
		},
		data: {
			label: 'node',
		}
	};

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
	let drag = false;
	let newEdgeCandidate: EdgeData | null = null;

	let dragStart: XYPosition = { x: 0, y: 0 };

	const handleMousedown = (e: CustomEvent<{ node: NodeData; event: MouseEvent | TouchEvent; }>) => {
		pauseEvent(e.detail.event);
		if (isRightMB(e.detail.event as MouseEvent))
			return ;
		containerBounds = container.getBoundingClientRect();
		drag = true;
		selectNode(e.detail.node);
		let selected = e.detail.node;
		let pos = getEventPosition(e.detail.event, containerBounds);
		offsetX = pos.x - selected.position.x;
		offsetY = pos.y - selected.position.y;
		dragStart = pos;
		document.onmousemove = handleMousemove;
		document.onmouseleave = handleMouseleave;
	}

	const handleMouseleave = (event: MouseEvent | TouchEvent) => {
		pauseEvent(event);
		document.onmousemove = null;
		document.onmouseenter = handleMouseEnter;
	}

	const handleMouseEnter = (event: MouseEvent | TouchEvent) => {
		pauseEvent(event);
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
		pauseEvent(event);
		if (drag) {
			containerBounds = container.getBoundingClientRect();
			let pos = getEventPosition(event, containerBounds);
			updateNodes(pos);
			updateNewEdge(pos);
		}
	}

	const selectNode = (node: NodeData) => {
		selectedNodeIds = [node.id!];
	};

	const handleMouseup = () => {
		drag = false;
		document.onmousemove = null;
		document.onmouseleave = null;
		document.onmouseenter = null;
		selectedNodeIds = [];
		if (newEdge) {
			newEdge = null;
		}
	}

	const edgeLinkStart = (event: CustomEvent<{ node: NodeData; type: EdgeLinkTypes; event: MouseEvent | TouchEvent; }>) => {
		drag = true;

		//selectNode(e.detail.node);
		pauseEvent(event.detail.event);
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
		drag = false;
		//selectNode(e.detail.node);
		pauseEvent(event.detail.event);
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
		pauseEvent(event.detail.event);
		if (drag && newEdge) {
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

	export const addNode = () => {
		nodeStore.set([...nodes, 
		{...newNodeTemplate,
			id: 'node' + (nodes.length + 1),
			data: {
				label: 'node ' + (nodes.length + 1),
			}
		}]);
		console.log('addNode', nodes);
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
					backgroundColor={"rgba(220,220,220,1)"}
					{handleMousedown}
					{handleMouseup}
					{edgeLinkStart}
					{edgeLinkEnd}
					{edgeLinkEnter}
					children={nodes.filter((n) => n.parent === node.id)}
					/>
			{/if}
			{/each}
		</NodeCanvas>  
	</div>
</div>
