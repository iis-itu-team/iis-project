<script lang="ts">
	import { currentUser, ensureLoggedIn } from '$lib/stores/auth';
	import { toasts } from 'svelte-toasts';
	import { client } from '$lib/http/http';
	import type { User, ResponseFormat } from '$lib/types';
	import { showCrumbs } from '$lib/stores/breadcrumbs';
	import { logout } from '$lib/stores/auth';
	import { goto, invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';
	import Form from '$lib/components/Form.svelte';
	import type { FormFields } from '$lib/types/form';
	import UserStatistics from '$lib/components/UserStatistics.svelte';
	import type { Statistics } from '$lib/types/user';
	import { errorInfoFromResponse } from '$lib/common/error';
	import Error from '../+error.svelte';

	showCrumbs(false);

	onMount(() => {
		ensureLoggedIn();
	});

	const statistics = client
		.get<ResponseFormat<Statistics>>(`/users/${$currentUser?.id}/statistics`)
		.then((res) => {
			if (res.status !== 200) {
				throw errorInfoFromResponse(res);
			}
			return res.data.data!;
		});

	const fields: FormFields = {
		email: {
			validate(val?: string) {
				if (!val || val.trim().length === 0) {
					return 'email cannot be empty';
				}
			},
			title: 'Email',
			type: 'text'
		},
		nickname: {
			validate(val) {
				if (!val || val.trim().length === 0) {
					return 'nickname cannot be empty';
				}
			},
			title: 'Nickname',
			type: 'text'
		},
		visibility: {
			type: 'radio',
			title: 'Visibility',
			radioOptions: [
				{
					value: 'private',
					text: 'Private',
					description: 'No one can see your profile.'
				},
				{
					value: 'protected',
					text: 'Protected',
					description: 'Only registered users can see your profile.'
				},
				{
					value: 'public',
					text: 'Public',
					description: 'Anyone can see your profile.'
				}
			]
		}
	};

	$: defaults = {
		visibility: $currentUser?.visibility,
		email: $currentUser?.email,
		nickname: $currentUser?.nickname
	};

	let errors: any = {};

	const handleSubmit = async (values: any) => {
		const res = await client.put<ResponseFormat<User>>(`/users/${$currentUser?.id}`, {
			...values
		});

		if (res.status === 200 && res.data.status === 'success') {
			invalidateAll();

			$currentUser = res.data.data;

			toasts.add({
				type: 'success',
				description: 'Account information updated.'
			});
			return true;
		}

		if (res.data.status === 'nickname_taken') {
			errors.nickname = 'already taken';
			toasts.add({
				type: 'error',
				description: 'Nickname already taken.'
			});
			return;
		}

		if (res.data.status === 'email_taken') {
			errors.email = 'already taken';
			toasts.add({
				type: 'error',
				description: 'Email already taken.'
			});
			return;
		}

		if (res.data.status === 'validation_fail') {
			const validationErrors = res.data.data as unknown as any[];

			validationErrors.forEach((val: { rule: string; field: string; message: string }) => {
				errors[val.field] = val.message;
			});
			return;
		}
	};

	const handleLogout = async () => {
		await logout();
		goto('/');
	};

	const deleteAccount = async () => {
		if (confirm('Your account will be deleted') == false) {
			alert('Account deletion was cancelled by user');
			return;
		}

		await client.delete<ResponseFormat<void>>(`/users/${$currentUser?.id}`);

		goto('/');
		alert('Your account was deleted');
	};
</script>

<div class="flex flex-col">
	<div class="self-end">
		<button class="btn" on:click={handleLogout}>logout</button>
	</div>

	<div class="m-auto">
		<h2 class="font-semibold text-lg">Account settings</h2>
		<div class="max-w-md m-auto p-10">
			<Form bind:errors {fields} onSubmit={handleSubmit} {defaults} />
		</div>

		<div class="flex flex-col py-4">
			<h2 class="font-semibold text-lg">Statistics</h2>

			{#await statistics}
				loading...
			{:then stats}
				<UserStatistics statistics={stats} />
			{:catch error}
				<Error {error} />
			{/await}
		</div>
		<div class="py-4">
			<h2 class="font-semibold text-lg">Danger zone</h2>
			<div class="p-8 text-center">
				<button class="btn-red" on:click={deleteAccount}>delete my account</button>
			</div>
		</div>
	</div>
</div>
