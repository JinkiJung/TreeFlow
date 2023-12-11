<script lang="ts">
	import { onMount } from "svelte";
	import Canvas from "../Canvas/Canvas.svelte";
	import EdgeCanvas from "../Canvas/EdgeCanvas.svelte";
	import NodeCanvas from "../Canvas/NodeCanvas.svelte";
	import { Edge } from "../Edge";
	import DefaultNode from "../Node/DefaultNode.svelte";
	import { edgeStore, nodeStore } from "../stores";
	import { getEventPosition, type EdgeData, type NodeData } from "../types";
	import { pauseEvent, updateAllEdgeEndpoints } from "../types/dom";
    import type { HiergramProps } from "./types";

    //type $$Props = HiergramProps;
    
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

	let offsetX = 0;
	let offsetY = 0;
	let drag = false;

	const handleMousedown = (e: CustomEvent<{ node: NodeData; event: MouseEvent | TouchEvent; }>) => {
		pauseEvent(e.detail.event);
		drag = true;
		selectNode(e.detail.node);
		let selected = e.detail.node;
		let pos = getEventPosition(e.detail.event);
		offsetX = pos.x - selected.position.x;
		offsetY = pos.y - selected.position.y;
		/*
		if (selectedNodeIds.length) {
			let selected: NodeData = nodesProp.filter((node) => selectedNodeIds.includes(node.id!)).pop()!;
			let pos = getEventPosition(e.detail.event);
			offsetX = pos.x - selected.position.x;
			offsetY = pos.y - selected.position.y;
		}
		*/
	}

	const handleMousemove = (e: CustomEvent<{ node: NodeData; event: MouseEvent | TouchEvent; }>) => {
		pauseEvent(e.detail.event);
		if (drag && selectedNodeIds.length) {
			let selected: NodeData = nodes.filter((node) => selectedNodeIds.includes(node.id!)).pop()!;
			let pos = getEventPosition(e.detail.event);
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

	const handleNodeClick = (e: CustomEvent<{ node: NodeData; event: MouseEvent | TouchEvent; }>) => {
		//selectNode(e.detail.node);
	}

	const selectNode = (node: NodeData) => {
		if(selectedNodeIds.length && selectedNodeIds[0] === node.id) {
			selectedNodeIds = [];
		} else {
			selectedNodeIds = [node.id!];
		}
	};

	const handleMouseup = () => {
		drag = false;

	}
</script>
<div>
    <Canvas width={600} height={400}>
        <EdgeCanvas>
            {#each edges as edge}
                <Edge edge={edge} />
            {/each}
        </EdgeCanvas>
        <NodeCanvas>
            {#each nodes as node}
                <DefaultNode node = {node}
					on:nodeclick={handleNodeClick}
					on:nodedragstart={handleMousedown}
					on:nodedragstop={handleMouseup}
					on:nodemousemove={handleMousemove}
					/>
            {/each}
        </NodeCanvas>
        
    </Canvas>
</div>