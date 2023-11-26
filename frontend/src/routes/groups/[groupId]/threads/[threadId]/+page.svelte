<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { client } from '$lib/http/http';
	import { currentUser } from '$lib/stores/auth';
	import { setCrumbs, showCrumbs } from '$lib/stores/breadcrumbs';
	import { UserRole, type Message, type ResponseFormat, type Thread, GroupRole } from '$lib/types';
	import { toasts } from 'svelte-toasts';
	import type { PageData } from './$types';

	export let data: PageData;

	$: sorted_messages =
		data.messages?.sort((mes1: Message, mes2: Message) => {
			let date1 = new Date(mes1.date);
			let date2 = new Date(mes2.date);

			if (date1 == date2) {
				return mes1.id > mes2.id ? 1 : -1;
			}

			return date1 > date2 ? 1 : -1;
		}) ?? [];

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
			.post(`/groups/${data.group?.id}/threads/${data.thread?.id}/messages`, {
				content,
				ownerId: $currentUser?.id
			})
			.then(() => {
				invalidateAll();
				content = undefined;
			});
	};

	async function handleUp(current_message: Message) {
		await client
			.post('/messages/' + current_message.id + '/ratings', {
				message_id: current_message.id,
				up: 'true'
			})
			.then(() => {
				invalidateAll();
				content = undefined;
			});
	}

	async function handleDown(current_message: Message) {
		await client
			.post('/messages/' + current_message.id + '/ratings', {
				message_id: current_message.id,
				up: 'false'
			})
			.then(() => {
				invalidateAll();
				content = undefined;
			});
	}

	const handleDelete = async () => {
		const res = await client.delete<ResponseFormat<void>>(`/threads/${data.thread?.id}`);

		if (res.status === 200 && res.data.status === 'success') {
			toasts.add({
				type: 'success',
				description: `Thread ${data.thread?.title} deleted.`
			});
			invalidateAll();
			return;
		}
	};

	$: currentMember = data.group?.members?.find((m) => m.id === $currentUser?.id);

	$: canManage =
		$currentUser?.role == UserRole.ADMIN ||
		currentMember?.group_role == GroupRole.ADMIN ||
		currentMember?.group_role == GroupRole.MOD;
</script>

<div class="flex flex-col gap-y-8">
	<div>
		<span class="text-gray-300">thread</span>
		<h2 class="font-semibold text-3xl">{data.thread?.title}</h2>
		<div class="flex flex-row items-center justify-end gap-x-4">
			{#if canManage}
				<a class="nav" href="{`/groups/${data.group?.id}/threads/${data.thread?.id}/edit`}"
					>edit thread</a
				>
				<button class="btn" on:click={handleDelete}>delete thread</button>
			{/if}
		</div>
	</div>
	<div class="flex flex-col gap-y-2 w-full">
		<p class="text-white font-semibold text-lg">messages ({data.messages?.length}):</p>

		<div class="flex flex-col gap-y-4 border p-4 border-secondary rounded-md">
			{#if data.messages?.length == 0}
				<p>Nothing yet... so empty.</p>
			{:else}
				{#each sorted_messages as message}
					<div class="flex flex-col">
						<div class="grid grid-cols-2 gap-x-2">
							<div class="place-self-start">
								<span class="text-lg font-semibold">{message.owner.nickname}</span>
								<span>&lt;{message.owner.email}&gt;</span>
							</div>
							<div class="flex flex-row items-center space-x-2 place-self-end">
								<p class="text-white font-bold">{message.rating}</p>
								<button
									class="flex bg-primary hover:bg-background-light text-white font-bold py-1 px-2.5 rounded-full"
									on:click={async () => await handleUp(message)}
								>
									&#x21E7
								</button>
								<button
									class="flex bg-secondary hover:bg-background-light text-white font-bold py-1 px-2.5 rounded-full"
									on:click={async () => await handleDown(message)}
								>
									&#x21E9
								</button>
							</div>
						</div>
						<div class="flex text-md justify-between">
							<p class="text-left">
								{message.content}
							</p>
							<p class="text-right">
								{new Date(message.date).toLocaleString('en-gb', {
									hour: '2-digit',
									minute: '2-digit',
									day: '2-digit',
									month: '2-digit',
									year: 'numeric'
								})}
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
				<span class="italic">Only registered users that are group members can send messages.</span>
			</div>
		{/if}
	</div>
</div>
