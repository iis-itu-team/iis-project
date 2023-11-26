<script lang="ts">
	import type { HTMLInputTypeAttribute } from 'svelte/elements';

	export let name: string;
	export let title: string;
	export let value: string | undefined;
	export let error: string | undefined;
	export let type: HTMLInputTypeAttribute = 'text';

    // type coercion
	const handleInput = (e: any) => {
		value = type === 'number' || type === 'range' ? +e.target.value : e.target.value;
	};
</script>

<div class="flex flex-col gap-y-2">
	<label class="text-lg" for={name}>{title}</label>
	<input
		class="bg-background-light rounded-md p-2"
		{name}
		{type}
        value={value ?? ""}
		placeholder={title}
		on:input={handleInput}
	/>
	{#if error}
		<p class="text-red-400">{error}</p>
	{/if}
</div>
