<script lang="ts">
	import { currentUser } from "$lib/stores/auth";

</script>

<div class="text-center">
	<p>Your fancy account!</p>
	<p>{$currentUser?.email}</p>
	<p>{$currentUser?.nickname}</p>
</div>