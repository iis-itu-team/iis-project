<script lang="ts">
	import { page } from '$app/stores';
</script>

<div class="text-center">
	<h1>Something went wrong.</h1>
	<h2>{$page.error?.message}</h2>
</div>
