<script lang="ts">
    import { createEventDispatcher, onMount } from "svelte";
	import type { ResizableContainer } from ".";
    import { ResizeDirection } from "../types";

    export let width = 400;
    export let height = 200;
    export let owningNode: string = '';
    export let backgroundColor: string = 'rgba(230,230,230,0.1)';
    export let highlightOutline: boolean = false;

    const boundary: number = 5;
    
    let container: ResizableContainer;

    const dispatch = createEventDispatcher<{
		resizedrag: { event: MouseEvent | TouchEvent };
		resizestart: { nodeId: string, direction: ResizeDirection; event: MouseEvent | TouchEvent };
		resizestop: { event: MouseEvent | TouchEvent };
	}>();

    </script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div 
    bind:this={container}
    style="position: relative; width: {width}px; height: {height}px; background: {backgroundColor}; outline: {highlightOutline ? '2' : '1'}px solid {highlightOutline
        ? 'red'
        : 'black'};"
>
    <div class="hoverable"
        style="position: absolute; top: 0; left: 0; right: 0; height: {boundary}px; cursor: ns-resize;"
        on:mousedown={(event) => dispatch('resizestart', { nodeId: owningNode, direction: ResizeDirection.Top, event })}
        role="button" tabindex="0" />
    <div  class="hoverable"
        style="position: absolute; bottom: 0; left: 0; right: 0; height: {boundary}px; cursor: ns-resize;"
        on:mousedown={(event) => dispatch('resizestart', { nodeId: owningNode, direction: ResizeDirection.Bottom, event })}
        role="button" tabindex="0" />
    <div  class="hoverable"
        style="position: absolute; top: 0; bottom: 0; left: 0; width: {boundary}px; cursor: ew-resize;"
        on:mousedown={(event) => dispatch('resizestart', { nodeId: owningNode, direction: ResizeDirection.Left, event })}
        role="button" tabindex="0" />
    <div  class="hoverable"
        style="position: absolute; top: 0; bottom: 0; right: 0; width: {boundary}px; cursor: ew-resize;"
        on:mousedown={(event) => dispatch('resizestart', { nodeId: owningNode, direction: ResizeDirection.Right, event })}
        role="button" tabindex="0" />
    <div style="position: absolute;">
        <slot />
    </div>
    
</div>

<style>
.hoverable:hover {
  background-color: blue;
  transition: background-color 0.2s ease;
}

.hoverable:active {
  background-color: blue;
}

.hoverable:not( :hover ){
    background-color: transparent;
  transition: background-color 0.2s ease;
}

</style>