<script lang="ts">
	import { setCrumbs, showCrumbs } from '$lib/stores/breadcrumbs';
	import type { Group, Thread } from '$lib/types';

	export let data: { group: Group; threads: Thread[] };

	$: group = data.group;
	$: threads = data.threads;

    showCrumbs(true);
    $: setCrumbs([
        {
            text: "Explore",
            href: "/explore",
            selected: false
        },
        {
            text: group.title,
            href: `/groups/${group.id}`,
            selected: true
        }
    ])
</script>

<div class="flex flex-col gap-y-2">
    <p class="text-white font-semibold text-lg">threads ({threads.length}):</p>

	<div class="flex flex-col gap-y-4">
		{#each threads as thread}
			<div class="bg-background-light rounded-xl p-4">
				<span class="text-lg font-semibold hover:underline hover:cursor-pointer"
					>{thread.title}</span
				>
				<!-- TODO: Load x last messages, show? -->
			</div>
		{/each}
	</div>
</div>
