
<script lang='ts'>
	import Hiergram from '$lib/components/Hiergram/Hiergram.svelte';
	import { writable } from 'svelte/store';
	import { type NodeData, type EdgeData, EdgeLinkTypes } from '$lib/components/types';
	import { edgeStore, nodeStore } from '$lib/components/stores';

	let edgeItems: EdgeData[]= [
		{
			id: 'edge1',
			fromId: 'node1',
			fromType: EdgeLinkTypes.End,
			toType: EdgeLinkTypes.Start,
			toId: 'node2',
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
        },
		{
            id: 'node3',
            position: {
				x: 400,
				y: 200,
			},
			size: {
				width: 160,
				height: 60,
			},
			data: {
				label: 'node 3',
			}
        },
    ] as NodeData[];
	nodeStore.set(nodeItems);
	edgeStore.set(edgeItems);
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

	<Hiergram width={600} height={400}/>
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
