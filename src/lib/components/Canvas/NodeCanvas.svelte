<script lang="ts">
	import { createEventDispatcher, onDestroy, onMount } from "svelte";
	import { nodeStore } from "../stores";
	import type { NodeData } from "../types";

    export let initWidth: number = 0;
    export let initHeight: number = 0;
    export let backgroundColor: string = 'rgba(230,230,230,0.5)';
    export let hasChildren = false;
    export let parentId: string | undefined = undefined;

    let width: number = initWidth;
    let height: number = initHeight;
    let nodes: NodeData[] = [];
    let initialized: boolean = false;

    /*
    $: { ({ width, height } = calculateCanvasSize()); }
    */
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
        if (!hasChildren) return { width: initWidth, height: initHeight };

        const nodePositions = nodes.map((node) => {
            if ((node.parent === parentId) || (!parentId && !node.parent))
            return {
                x: node.position.x + node.size.width,
                y: node.position.y + node.size.height,
            };
            else return { x: 0, y: 0 };
        });

        const maxX = Math.max(...nodePositions.map((pos) => pos.x));
        const maxY = Math.max(...nodePositions.map((pos) => pos.y));

        const size = {
            width: maxX + 10,
            height: maxY + 10,
        };
        return size;
    };
</script>

<div style="position: relative; top: 0; left: 0; width: 100%; height: 100%; background:{backgroundColor};">
    <slot />
</div>
