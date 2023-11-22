<script lang="ts">
	import { showCrumbs } from '$lib/stores/breadcrumbs';
	import type { Group } from '$lib/types/group';
	import GroupList from '$lib/components/GroupList.svelte';

	export let data: { groups: Group[] };

	$: groups = data.groups;

	showCrumbs(false);
</script>

<div class="flex flex-col gap-y-2">
	<p class="text-white font-semibold text-lg">public groups ({groups.length}):</p>

	<GroupList groups={groups} />
</div>
