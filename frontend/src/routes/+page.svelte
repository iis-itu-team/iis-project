<script lang="ts">
	import { showCrumbs } from '$lib/stores/breadcrumbs';
	import type { Group } from '$lib/types/group';
	import GroupList from '$lib/components/GroupList.svelte';
	import { Visibility } from '$lib/types/visibility';

	export let data: { groups: Group[] };

	$: groups = data.groups;

	$: public_groups = groups.filter((group) => {return group.visibility == Visibility.PUBLIC});
	$: protected_groups = groups.filter((group) => {return group.visibility == Visibility.PROTECTED});
	$: private_groups = groups.filter((group) => {return group.visibility == Visibility.PRIVATE});

	showCrumbs(false);
</script>

<div class="flex flex-col gap-y-2">
	<p class="text-white font-semibold text-lg">public groups ({public_groups.length}):</p>
	<GroupList groups={public_groups} />

	<br>

	<p class="text-white font-semibold text-lg">protected groups ({protected_groups.length}):</p>
	<GroupList groups={protected_groups} />

	<br>

	<p class="text-white font-semibold text-lg">private groups ({private_groups.length}):</p>
	<GroupList groups={private_groups} />
</div>
