<script lang="ts">
    import { createEventDispatcher, onMount } from "svelte";
	import type { ResizableContainer } from ".";
    import { ResizeDirection } from "../types";

    export let width = 400;
    export let height = 200;
    export let boundary: number = 5;
    export let nodeId: string = '';

    let container: ResizableContainer;

    const dispatch = createEventDispatcher<{
		resizedrag: { event: MouseEvent | TouchEvent };
		resizestart: { nodeId: string, direction: ResizeDirection; event: MouseEvent | TouchEvent };
		resizestop: { event: MouseEvent | TouchEvent };
	}>();

    </script>

<div 
    bind:this={container}
    style="position: relative; width: {width}px; height: {height}px; background: white;"
>
    <div class="hoverable"
        style="position: absolute; top: 0; left: 0; right: 0; height: {boundary}px; cursor: ns-resize;"
        on:mousedown={(event) => dispatch('resizestart', { nodeId, direction: ResizeDirection.Top, event })}
        role="button" tabindex="0" />
    <div  class="hoverable"
        style="position: absolute; bottom: 0; left: 0; right: 0; height: {boundary}px; cursor: ns-resize;"
        on:mousedown={(event) => dispatch('resizestart', { nodeId, direction: ResizeDirection.Bottom, event })}
        role="button" tabindex="0" />
    <div  class="hoverable"
        style="position: absolute; top: 0; bottom: 0; left: 0; width: {boundary}px; cursor: ew-resize;"
        on:mousedown={(event) => dispatch('resizestart', { nodeId, direction: ResizeDirection.Left, event })}
        role="button" tabindex="0" />
    <div  class="hoverable"
        style="position: absolute; top: 0; bottom: 0; right: 0; width: {boundary}px; cursor: ew-resize;"
        on:mousedown={(event) => dispatch('resizestart', { nodeId, direction: ResizeDirection.Right, event })}
        role="button" tabindex="0" />
    <div style="position: absolute; inset: {boundary}px;">
        <slot />
    </div>
    
</div>

<style>
.hoverable:hover {
  background-color: blue;
  transition: background-color 0.5s ease;
}

</style>