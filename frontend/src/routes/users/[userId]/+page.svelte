<script lang="ts">
	import { page } from '$app/stores';
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

<div class="text-center">
	<h2 class="text-2xl font-semibold">{data.user?.nickname}</h2>
	<p>{data.user?.email}</p>
</div>
