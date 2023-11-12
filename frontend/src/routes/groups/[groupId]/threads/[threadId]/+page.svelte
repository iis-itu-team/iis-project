<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { client } from '$lib/http/http';
	import { setCrumbs, showCrumbs } from '$lib/stores/breadcrumbs';
	import type { Group, Message, Thread } from '$lib/types';

	export let data: { group: Group; thread: Thread; messages: Message[] };

	showCrumbs(true);
	$: setCrumbs([
		{
			text: 'Groups'
		},
		{
			text: data.group?.title,
			href: `/groups/${data.group?.id}`
		},
		{
			text: data.thread?.title,
			href: `/groups/${data.group?.id}/threads/${data.thread?.id}`,
			selected: true
		}
	]);

	$: content = undefined;

	const handleSend = () => {
		if (content == undefined) {
			// highlight input
			alert('You have to type something...');
		}

		client
			.post(`/groups/${data.group.id}/threads/${data.thread.id}/messages`, {
				content,
				/* TODO: Currently logged in user */
				ownerId: 'user_random'
			})
			.then(() => {
				invalidateAll();
			});
	};
</script>

<div class="flex flex-col gap-y-2 w-full">
	<!-- TODO: don't show if joined -->
	<span class="self-end hover:underline hover:cursor-pointer">request to join</span>
	<p class="text-white font-semibold text-lg">messages ({data.messages.length}):</p>

	<div class="flex flex-col gap-y-4 border p-4 border-secondary rounded-md">
		{#if data.messages.length == 0}
			<p>Nothing yet... so empty.</p>
		{:else}
			{#each data.messages as message}
				<div class="flex flex-col">
					<span class="text-lg font-semibold">{message.owner.nickname}</span>
					<p class="text-md">
						{message.content}
					</p>
				</div>
			{/each}
		{/if}
	</div>
	<div class="flex flex-row gap-x-4 w-full">
		<input
			bind:value={content}
			class="bg-background-light rounded-md p-2 w-full"
			type="text"
			placeholder="type something interesting..."
		/>
		<button on:click={handleSend} class="hover:underline hover:cursor-pointer">send</button>
	</div>
</div>