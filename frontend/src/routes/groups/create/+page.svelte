<script lang="ts">
	import { goto } from '$app/navigation';
	import { client } from '$lib/http/http';
	import { setCrumbs, showCrumbs } from '$lib/stores/breadcrumbs';
	import type { Group, ResponseFormat } from '$lib/types';
	import { toasts } from 'svelte-toasts';

	const values: Partial<{
		title: string;
		visibility: string;
	}> = {
		visibility: 'private'
	};

	showCrumbs(true);

	setCrumbs([
		{
			text: 'Groups',
			href: '/groups'
		},
		{
			text: 'Create a new group',
			selected: true
		}
	]);

	const handleSubmit = async () => {
		const res = await client.post<ResponseFormat<Group>>('/groups', {
			title: values.title,
            visibility: values.visibility
		});

		if (res.status !== 201 || res.data.status !== 'success') {
			toasts.add({
				type: 'error',
				description: 'Something went wrong.'
			});
            return;
		}

        toasts.add({
            type: "success",
            description: `Group ${res.data.data?.title} created.`
        });
        
        goto(`/groups/${res.data.data?.id}`);
	};

	const visibilityOptions = [
		{
			value: 'private',
			text: 'Private',
			description: 'No one can see inside your group.'
		},
		{
			value: 'protected',
			text: 'Protected',
			description: 'Only registered users can see inside your group.'
		},
		{
			value: 'public',
			text: 'Public',
			description: 'Anyone can see inside your group.'
		}
	];
</script>

<form class="flex flex-col gap-y-4 p-10 max-w-md m-auto">
	<div class="flex flex-col">
		<label class="text-lg" for="title">Title</label>
		<input
			class="bg-background-light rounded-md p-2"
			name="title"
			type="text"
			placeholder="Group title"
			bind:value={values.title}
		/>
	</div>
	<p class="text-lg">Visibility</p>
	{#each visibilityOptions as option}
		<div class="flex flex-row gap-x-4 items-center justify-start">
			<input
				class="w-6 h-6 hover:cursor-pointer accent-primary"
				name={option.value}
				bind:group={values.visibility}
				id={option.value}
				type="radio"
				value={option.value}
			/>
			<div class="flex flex-col">
				<label class="text-lg bold" for={option.value}>{option.text}</label>
				<p class="text-md text-gray-300">{option.description}</p>
			</div>
		</div>
	{/each}
	<div class="flex flex-row gap-x-4 justify-center">
		<button
			on:click={() => {
				goto(`/groups`);
			}}>Cancel</button
		>
		<button type="submit" on:click={handleSubmit}> Create </button>
	</div>
</form>

<style>
	button:hover {
		text-decoration: underline;
		cursor: pointer;
	}
</style>
