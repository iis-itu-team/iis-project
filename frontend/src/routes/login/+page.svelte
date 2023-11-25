<script lang="ts">
	import { goto } from '$app/navigation';
	import { currentUser, login } from '$lib/stores/auth';
	import { toasts } from 'svelte-toasts';

	// -- Realtime basic validation

	type FormValues = {
		uid?: string;
		password?: string;
	};

	type Schema = {
		[Property in keyof FormValues]: {
			validate: (val?: string) => string | undefined;
		};
	};

	type Errors = {
		[Property in keyof FormValues]: string | undefined;
	};

	const schema = {
		uid: {
			validate(val?: string) {
				if (!val || val.trim().length === 0) {
					return 'enter your email or nickname';
				}
			}
		},
		password: {
			validate(val?: string) {
				if (!val || val.trim().length === 0) {
					return 'enter your password';
				}
			}
		}
	};

	let values: FormValues = {};

	let errors: Errors = {};
	let hasErrors: boolean = false;

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

	const handleSubmit = async () => {
		const res = await login(values);

		if (res.status === 'success') {
			toasts.add({
				type: 'success',
				description: `Logged in as ${$currentUser?.nickname}`
			});
			goto('/', {
				invalidateAll: true
			});
			return;
		}

		if (res.status === 'invalid_credentials') {
			toasts.add({
				type: 'error',
				description: 'Invalid credentials.'
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
		<label class="text-lg" for="email">Email or nickname</label>
		<input
			class="bg-background-light rounded-md p-2"
			name="uid"
			type="text"
			placeholder="uid"
			bind:value={values.uid}
		/>
		{#if errors.uid}
			<p class="error">{errors.uid}</p>
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
	<!-- TODO: Doesn't seem to be hooked to anything on the backend -->
	<!-- <div class="flex flex-row gap-x-4 items-center">
		<input
			class="accent-primary text-white hover:cursor-pointer rounded-full w-6 h-6"
			type="checkbox"
			checked={false}
			name="remember"
		/>
		<label for="remember">Remember me</label>
	</div> -->
	<div class="flex flex-row gap-x-4 justify-center">
		<button
			type="submit"
			disabled={!canSubmit}
			class="bg-primary hover:bg-secondary box-border rounded-xl p-2 mx-auto my-5 w-full max-w-sm flex items-center justify-center text-2xl {canSubmit ? 'button' : 'button-disabled'}"
			on:click={handleSubmit}
		>
			log in
		</button>
	</div>
	<div class="flex flex-col gap-y-4 items-left">
		<p>
			Not registered yet? do it, <a class="button" href="/register">register</a>!
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
