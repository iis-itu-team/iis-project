<script lang="ts">
	import GroupList from '$lib/components/GroupList.svelte';
	import { setCrumbs, showCrumbs } from '$lib/stores/breadcrumbs';
	import { client } from '$lib/http/http';
	import { currentUser } from '$lib/stores/auth';
	import type { ResponseFormat, Group } from '$lib/types';
	import { get } from 'svelte/store';
	import { errorInfoFromResponse } from '$lib/common/error';
	import Error from "../+error.svelte";

	const fetchGroups = (async () => {
		const res = await client.get<ResponseFormat<Group[]>>('/groups', {
			params: {
				userId: get(currentUser)?.id
			}
		});

		if (res.status !== 200) {
			throw errorInfoFromResponse(res);
		}

		return res.data.data;
	})();

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
	{#await fetchGroups}
		<p class="text-center">loading...</p>
	{:then groups}
		<p class="text-white font-semibold text-lg">my groups ({groups?.length ?? 0}):</p>
		<GroupList groups={groups ?? []} />
		<a href={`/groups/create`} class="self-center hover:underline hover:cursor-pointer"
			>create a new group</a
		>
	{:catch error}
		<Error {error} />
	{/await}
</div>
