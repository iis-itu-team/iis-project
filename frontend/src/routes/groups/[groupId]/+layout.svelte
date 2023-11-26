<script lang="ts">
	import { client } from '$lib/http/http';
	import { currentUser, ensureLoggedIn } from '$lib/stores/auth';
	import type { ResponseFormat } from '$lib/types';
	import {
		GroupRequestType,
		GroupRole,
		type GroupRequest,
		type Member,
		GroupRequestStatus
	} from '$lib/types/group';
	import { UserRole } from '$lib/types/user';
	import { toasts } from 'svelte-toasts';
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import { goto, invalidateAll } from '$app/navigation';
	import { requestToJoin } from '$lib/common/group';
	import { page } from '$app/stores';

	export let data: PageData;

	$: group = data.group;

	$: currentMember = group?.members?.find((m) => m.id === $currentUser?.id);
	$: joined = currentMember != undefined;

	let sentJoinRequest: GroupRequest | undefined = undefined;
	let sentModRequest: GroupRequest | undefined = undefined;

	onMount(() => {
		ensureLoggedIn();

		client
			.get<ResponseFormat<GroupRequest[]>>(`/groups/${group?.id}/requests`, {
				params: {
					me: 'true',
					type: GroupRequestType.JOIN
				}
			})
			.then((res) => {
				if (res.status == 200 && res.data.count !== 0) {
					sentJoinRequest = res.data?.data?.[0];
				}
			});

		client
			.get<ResponseFormat<GroupRequest[]>>(`/groups/${group?.id}/requests`, {
				params: {
					me: 'true',
					type: GroupRequestType.MOD
				}
			})
			.then((res) => {
				if (res.status == 200 && res.data.count !== 0) {
					sentModRequest = res.data?.data?.[0];
				}
			});
	});

	const handleKick = async (member: Member) => {
		const res = await client.post<ResponseFormat<void>>(`/groups/${group?.id}/kick`, {
			userId: member.id
		});

		if (res.status !== 200) {
			if (res.data.status === 'not_a_member') {
				toasts.add({
					type: 'error',
					description: 'User is not a member.'
				});
				return;
			}

			toasts.add({
				type: 'error',
				description: 'Something went wrong.'
			});
			return;
		}

		toasts.add({
			type: 'success',
			description: 'Member kicked.'
		});
		invalidateAll();
	};

	const handleLeave = async () => {
		const res = await client.post<ResponseFormat<void>>(`/groups/${group?.id}/kick`, {
			userId: $currentUser?.id
		});

		if (res.status !== 200) {
			if (res.data.status === 'not_a_member') {
				toasts.add({
					type: 'error',
					description: 'User is not a member.'
				});
				return;
			}

			toasts.add({
				type: 'error',
				description: 'Something went wrong.'
			});
			return;
		}

		toasts.add({
			type: 'success',
			description: 'You left, bye...'
		});
		goto('/groups');
	};

	const handleRequestToJoin = async () => {
		sentJoinRequest = await requestToJoin(group);
	};

	const requestMod = async () => {
		const res = await client.post<ResponseFormat<GroupRequest>>(`/groups/${group?.id}/requests`, {
			type: GroupRequestType.MOD
		});

		if (res.status !== 200) {
			if (res.data.status == 'already_mod') {
				toasts.add({
					type: 'error',
					description: 'You are already a mod.'
				});
				return;
			}

			if (res.data.status == 'already_admin') {
				toasts.add({
					type: 'error',
					description: 'You are an admin.'
				});
				return;
			}

			if (res.data.status == 'already_exists') {
				toasts.add({
					type: 'error',
					description: 'You already requested to be a mod, wait for a response.'
				});
				return;
			}

			toasts.add({
				type: 'error',
				description: 'Something went wrong.'
			});
			return;
		}

		sentModRequest = res.data.data;
		toasts.add({
			type: 'success',
			description: 'Sent a request to be a mod in this group.'
		});
	};

	const handleDelete = async () => {
		const res = await client.delete<ResponseFormat<void>>(`/groups/${group?.id}`);

		if (res.status === 200 && res.data.status === 'success') {
			toasts.add({
				type: 'success',
				description: `Group ${group?.title} deleted.`
			});
			goto(`/groups`, {
				invalidateAll: true
			});
			return;
		}
	};

	$: canKick =
		$currentUser?.role == UserRole.ADMIN ||
		currentMember?.group_role == GroupRole.ADMIN ||
		currentMember?.group_role == GroupRole.MOD;

	// can leave only if he's not an admin
	$: canLeave = currentMember?.group_role !== GroupRole.ADMIN;

	$: otherMembers = group?.members?.filter((m) => m.id !== $currentUser?.id) ?? [];
