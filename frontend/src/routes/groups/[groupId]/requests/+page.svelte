<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { AccessType, checkAccess } from '$lib/stores/auth';
	import { setCrumbs, showCrumbs } from '$lib/stores/breadcrumbs';
	import { GroupRequestStatus, type GroupRequest, type ResponseFormat } from '$lib/types';
	import { toasts } from 'svelte-toasts';
	import type { PageData } from './$types';
	import { client } from '$lib/http/http';
	import { onMount } from 'svelte';
	import { error } from '@sveltejs/kit';
	import { errorInfoFromResponse } from '$lib/common/error';
	import Error from '../../../+error.svelte';
	import Pagination from '$lib/components/Pagination.svelte';

	export let data: PageData;

	$: groupId = data.group?.id;

	showCrumbs(true);
	$: setCrumbs([
		{
			text: 'Groups'
		},
		{
			text: data.group?.title ?? '',
			href: `/groups/${data.group?.id}`
		},
		{
			text: 'Requests',
			href: `/groups/${data.group?.id}/requests`,
			selected: true
		}
	]);

	onMount(() => {
		checkAccess({
			type: AccessType.GROUP_MANAGE,
			group: data.group,
			redirectTo: `/groups/${data.group?.id}`
		});
	});

	const handleStatusChange = async (request: GroupRequest, status: GroupRequestStatus) => {
		const res = await client.put<ResponseFormat<void>>(`/requests/${request.id}/status`, {
			status
		});

		if (res.status !== 200) {
			toasts.add({
				type: 'error',
				description: 'Something went wrong.'
			});
			return;
		}

		fetchPromise = fetch();
		toasts.add({
			type: 'success',
			description: status === GroupRequestStatus.DENIED ? 'Denied.' : 'Accepted.'
		});
	};

	let pageCurrent = 1;
	let pageFirst = 0;
	let pageLast = 0;
	let total = 0;

	async function fetch() {
		// waits for group id
		await invalidateAll();

		const res = await client.get<ResponseFormat<GroupRequest[]>>(`/groups/${groupId}/requests`, {
			params: {
				page: pageCurrent,
				expand: ['group', 'user'].join(',')
			}
		});

		if (res.status !== 200) {
			throw error(res.status, errorInfoFromResponse(res));
		}

		pageCurrent = res.data.pagination?.currentPage ?? 0;
		pageFirst = res.data.pagination?.firstPage ?? 0;
		pageLast = res.data.pagination?.lastPage ?? 0;
		total = res.data.pagination?.total ?? 0;

		return res.data.data ?? [];
	}

	let fetchPromise = fetch();
</script>

<span class="font-semibold">requests ({data.requests?.length}):</span>
<div class="flex flex-col gap-y-4 p-2">
	{#await fetchPromise}
		<p>Loading...</p>
	{:then reqeusts}
		{#each reqeusts as request}
			<div class="grid grid-cols-12 grid-rows-1 bg-background-light rounded-lg p-2">
				<p class="col-span-2 font-semibold">{request.user?.nickname}</p>
				<p>{request.type}</p>
				<p class="col-span-3">{request.group?.title}</p>
				<p>{request.status}</p>
				<div class="col-span-2 col-start-11 flex flex-row gap-x-2 justify-start">
					{#if request.status == GroupRequestStatus.WAITING}
						<button on:click={() => handleStatusChange(request, GroupRequestStatus.ACCEPTED)}
							>accept</button
						>
						<button on:click={() => handleStatusChange(request, GroupRequestStatus.DENIED)}
							>deny</button
						>
					{/if}
				</div>
			</div>
		{/each}
		<Pagination
			bind:pageCurrent
			{pageFirst}
			{pageLast}
			updateFunction={() => (fetchPromise = fetch())}
		/>
	{:catch err}
		<Error error={err} />
	{/await}
</div>

<style>
	button:hover {
		text-decoration: underline;
		cursor: pointer;
	}
</style>
