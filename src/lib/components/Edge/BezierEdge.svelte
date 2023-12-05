<script lang='ts'>
    import { onMount } from 'svelte';
    export let id = '';
    export let from = '';
    export let to = '';
    export let data = {};
    
    let path: any;

    onMount(() => {
        path.setAttribute('d', getBezierPath(100, 100, 200, 200));
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