<script lang="ts">
	import BasicNode from "./Node/BasicNode.svelte";

    let x = 0;
    let y = 0;
    let offsetX = 0;
    let offsetY = 0;
    let drag = false;
  
    function handleMousedown(event: any) {
      drag = true;
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

    $: {

    }
</script>

<div style="position: relative; width: 600px; height: 400px;">
    <svg style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle fill="#AAAAAA" cx="0" cy="0" r="1"></circle>
            </pattern>
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation="0.5" flood-color="#000000" flood-opacity="0.5" />
              </filter>
        </defs>
          <g id="canvas" filter="url(#shadow)">
            <rect id="canvas-bg" width="100%" height="100%" fill="url(#dots)"/>
            <g id="canvas-content">
              <BasicNode id="node-1" x={20} y={20} width={20} height={20} />
            </g>
          </g>
    </svg>
    <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 2;"
        on:mousemove={handleMousemove}
        on:mouseup={handleMouseup} >
        <div role="button" style="position: relative; top: {y}px; left: {x}px; width: 120px; height: 60px; background: rgba(0,0,0,0.5); z-index: 2;" on:mousedown={handleMousedown}>
            <div style="width: 20px; height: 20px; border: 1px solid black; box-sizing: border-box;">test</div>
            <div><input type="text" style="width: 100%; height: 20px; border: 1px solid black; box-sizing: border-box;"/></div>
            <div style="width: 20px; height: 20px; border: 1px solid black; box-sizing: border-box;">test</div>
        </div>
    </div>
</div>
