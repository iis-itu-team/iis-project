<script lang="ts">
	import GroupList from '$lib/components/GroupList.svelte';
	import { setCrumbs, showCrumbs } from '$lib/stores/breadcrumbs';
	import type { PageData } from './$types';

	export let data: PageData;

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
	<p class="text-white font-semibold text-lg">my groups ({data.userGroups?.length ?? 0}):</p>
	<GroupList groups={data.userGroups ?? []} />
	<a href={`/groups/create`} class="self-center hover:underline hover:cursor-pointer">create a new group</a>
</div>
