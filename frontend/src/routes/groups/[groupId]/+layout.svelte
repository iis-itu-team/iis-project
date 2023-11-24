<script lang="ts">
	import { client } from '$lib/http/http';
	import { AccessType, checkAccess, currentUser } from '$lib/stores/auth';
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
	import { writable } from 'svelte/store';
	import { onMount } from 'svelte';
	import { goto, invalidate, invalidateAll } from '$app/navigation';
	import { requestToJoin } from '$lib/common/group';

	export let data: PageData;

	$: group = data.group;

	$: currentMember = group?.members?.find((m) => m.id === $currentUser?.id);
	$: joined = currentMember != undefined;

	const sentJoinRequest = writable<GroupRequest | null | undefined>(null);
	const sentModRequest = writable<GroupRequest | null | undefined>(null);

	onMount(() => {
		checkAccess({
			type: AccessType.GROUP_MEMBER_VISIBLE,
			redirectTo: '/groups',
			group,
		});

		client
			.get<ResponseFormat<GroupRequest[]>>(`/groups/${group?.id}/requests`, {
				params: {
					me: 'true',
					type: GroupRequestType.JOIN
				}
			})
			.then((res) => {
				if (res.status == 200 && res.data.count !== 0) {
					sentJoinRequest.set(res.data?.data?.[0]);
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
					sentModRequest.set(res.data?.data?.[0]);
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
		$sentJoinRequest = await requestToJoin(group);
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

		$sentModRequest = res.data.data;
		toasts.add({
			type: 'success',
			description: 'Sent a request to be a mod in this group.'
		});
	};

	const handleDelete = () => {
		/* TODO: Implement */
	};

	$: canKick =
		$currentUser?.role == UserRole.ADMIN ||
		currentMember?.group_role == GroupRole.ADMIN ||
		currentMember?.group_role == GroupRole.MOD;

	// can leave only if he's not an admin
	$: canLeave = currentMember?.group_role !== GroupRole.ADMIN;
</script>

<div class="grid grid-cols-12 grid-rows-2 gap-8">
	<div class="col-span-9">
		<slot />
	</div>
	<div class="col-span-3">
		<div class="flex flex-col gap-y-4">
			<div class=" grid grid-cols-2 grid-rows-3">
				{#if $currentUser}
					<span class="font-semibold">{$currentUser?.nickname}</span>
					<span class="italic text-right">{currentMember?.group_role ?? 'guest'}</span>
					{#if joined && currentMember?.group_role == GroupRole.MEMBER}
						<span class="italic">mod</span>
						<div class="text-right">
							{#if $sentModRequest && $sentModRequest.status == GroupRequestStatus.WAITING}
								<span>waiting</span>
							{:else if $sentModRequest && $sentModRequest.status == GroupRequestStatus.DENIED}
								<span>denied</span>
							{:else}
								<button on:click={requestMod}>request mod</button>
							{/if}
						</div>
					{/if}
					<span class="italic">presence</span>
					<div class="text-right">
						{#if joined}
							{#if canLeave}
								<button on:click={handleLeave}>leave</button>
							{/if}
						{:else if $sentJoinRequest && $sentJoinRequest.status == GroupRequestStatus.WAITING}
							<span>waiting</span>
						{:else if $sentJoinRequest && $sentJoinRequest.status == GroupRequestStatus.DENIED}
							<span>denied</span>
						{:else}
							<button on:click={handleRequestToJoin}>request to join</button>
						{/if}
					</div>
					{#if currentMember?.group_role == GroupRole.ADMIN || currentMember?.group_role == GroupRole.MOD}
						<div class="text-left">
							<a href={`/groups/${group?.id}/requests`}>requests</a>
						</div>
					{/if}
					{#if currentMember?.group_role == GroupRole.ADMIN}
						<div class="text-right">
							<a href={`/groups/${group?.id}/edit`}>edit group</a>
						</div>
						<div class="text-left">
							<button on:click={handleDelete}>delete group</button>
						</div>
					{/if}
				{/if}
			</div>
			<div>
				<span class="font-semibold">members ({group?.members?.length ?? 0}):</span>
				{#each group?.members?.filter((m) => m.id !== $currentUser?.id) ?? [] as member}
					<div class="grid grid-rows-2">
						<span>{member.nickname}</span>
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

<style>
	button:hover,
	a:hover {
		text-decoration: underline;
		cursor: pointer;
	}
</style>
