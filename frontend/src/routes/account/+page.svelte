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

	showCrumbs(false);

	onMount(() => {
		ensureLoggedIn();
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

	let groups_count = 0;
	let threads_count = 0;
	let messages_count = 0;
	let score = 0;

	let group_last = '';
	let thread_last = '';

	const getStatistics = async () => {
		const res = await client.put<ResponseFormat<User>>(`/users/${$currentUser?.id}`, {
			...values
		});

		if (res.status === 200 && res.data.status === 'success') {
			// alert("gucci")
		}

		groups_count = 0;
		threads_count = 0;
		messages_count = 0;
		score = 0;

		group_last = '';
		thread_last = '';

		const messages = res.data.data;

		for (let message in messages) {
			if (group_last !== message.group_id) {
				group_last = message.group_id;
				groups_count++;
			}

			if (thread_last !== message.thread_id) {
				thread_last = message.thread_id;
				threads_count++;
			}

			// TODO: fix rating
			if (message.rating !== null) {
				score += message.rating;
			}

			messages_count++;
		}
	};
</script>

<div class="flex flex-col">
	<div class="self-end">
		<button class="hover:cursor-pointer hover:underline" on:click={handleLogout}>logout</button>
	</div>

	<div class="max-w-md m-auto p-10">
		<Form bind:errors {fields} onSubmit={handleSubmit} {defaults} />
	</div>

	<div class="flex flex-col items-center gap-y-4 p-10">
		<div class="flex flex-col">
			<p class="bold text-xl">Statistics:</p>
		</div>

		<div class="flex flex-col">
			<p>Groups: {groups_count}</p>
			<p>Threads: {threads_count}</p>
			<p>Messages: {messages_count}</p>
			<p>Score (based on message rating): {score}</p>
		</div>

		<button
			class="bg-primary hover:bg-secondary box-border rounded-xl p-2 mx-auto my-5 w-full max-w-sm flex items-center justify-center text-2xl"
			on:click={getStatistics}
			>Check for statistics
		</button>
	</div>
</div>
