<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { client } from '$lib/http/http';
	import { currentUser } from '$lib/stores/auth';
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
			return;
		}

		client
			.post(`/groups/${data.group.id}/threads/${data.thread.id}/messages`, {
				content,
				ownerId: $currentUser?.id
			})
			.then(() => {
				invalidateAll();
				content = undefined;
			});
	};

	async function handleUp(current_message) {
		await client.post('/messages/' + current_message.id + '/ratings', {
			message_id: current_message.id,
			up: 'true'
		}).then(() => {
			invalidateAll();
			content = undefined;
		});
	};

	async function handleDown(current_message) {
		await client.post('/messages/' + current_message.id + '/ratings', {
			message_id: current_message.id,
			up: 'false'
		}).then(() => {
			invalidateAll();
			content = undefined;
		});
	};

</script>

<div class="flex flex-col gap-y-2 w-full">
	<p class="text-white font-semibold text-lg">messages ({data.messages.length}):</p>

	<div class="flex flex-col gap-y-4 border p-4 border-secondary rounded-md">
		{#if data.messages.length == 0}
			<p>Nothing yet... so empty.</p>
		{:else}
			{#each data.messages as message}
				<div class="flex flex-col">
					<div class="flex flex-row gap-x-2 grid grid-cols-2">
						<div class="place-self-start">
							<span class="text-lg font-semibold">{message.owner.nickname}</span>
							<span>&lt;{message.owner.email}&gt;</span>
						</div>
						<div class="flex flex-row items-center space-x-2 place-self-end">
							<p class="text-white font-bold">{message.rating}</p>
							<button class="flex bg-primary hover:bg-background-light text-white font-bold py-1 px-2.5 rounded-full" on:click={async () => await handleUp(message)}>
								&#x21E7
							</button>
							<button class="flex bg-secondary hover:bg-background-light text-white font-bold py-1 px-2.5 rounded-full" on:click={async () => await handleDown(message)}>
								&#x21E9
							</button>
						</div>
					</div>
					<div class="flex text-md justify-between">
						<p class="text-left">
							{message.content}
						</p>
						<p class="text-right">
							{message.date}
						</p>
					</div>
				</div>
			{/each}
		{/if}
	</div>
	{#if $currentUser}
		<div class="flex flex-row gap-x-4 w-full">
			<input
				bind:value={content}
				on:keydown={(event) => (event.key == 'Enter' ? handleSend() : null)}
				class="bg-background-light rounded-md p-2 w-full"
				type="text"
				placeholder="type something interesting..."
			/>
			<button
				on:click={handleSend}
				disabled={!content}
				class="{content && 'hover:underline hover:cursor-pointer'} {!content && 'text-stone-400'}"
				>send</button
			>
		</div>
	{:else}
		<div class="w-full">
			<span class="italic">Only registered users can send messages.</span>
		</div>
	{/if}
</div>
