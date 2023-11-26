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

	const handleChange = (e: any) => {
		value = e.target.checked;
	};
</script>

<div
	class="flex {type === 'checkbox'
		? 'flex-row-reverse gap-x-2 items-center'
		: 'flex-col gap-y-2'} justify-end w-full"
>
	<label class="text-lg" for={name}>{title}</label>
	{#if type === 'checkbox'}
		<input
			class="bg-background-light rounded-md p-2 {type === 'checkbox' && 'checkbox'}"
			{name}
			{type}
			checked={!!value}
			placeholder={title}
			on:change={handleChange}
		/>
	{:else}
		<input
			class="bg-background-light rounded-md p-2 {type === 'checkbox' && 'checkbox'}"
			{name}
			{type}
			value={value ?? ''}
			placeholder={title}
			on:input={handleInput}
		/>
	{/if}
	{#if error}
		<p class="text-red-400">{error}</p>
	{/if}
</div>
