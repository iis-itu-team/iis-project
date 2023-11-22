<script lang="ts">
	import { showCrumbs } from '$lib/stores/breadcrumbs';
	import type { PageData } from './$types';

	export let data: PageData;

	// showCrumbs(false);
</script>

<div class="text-center">
	<p>Your fancy account!</p>
	<d>{data.user?.email}</d>
	<p>{data.user?.nickname}</p>
</div>
