<script lang="ts">
	import { breadcrumbs, show } from '$lib/stores/breadcrumbs';
</script>

{#if $show}
	<div class="flex flex-row text-xl gap-x-2">
		...:
		{#each $breadcrumbs as crumb, id}
			{#if crumb.href}
				<a href={crumb.href} class:font-semibold={crumb.selected}>{crumb.text}</a>
			{:else}
				<span class:font-semibold={crumb.selected}>{crumb.text}</span>
			{/if}
			{#if id != $breadcrumbs.length - 1}
				<span>/</span>
			{/if}
		{/each}
	</div>
{/if}
