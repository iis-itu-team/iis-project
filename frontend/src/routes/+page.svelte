<script lang="ts">
	import { showCrumbs } from '$lib/stores/breadcrumbs';
	import type { Group } from '$lib/types/group';
	import GroupList from '$lib/components/GroupList.svelte';
	import { Visibility } from '$lib/types/visibility';
	import { toasts } from 'svelte-toasts';
	import { client } from '$lib/http/http';
	import type { ResponseFormat } from '$lib/types';
	import { errorInfoFromResponse } from '$lib/common/error';
	import Error from './+error.svelte';
    import Pagination from '$lib/components/Pagination.svelte';

    let pageCurrent: number = 1
    let pageFirst: number = 0
    let pageLast: number = 0

	async function fetch() {
        const groupsRes = await client.get<ResponseFormat<Group[]>>('/groups', {
            params: {
                page: pageCurrent
            }
        });

		if (groupsRes.status === 200 && groupsRes.data.status === 'success') {
			const groups = groupsRes.data.data!;

			const publicGroups = groups.filter((group) => {
				return group.visibility == Visibility.PUBLIC;
			});
			const protectedGroups = groups.filter((group) => {
				return group.visibility == Visibility.PROTECTED;
			});
			const privateGroups = groups.filter((group) => {
				return group.visibility == Visibility.PRIVATE;
			});

            pageFirst = groupsRes.data.pagination?.firstPage ?? 0
            pageLast = groupsRes.data.pagination?.lastPage ?? 0
            pageCurrent = groupsRes.data.pagination?.currentPage ?? 0

			return [publicGroups, protectedGroups, privateGroups];
		} else {
			toasts.add({
				type: 'error',
				description: 'Failed loading groups.'
			});

			throw errorInfoFromResponse(groupsRes);
		}
	};

    let fetchPromise = fetch();

	showCrumbs(false);
</script>

<div class="flex flex-col gap-y-8">
	{#await fetchPromise}
		<p class="text-md">loading...</p>
	{:then [publicGroups, protectedGroups, privateGroups]}
		{#if publicGroups.length > 0}
			<div>
				<p class="font-semibold text-lg">public groups ({publicGroups.length}):</p>
				<GroupList groups={publicGroups} visibility={Visibility.PUBLIC} />
			</div>
		{/if}

		{#if protectedGroups.length > 0}
			<div>
				<p class="font-semibold text-lg">protected groups ({protectedGroups.length}):</p>
				<GroupList groups={protectedGroups} visibility={Visibility.PROTECTED} />
			</div>
		{/if}

		{#if privateGroups.length > 0}
			<div>
				<p class="font-semibold text-lg">private groups ({privateGroups.length}):</p>
				<GroupList groups={privateGroups} visibility={Visibility.PRIVATE} />
			</div>
		{/if}

		<Pagination bind:pageCurrent={pageCurrent} pageFirst={pageFirst} pageLast={pageLast} updateFunction={() => fetchPromise = fetch()}/>
	{:catch err}
		<Error error={err} />
	{/await}
</div>
