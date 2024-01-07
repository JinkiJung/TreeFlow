<script lang="ts">
	import { createEventDispatcher, onDestroy, onMount } from "svelte";
	import { nodeStore } from "../stores";
	import type { NodeData } from "../types";

    export let backgroundColor: string = 'rgba(230,230,230,0.5)';
    export let parentId: string | undefined = undefined;

    let nodes: NodeData[] = [];
    let focused: boolean = false;
    /*
    $: { ({ width, height } = calculateCanvasSize()); }
    */
    const unsubscribeNodeStore = nodeStore.subscribe((value) => {
        nodes = value;
    });

    onDestroy(() => {
        unsubscribeNodeStore();
    });
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div style="position: relative; top: 0; left: 0; width: 100%; height: 100%; background:{backgroundColor};"
    class="{focused ? 'focused' : ''}">
    <slot />
</div>

<style>
    .focused {
        outline: 2px solid red;
    }
</style>