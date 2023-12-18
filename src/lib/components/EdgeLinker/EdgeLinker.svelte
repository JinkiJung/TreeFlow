<script lang="ts">
    import { createEventDispatcher } from 'svelte';
	import { EdgeLinkTypes, type NodeData } from "../types";

    export let endpointSize: number = 0;
    export let node: NodeData;
    export let type: EdgeLinkTypes = EdgeLinkTypes.Start;

    const dispatch = createEventDispatcher<{
		edgelinkstart: { node: NodeData; type: EdgeLinkTypes; event: MouseEvent | TouchEvent };
        edgelinkend: { node: NodeData; type: EdgeLinkTypes; event: MouseEvent | TouchEvent };
	}>();
</script>

<div class="p-0"
    role="button"
    style="width: {endpointSize}px; height: {endpointSize}px; border: 1px solid black;"
    on:mousedown={(event) => dispatch('edgelinkstart', { node, type, event })}
    on:mouseup={(event) => dispatch('edgelinkend', { node, type, event })}
    tabindex="0"
>
    {type.toString()}
</div>