<script lang="ts">
	import { goto } from '$app/navigation';
	import { client } from '$lib/http/http';
	import { currentUser } from '$lib/stores/auth';
	import { setCrumbs, showCrumbs } from '$lib/stores/breadcrumbs';
	import type { Group } from '$lib/types';
	import { get } from 'svelte/store';

	export let data: { group: Group };

	$: group = data.group;

	const values = {
		title: 'First law of robotics'
	};

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
		const user = get(currentUser);

		const data = {
			...values,
			ownerId: user!.id
		};

		client.post(`/groups/${group.id}/threads`, data).then(() => {
			goto(`/groups/${group.id}`);
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
			bind:value={values.title}
		/>
	</div>
	<div class="flex flex-row gap-x-4 justify-center">
		<button
			on:click={() => {
				goto(`/groups/${group.id}`);
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
