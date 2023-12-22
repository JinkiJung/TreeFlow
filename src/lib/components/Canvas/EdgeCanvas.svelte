<script>
  export let hasBackground = false;
</script>

<svg style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" xmlns="http://www.w3.org/2000/svg">
    <defs>
      {#if hasBackground}
        <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle fill="#AAAAAA" cx="0" cy="0" r="1"></circle>
      </pattern>
      {/if}
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="0.5" flood-color="#000000" flood-opacity="0.5" />
          </filter>
    </defs>
      <g id="canvas" filter="url(#shadow)">
        <rect id="canvas-bg" width="100%" height="100%" fill="url(#dots)"/>
        <g id="canvas-content">
          <slot />
        </g>
      </g>
</svg>