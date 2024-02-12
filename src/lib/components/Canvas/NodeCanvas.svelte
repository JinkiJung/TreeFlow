<script lang="ts">
	import { createEventDispatcher, onDestroy, onMount } from "svelte";
	import { nodeStore } from "../stores";
	import type { NodeData } from "../types";
    import ShortUniqueId from "short-unique-id";
	import { NODECANVAS_SURFIX } from "../constant";

    export let backgroundColor: string = 'rgba(230,230,230,0.1)';
    export let owningNode = '';
    export let width= 0;
    export let height= 0;
    let nodes: NodeData[] = [];
    let focused: boolean = false;
    
    $: id = NODECANVAS_SURFIX + owningNode;
    
    const unsubscribeNodeStore = nodeStore.subscribe((value) => {
        nodes = value;
    });

    onDestroy(() => {
        unsubscribeNodeStore();
    });


</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
    id={id}
    style="position: relative; top: 0; left: 0; width: {width}px; height: {height}px; background:{backgroundColor};"
    class="nodecanvas">
    <slot />
</div>

<style>
    *:after, *:before{
		box-sizing: content-box !important;
	}
</style>