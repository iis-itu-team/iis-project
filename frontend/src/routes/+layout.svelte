<script>
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
	import NavBar from '$lib/components/NavBar.svelte';
	import '../app.css';
</script>

<div class="flex flex-col text-text">
	<NavBar />
	<Breadcrumbs />
	<div class="p-10">
		<slot />
	</div>
</div>
