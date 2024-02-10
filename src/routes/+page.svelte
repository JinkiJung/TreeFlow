
<script lang='ts'>
	import TreeFlow from '$lib/components/TreeFlow/TreeFlow.svelte';
	import { writable } from 'svelte/store';
	import { type NodeData, type EdgeData, EdgeLinkTypes } from '$lib/components/types';
	import { edgeStore, nodeStore } from '$lib/components/stores';

	let treeflow: TreeFlow;
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
				height: 200,
			},
			data: {
				label: 'node 1',
			},
			children: [
				'node4',
				'node3'
			],
			startLinker: {
				type: EdgeLinkTypes.Start,
				connected: false,
				highlighted: false,
				selected: false,
			},
			endLinker: {
				type: EdgeLinkTypes.End,
				connected: false,
				highlighted: false,
				selected: false,
			},
			depth: 0,
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
			},
			startLinker: {
				type: EdgeLinkTypes.Start,
				connected: false,
				highlighted: false,
				selected: false,
			},
			endLinker: {
				type: EdgeLinkTypes.End,
				connected: false,
				highlighted: false,
				selected: false,
			},
			depth: 0,
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
			},
			parent: 'node1',
			startLinker: {
				type: EdgeLinkTypes.Start,
				connected: false,
				highlighted: false,
				selected: false,
			},
			endLinker: {
				type: EdgeLinkTypes.End,
				connected: false,
				highlighted: false,
				selected: false,
			},
			depth: 0,
        },
		{
			id: 'node4',
			position: {
				x: 100,
				y: 100,
			},
			size: {
				width: 160,
				height: 60,
			},
			data: {
				label: 'node 4',
			},
			parent: 'node1',
			startLinker: {
				type: EdgeLinkTypes.Start,
				connected: false,
				highlighted: false,
				selected: false,
			},
			endLinker: {
				type: EdgeLinkTypes.End,
				connected: false,
				highlighted: false,
				selected: false,
			},
			depth: 1,
		}
    ] as NodeData[];
	nodeStore.set(nodeItems);
	edgeStore.set(edgeItems);
</script>

<svelte:head>
	<title>TreeFlow</title>
	<meta name="description" content="Svelte demo app" />
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
</svelte:head>

<section>
	<h1>
		<span class="welcome">
		</span>

		TreeFlow Svelte Demo
	</h1>
	<div class="container" >
		<TreeFlow bind:this={treeflow} width={800} height={600}/>
		<button on:click={(e) => treeflow.addNode()}
		>create new</button>
	</div>
	
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
