<script lang="ts">
	import { onDestroy, onMount } from "svelte";
	import { nodeStore } from "../stores";
	import type { NodeData } from "../types";

    export let initWidth: number = 0;
    export let initHeight: number = 0;
    export let backgroundColor: string = 'rgba(0,0,0,0.5)';
    export let parentId: string | undefined = undefined;

    let width: number = 0;
    let height: number = 0;
    let nodes: NodeData[] = [];
    let initialized: boolean = false;

    $: { ({ width, height } = calculateCanvasSize()); }

    const unsubscribeNodeStore = nodeStore.subscribe((value) => {
        nodes = value;
        if (initialized) ({ width, height } = calculateCanvasSize());
    });

    onMount(() => {
        ({ width, height } = calculateCanvasSize());
        initialized = true;
    });

    onDestroy(() => {
        unsubscribeNodeStore();
    });

    const calculateCanvasSize = () => {
        const nodePositions = nodes.map((node) => {
            if ((node.parentNode === parentId) || (!parentId && !node.parentNode))
            return {
                x: node.position.x + node.size.width,
                y: node.position.y + node.size.height,
            };
            else return { x: 0, y: 0 };
        });

        const maxX = Math.max(...nodePositions.map((pos) => pos.x));
        const maxY = Math.max(...nodePositions.map((pos) => pos.y));

        return {
            width: maxX > initWidth ? maxX : initWidth,
            height: maxY > initHeight ? maxY : initHeight,
        };
    };
</script>

<div style="position: relative; top: 0; left: 0; width: {width}px; height: {height}px; z-index: 2; background={backgroundColor}">
    <slot />
</div>