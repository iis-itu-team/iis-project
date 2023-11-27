<script lang="ts">
	import { page } from '$app/stores';
	import type { ErrorInfo } from '$lib/types/error';

	export let error: ErrorInfo | undefined;

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
	{#if hasInfo}
		<span class="text-red-300 font-semibold text-2xl">{error?.statusCode}</span>
		<span class="py-10 text-lg">Not Found</span>
	{:else}
		<span class="text-red-300 font-semibold text-2xl">{$page.status}</span>
		<span class="py-10 text-lg">{$page.error?.message}</span>
	{/if}
	{#if error?.statusCode === 404}
		<p class="py-10 text-lg">
			What you're looking for is not here, go
			<span
				role="button"
				tabindex="0"
				class="nav"
				on:keydown={(event) => event.key === 'Enter' && handleHome()}
				on:click={handleHome}>home</span
			>.
		</p>
	{:else}
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
	{/if}
	{#if hasInfo}
		<div>
			<span class="text-red-300/100">{error?.status}</span>
			{#if error?.message}
				<span class="font-bold">:</span>
				<span>{error?.message}</span>
			{/if}
		</div>
	{:else}
		<p>{$page.error?.message ?? 'Something went wrong.'}</p>
	{/if}
</div>
