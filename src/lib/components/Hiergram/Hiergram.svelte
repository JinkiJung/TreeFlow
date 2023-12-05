<script lang="ts">
	import Canvas from "../Canvas/Canvas.svelte";
	import EdgeCanvas from "../Canvas/EdgeCanvas.svelte";
	import NodeCanvas from "../Canvas/NodeCanvas.svelte";
	import { Edge } from "../Edge";
	import DefaultNode from "../Node/DefaultNode.svelte";
    import type { HiergramProps } from "./types";

    type $$Props = HiergramProps;

    export let id: $$Props['id'] = '1';
    export let nodes: $$Props['nodes'];
    export let edges: $$Props['edges'];
    
</script>
<div>
    <Canvas width={600} height={400}>
        <EdgeCanvas>
            {#each edges as edge}
                <Edge id={edge.id} from={edge.from} to={edge.to} />
            {/each}
        </EdgeCanvas>
        <NodeCanvas>
            {#each nodes as node}
                <DefaultNode id={node.id} x={node.position.x} y={node.position.y} width={node.size.width} height={node.size.height} />
            {/each}
        </NodeCanvas>
        
    </Canvas>
</div>