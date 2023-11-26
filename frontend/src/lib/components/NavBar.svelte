<script lang="ts">
	import { page } from '$app/stores';
	import logo from '$lib/assets/logo.svg';
	import { currentUser } from '$lib/stores/auth';

	$: pageId = $page.route.id;

	$: items = [
		{
			text: 'home',
			href: '/'
		},
		...($currentUser ? [{ text: 'my groups', href: '/groups' }] : [])
	];
</script>

<nav class="flex flex-row h-20 gap-x-10 border-b-2 border-text">
	<img src={logo} alt="logo" />
	<div class="w-full flex flex-row justify-between pr-10">
		<div class="flex flex-row items-center gap-x-10">
			{#each items as item}
				<a class="nav {pageId === item.href ? 'nav-selected' : ''}" href={item.href}
					>{item.text}</a
				>
			{/each}
		</div>
		{#if $currentUser}
			<div class="self-center flex flex-row gap-x-10">
				<a
					class="nav {pageId === '/groups/create'
						? 'nav-selected'
						: ''}"
					href="/groups/create">create group</a
				>
				<a
					class="self-center nav {pageId === '/account'
						? 'nav-selected'
						: ''}"
					href="/account">{$currentUser.nickname}</a
				>
			</div>
		{:else}
			<div class="self-center">
				<a
					class="nav {pageId === '/login'
						? 'nav-selected'
						: ''}"
					href="/login">login</a
				>
				<a
					class="nav {pageId === '/register'
						? 'nav-selected'
						: ''}"
					href="/register">register</a
				>
			</div>
		{/if}
	</div>
</nav>
