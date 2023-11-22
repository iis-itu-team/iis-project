<script lang="ts">
	import { currentUser, ensureLoggedIn } from '$lib/stores/auth';
	import { showCrumbs } from '$lib/stores/breadcrumbs';

	showCrumbs(false);
	ensureLoggedIn();
</script>

<div class="text-center">
	<p>Your fancy account!</p>
	<d>{$currentUser?.email}</d>
	<p>{$currentUser?.nickname}</p>
</div>
