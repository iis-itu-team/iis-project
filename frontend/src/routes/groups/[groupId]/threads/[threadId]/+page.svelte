<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { client } from '$lib/http/http';
	import { currentUser } from '$lib/stores/auth';
	import { setCrumbs, showCrumbs } from '$lib/stores/breadcrumbs';
	import { UserRole, type Message, type ResponseFormat, GroupRole, type User } from '$lib/types';
	import { toasts } from 'svelte-toasts';
	import type { PageData } from './$types';
	import SvelteMarkdown from 'svelte-markdown';
	import { errorInfoFromResponse } from '$lib/common/error';
	import Pagination from '$lib/components/Pagination.svelte';
	import { Membership } from '$lib/types/group';
	import { error } from '@sveltejs/kit';

	export let data: PageData;

	let messages: Message[] = [];

	$: sorted_messages =
		messages.sort((mes1: Message, mes2: Message) => {
			let date1 = new Date(mes1.date);
			let date2 = new Date(mes2.date);

			if (date1 == date2) {
				return mes1.id > mes2.id ? 1 : -1;
			}

			return date1 > date2 ? 1 : -1;
		}) ?? [];

	let pageCurrent: number = 1;
	let pageFirst: number = 0;
	let pageLast: number = 0;
	let messagesTotal: number = 0;
	let lastLoad: boolean = true;

	async function fetchMessages() {
		// wait for threadId & groupId
		await invalidateAll();

		const messagesRes = await client.get<ResponseFormat<Message[]>>(
			`/groups/${data?.groupId}/threads/${data?.threadId}/messages`,
			{
				params: {
					expand: 'owner',
					page: pageCurrent
				}
			}
		);

		if (messagesRes.status !== 200) {
			throw error(messagesRes.status, errorInfoFromResponse(messagesRes));
		}

		pageFirst = messagesRes.data.pagination?.firstPage ?? 0;
		pageLast = messagesRes.data.pagination?.lastPage ?? 0;
		messagesTotal = messagesRes.data.pagination?.total ?? 0;

		messages = messagesRes.data.data ?? [];

		if (lastLoad) {
			lastLoad = false;
			pageCurrent = pageLast;
			// triggers reload
			fetchMessagesPromise = fetchMessages();
		} else {
			pageCurrent = messagesRes.data.pagination?.currentPage ?? 0;
		}
	}

	let fetchMessagesPromise = fetchMessages();

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

	let errorString: string | undefined = undefined;

	const validate = (content?: string) => {
		if (!content) {
			errorString = undefined;
			return;
		}

		if (content.trim().length === 0) {
			errorString = 'a message cannot be just whitespace';
			return;
		}

		if (content.trim().length >= 255) {
			errorString = 'too long';
			return;
		}

		errorString = undefined;
	};

	const handleSend = async () => {
		if (content == undefined || errorString !== undefined) {
			return;
		}

		const res = await client.post(`/groups/${data.group?.id}/threads/${data.thread?.id}/messages`, {
			content,
			ownerId: $currentUser?.id
		});

		lastLoad = true;
		fetchMessagesPromise = fetchMessages();

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
				fetchMessagesPromise = fetchMessages();
			});
	}

	async function handleDown(current_message: Message) {
		await client
			.post('/messages/' + current_message.id + '/ratings', {
				message_id: current_message.id,
				up: 'false'
			})
			.then(() => {
				fetchMessagesPromise = fetchMessages();
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
		const res = await client.delete<ResponseFormat<void>>(
			`/groups/${data.group?.id}/threads/${data.thread?.id}/messages/${message.id}`
		);

		if (res.status === 200 && res.data.status === 'success') {
			toasts.add({
				type: 'success',
				description: 'Message deleted.'
			});

			fetchMessagesPromise = fetchMessages();
			return;
		}

		toasts.add({
			type: 'error',
			description: 'Something went wrong.'
		});
	};

	let editing: {
		message?: Message;
		content?: string;
	};
	$: editing = {};

	const startEditing = (message: Message) => {
		editing = {
			message,
			content: message.content
		};
	};

	const stopEditing = () => {
		editing = {};
	};

	const saveEdit = async () => {
		const res = await client.put<ResponseFormat<Message>>(
			`/groups/${data.group?.id}/threads/${data.thread?.id}/messages/${editing.message?.id}`,
			{
				content: editing.content
			}
		);

		if (res.status === 200 && res.data.status === 'success') {
			stopEditing();

			toasts.add({
				type: 'success',
				description: 'Updated message.'
			});

			fetchMessagesPromise = fetchMessages();
			return;
		}

		toasts.add({
			type: 'error',
			description: 'Something went wrong.'
		});
	};

	$: currentMember = data.group?.members?.find((m) => m.id === $currentUser?.id);

	const getUserRole = (userId?: string) => {
		return data.group?.members?.find((m) => m.id === userId)?.group_role ?? 'guest';
	};

	const canManageMessage = (message: Message) => {
		// only if admin, or the message is mod / member message
		// admins can delete messages of each other, why not
		if ($currentUser?.role === UserRole.ADMIN) {
			return true;
		}

		if (data.group?.membership === Membership.GUEST) {
			return false;
		}

		if (message.owner_id === $currentUser?.id) {
			return true;
		}

		const userRole = getUserRole(message.owner_id);

		// is admin, message belongs to mod / user
		if (
			currentMember?.group_role === GroupRole.ADMIN &&
			(userRole === GroupRole.MOD || userRole === GroupRole.MEMBER)
		) {
			return true;
		}

		// is mod, message belogns to user
		if (currentMember?.group_role === GroupRole.MOD && userRole === GroupRole.MEMBER) {
			return true;
		}

		return false;
	};

	$: canManage =
		$currentUser?.role == UserRole.ADMIN ||
		currentMember?.group_role == GroupRole.ADMIN ||
		currentMember?.group_role == GroupRole.MOD;

	let scrollHeight: number;
	$: height = scrollHeight;

	$: canSend = content !== undefined && errorString === undefined;
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
		<p class="text-white font-semibold text-lg">messages ({messagesTotal}):</p>

		<div class="flex flex-col [&>*:nth-child(odd)]:bg-background-light/10">
			{#if messages.length == 0}
				<p class="w-full text-center italic p-4">nothing yet... so empty.</p>
			{:else}
				<Pagination
					bind:pageCurrent
					{pageFirst}
					{pageLast}
					updateFunction={() => (fetchMessagesPromise = fetchMessages())}
				/>
				{#each sorted_messages as message}
					<div
						class="flex flex-col rounded-sm p-4 last:border-0 border-b border-secondary-light/20"
					>
						<div class="flex flex-row justify-between">
							<div class="place-self-start">
								<a href={`/users/${message.owner?.id}`} class="text-lg font-semibold nav"
									>{message.owner?.nickname}</a
								>
								<span class="italic">group {getUserRole(message.owner_id)}</span>
								<span class="text-right">
									@
									{new Date(message.date).toLocaleString('en-gb', {
										hour: '2-digit',
										minute: '2-digit',
										day: '2-digit',
										month: '2-digit',
										year: 'numeric'
									})}
								</span>
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
						<div class="p-2 message-content">
							{#if editing.message?.id === message.id}
								<textarea
									bind:clientHeight
									on:input={(e) => {
										//@ts-ignore
										scrollHeight = e.target?.scrollHeight;
									}}
									style="height: {height}px"
									class="bg-background-light rounded-md w-full max-h-60 resize-none overflow-hidden"
									on:keydown={(event) =>
										event.key == 'Enter' && !event.shiftKey ? saveEdit() : null}
									bind:value={editing.content}
								/>
							{:else}
								<SvelteMarkdown source={message.content} />
							{/if}
						</div>
						{#if canManageMessage(message)}
							<div class="flex flex-row justify-end pt-8 gap-x-4">
								{#if editing.message?.id === message.id}
									<button class="btn-no" on:click={stopEditing}>cancel</button>
									<button class="btn" on:click={saveEdit}>save</button>
								{:else}
									<button class="btn" on:click={() => startEditing(message)}>edit</button>
									<button class="btn" on:click={() => handleDeleteMessage(message)}>delete</button>
								{/if}
							</div>
						{/if}
					</div>
				{/each}
			{/if}
		</div>
		{#if $currentUser && (data.group?.membership !== Membership.GUEST || canManage)}
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
			{#if errorString}
				<span class="text-red-300">{errorString}</span>
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
