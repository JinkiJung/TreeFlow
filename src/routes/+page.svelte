<script lang='ts'>
	import Canvas from '$lib/components/Canvas.svelte';
	import Hiergram from '$lib/components/Hiergram/Hiergram.svelte';
	import { writable } from 'svelte/store';
	import type { Node, Edge } from '$lib/components/types';

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
    let nodeItems: Node[] = [
        {
            id: 'node1',
            position: {
				x: 100,
				y: 100,
			},
			size: {
				width: 260,
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
				width: 260,
				height: 60,
			},
			data: {
				label: 'node 2',
			}
        }
    ];
	//const nodes = writable(nodeItems);
	//const edges = writable(edgeItems);
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
	<h1>
		<span class="welcome">
		</span>

		Hieragram Svelte Demo
	</h1>

	<Hiergram nodes={nodeItems} edges={edgeItems}/>
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
