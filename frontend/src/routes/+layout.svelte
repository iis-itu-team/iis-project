<script>
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
	import NavBar from '$lib/components/NavBar.svelte';
	import { ToastContainer, FlatToast } from 'svelte-toasts';
	import '../app.css';
	import { attemptLoad } from '$lib/stores/auth';

	// load the user
	attemptLoad();
</script>

<div class="flex flex-col text-text">
	<NavBar />
	<Breadcrumbs />
	<div class="p-10">
		<slot />
	</div>
	<ToastContainer let:data>
		<FlatToast {data} />
	</ToastContainer>
</div>
