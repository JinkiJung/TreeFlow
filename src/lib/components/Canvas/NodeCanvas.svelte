<script lang="ts">
	import { createEventDispatcher, onDestroy, onMount } from "svelte";
	import { nodeStore } from "../stores";
	import type { NodeData } from "../types";
    import ShortUniqueId from "short-unique-id";

    export let backgroundColor: string = 'rgba(230,230,230,0.0)';
    let id = (new ShortUniqueId({ length: 10 })).rnd();
    let nodes: NodeData[] = [];
    let focused: boolean = false;
    
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
    style="position: relative; top: 0; left: 0; width: 100%; height: 100%; background:{backgroundColor};"
    class="nodecanvas">
    <slot />
</div>

<style>
    
</style>