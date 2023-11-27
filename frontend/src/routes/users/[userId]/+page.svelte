<script lang="ts">
	import { page } from '$app/stores';
	import UserStatistics from '$lib/components/UserStatistics.svelte';
	import { setCrumbs, showCrumbs } from '$lib/stores/breadcrumbs';
	import type { PageData } from './$types';

	export let data: PageData;

	showCrumbs(true);
	$: setCrumbs([
		{
			text: 'Users'
		},
		{
			text: data.user?.nickname,
			href: $page.url.href,
			selected: true
		}
	]);
</script>

<div class="m-auto max-w-lg">
	<h2 class="text-2xl font-semibold">{data.user?.nickname}</h2>
	<p>{data.user?.email}</p>

	<div class="py-4">
		<h2 class="text-lg font-semibold">Statistics:</h2>
		<UserStatistics statistics={data.statistics} />
	</div>
</div>
