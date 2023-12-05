<script lang="ts">
	import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher<{
    nodeclick: { node: Node; event: MouseEvent | TouchEvent };
    nodecontextmenu: { node: Node; event: MouseEvent | TouchEvent };
    nodedrag: { node: Node; nodes: Node[]; event: MouseEvent | TouchEvent };
    nodedragstart: { node: Node; nodes: Node[]; event: MouseEvent | TouchEvent };
    nodedragstop: { node: Node; nodes: Node[]; event: MouseEvent | TouchEvent };
    nodemouseenter: { node: Node; event: MouseEvent | TouchEvent };
    nodemouseleave: { node: Node; event: MouseEvent | TouchEvent };
    nodemousemove: { node: Node; event: MouseEvent | TouchEvent };
  }>();

  export let id: string = '';
  export let x: number = 0;
  export let y: number = 0;
  export let width: number = 0;
  export let height: number = 0;
  let node: Node;

  let offsetX = 0;
  let offsetY = 0;
  let drag = false;

  $: {
    console.log(x, y, width, height);
  }
  
    function handleMousedown(event: any) {
      drag = true;
      console.log(event);
      offsetX = event.clientX - x;
      offsetY = event.clientY - y;
    }
  
    function handleMousemove(event: any) {
      if (drag) {
        x = event.clientX - offsetX;
        y = event.clientY - offsetY;
      }
    }
  
    function handleMouseup() {
      drag = false;
    }
    function onSelectNodeHandler(event: MouseEvent | TouchEvent) {
      dispatch('nodeclick', {node, event});
    }

</script>

<div id={id} role="button" style="position: relative; top: {y}px; left: {x}px; width: {width}px; height: {height}px; background: rgba(0,0,0,0.5); z-index: 2;"
  on:click={onSelectNodeHandler}
    on:mouseenter={(event) => dispatch('nodemouseenter', { node, event })}
    on:mouseleave={(event) => dispatch('nodemouseleave', { node, event })}
    on:mousemove={(event) => dispatch('nodemousemove', { node, event })}
    on:contextmenu={(event) => dispatch('nodecontextmenu', { node, event })}
    >
    <div style="width: 20px; height: 20px; border: 1px solid black; box-sizing: border-box;">test</div>
    <div><input type="text" style="width: 100%; height: 20px; border: 1px solid black; box-sizing: border-box;"/></div>
    <div style="width: 20px; height: 20px; border: 1px solid black; box-sizing: border-box;">test</div>
</div>