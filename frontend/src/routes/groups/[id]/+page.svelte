<script lang="ts">
	import { setCrumbs, showCrumbs } from '$lib/stores/breadcrumbs';
	import type { Group, Thread } from '$lib/types';

	export let data: { group: Group; threads: Thread[] };

	$: group = data.group;
	$: threads = data.threads;

	showCrumbs(true);
	$: setCrumbs([
		{
			text: 'Groups'
		},
		{
			text: group.title,
			href: `/groups/${group.id}`,
			selected: true
		}
	]);
</script>

<div class="flex flex-col gap-y-2">
    <!-- TODO: don't show if joined -->
	<span class="self-end hover:underline hover:cursor-pointer">request to join</span>
	<p class="text-white font-semibold text-lg">threads ({threads.length}):</p>

	<div class="flex flex-col gap-y-4">
		{#each threads as thread}
			<div class="bg-background-light rounded-xl p-4">
				<span class="text-lg font-semibold hover:underline hover:cursor-pointer"
					>{thread.title}</span
				>
				<!-- TODO: Load x last messages, show? message count? -->
			</div>
		{/each}
        <div class="self-center">
            <!-- TODO: if logged in and joined in the group and has the rights -->
            <a href={`/groups/${group.id}/threads/create`} class="hover:underline hover:cursor-pointer">create a new thread</a>
        </div>
	</div>
</div>
