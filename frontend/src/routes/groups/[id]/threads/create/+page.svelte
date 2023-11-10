<script lang="ts">
	import { client } from '$lib/http/http';
	import { setCrumbs, showCrumbs } from '$lib/stores/breadcrumbs';
	import type { Group } from '$lib/types';
	import { writable } from 'svelte/store';

	export let data: { group: Group };

	$: group = data.group;

	const values = writable({
		title: 'First law of robotics'
	});

	showCrumbs(true);
	$: setCrumbs([
		{
			text: 'Groups'
		},
		{
			text: `${group.title}`,
			href: `/groups/${group.id}`
		},
		{
			text: 'Create a new thread',
			selected: true
		}
	]);

	const handleSubmit = () => {
		const data = {
			...$values,
			/* TODO: Get the currently logged in user and send his id here */
			ownerId: 'user_random'
		};

		client.post(`/groups/${group.id}/threads`, data).then(() => {
			//@ts-ignore
			window.location = `/groups/${group.id}`;
		});
	};
</script>

<form class="flex flex-col gap-y-4 p-10 max-w-md m-auto">
	<div class="flex flex-col">
		<label class="text-lg" for="title">Title</label>
		<input
			class="bg-background-light rounded-md p-2"
			name="title"
			type="text"
			placeholder="Thread title"
			bind:value={$values.title}
		/>
	</div>
	<div class="flex flex-row gap-x-4 justify-center">
		<button
			on:click={() => {
				//@ts-ignore
				window.location = `/groups/${group.id}`;
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
