<script lang="ts">
	import { page } from '$app/stores';
	import logo from "$lib/assets/logo.svg";

	$: pageId = $page.route.id;
</script>

<nav class="flex flex-row h-20 gap-x-10 border-b-2 border-text">
	<img src={logo} alt="logo" />
	<div class="w-full flex flex-row justify-between pr-10">
		<div class="flex flex-row items-center gap-x-10">
			<a class={pageId === '/' ? 'font-semibold underline' : ''} href="/">home</a>
			<a class={pageId === '/explore' ? 'font-semibold underline' : ''} href="/explore">explore</a>
		</div>
		<a class=" self-center {pageId === '/account' ? 'font-semibold underline' : ''}" href="/account"
			>account</a
		>
	</div>
</nav>
