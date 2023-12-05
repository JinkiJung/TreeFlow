<script lang="ts">
  export let width: number = 0;
  export let height: number = 0;
</script>

<div style="position: relative; width: {width}px; height: {height}px;">
    <slot />
</div>
