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
</script>

<div>
	<span class="text-gray-300">group</span>
	<h2 class="font-semibold text-3xl">{group?.title}</h2>
	<div class="flex flex-row items-center justify-end gap-x-4">
		{#if canManage}
			<a href={`/groups/${group?.id}/threads/create`} class="nav">create a new thread</a>
		{/if}
	</div>
</div>
<p class="text-white font-semibold text-lg py-2">threads ({threads?.length}):</p>
<div class="flex flex-col gap-y-4">
	{#each threads ?? [] as thread}
		<div class="flex flex-row items-center justify-between bg-background-light rounded-xl p-4">
			<a
				href={`/groups/${group?.id}/threads/${thread.id}`}
				class="text-lg font-semibold hover:underline hover:cursor-pointer">{thread.title}</a
			>
		</div>
	{/each}
</div>
