<script lang="ts">
	import Canvas from "../Canvas/Canvas.svelte";
	import EdgeCanvas from "../Canvas/EdgeCanvas.svelte";
	import NodeCanvas from "../Canvas/NodeCanvas.svelte";
	import { Edge } from "../Edge";
	import DefaultNode from "../Node/DefaultNode.svelte";
	import { nodes } from "../stores";
	import { getEventPosition, type NodeData } from "../types";
    import type { HiergramProps } from "./types";

    type $$Props = HiergramProps;

    export let id: $$Props['id'] = '1';
    export let nodesProp: $$Props['nodesProp'];
    export let edges: $$Props['edges'];
    
	let nodeData: NodeData[];

	nodes.subscribe((value) => {
		nodeData = value;
		console.log(nodeData);
	});

	

	let selectedNodeIds: string[] = [];

	$: {
		
	}
	let offsetX = 0;
	let offsetY = 0;
	let drag = false;

	function handleMousedown(event: MouseEvent | TouchEvent) {
		drag = true;
		if (selectedNodeIds.length) {
			let selected: NodeData = nodesProp.filter((node) => selectedNodeIds.includes(node.id!)).pop()!;
			let pos = getEventPosition(event);
			offsetX = pos.x - selected.position.x;
			offsetY = pos.y - selected.position.y;
		}
	}

	function handleMousemove(e: CustomEvent<{ node: NodeData; event: MouseEvent | TouchEvent; }>) {
		if (drag && selectedNodeIds.length) {
			let selected: NodeData = nodesProp.filter((node) => selectedNodeIds.includes(node.id!)).pop()!;
			let pos = getEventPosition(e.detail.event);
			nodes.set(nodesProp.map((node) => {
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

	function handleNodeClick(e: CustomEvent<{ node: NodeData; event: MouseEvent | TouchEvent; }>) {
		if(selectedNodeIds.length && selectedNodeIds[0] === e.detail.node.id) {
			selectedNodeIds = [];
		} else {
			selectedNodeIds = [e.detail.node.id!];
		}
		console.log(selectedNodeIds);
	}

	function handleMouseup() {
		drag = false;
	}
</script>
<div>
    <Canvas width={600} height={400}>
        <EdgeCanvas>
            {#each edges as edge}
                <Edge id={edge.id} from={edge.from} to={edge.to} />
            {/each}
        </EdgeCanvas>
        <NodeCanvas handleMousedown={handleMousedown}>
            {#each nodeData as node}
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