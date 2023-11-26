<script lang="ts">
	import type { RegisterInput, Visibility } from '$lib/types';
	import { goto } from '$app/navigation';
	import { register } from '$lib/stores/auth';
	import { toasts } from 'svelte-toasts';
	import Form from '$lib/components/Form.svelte';
	import type { FormFields } from '$lib/types/form';
	import { setLastUsedUid } from '$lib/common/credentials-helper';

	// -- Realtime basic validation

	let errors: any = {};
	const fields: FormFields = {
		email: {
			validate(val?: string) {
				if (!val || val.trim().length === 0) {
					return 'enter your email';
				}
			},
			title: 'Email',
			type: 'text'
		},
		nickname: {
			validate(val?: string) {
				if (!val || val.trim().length === 0) {
					return 'choose a cool nickname';
				}
			},
			title: 'Nickname',
			type: 'text'
		},
		password: {
			validate(val?: string) {
				if (!val || val.trim().length === 0) {
					return 'choose a *secure* password';
				}
			},
			title: 'Password',
			type: 'password'
		},
		c_password: {
			validate(val?: string, values?: any) {
				if (val !== values.password) {
					return 'has to match the password';
				}
			},
			title: 'Repeat password',
			type: 'password'
		}
	};

	const handleSubmit = async (values: any) => {
		const res = await register(values);

		if (res.status === 'success') {
			setLastUsedUid(values.email);
			
			toasts.add({
				type: 'success',
				description: 'Registered!'
			});
			goto('/login', {
				invalidateAll: true
			});
			return true;
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

		return res;
	};
</script>

<div class="flex flex-col gap-y-4 w-full items-center p-10 max-w-md m-auto">
	<Form bind:errors submitText="register" {fields} onSubmit={handleSubmit} />
	<p>
		Already registered? come on, <a class="button" href="/login">log in</a>!
	</p>
</div>
