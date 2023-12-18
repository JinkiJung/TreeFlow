<script lang="ts">
	import { onMount } from "svelte";
	import EdgeCanvas from "../Canvas/EdgeCanvas.svelte";
	import NodeCanvas from "../Canvas/NodeCanvas.svelte";
	import { Edge } from "../Edge";
	import DefaultNode from "../Node/DefaultNode.svelte";
	import { edgeStore, edgelinkSize, nodeStore } from "../stores";
	import { getEventPosition, type EdgeData, type NodeData, type XYPosition, EdgeLinkTypes } from "../types";
	import { pauseEvent, updateAllEdgeEndpoints } from "../types/dom";
    import type { HiergramProps } from "./types";
	import BezierEdge from "../Edge/BezierEdge.svelte";

    //type $$Props = HiergramProps;
    
	export let width: number = 0;
	export let height: number = 0;

	let container: HTMLDivElement;
	let containerBounds: DOMRect | null = null;
	let nodes: NodeData[];
	let edges: EdgeData[];

	nodeStore.subscribe((value) => {
		nodes = value;
		if (edges && edges.length) {
			const updated = updateAllEdgeEndpoints(edges, nodes);
			edgeStore.set(updated);
		}
	});

	edgeStore.subscribe((value) => {
		edges = value;
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

	let dragStart: XYPosition = { x: 0, y: 0 };

	const handleMousedown = (e: CustomEvent<{ node: NodeData; event: MouseEvent | TouchEvent; }>) => {
		pauseEvent(e.detail.event);
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

	const handleMousemove = ( event: MouseEvent | TouchEvent) => {
		pauseEvent(event);
		containerBounds = container.getBoundingClientRect();
		if (drag && selectedNodeIds.length) {
			let selected: NodeData = nodes.filter((node) => selectedNodeIds.includes(node.id!)).pop()!;
			let pos = getEventPosition(event, containerBounds);
			
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
		} else if (drag && newEdge) {
			let pos = getEventPosition(event, containerBounds);
			newEdge.to = {
				x: pos.x,
				y: pos.y,
			};
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
			//edgeStore.set([...edges, newEdge]);
			newEdge = null;
		}
	}


const edgeLinkStart = (event: CustomEvent<{ node: NodeData; type: EdgeLinkTypes; event: MouseEvent | TouchEvent; }>) => {
	drag = true;
	//selectNode(e.detail.node);
	pauseEvent(event.detail.event);
	containerBounds = container.getBoundingClientRect();
	newEdge = {
		id: 'edge1:',
		fromId: event.detail.node.id,
		from: {
			x: event.detail.node.position.x + edgelinkSize / 2,
			y: event.detail.node.position.y + edgelinkSize / 2,
		},
		data: {
			label: 'edge 1',
		}
	};

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
}

</script>

<div>
	<div bind:this={container} style="position: relative; width: {width}px; height: {height}px;">
		<EdgeCanvas>
			{#each edges as edge}
				<Edge edge={edge} />
			{/each}
			{#if newEdge}
				<BezierEdge edge={newEdge} />
			{/if}
		</EdgeCanvas>
		<NodeCanvas>
			{#each nodes as node}
				<DefaultNode 
					node = {node} 
					selected={selectedNodeIds.includes(node.id)}
					on:nodedragstart={handleMousedown}
					on:nodedragstop={handleMouseup}
					edgeLinkStart={edgeLinkStart}
					edgeLinkEnd={edgeLinkEnd}
					/>
			{/each}
		</NodeCanvas>  
	</div>
</div>
