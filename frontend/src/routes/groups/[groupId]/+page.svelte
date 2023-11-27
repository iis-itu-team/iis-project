<script lang="ts">
	import { showCrumbs, setCrumbs } from '$lib/stores/breadcrumbs';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import { checkAccess, AccessType, currentUser } from '$lib/stores/auth';
	import { GroupRole, UserRole, type Thread, type ResponseFormat } from '$lib/types';
	import { client } from '$lib/http/http';
	import Pagination from '$lib/components/Pagination.svelte';
	import Error from '../../+error.svelte';
	import { error } from '@sveltejs/kit';
	import { errorInfoFromResponse } from '$lib/common/error';
	import { invalidateAll } from '$app/navigation';

	export let data: PageData;

	$: group = data.group;
	let threadsLength: number = 0;
	let pageCurrent: number = 1;
	let pageFirst: number = 0;
	let pageLast: number = 0;

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

	async function fetch() {
		// waits for group.id to be loaded in
		await invalidateAll();

		const threadsRes = await client.get<ResponseFormat<Thread[]>>(`/groups/${group?.id}/threads`, {
		    params: {
		        page: pageCurrent
		    }              
		});                
		                   
		if (threadsRes.status !== 200) {                                                                                                       
		    throw error(threadsRes.status, errorInfoFromResponse(threadsRes));
		}

		pageFirst = threadsRes.data.pagination?.firstPage ?? 0;
		pageLast = threadsRes.data.pagination?.lastPage ?? 0;
		pageCurrent = threadsRes.data.pagination?.currentPage ?? 0;

		const result = threadsRes.data.data ?? [];
		threadsLength = result.length;
		return result;
	};

	let fetchPromise = fetch();
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
<p class="text-white font-semibold text-lg py-2">threads ({threadsLength}):</p>
<div class="flex flex-col gap-y-4">
	{#await fetchPromise}
		<p>Loading...<p/>
	{:then threads}
		{#each threads as thread}
			<div class="flex flex-row items-center justify-between bg-background-light rounded-xl p-4">
				<a
					href={`/groups/${group?.id}/threads/${thread.id}`}
					class="text-lg font-semibold hover:underline hover:cursor-pointer">{thread.title}</a
				>
			</div>
		{/each}
		<Pagination bind:pageCurrent={pageCurrent} pageFirst={pageFirst} pageLast={pageLast} updateFunction={() => fetchPromise = fetch()}/>
	{:catch err}
		<Error error={err}/>
	{/await}
</div>
