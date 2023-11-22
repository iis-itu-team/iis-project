<script lang="ts">
	import { showCrumbs, setCrumbs } from '$lib/stores/breadcrumbs';
	import type { PageData } from './$types';

	export let data: PageData;

	$: threads = data.threads;
	$: group = data.group;

	showCrumbs(true);
	$: setCrumbs([
		{
			text: 'Groups'
		},
		{
			text: group?.title ?? '',
			href: `/groups/${group?.id}`,
			selected: true
		}
	]);
</script>

<p class="text-white font-semibold text-lg py-2">threads ({threads?.length}):</p>
<div class="flex flex-col gap-y-4">
	{#each threads ?? [] as thread}
		<div class="bg-background-light rounded-xl p-4">
			<a
				href={`/groups/${group?.id}/threads/${thread.id}`}
				class="text-lg font-semibold hover:underline hover:cursor-pointer">{thread.title}</a
			>
			<!-- TODO: Load x last messages, show? message count? -->
		</div>
	{/each}
</div>
<div class="text-center col-span-5">
	<!-- TODO: if logged in and joined in the group and has the rights -->
	<a href={`/groups/${group?.id}/threads/create`} class="hover:underline hover:cursor-pointer"
		>create a new thread</a
	>
</div>
