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
	import { newNode } from '$lib/interaction/newNode';

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

	export let nodes: NodeData[] = [];
	export let nodeId: string = '';
	export let backgroundColor: string = 'rgba(0,0,0,0.0)';
	export let linkEdgeStart: (
		e: CustomEvent<{ node: NodeData; type: EdgeLinkTypes; event: MouseEvent | TouchEvent }>
	) => void;
	export let linkEdgeEnd: (
		e: CustomEvent<{ node: NodeData; type: EdgeLinkTypes; event: MouseEvent | TouchEvent }>
	) => void;
	export let linkEdgeOverlap: (
		e: CustomEvent<{ node: NodeData; type: EdgeLinkTypes; event: MouseEvent | TouchEvent }>
	) => void;
	export let handleMousedown: (
		e: CustomEvent<{ node: NodeData; event: MouseEvent | TouchEvent }>
	) => void;
	export let handleMouseup: () => void;
	export let resizeStart: (
		e: CustomEvent<{ nodeId: string; direction: ResizeDirection; event: MouseEvent | TouchEvent }>
	) => void;
	export let addChild: (node: NodeData) => NodeData;

	function onSelectNodeHandler(event: MouseEvent | TouchEvent) {
		dispatch('nodeclick', { node, event });
	}

	let node: NodeData = newNode();
	let x = node.position.x;
	let y = node.position.y;
	let hasParent = node.parent !== undefined;
	let selected: boolean = false;
	let children: NodeData[] = [];
	let numberOfSections: number = children.length > 0 ? 3 : 4;
	let width = node.size.width;
	let height = node.size.height < sectionHeight * numberOfSections ? sectionHeight * numberOfSections : node.size.height;
	let data = node.data;
	let container: HTMLDivElement;
	let actValue: string = data.label;
	let actInput: HTMLInputElement;
	let expanded: boolean = false;
	let heightOffset: number = sectionHeight * 2;

	$: {
		node = nodes.filter((n) => n.id === nodeId).pop()!;
		console.log(nodes);
		console.log(nodeId);
		if (node) {
			children = nodes.filter((n) => n.parent === nodeId);
			expanded = children.length > 0;
			data = node.data;

			hasParent = node.parent !== undefined;
			x = node.position.x;
			y = hasParent ? node.position.y + heightOffset : node.position.y;
			width = node.size.width;
			height = node.size.height < sectionHeight * numberOfSections ? sectionHeight * numberOfSections : node.size.height;
			data = node.data;
			actValue = data.label + " " + node.position.y.toString();//data.label;
			selected = node.selected!;
			console.trace("node.id: " + node.id);
			console.log("node.position: " + node.position.x + " " + node.position.y);
			console.log("node.position: " + x + " " + y);
		}
	}

	onMount(() => {
		updateChildren();
		adjustSize();
	});

	const updateChildren = () => {
		const prevChildrenLength = children.length;
		children = nodes.filter((n) => n.parent === nodeId);
		if (prevChildrenLength !== children.length) {
			adjustSize();
		}
	};

	const adjustSize = () => {
		const size = calculateCanvasSize(children.map((n) => n.id!));
		if (size.width !== node.size.width && size.height !== node.size.height) {
			nodeStore.set(nodes.map((n) => (n.id === nodeId ? { ...node, size } : n)));
		}
	};

	const calculateCanvasSize = (childrenIds: string[]): Size => {
		if (childrenIds.length === 0) return { width, height };

		const nodePositions = childrenIds!.map((nodeId) => {
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
			height: maxY + 40 + sectionHeight * numberOfSections
		};
		return size;
	};

	const onAddChild = () => {
		addChild(node);
		adjustSize();
	};
</script>

<div
	id={nodeId}
	bind:this={container}
	role="button"
	class="iil-container unselectable"
	style=" top: {y}px; left: {x}px;"
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
	<ResizableContainer owningNode={nodeId} {width} {height}
		{backgroundColor} highlightOutline={selected} on:resizestart={resizeStart}>
		<NodeCanvas backgroundColor={'rgba(230,230,230,0.0)'} owningNode={nodeId} {width} {height}>
				<div class="d-flex justify-content-between iil-section condition" style="height: {sectionHeight}px;">
					<EdgeLink
						edgelinkSize={sectionHeight}
						{node}
						data={node.startLinker}
						type={EdgeLinkTypes.Start}
						on:linkstart={linkEdgeStart}
						on:linkend={linkEdgeEnd}
						on:linkoverlap={linkEdgeOverlap}
					/>
				</div>
				<div class="iil-section">
					<input
						bind:this={actInput}
						bind:value={actValue}
						type="text"
						class="p-0 m-0"
						style="width: 100%; height: {sectionHeight}px; border: 0px solid black;"
						on:click={(event) => actInput.focus()}
					/>
				</div>
				<div class="d-flex justify-content-between iil-section"
					style="width: {width}px; height: {height - sectionHeight * (numberOfSections - 1)}px;">
					{#if expanded}
						{#each children || [] as n}
						<h1>{n.position.x} {n.position.y}</h1>
							<DefaultNode
								{nodes}
								nodeId={n.id}
								{backgroundColor}
								on:nodedragstart={handleMousedown}
								on:nodedragstop={handleMouseup}
								{handleMousedown}
								{handleMouseup}
								{linkEdgeStart}
								{linkEdgeEnd}
								{linkEdgeOverlap}
								{resizeStart}
								{addChild}
							/>
						{/each}
					{:else}
						<button class="addBtn"
							style="width: {width}px; height: {sectionHeight}px;"
							on:click={(e) => onAddChild()}>+</button>
					{/if}
				</div>
				<div class="d-flex justify-content-between iil-section condition"
					style="height: {sectionHeight}px;">
					<div></div>
					<EdgeLink
						edgelinkSize={sectionHeight}
						{node}
						data={node.endLinker}
						type={EdgeLinkTypes.End}
						on:linkstart={linkEdgeStart}
						on:linkend={linkEdgeEnd}
						on:linkoverlap={linkEdgeOverlap}
					/>
				</div>
		</NodeCanvas>
	</ResizableContainer>
</div>

<style>
	.iil-container {
		position: absolute;
		margin: 0px;
	}

	.iil-section {
		margin: 0px;
		padding: 0px;
		border: 0px;
	}

	.condition {
		background: rgba(101, 101, 101, 1);
		border: 0px;
	}

	/* addBtn style is for a button full fit to the parent div and color is blue, font is very small */
	.addBtn {
		background-color: #007bff;
		color: white;
		border: 0px;
		font-size: 8px;
	}
</style>
