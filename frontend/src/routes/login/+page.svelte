<script lang="ts">
	import { goto } from '$app/navigation';
	import { getLastUsedUid, setLastUsedUid } from '$lib/common/credentials-helper';
	import Form from '$lib/components/Form.svelte';
	import { currentUser, login } from '$lib/stores/auth';
	import type { FormFields } from '$lib/types/form';
	import { toasts } from 'svelte-toasts';

	const fields: FormFields = {
		uid: {
			validate(val?: string) {
				if (!val || val.trim().length === 0) {
					return 'enter your email or nickname';
				}
			},
			title: 'Email or Nickname',
			type: 'text'
		},
		password: {
			validate(val?: string) {
				if (!val || val.trim().length === 0) {
					return 'enter your password';
				}
			},
			title: 'Password',
			type: 'password'
		},
		rememberMe: {
			title: 'Remember me',
			type: 'checkbox'
		}
	};

	const defaults = {
		uid: getLastUsedUid()
	};

	const handleSubmit = async (values: any) => {
		const res = await login(values);

		if (res.status === 'success') {
			setLastUsedUid(values.uid);

			toasts.add({
				type: 'success',
				description: `Logged in as ${$currentUser?.nickname}`
			});
			goto('/', {
				invalidateAll: true
			});
			return true;
		}

		if (res.status === 'invalid_credentials') {
			toasts.add({
				type: 'error',
				description: 'Invalid credentials.'
			});
			return;
		}

		return res;
	};
</script>

<div class="flex flex-col gap-y-4 items-center p-10 max-w-md m-auto">
	<Form onSubmit={handleSubmit} {fields} {defaults} submitText="login" />
	<p>
		Not registered yet? do it, <a class="nav" href="/register">register</a>!
	</p>
</div>
