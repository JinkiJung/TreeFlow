
<script lang='ts'>
	import Canvas from '$lib/components/Canvas/Canvas.svelte';
	import Hiergram from '$lib/components/Hiergram/Hiergram.svelte';
	import { writable } from 'svelte/store';
	import type { NodeData, Edge } from '$lib/components/types';
	import { nodes } from '$lib/components/stores';

	let edgeItems: Edge[]= [
		{
			id: 'edge1',
			from: 'node1',
			to: 'node2',
			data: {
				label: 'edge 1',
			}
		}
	];
    let nodeItems: NodeData[] = [
        {
            id: 'node1',
            position: {
				x: 100,
				y: 100,
			},
			size: {
				width: 160,
				height: 60,
			},
			data: {
				label: 'node 1',
			}
        },
        {
            id: 'node2',
            position: {
				x: 400,
				y: 100,
			},
			size: {
				width: 160,
				height: 60,
			},
			data: {
				label: 'node 2',
			}
        }
    ] as NodeData[];
	nodes.set(nodeItems);
</script>

<svelte:head>
	<title>Hiergram</title>
	<meta name="description" content="Svelte demo app" />
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
</svelte:head>

<section>
	<h1>
		<span class="welcome">
		</span>

		Hieragram Svelte Demo
	</h1>

	<Hiergram nodesProp={nodeItems} edges={edgeItems}/>
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}

	h1 {
		width: 100%;
	}

</style>
