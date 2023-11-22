<script lang="ts">
	import { client } from '$lib/http/http';
	import { currentUser } from '$lib/stores/auth';
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

	export let data: PageData;

	$: group = data.group;

	$: currentMember = group?.members?.find((m) => m.id === $currentUser?.id);
	$: joined = currentMember != undefined;

	const sentRequest = writable<GroupRequest | null | undefined>(null);

	onMount(() => {
		client
			.get<ResponseFormat<GroupRequest[]>>(`/groups/${group?.id}/requests`, {
				params: {
					me: 'true',
					type: GroupRequestType.JOIN
				}
			})
			.then((res) => {
				if (res.status == 200 && res.data.count !== 0) {
					sentRequest.set(res.data?.data?.[0]);
				}
			});
	});

	const handleKick = (member: Member) => {
		/* TODO: Implement */
	};

	const handleLeave = () => {
		/* TODO: Implement */
	};

	const requestToJoin = async () => {
		const res = await client.post<ResponseFormat<void>>(`/groups/${group?.id}/requests`, {
			type: GroupRequestType.JOIN
		});

		if (res.status !== 200) {
			if (res.data.status == 'already_joined') {
				toasts.add({
					type: 'error',
					description: 'You are already joined in this group.'
				});
				return;
			}

			if (res.data.status == 'already_exists') {
				toasts.add({
					type: 'error',
					description: 'You already requested to join, wait for a response.'
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
			description: 'Sent a request to join this group.'
		});
	};

	$: canKick =
		$currentUser?.role == UserRole.ADMIN ||
		currentMember?.group_role == GroupRole.ADMIN ||
		currentMember?.group_role == GroupRole.MOD;
</script>

<div class="grid grid-cols-12 grid-rows-2 gap-8">
	<div class="col-span-9">
		<slot />
	</div>
	<div class="col-span-3">
		<div class="flex flex-col gap-y-4">
			<div class="text-right">
				{#if joined}
					<button on:click={handleLeave}>leave</button>
				{:else if $sentRequest && $sentRequest.status == GroupRequestStatus.WAITING}
					<span>waiting for response</span>
				{:else if $sentRequest && $sentRequest.status == GroupRequestStatus.DENIED}
					<span>request denied</span>
				{:else}
					<button on:click={requestToJoin}>request to join</button>
				{/if}
			</div>
			<div>
				<span class="font-semibold">members ({group?.members?.length ?? 0}):</span>
				{#each group?.members ?? [] as member}
					<div class="grid grid-rows-2">
						<span>{member.nickname}</span>
						<span class="italic">{member.group_role}</span>
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
	button:hover {
		text-decoration: underline;
		cursor: pointer;
	}
</style>
