<script lang="ts">
	import { currentUser, ensureCurrentUser } from "$lib/stores/auth";
	import { showCrumbs } from "$lib/stores/breadcrumbs";

	showCrumbs(false);

	ensureCurrentUser();
</script>

<div class="text-center">
	<p>Your fancy account!</p>
	<p>{$currentUser?.email}</p>
	<p>{$currentUser?.nickname}</p>
</div>