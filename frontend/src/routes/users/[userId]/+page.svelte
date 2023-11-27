<script lang="ts">
	import { page } from '$app/stores';
	import UserStatistics from '$lib/components/UserStatistics.svelte';
	import { client } from '$lib/http/http';
	import { currentUser } from '$lib/stores/auth';
	import { setCrumbs, showCrumbs } from '$lib/stores/breadcrumbs';
	import { type ResponseFormat, UserRole, type User, type FormFields } from '$lib/types';
	import { toasts } from 'svelte-toasts';
	import type { PageData } from './$types';
	import { invalidateAll } from '$app/navigation';
	import Form from '$lib/components/Form.svelte';

	export let data: PageData;

	showCrumbs(true);
	$: setCrumbs([
		{
			text: 'Users'
		},
		{
			text: data.user?.nickname,
			href: $page.url.href,
			selected: true
		}
	]);

	$: isCurrentUser = $currentUser?.id === data.user?.id;

	const handleMakeAdmin = async () => {
		const res = await client.put<ResponseFormat<User>>(`/users/${data.user.id}`, {
			role: UserRole.ADMIN
		});

		if (res.status === 200 && res.data.status === 'success') {
			toasts.add({
				type: 'success',
				description: 'User made an administrator.'
			});
			invalidateAll();
			return;
		}

		toasts.add({
			type: 'error',
			description: 'Something went wrong.'
		});
	};

	const handleDeleteUser = async () => {
		const res = await client.delete<ResponseFormat<void>>(`/users/${data.user.id}`);

		if (res.status === 200 && res.data.status === 'success') {
			toasts.add({
				type: 'success',
				description: 'User deleted.'
			});
			invalidateAll();
			return;
		}

		toasts.add({
			type: 'error',
			description: 'Something went wrong.'
		});
	};

	const fields: FormFields = {
		nickname: {
			validate(val) {
				if (!val || val.trim().length === 0) {
					return 'nickname cannot be empty';
				}
			},
			type: 'text',
			title: 'Nickname'
		}
	};
	$: defaults = {
		nickname: data.user.nickname
	};

	let editingNickname = false;

	const handleNickChange = async (values: any) => {
		const res = await client.put<ResponseFormat<User>>(`/users/${data.user.id}`, values);

		if (res.status === 200 && res.data.status === 'success') {
			toasts.add({
				type: 'success',
				description: 'Users nickname updated.'
			});
			invalidateAll();
			editingNickname = false;
			return true;
		}

		return res.data;
	};
</script>

<div class="flex flex-col">
	{#if isCurrentUser}
		<div class="flex flex-row justify-end">
			<a class="nav" href="/account">manage your account</a>
		</div>
	{/if}
	<div class="m-auto max-w-lg">
		<div>
			<span class="text-2xl font-semibold">{data.user?.nickname}</span>
			<span class="italic px-2">{data.user.role}</span>
		</div>
		<p>{data.user?.email}</p>

		<div class="py-4">
			<h2 class="text-lg font-semibold">Statistics</h2>
			<UserStatistics statistics={data.statistics} />
		</div>

		<!-- admin controls -->
		{#if $currentUser?.role === UserRole.ADMIN}
			<h2 class="font-semibold text-lg py-4">Administration</h2>
			<div class="flex flex-col items-center justify-center">
				{#if editingNickname}
					<Form
						onCancel={() => (editingNickname = false)}
						onSubmit={handleNickChange}
						{defaults}
						{fields}
						submitText="change"
					/>
				{:else}
					<button class="btn" on:click={() => (editingNickname = true)}>edit nickname</button>
				{/if}
				<div class="flex flex-row gap-x-4 p-4">
					<button
						class="btn {data.user.role === UserRole.ADMIN && 'btn-disabled'}"
						disabled={data.user.role === UserRole.ADMIN}
						on:click={handleMakeAdmin}>make admin</button
					>
					<button class="btn-red" on:click={handleDeleteUser}>delete user</button>
				</div>
			</div>
		{/if}
	</div>
</div>
