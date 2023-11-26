<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { AccessType, checkAccess } from '$lib/stores/auth';
	import { setCrumbs, showCrumbs } from '$lib/stores/breadcrumbs';
	import { GroupRequestStatus, type GroupRequest, type ResponseFormat } from '$lib/types';
	import { toasts } from 'svelte-toasts';
	import type { PageData } from './$types';
	import { client } from '$lib/http/http';
	import { onMount } from 'svelte';

	export let data: PageData;

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

		invalidateAll();
		toasts.add({
			type: 'success',
			description: status === GroupRequestStatus.DENIED ? 'Denied.' : 'Accepted.'
		});
	};
</script>

<span class="font-semibold">requests ({data.requests?.length}):</span>
<div class="flex flex-col gap-y-4 p-2">
	{#each data.requests ?? [] as request}
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
</div>

<style>
	button:hover {
		text-decoration: underline;
		cursor: pointer;
	}
</style>
