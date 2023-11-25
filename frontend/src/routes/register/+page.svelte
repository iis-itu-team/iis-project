<script lang="ts">
	import type { RegisterInput, Visibility } from '$lib/types';
	import { goto } from '$app/navigation';
	import { register } from '$lib/stores/auth';
	import { toasts } from 'svelte-toasts';

	// -- Realtime basic validation

	type FormValues = {
		email?: string;
		nickname?: string;
		password?: string;
		c_password?: string;
		visibility?: Visibility;
	};

	type Schema = {
		[Property in keyof FormValues]: {
			validate: (val?: string) => string | undefined;
		};
	};

	type Errors = {
		[Property in keyof FormValues]: string | undefined;
	};

	let values: FormValues = {};

	let errors: Errors = {};
	let hasErrors: boolean = false;

	const schema = {
		email: {
			validate(val?: string) {
				if (!val || val.trim().length === 0) {
					return 'enter your email';
				}
			}
		},
		nickname: {
			validate(val?: string) {
				if (!val || val.trim().length === 0) {
					return 'choose a cool nickname';
				}
			}
		},
		password: {
			validate(val?: string) {
				if (!val || val.trim().length === 0) {
					return 'choose a *secure* password';
				}
			}
		},
		c_password: {
			validate(val?: string) {
				if (val !== values.password) {
					return 'has to match the password';
				}
			}
		}
	};

	const validate = (schema: Schema, values: FormValues) => {
		hasErrors = false;
		Object.entries(schema).forEach(([key, validator]) => {
			const k = key as keyof FormValues;
			const value = values[k];

			errors[k] = (validator as any).validate(value);

			if (errors[k]) {
				hasErrors = true;
			}
		});
	};

	$: validate(schema, values);

	$: canSubmit = !hasErrors;

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
		const res = await register(values);

		if (res.status === 'success') {
			toasts.add({
				type: 'success',
				description: 'Registered!'
			});
			goto('/login', {
				invalidateAll: true
			});
			return;
		}

		if (res.status === 'nickname_taken') {
			errors.nickname = 'already taken';
			toasts.add({
				type: 'error',
				description: 'Nickname already taken.'
			});
			return;
		}

		if (res.status === 'email_taken') {
			errors.email = 'already taken';
			toasts.add({
				type: 'error',
				description: 'Email already taken.'
			});
			return;
		}

		if (res.status === 'validation_fail') {
			const validationErrors = res.data as unknown as any[];

			validationErrors.forEach((val: { rule: string; field: string; message: string }) => {
				errors[val.field as keyof FormValues] = val.message;
			});
			return;
		}
	};
</script>

<form method="post" on:submit|preventDefault class="flex flex-col gap-y-4 p-10 max-w-md m-auto">
	<div class="flex flex-col gap-y-2">
		<label class="text-lg" for="email">Email</label>
		<input
			class="bg-background-light rounded-md p-2"
			name="email"
			type="text"
			placeholder="email"
			bind:value={values.email}
		/>
		{#if errors.email}
			<p class="error">{errors.email}</p>
		{/if}
	</div>
	<div class="flex flex-col gap-y-2">
		<label class="text-lg" for="nickname">Nickname</label>
		<input
			class="bg-background-light rounded-md p-2"
			name="nickname"
			type="text"
			placeholder="nickname"
			bind:value={values.nickname}
		/>
		{#if errors.nickname}
			<p class="error">{errors.nickname}</p>
		{/if}
	</div>
	<div class="flex flex-col gap-y-2">
		<label class="text-lg" for="email">Password</label>
		<input
			class="bg-background-light rounded-md p-2"
			name="password"
			type="password"
			placeholder="password"
			bind:value={values.password}
		/>
		{#if errors.password}
			<p class="error">{errors.password}</p>
		{/if}
	</div>
	<div class="flex flex-col gap-y-2">
		<label class="text-lg" for="email">Repeat password</label>
		<input
			class="bg-background-light rounded-md p-2"
			name="c_password"
			type="password"
			placeholder="Repeat password"
			bind:value={values.c_password}
		/>
		{#if errors.c_password}
			<p class="error">{errors.c_password}</p>
		{/if}
	</div>
	<div class="flex flex-row gap-x-4 justify-center">
		<button
			type="submit"
			disabled={!canSubmit}
			class={canSubmit ? 'button' : 'button-disabled'}
			on:click={handleSubmit}
		>
			register
		</button>
	</div>
	<div class="flex flex-col gap-y-4 items-left">
		<p>
			Already registered? come on, <a class="button" href="/login">log in</a>!
		</p>
	</div>
</form>

<style lang="postcss">
	.button {
		@apply hover:cursor-pointer hover:decoration-primary text-white italic underline decoration-2 decoration-secondary;
	}

	.button-disabled {
		@apply hover:cursor-auto text-gray-400;
	}

	.error {
		@apply text-red-400 italic;
	}
</style>