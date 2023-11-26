<script lang="ts">
	import { showCrumbs, setCrumbs } from '$lib/stores/breadcrumbs';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import { checkAccess, AccessType, currentUser } from '$lib/stores/auth';
	import { GroupRole, UserRole, type Thread, type ResponseFormat } from '$lib/types';
	import { client } from '$lib/http/http';
	import { toasts } from 'svelte-toasts';
	import { invalidate, invalidateAll } from '$app/navigation';

	export let data: PageData;

	$: threads = data.threads;
	$: group = data.group;

	onMount(() => {
		checkAccess({
			type: AccessType.GROUP_MEMBER_VISIBLE,
			redirectTo: '/groups',
			group
		});
	});

	showCrumbs(true);
	$: setCrumbs([
		{
			text: 'Groups',
			href: `/groups`
		},
		{
			text: group?.title ?? '',
			href: `/groups/${group?.id}`,
			selected: true
		}
	]);

	$: currentMember = group?.members?.find((m) => m.id === $currentUser?.id);

	$: canManage =
		$currentUser?.role == UserRole.ADMIN ||
		currentMember?.group_role == GroupRole.ADMIN ||
		currentMember?.group_role == GroupRole.MOD;

	const handleThreadDelete = async (thread: Thread) => {
		const res = await client.delete<ResponseFormat<void>>(`/threads/${thread.id}`);

		if (res.status === 200 && res.data.status === 'success') {
			toasts.add({
				type: 'success',
				description: `Thread ${thread.title} deleted.`
			});
			invalidateAll();
			return;
		}
	};
</script>

<p class="text-white font-semibold text-lg py-2">threads ({threads?.length}):</p>
<div class="flex flex-col gap-y-4">
	{#each threads ?? [] as thread}
		<div class="flex flex-row items-center justify-between bg-background-light rounded-xl p-4">
			<a
				href={`/groups/${group?.id}/threads/${thread.id}`}
				class="text-lg font-semibold hover:underline hover:cursor-pointer">{thread.title}</a
			>
			<div>
				<button
					on:click={() => handleThreadDelete(thread)}
					class="hover:underline hover:cursor-pointer">delete</button
				>
				<a
					href={`/groups/${group?.id}/threads/${thread.id}/edit`}
					class="hover:underline hover:cursor-pointer">edit</a
				>
			</div>
		</div>
	{/each}
</div>
<div class="text-center col-span-5">
	{#if canManage}
		<a href={`/groups/${group?.id}/threads/create`} class="hover:underline hover:cursor-pointer"
			>create a new thread</a
		>
	{/if}
</div>
