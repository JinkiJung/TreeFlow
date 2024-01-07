<script lang="ts">
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';
	import {
		EdgeLinkTypes,
		type EdgeData,
		type NodeData,
		ResizeDirection,
		type Size
	} from '../types';
	import { sectionHeight, nodeStore } from '../stores';
	import EdgeLink from '../EdgeLink/EdgeLink.svelte';
	import NodeCanvas from '../Canvas/NodeCanvas.svelte';
	import { DefaultNode } from '.';
	import { ResizableContainer } from '../Container';

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
	export let backgroundColor: string = 'rgba(0,0,0,0.0)';
	export let linkEdgeStart: (
		e: CustomEvent<{ node: NodeData; type: EdgeLinkTypes; event: MouseEvent | TouchEvent }>
	) => void;
	export let linkEdgeEnd: (
		e: CustomEvent<{ node: NodeData; type: EdgeLinkTypes; event: MouseEvent | TouchEvent }>
	) => void;
	export let linkEdgeEnter: (
		e: CustomEvent<{ node: NodeData; type: EdgeLinkTypes; event: MouseEvent | TouchEvent }>
	) => void;
	export let handleMousedown: (
		e: CustomEvent<{ node: NodeData; event: MouseEvent | TouchEvent }>
	) => void;
	export let resizeStart: (
		e: CustomEvent<{ nodeId: string; direction: ResizeDirection; event: MouseEvent | TouchEvent }>
	) => void;
	export let addChild: (node: NodeData) => NodeData;

	function onSelectNodeHandler(event: MouseEvent | TouchEvent) {
		dispatch('nodeclick', { node, event });
	}

	let id = node.id;
	let x = node.position.x;
	let y = node.position.y;
	let width = node.size.width;
	let height = node.size.height;
	let data = node.data;
	let container: HTMLDivElement;
	let actValue: string = data.label;
	let actInput: HTMLInputElement;
	let edgeLinkSelected: boolean = false;
	let children: NodeData[] = [];
	let expanded: boolean = false;
	let nodes: NodeData[];

	$: {
		x = node.position.x;
		y = node.position.y;
		width = node.size.width;
		height = node.size.height;
		data = node.data;
		expanded = children.length > 0;
	}

	const unsubscribeNodeStore = nodeStore.subscribe((value) => {
		nodes = value;

		children = nodes.filter((n) => n.parent === node.id);
		expanded = children.length > 0;
	});

	const calculateCanvasSize = (): Size => {
		if (node.children === undefined) return { width: 0, height: 0 };

		const nodePositions = node.children!.map((nodeId) => {
			const node = nodes.filter((n) => n.id === nodeId).pop();
			if (node)
				return {
					x: node.position.x + node.size.width,
					y: node.position.y + node.size.height
				};
			else return { x: 0, y: 0 };
		});

		const maxX = Math.max(...nodePositions.map((pos) => pos.x));
		const maxY = Math.max(...nodePositions.map((pos) => pos.y));

		const size = {
			width: maxX + 20,
			height: maxY + 40 + sectionHeight * 3
		};
		return size;
	};

	const onAddChild = () => {
		addChild(node);
		const size = calculateCanvasSize();
		console.log(size);
		nodeStore.set([...nodes, { ...node, size }]);
	};
</script>

<div
	{id}
	bind:this={container}
	role="button"
	class="iil-container unselectable"
	style=" top: {y}px; left: {x}px; background: {backgroundColor}; outline: {selected
		? '2'
		: '1'}px solid {selected ? 'red' : 'black'};"
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
	<div class="d-flex justify-content-between iil-section condition">
		<EdgeLink
			edgelinkSize={sectionHeight}
			{node}
			data={node.startLinker}
			type={EdgeLinkTypes.Start}
			on:edgelinkstart={linkEdgeStart}
			on:edgelinkend={linkEdgeEnd}
			on:edgelinkenter={linkEdgeEnter}
		/>
		<div></div>
	</div>
	<div class="iil-section">
		<input
			bind:this={actInput}
			bind:value={actValue}
			type="text"
			class="p-0"
			style="width: {width}px; height: {sectionHeight}px; border: 0px solid black;"
			on:click={(event) => actInput.focus()}
		/>
	</div>
	<div class="d-flex justify-content-between iil-section">
		{#if expanded}
			<ResizableContainer
				nodeId={node.id}
				{width}
				height={height - sectionHeight * 3}
				on:resizestart={resizeStart}
			>
				<NodeCanvas backgroundColor={'rgba(230,230,230,0.5)'} parentId={node.id}>
					{#each children || [] as node}
						<DefaultNode
							{node}
							on:nodedragstart={handleMousedown}
							{linkEdgeStart}
							{linkEdgeEnd}
							{linkEdgeEnter}
							{addChild}
							{handleMousedown}
							{resizeStart}
						/>
					{/each}
				</NodeCanvas>
			</ResizableContainer>
		{:else}
			<button class="addBtn" on:click={(e) => onAddChild()}>+</button>
		{/if}
	</div>
	<div class="d-flex justify-content-between iil-section condition">
		<div></div>
		<EdgeLink
			edgelinkSize={sectionHeight}
			{node}
			data={node.endLinker}
			type={EdgeLinkTypes.End}
			on:edgelinkstart={linkEdgeStart}
			on:edgelinkend={linkEdgeEnd}
			on:edgelinkenter={linkEdgeEnter}
		/>
	</div>
</div>

<style>
	.iil-container {
		position: absolute;
		margin: 0px;
		padding: 0px;
	}

	.iil-section {
		margin: 0px;
		padding: 0px;
	}

	.condition {
		background: rgba(101, 101, 101, 1);
		border: 0px;
	}

	/* addBtn style is for a button full fit to the parent div and color is blue, font is very small */
	.addBtn {
		background-color: #007bff;
		color: white;
		width: 100%;
		height: 10px;
		border: 0px;
		font-size: 8px;
	}
</style>
