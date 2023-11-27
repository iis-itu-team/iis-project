<script lang="ts">
	import GroupList from '$lib/components/GroupList.svelte';
	import { setCrumbs, showCrumbs } from '$lib/stores/breadcrumbs';
	import { client } from '$lib/http/http';
	import { currentUser } from '$lib/stores/auth';
	import type { ResponseFormat, Group } from '$lib/types';
	import { get } from 'svelte/store';
	import { errorInfoFromResponse } from '$lib/common/error';
	import Error from "../+error.svelte";
    import Pagination from '$lib/components/Pagination.svelte';

	let pageCurrent: number = 1;
    let pageFirst: number = 0;
    let pageLast: number = 0;

	async function fetchGroups() {
		const res = await client.get<ResponseFormat<Group[]>>('/groups', {
			params: {
                userId: get(currentUser)?.id,
                page: pageCurrent
			}
		});

		if (res.status !== 200) {
			throw errorInfoFromResponse(res);
		}

        pageFirst = res.data.pagination?.firstPage ?? 0
        pageLast = res.data.pagination?.lastPage ?? 0
        pageCurrent = res.data.pagination?.currentPage ?? 0

		return res.data.data;
	};
    let fetchGroupsPromise = fetchGroups();

	showCrumbs(true);
	setCrumbs([
		{
			text: 'Groups',
			href: '/groups',
			selected: true
		}
	]);
</script>

<div class="flex flex-col">
	{#await fetchGroupsPromise}
		<p class="text-center">loading...</p>
	{:then groups}
		<a href={`/groups/create`} class="nav self-end"
			>create a new group</a
		>
		<p class="text-white font-semibold text-lg">my groups ({groups?.length ?? 0}):</p>
		<GroupList groups={groups ?? []} />
		<Pagination bind:pageCurrent={pageCurrent} pageFirst={pageFirst} pageLast={pageLast} updateFunction={() => fetchGroupsPromise = fetchGroups()}/>
	{:catch error}
		<Error {error} />
	{/await}
</div>
