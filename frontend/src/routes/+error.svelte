<script lang="ts">
	import { page } from '$app/stores';
	import type { ErrorInfo } from '$lib/types/error';

	export let error: ErrorInfo;

	const handleHome = () => {
		location.href = '/';
	};

	const handleReload = () => {
		location.reload();
	};

	const hasInfo = $page.error?.hasOwnProperty('status');
	
	if (hasInfo) {
		error = $page.error as ErrorInfo;
	}
</script>

<div class="m-auto p-10">
	<p class="py-10 text-lg">
		An error occured, try <span
			role="button"
			tabindex="0"
			class="nav"
			on:keydown={(event) => event.key === 'Enter' && handleReload()}
			on:click={handleReload}>reloading</span
		>
		or going
		<span
			role="button"
			tabindex="0"
			class="nav"
			on:keydown={(event) => event.key === 'Enter' && handleHome()}
			on:click={handleHome}>home</span
		>.
	</p>
	{#if hasInfo}
		<span class="text-red-300 font-semibold text-xl">{error.statusCode}</span>
		<span class="text-lg">{error.statusText}</span>
		<div>
			<span>{error.status}: </span>
			<span>{error.message}</span>
		</div>
	{:else}
		<p>{$page.error?.message ?? 'Something went wrong.'}</p>
	{/if}
</div>
