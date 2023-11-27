<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { client } from '$lib/http/http';
	import { currentUser } from '$lib/stores/auth';
	import { setCrumbs, showCrumbs } from '$lib/stores/breadcrumbs';
	import { UserRole, type Message, type ResponseFormat, GroupRole, type User } from '$lib/types';
	import { toasts } from 'svelte-toasts';
	import type { PageData } from './$types';
	import SvelteMarkdown from 'svelte-markdown';

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

	let content: string | undefined;
	let clientHeight: number;
	$: content = undefined;

	$: validate(content);

	let error: string | undefined = undefined;

	const validate = (content?: string) => {
		if (!content) {
			error = undefined;
			return;
		}

		if (content.trim().length === 0) {
			error = 'a message cannot be just whitespace';
			return;
		}

		if (content.trim().length >= 255) {
			error = 'too long';
			return;
		}

		error = undefined;
	};

	const handleSend = async () => {
		if (content == undefined || error !== undefined) {
			return;
		}

		const res = await client.post(`/groups/${data.group?.id}/threads/${data.thread?.id}/messages`, {
			content,
			ownerId: $currentUser?.id
		});

		invalidateAll();

		content = undefined;
		height = clientHeight;
	};

	async function handleUp(current_message: Message) {
		await client
			.post('/messages/' + current_message.id + '/ratings', {
				message_id: current_message.id,
				up: 'true'
			})
			.then(() => {
				invalidateAll();
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
			});
	}

	const handleDelete = async () => {
		const res = await client.delete<ResponseFormat<void>>(`/threads/${data.thread?.id}`);

		if (res.status === 200 && res.data.status === 'success') {
			toasts.add({
				type: 'success',
				description: `Thread ${data.thread?.title} deleted.`
			});
			goto(`/groups/${data.group?.id}`, {
				invalidateAll: true
			});
			return;
		}
	};

	const handleDeleteMessage = async (message: Message) => {
		const res = await client.delete<ResponseFormat<void>>(`/messages/${message.id}`);

		if (res.status === 200 && res.data.status === 'success') {
			toasts.add({
				type: 'success',
				description: 'Message deleted.'
			});
			invalidateAll();
			return;
		}

		toasts.add({
			type: 'error',
			description: 'Something went wrong.'
		});
	};

	$: currentMember = data.group?.members?.find((m) => m.id === $currentUser?.id);

	const getUserRole = (user?: User) => {
		return data.group?.members?.find((m) => m.id === user?.id)?.group_role;
	};

	$: canManage =
		$currentUser?.role == UserRole.ADMIN ||
		currentMember?.group_role == GroupRole.ADMIN ||
		currentMember?.group_role == GroupRole.MOD;

	let scrollHeight: number;
	$: height = scrollHeight;

	$: canSend = content !== undefined && error === undefined;
</script>

<div class="flex flex-col gap-y-8">
	<div>
		<span class="text-gray-300">thread</span>
		<h2 class="font-semibold text-3xl">{data.thread?.title}</h2>
		<div class="flex flex-row items-center justify-end gap-x-4">
			{#if canManage}
				<a class="nav" href={`/groups/${data.group?.id}/threads/${data.thread?.id}/edit`}
					>edit thread</a
				>
				<button class="btn" on:click={handleDelete}>delete thread</button>
			{/if}
		</div>
	</div>
	<div class="flex flex-col gap-y-2 w-full">
		<p class="text-white font-semibold text-lg">messages ({data.messages?.length}):</p>

		<div class="flex flex-col [&>*:nth-child(odd)]:bg-background-light/10">
			{#if data.messages?.length == 0}
				<p class="w-full text-center italic p-4">nothing yet... so empty.</p>
			{:else}
				{#each sorted_messages as message}
					<div
						class="flex flex-col rounded-sm p-4 last:border-0 border-b border-secondary-light/20"
					>
						<div class="flex flex-row justify-between">
							<div class="place-self-start">
								<a href={`/users/${message.owner?.id}`} class="text-lg font-semibold nav"
									>{message.owner?.nickname}</a
								>
								<span class="italic">group {getUserRole(message.owner)}</span>
							</div>
							<div class="flex flex-row gap-x-2 items-center">
								<button
									class="w-10 h-10 p-1 font-bold text-xl border rounded-full border-primary hover:bg-background-light {message.user_rating ===
										'true' && 'bg-primary-light'}"
									on:click={() => handleUp(message)}
								>
									&#x21E7
								</button>
								<span class="font-bold w-4 text-center">{message.rating}</span>
								<button
									class="w-10 h-10 p-1 font-bold text-xl border rounded-full border-secondary hover:bg-background-light {message.user_rating ===
										'false' && 'bg-secondary-light'}"
									on:click={() => handleDown(message)}
								>
									&#x21E9
								</button>
							</div>
						</div>
						<div class="flex text-md justify-between">
							<div class="message-content">
								<SvelteMarkdown source={message.content} />
							</div>
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
						<div class="flex flex-row justify-end pt-8">
							<button class="btn" on:click={() => handleDeleteMessage(message)}>delete</button>
						</div>
					</div>
				{/each}
			{/if}
		</div>
		{#if $currentUser}
			<div class="flex flex-row gap-x-4 w-full items-end">
				<textarea
					bind:clientHeight
					on:input={(e) => {
						//@ts-ignore
						scrollHeight = e.target?.scrollHeight;
					}}
					style="height: {height}px"
					class="bg-background-light rounded-md p-2 w-full max-h-60 resize-none overflow-hidden"
					on:keydown={(event) => (event.key == 'Enter' && !event.shiftKey ? handleSend() : null)}
					bind:value={content}
					placeholder="type something interesting..."
				/>
				<div class="w-20 text-center m-auto">
					<span class="text-gray-300 text-sm {(content?.length ?? 0) >= 255 && 'text-red-300'}"
						>{content?.length ?? 0}/255</span
					>
					<button on:click={handleSend} disabled={!canSend} class={canSend ? 'btn' : 'btn-disabled'}
						>send</button
					>
				</div>
			</div>
			<span class="text-md italic text-gray-300">*supports markdown</span>
			{#if error}
				<span class="text-red-300">{error}</span>
			{/if}
		{:else}
			<div class="w-full">
				<span class="italic">Only registered users that are group members can send messages.</span>
			</div>
		{/if}
	</div>
</div>

<style lang="postcss">
	.message-content :global(h1) {
		@apply text-xl font-semibold;
	}

	.message-content :global(h2) {
		@apply text-lg font-semibold;
	}

	.message-content :global(h3) {
		@apply font-semibold;
	}
</style>
