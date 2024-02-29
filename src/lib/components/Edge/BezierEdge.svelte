<script lang='ts'>
    import { onMount } from 'svelte';
	import type { EdgeData, XYPosition } from '../types';
    
    export let edge: EdgeData;
    let path: any;

    let x1 = edge.from?.x!;
    let y1 = edge.from?.y!;
    let x2 = edge.to?.x!;
    let y2 = edge.to?.y!;

    $: {
        if (path && edge.from && edge.to) {
            x1 = edge.from?.x!;
            y1 = edge.from?.y!;
            x2 = edge.to?.x!;
            y2 = edge.to?.y!;
            path.setAttribute('d', getBezierPath(x1, y1, x2, y2));
            /*
            if (edge.from?.x! < edge.to?.x!) {  // horizontal
                x1 = edge.from?.x!;
                y1 = edge.from?.y!;
                x2 = edge.to?.x!;
                y2 = edge.to?.y!;
                path.setAttribute('d', getBezierPath(x1, y1, x2, y2));
            } else if (edge.from?.x! >= edge.to?.x!) { // vertical
                x1 = edge.from?.x!;
                y1 = edge.from?.y!;
                x2 = edge.to?.x!;
                y2 = edge.to?.y!;
                path.setAttribute('d', getBezierPath(x1, y1, x2, y2, false));
            } 
            */
        }
    }

    onMount(() => {
        if (edge.from && edge.to) {
            path.setAttribute('d', getBezierPath(x2, y2, x1, y1));
        }
    });
    
    const getBezierPath = (x4: number, y4: number, x1: number, y1: number, horizontal: boolean = true) => {    
        const bezierWeight = 0.675;
        if (horizontal) {
            let dx = Math.abs(x4 - x1) * bezierWeight;
            let x2 = x1 - dx;
            let x3 = x4 + dx;
            return `M${x1} ${y1} C ${x2} ${y1} ${x3} ${y4} ${x4} ${y4}`;
        } else {
            let dy = Math.abs(y4 - y1) * bezierWeight;
            let y2 = y1 - dy;
            let y3 = y4 + dy;
            return `M${x1} ${y1} C ${x1} ${y2} ${x4} ${y3} ${x4} ${y4}`;
        }
        
    }

</script>

<path bind:this={path} stroke="gray" fill="transparent" ></path>