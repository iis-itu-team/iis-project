<script lang="ts">
	import { page } from '$app/stores';
	import logo from '$lib/assets/logo.svg';
	import { currentUser } from '$lib/stores/auth';
	import { showCrumbs } from '$lib/stores/breadcrumbs';

	$: pageId = $page.route.id;

	showCrumbs(false);
</script>

<nav class="flex flex-row h-20 gap-x-10 border-b-2 border-text">
	<img src={logo} alt="logo" />
	<div class="w-full flex flex-row justify-between pr-10">
		<div class="flex flex-row items-center gap-x-10">
			<a class={pageId === '/' ? 'font-semibold underline' : ''} href="/">home</a>
			<a class={pageId === '/explore' ? 'font-semibold underline' : ''} href="/explore">explore</a>
		</div>
		{#if $currentUser}
			<a
				class="self-center hover:underline hover:cursor-pointer {pageId === '/account' ? 'font-semibold underline' : ''}"
				href="/account">{$currentUser.nickname}</a
			>
		{:else}
			<div class="self-center">
				<a class="hover:underline hover:cursor-pointer {pageId === '/login' ? 'font-semibold underline' : ''}" href="/login">login</a>
				<a class="hover:underline hover:cursor-pointer {pageId === '/register' ? 'font-semibold underline' : ''}" href="/register"
					>register</a
				>
			</div>
		{/if}
	</div>
</nav>
