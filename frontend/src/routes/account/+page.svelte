<script lang="ts">
	import { currentUser } from '$lib/stores/auth';
</script>

<div class="text-center">
	<p>Your fancy account!</p>
	<d>{$currentUser?.email}</d>
	<p>{$currentUser?.nickname}</p>
</div>
