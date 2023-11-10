<script lang="ts">
	import { breadcrumbs, show } from '$lib/stores/breadcrumbs';
</script>

{#if $show}
	<div class="flex flex-row text-xl gap-x-2 p-10">
		...:
		{#each $breadcrumbs as crumb, id}
			<a href={crumb.href} class:font-semibold={crumb.selected}>{crumb.text}</a>
			{#if id != $breadcrumbs.length - 1}
				<span>/</span>
			{/if}
		{/each}
	</div>
{/if}
