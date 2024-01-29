<script lang="ts">
    import { createEventDispatcher } from 'svelte';
	import { EdgeLinkTypes, type EdgeLinkData, type NodeData } from "../types";

    export let data: EdgeLinkData;
    export let edgelinkSize: number = 0;
    export let node: NodeData;
    export let type: EdgeLinkTypes = EdgeLinkTypes.Start;

    const dispatch = createEventDispatcher<{
		linkstart: { node: NodeData; type: EdgeLinkTypes; event: MouseEvent | TouchEvent };
        linkend: { node: NodeData; type: EdgeLinkTypes; event: MouseEvent | TouchEvent };
        linkoverlap: { node: NodeData; type: EdgeLinkTypes; event: MouseEvent | TouchEvent };
	}>();
</script>

<div class="p-0"
    role="button"
    style="height: {edgelinkSize}px; border: {data.selected ? 2: 1}px solid {data.selected? 'red' : 'black'}; user-select: none; box-sizing: border-box;"
    on:mousedown={(event) => dispatch('linkstart', { node, type, event })}
    on:mouseup={(event) => dispatch('linkend', { node, type, event })}
    on:mouseenter={(event) => dispatch('linkoverlap', { node, type, event })}
    tabindex="0"
>
    {type.toString()}
</div>