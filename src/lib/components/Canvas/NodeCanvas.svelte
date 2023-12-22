<script lang="ts">
    export let backgroundColor: string = 'rgba(0,0,0,0.5)';
</script>

<div style="position: relative; top: 0; left: 0; width: 100%; height: 100%; z-index: 2; background={backgroundColor}">
    <slot />
</div>