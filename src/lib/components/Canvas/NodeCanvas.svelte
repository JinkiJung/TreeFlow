<script lang="ts">
    export let handleMousedown: (e: any) => void;
</script>

<div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 2;"  on:mousedown={handleMousedown}>
    <slot />
</div>