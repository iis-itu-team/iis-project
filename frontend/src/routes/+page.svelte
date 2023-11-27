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

    let pagePubCurrent: number = 1
    let pagePubFirst: number = 0
    let pagePubLast: number = 0

    let pageProtCurrent: number = 1
    let pageProtFirst: number = 0
    let pageProtLast: number = 0

    let pagePrivCurrent: number = 1
    let pagePrivFirst: number = 0
    let pagePrivLast: number = 0

    let totalPub: number = 0
    let totalProt: number = 0
    let totalPriv: number = 0

	async function fetch() {
        const groupsPubRes = await client.get<ResponseFormat<Group[]>>('/groups', {
            params: {
                page: pagePubCurrent,
                visibility: Visibility.PUBLIC
            }
        });

        const groupsProtRes = await client.get<ResponseFormat<Group[]>>('/groups', {
            params: {
                page: pageProtCurrent,
                visibility: Visibility.PROTECTED
            }
        });

        const groupsPrivRes = await client.get<ResponseFormat<Group[]>>('/groups', {
            params: {
                page: pagePrivCurrent,
                visibility: Visibility.PRIVATE
            }
        });

        let groupsPub: Group[] = []
        let groupsProt: Group[] = []
        let groupsPriv: Group[] = []

		if (groupsPubRes.status === 200 && groupsPubRes.data.status === 'success') {
			groupsPub = groupsPubRes.data.data!;

            pagePubFirst = groupsPubRes.data.pagination?.firstPage ?? 0
            pagePubLast = groupsPubRes.data.pagination?.lastPage ?? 0
            pagePubCurrent = groupsPubRes.data.pagination?.currentPage ?? 0
            totalPub = groupsPubRes.data.pagination?.total ?? 0
		} else {
			toasts.add({
				type: 'error',
				description: 'Failed loading public groups.'
			});

			throw errorInfoFromResponse(groupsPubRes);
		}

		if (groupsProtRes.status === 200 && groupsProtRes.data.status === 'success') {
			groupsProt = groupsProtRes.data.data!;

            pageProtFirst = groupsProtRes.data.pagination?.firstPage ?? 0
            pageProtLast = groupsProtRes.data.pagination?.lastPage ?? 0
            pageProtCurrent = groupsProtRes.data.pagination?.currentPage ?? 0
            totalProt = groupsProtRes.data.pagination?.total ?? 0
		} else {
			toasts.add({
				type: 'error',
				description: 'Failed loading protected groups.'
			});

			throw errorInfoFromResponse(groupsProtRes);
		}

		if (groupsPrivRes.status === 200 && groupsPrivRes.data.status === 'success') {
			groupsPriv = groupsPrivRes.data.data!;

            pagePrivFirst = groupsPrivRes.data.pagination?.firstPage ?? 0
            pagePrivLast = groupsPrivRes.data.pagination?.lastPage ?? 0
            pagePrivCurrent = groupsPrivRes.data.pagination?.currentPage ?? 0
            totalPriv = groupsPrivRes.data.pagination?.total ?? 0
		} else {
			toasts.add({
				type: 'error',
				description: 'Failed loading private groups.'
			});

			throw errorInfoFromResponse(groupsPrivRes);
		}

		return [groupsPub, groupsProt, groupsPriv];
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
				<p class="font-semibold text-lg">public groups ({totalPub}):</p>
				<GroupList groups={publicGroups} visibility={Visibility.PUBLIC} />
			</div>
			<Pagination bind:pageCurrent={pagePubCurrent} pageFirst={pagePubFirst} pageLast={pagePubLast} updateFunction={() => fetchPromise = fetch()}/>
		{/if}

		{#if protectedGroups.length > 0}
			<div>
				<p class="font-semibold text-lg">protected groups ({totalProt}):</p>
				<GroupList groups={protectedGroups} visibility={Visibility.PROTECTED} />
			</div>
			<Pagination bind:pageCurrent={pageProtCurrent} pageFirst={pageProtFirst} pageLast={pageProtLast} updateFunction={() => fetchPromise = fetch()}/>
		{/if}

		{#if privateGroups.length > 0}
			<div>
				<p class="font-semibold text-lg">private groups ({totalPriv}):</p>
				<GroupList groups={privateGroups} visibility={Visibility.PRIVATE} />
			</div>
			<Pagination bind:pageCurrent={pagePrivCurrent} pageFirst={pagePrivFirst} pageLast={pagePrivLast} updateFunction={() => fetchPromise = fetch()}/>
		{/if}
	{:catch err}
		<Error error={err} />
	{/await}
</div>
