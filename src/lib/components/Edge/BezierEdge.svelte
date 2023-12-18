<script lang='ts'>
    import { onMount } from 'svelte';
	import type { EdgeData, XYPosition } from '../types';
    
    export let edge: EdgeData;
    
    let x1 = edge.from?.x!;
    let y1 = edge.from?.y!;
    let x2 = edge.to?.x!;
    let y2 = edge.to?.y!;

    $: {
        x1 = edge.from?.x!;
        y1 = edge.from?.y!;
        x2 = edge.to?.x!;
        y2 = edge.to?.y!;
        
        if (path && edge.from && edge.to) {
            path.setAttribute('d', getBezierPath(x1, y1, x2, y2));
        }
    }
    let path: any;

    onMount(() => {
        if (edge.from && edge.to) {
            path.setAttribute('d', getBezierPath(x2, y2, x1, y1));
        }
    });
    
    const getBezierPath = (x4: number, y4: number, x1: number, y1: number) => {    
        const bezierWeight = 0.675;
        let dx = Math.abs(x4 - x1) * bezierWeight;
        let x2 = x1 - dx;
        let x3 = x4 + dx;
        return `M${x1} ${y1} C ${x2} ${y1} ${x3} ${y4} ${x4} ${y4}`;
    }

</script>

<path bind:this={path} stroke="gray" fill="transparent" ></path>