</script>

<div class="grid grid-rows-12 gap-y-10">
	<div class="flex flex-row gap-x-4 justify-end row-span-1 items-center">
		{#if $currentUser}
			<!-- Request mod -->
			{#if joined && currentMember?.group_role == GroupRole.MEMBER}
				<div class="flex flex-col gap-x-1 items-center">
					<span class="text-gray-300">mod request</span>
					{#if sentModRequest && sentModRequest.status == GroupRequestStatus.WAITING}
						<span class="btn-disabled">waiting for response</span>
					{:else if sentModRequest && sentModRequest.status == GroupRequestStatus.DENIED}
						<span class="btn-disabled">request for mod denied</span>
					{:else}
						<button class="btn" on:click={requestMod}>request mod</button>
					{/if}
				</div>
			{/if}
			<!-- Requests -->
			{#if currentMember?.group_role == GroupRole.ADMIN || currentMember?.group_role == GroupRole.MOD}
				<div class="text-left">
					<a
						class="nav {$page.route.id === '/groups/[groupId]/requests' && 'nav-selected'}"
						href={`/groups/${group?.id}/requests`}>requests</a
					>
				</div>
			{/if}
			<!-- Edit/Delete group button -->
			{#if currentMember?.group_role == GroupRole.ADMIN}
				<a
					class="nav {$page.route.id === '/groups/[groupId]/edit' && 'nav-selected'}"
					href={`/groups/${group?.id}/edit`}>edit group</a
				>
				<div class="text-left">
					<button class="btn" on:click={handleDelete}>delete group</button>
				</div>
			{/if}
			<!-- Join/Leave button -->
			{#if joined}
				{#if canLeave}
					<button class="btn" on:click={handleLeave}>leave group</button>
				{/if}
			{:else}
				<div class="flex flex-col gap-x-1 items-center">
					<span class="text-gray-300">join request</span>
					{#if sentJoinRequest && sentJoinRequest.status == GroupRequestStatus.WAITING}
						<span class="btn-disabled">waiting for response</span>
					{:else if sentJoinRequest && sentJoinRequest.status == GroupRequestStatus.DENIED}
						<span class="btn-disabled">request denied</span>
					{:else}
						<button class="btn" on:click={handleRequestToJoin}>request to join</button>
					{/if}
				</div>
			{/if}
		{/if}
	</div>
	<div class="row-span-11 grid grid-cols-12 grid-rows-2 gap-8">
		<div class="col-span-9">
			<slot />
		</div>
		<div class="col-span-3">
			<div class="flex flex-col gap-y-4">
				<div class=" grid grid-cols-2 grid-rows-3">
					{#if $currentUser}
						<span class="font-semibold">{$currentUser?.nickname}</span>
						<span class="italic text-right">{currentMember?.group_role ?? 'guest'}</span>
					{/if}
				</div>
				<div>
					<span class="font-semibold">members ({otherMembers.length ?? 0}):</span>
					{#each otherMembers as member}
						<div class="grid grid-rows-2">
							<a href="/users/{member.id}">{member.nickname}</a>
							<span class="text-right italic">{member.group_role}</span>
							<div class="text-right col-start-2 row-start-2">
								{#if canKick && member.id !== $currentUser?.id}
									<button on:click={() => handleKick(member)}>kick</button>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
</div>
