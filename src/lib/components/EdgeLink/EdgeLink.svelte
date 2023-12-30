<script lang="ts">
    import { createEventDispatcher } from 'svelte';
	import { EdgeLinkTypes, type EdgeLinkData, type NodeData } from "../types";

    export let data: EdgeLinkData;
    export let edgelinkSize: number = 0;
    export let node: NodeData;
    export let type: EdgeLinkTypes = EdgeLinkTypes.Start;

    const dispatch = createEventDispatcher<{
		edgelinkstart: { node: NodeData; type: EdgeLinkTypes; event: MouseEvent | TouchEvent };
        edgelinkend: { node: NodeData; type: EdgeLinkTypes; event: MouseEvent | TouchEvent };
        edgelinkenter: { node: NodeData; type: EdgeLinkTypes; event: MouseEvent | TouchEvent };
	}>();

    console.log(data);
</script>

<div class="p-0"
    role="button"
    style="height: {edgelinkSize}px; border: {data.selected ? 2: 1}px solid {data.selected? 'red' : 'black'}; user-select: none;"
    on:mousedown={(event) => dispatch('edgelinkstart', { node, type, event })}
    on:mouseup={(event) => dispatch('edgelinkend', { node, type, event })}
    on:mouseenter={(event) => dispatch('edgelinkenter', { node, type, event })}
    tabindex="0"
>
    {type.toString()}
</div>