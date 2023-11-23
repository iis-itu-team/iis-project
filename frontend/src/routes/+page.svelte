<script lang="ts">
	import { showCrumbs } from '$lib/stores/breadcrumbs';
	import type { Group } from '$lib/types/group';
	import GroupList from '$lib/components/GroupList.svelte';
	import { Visibility } from '$lib/types/visibility';
	import { toasts } from 'svelte-toasts';
	import { client } from '$lib/http/http';
	import type { ResponseFormat } from '$lib/types';

	const fetch = (async () => {
	    const groupsRes = await client.get<ResponseFormat<Group[]>>("/groups");
	
	    if (groupsRes.status === 200 && groupsRes.data.status === 'success') {
	        const groups = groupsRes.data.data!;

			const public_groups = groups.filter((group) => {return group.visibility == Visibility.PUBLIC});
			const protected_groups = groups.filter((group) => {return group.visibility == Visibility.PROTECTED});
			const private_groups = groups.filter((group) => {return group.visibility == Visibility.PRIVATE});

			return [public_groups, protected_groups, private_groups];
	    } else {
	        toasts.add({
	            type: 'error',
	            description: 'Failed loading groups'
	        });

			throw "Error loading groups";
	    }
	})()

	showCrumbs(false);
</script>

<div class="flex flex-col gap-y-2">
	{#await fetch}
		<p class ="text-white font-bold text-xl2">Loading...</p>
	{:then [public_groups, protected_groups, private_groups]}
		<p class="text-white font-semibold text-lg">public groups ({public_groups.length}):</p>
		<GroupList groups={public_groups} />

		<br>

		<p class="text-white font-semibold text-lg">protected groups ({protected_groups.length}):</p>
		<GroupList groups={protected_groups} />

		<br>

		<p class="text-white font-semibold text-lg">private groups ({private_groups.length}):</p>
		<GroupList groups={private_groups} />
	{:catch err}
		<p class ="text-red font-bold text-xl2">{err}</p>
	{/await}
</div>
