<script lang="ts">
	import { ensureLoggedIn } from '$lib/stores/auth';
	import { toasts } from 'svelte-toasts';
	import { client } from '$lib/http/http';
	import type { User, ResponseFormat, Visibility } from '$lib/types';
	import { showCrumbs } from '$lib/stores/breadcrumbs';
	import { logout } from '$lib/stores/auth';
	import { goto, invalidateAll } from '$app/navigation';
	import type { PageData } from './$types';
	import { onMount } from 'svelte';

	export let data: PageData;

	showCrumbs(false);

	onMount(() => {
		ensureLoggedIn();
	});

	// -- Realtime basic validation

	type FormValues = {
		email?: string;
		nickname?: string;
		visibility?: Visibility;
	};

	type Schema = any;

	const schema = {
		email: {
			validate(val?: string) {
				if (!val || val.trim().length === 0) {
					return 'email cannot be empty';
				}
			}
		},
		nickname: {
			validate(val?: string) {
				if (!val || val.trim().length === 0) {
					return 'nickname cannot be empty';
				}
			}
		}
	};

	const defaults = {
		visibility: data.user?.visibility,
		email: data.user?.email,
		nickname: data.user?.nickname
	};

	let values: FormValues = {
		...defaults
	};

	let errors: { [key: string]: string } = {};
	let hasErrors: boolean = false;

	const validate = (schema: Schema, values: FormValues) => {
		hasErrors = false;
		Object.entries(schema).forEach(([key, validator]) => {
			const value = values[key as keyof FormValues];

			errors[key] = (validator as any).validate(value);

			if (errors[key]) {
				hasErrors = true;
			}
		});
	};

	$: validate(schema, values);

	$: hasChanges =
		data.user?.email !== values.email ||
		data.user?.nickname !== values.nickname ||
		data.user?.visibility !== values.visibility;

	$: canSubmit = hasChanges && !hasErrors;

	const visibilityOptions = [
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
			description: 'Anyone can see your profile..'
		}
	];

	const handleSubmit = async () => {
		const res = await client.put<ResponseFormat<User>>(`/users/${data.user?.id}`, {
			...values
		});

		if (res.status === 200 && res.data.status === 'success') {
			errors = {};
			hasErrors = false;
			invalidateAll();

			toasts.add({
				type: 'success',
				description: 'Account information updated.'
			});
			return;
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
</script>

<div class="flex flex-col">
	<div class="self-end">
		<button class="button" on:click={handleLogout}>logout</button>
	</div>
	<form method="post" on:submit|preventDefault class="flex flex-col gap-y-4 p-10 max-w-md m-auto">
		<div class="flex flex-col gap-y-2">
			<label class="text-lg" for="email">Email</label>
			<input
				class="bg-background-light rounded-md p-2"
				name="email"
				type="text"
				placeholder="Email"
				bind:value={values.email}
			/>
			{#if errors.email}
				<p class="error">{errors.email}</p>
			{/if}
		</div>
		<div class="flex flex-col gap-y-2">
			<label class="text-lg" for="email">Nickname</label>
			<input
				class="bg-background-light rounded-md p-2"
				name="nickname"
				type="text"
				placeholder="Nickname"
				bind:value={values.nickname}
			/>
			{#if errors.nickname}
				<p class="error">{errors.nickname}</p>
			{/if}
		</div>
		<p class="text-lg">Visibility</p>
		{#each visibilityOptions as option}
			<div class="flex flex-row gap-x-4 items-center justify-start">
				<input
					class="w-6 h-6 hover:cursor-pointer accent-primary"
					name={option.value}
					bind:group={values.visibility}
					id={option.value}
					type="radio"
					value={option.value}
				/>
				<div class="flex flex-col">
					<label class="text-lg bold" for={option.value}>{option.text}</label>
					<p class="text-md text-gray-300">{option.description}</p>
				</div>
			</div>
		{/each}
		<div class="flex flex-row gap-x-4 justify-center">
			<button
				type="submit"
				disabled={!canSubmit}
				class={canSubmit ? 'button' : 'button-disabled'}
				on:click={handleSubmit}
			>
				save changes
			</button>
		</div>
	</form>
</div>

<style lang="postcss">
	.button {
		@apply hover:cursor-pointer hover:underline text-white;
	}

	.button-disabled {
		@apply hover:cursor-auto text-gray-400;
	}

	.error {
		@apply text-red-400;
	}
</style>
