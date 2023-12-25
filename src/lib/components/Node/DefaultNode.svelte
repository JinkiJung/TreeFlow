<script lang="ts">
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';
	import { EdgeLinkTypes, type EdgeData, type NodeData } from '../types';
	import { edgelinkSize, nodeStore } from '../stores';
	import EdgeLinker from '../EdgeLinker/EdgeLinker.svelte';
	import { pauseEvent } from '../types/dom';
	import BezierEdge from '../Edge/BezierEdge.svelte';
	import NodeCanvas from '../Canvas/NodeCanvas.svelte';
	import { DefaultNode } from '.';
	
	const dispatch = createEventDispatcher<{
		nodeclick: { node: NodeData; event: MouseEvent | TouchEvent };
		nodecontextmenu: { node: NodeData; event: MouseEvent | TouchEvent };
		nodedrag: { node: NodeData; nodes: NodeData[]; event: MouseEvent | TouchEvent };
		nodedragstart: { node: NodeData; event: MouseEvent | TouchEvent };
		nodedragstop: { node: NodeData; event: MouseEvent | TouchEvent };
		nodemouseenter: { node: NodeData; event: MouseEvent | TouchEvent };
		nodemouseleave: { node: NodeData; event: MouseEvent | TouchEvent };
		nodemousemove: { node: NodeData; event: MouseEvent | TouchEvent };
	}>();

	export let node: NodeData;
	export let selected: boolean = false;
	export let children: NodeData[] = [];
	export let backgroundColor: string = 'rgba(0,0,0,0.5)';
	export let edgeLinkStart: (e: CustomEvent<{ node: NodeData; type: EdgeLinkTypes; event: MouseEvent | TouchEvent }>) => void;
    export let edgeLinkEnd: (e: CustomEvent<{ node: NodeData; type: EdgeLinkTypes; event: MouseEvent | TouchEvent }>) => void;
	export let edgeLinkEnter: (e: CustomEvent<{ node: NodeData; type: EdgeLinkTypes; event: MouseEvent | TouchEvent }>) => void;
	export let handleMousedown: (e: CustomEvent<{ node: NodeData; event: MouseEvent | TouchEvent; }>) => void;
	export let handleMouseup: (e: CustomEvent<{ node: NodeData; event: MouseEvent | TouchEvent; }>) => void;

	function onSelectNodeHandler(event: MouseEvent | TouchEvent) {
		dispatch('nodeclick', { node, event });
	}

	let id = node.id;
	let x = node.position.x;
	let y = node.position.y;
	let width = node.size.width;
	let height = node.size.height;
	let data = node.data;

	$: {
		x = node.position.x;
		y = node.position.y;
		data = node.data;
	}

	const handleCanvasResize = (e: CustomEvent<{ width: number; height: number }>) => {
		width = e.detail.width;
		height = e.detail.height + 60;
		console.log(width, height);
	};
</script>

<div
	{id}
	role="button"
	class="iil-container"
	style=" top: {y}px; left: {x}px; width: {width}px; height: {height}px; background: {backgroundColor}; border: {selected ? '2':'1'}px solid {selected ? 'red':'black'};"
	on:click={(event) => dispatch('nodeclick', { node, event })}
	on:keydown={(event) => {}}
	on:mousedown={(event) => dispatch('nodedragstart', { node, event })}
	on:mouseup={(event) => dispatch('nodedragstop', { node, event })}
	on:mouseenter={(event) => dispatch('nodemouseenter', { node, event })}
	on:mouseleave={(event) => dispatch('nodemouseleave', { node, event })}
	on:mousemove={(event) => dispatch('nodemousemove', { node, event })}
	on:contextmenu={(event) => dispatch('nodecontextmenu', { node, event })}
	tabindex="0"
>
	<div class="d-flex justify-content-between">
		<EdgeLinker
			{edgelinkSize}
			{node}
			type={EdgeLinkTypes.Start}
			on:edgelinkstart={edgeLinkStart}
			on:edgelinkend={edgeLinkEnd}
			on:edgelinkenter={edgeLinkEnter}
			/>
		<div></div>
	</div>
	<div>
		<input
		type="text"
		class="p-0"
		style="width: 100%; height: 20px; border: 0px solid black;"
		value={data.label ? data.label : ''}
	/>
	</div>
	<div class="d-flex justify-content-between">
		<NodeCanvas
			initWidth={width}
			initHeight={children.length > 0 ? height : 0}
			backgroundColor={"rgba(230,230,230,0.5)"}
			parentId={node.id}
			hasChildren={children.length > 0}
			on:canvasresize={handleCanvasResize}>
			{#each children || [] as node}
				<DefaultNode 
					{node} 
					on:nodedragstart={handleMousedown}
					on:nodedragstop={handleMouseup}
					{edgeLinkStart}
					{edgeLinkEnd}
					{edgeLinkEnter}
					handleMousedown={handleMousedown}
					handleMouseup={handleMouseup}
					/>
			{/each}
		</NodeCanvas>
	</div>
	<div class="d-flex justify-content-between">
		<div>

		</div>
		<EdgeLinker
			{edgelinkSize}
			{node}
			type={EdgeLinkTypes.End}
			on:edgelinkstart={edgeLinkStart}
			on:edgelinkend={edgeLinkEnd}
			on:edgelinkenter={edgeLinkEnter}
			/>
	</div>
</div>

<style>
.iil-container{
	position: absolute;
}
</style>