
<script lang='ts'>
	import TreeFlow from '$lib/components/TreeFlow/TreeFlow.svelte';
	import { edgeStore, nodeStore } from '$lib/components/stores';
	import { onMount } from 'svelte';
	import { updateAllEdgeEndpoints } from '$lib/components/types/dom';
	import { preprocessNodes } from '$lib/components/types/utils';

	
	let treeflow: TreeFlow;

	// implement changeData function to change the data according to the string parameter
	const changeData = (data: string) => {
		if (data === '1') {
			loadJsonData('data/data1.json');
		}
		else if (data === '2') {
			loadJsonData('data/data2.json');
		}
		else if (data === '3') {
			loadJsonData('data/data3.json');
		}
		else if (data === '4') {
			loadJsonData('data/data4.json');
		}
	}

	// load data from json files and convert it to NodeData and EdgeData and store it to nodeStore and edgeStore
	const loadJsonData = async (fileName: string) => {
		const res = await fetch(fileName);
		const data = await res.json();
		const nodes = preprocessNodes(data.nodes);
		nodeStore.set(nodes);
		edgeStore.set(updateAllEdgeEndpoints(data.edges, nodes));
	}
	
	onMount(() => {
		loadJsonData('data/data1.json');
	});
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
		<div>
			<button on:click={(e) => changeData('1')} >Sequence</button>
			<button on:click={(e) => changeData('2')} >Sequence in a layer</button>
			<button on:click={(e) => changeData('3')} >Sequence in two layers</button>
			<button on:click={(e) => changeData('4')} >Mixed</button>
		</div>
		<div>
			<button on:click={(e) => treeflow.addNode()}
				>add new node</button>	
		</div>
		

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
