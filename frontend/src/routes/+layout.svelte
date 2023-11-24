<script lang="ts">
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
	import NavBar from '$lib/components/NavBar.svelte';
	import { ToastContainer, FlatToast } from 'svelte-toasts';
	import '../app.css';
	import { currentUser } from '$lib/stores/auth';
	import type { PageData } from './$types';
	import { fetchRequests } from '$lib/stores/requests';

	export let data: PageData;
	
	$currentUser = data.user;
	fetchRequests();
</script>

<svelte:head>
	<title>sochub</title>
</svelte:head>

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

