<script lang="ts">
	import { page } from '$app/stores';
</script>

<div class="text-center p-10">
	<h2 class="text-2xl">{$page.error?.message ?? 'Something went wrong.'}</h2>
</div>
