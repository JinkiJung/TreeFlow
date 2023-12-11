<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { NodeData } from '../types';
	import { nodes } from '../stores';
	
	const dispatch = createEventDispatcher<{
		nodeclick: { node: NodeData; event: MouseEvent | TouchEvent };
		nodecontextmenu: { node: NodeData; event: MouseEvent | TouchEvent };
		nodedrag: { node: NodeData; nodes: NodeData[]; event: MouseEvent | TouchEvent };
		nodedragstart: { node: NodeData; event: MouseEvent | TouchEvent };
		nodedragstop: { node: NodeData; nodes: NodeData[]; event: MouseEvent | TouchEvent };
		nodemouseenter: { node: NodeData; event: MouseEvent | TouchEvent };
		nodemouseleave: { node: NodeData; event: MouseEvent | TouchEvent };
		nodemousemove: { node: NodeData; event: MouseEvent | TouchEvent };
	}>();

	export let node: NodeData;

	function onSelectNodeHandler(event: MouseEvent | TouchEvent) {
		dispatch('nodeclick', { node, event });
	}

	let id = node.id;
	let x = node.position.x;
	let y = node.position.y;
	let width = node.size.width;
	let height = node.size.height;
	let data = node.data;
	let selected = node.selected;

	$: {
		x = node.position.x;
		y = node.position.y;
		width = node.size.width;
		height = node.size.height;
		data = node.data;
		selected = node.selected;
	}

</script>

<div
	{id}
	role="button"
	style="position: relative; top: {y}px; left: {x}px; width: {width}px; height: {height}px; background: rgba(0,0,0,0.5); z-index: 2; border: 1px solid black; box-sizing: border-box;"
	on:click={(event) => dispatch('nodeclick', { node, event })}
	on:keydown={(event) => {}}
	on:mousedown={(event) => dispatch('nodedragstart', { node, nodes: [node], event })}
	on:mouseup={(event) => dispatch('nodedragstop', { node, nodes: [node], event })}
	on:mouseenter={(event) => dispatch('nodemouseenter', { node, event })}
	on:mouseleave={(event) => dispatch('nodemouseleave', { node, event })}
	on:mousemove={(event) => dispatch('nodemousemove', { node, event })}
	on:contextmenu={(event) => dispatch('nodecontextmenu', { node, event })}
	tabindex="0"
>
	<div class="d-flex justify-content-between">
		<div class="p-0" style="width: 20px; height: 20px; border: 1px solid black; box-sizing: border-box;">
			Start
		</div>
		<div></div>
	</div>
	<div>
		<input
		type="text"
		class="p-0"
		style="width: 100%; height: 20px; border: 0px solid black; box-sizing: border-box;"
		value={data.label ? data.label : ''}
	/>
	</div>
	<div class="d-flex justify-content-between">
		<div>

		</div>
		<div style="width: 20px; height: 20px; border: 1px solid black; box-sizing: border-box;">
			End
		</div>
	</div>
</div>
