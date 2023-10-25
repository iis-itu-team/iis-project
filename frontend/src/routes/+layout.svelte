<script>
	import NavBar from '$lib/components/NavBar.svelte';
	import '../app.css';
</script>

<div class="flex flex-col text-text">
	<NavBar />
	<div class="p-20">
		<slot />
	</div>
</div>
