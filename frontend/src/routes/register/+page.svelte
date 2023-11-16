<script lang="ts">
	import type { RegisterInput } from '$lib/types';
	import { goto } from '$app/navigation';
	import { register } from '$lib/stores/auth';
	import { toasts } from 'svelte-toasts';

	// TODO: check if emails and passwords match

	let formValues: Partial<RegisterInput & { verifyEmail: string; verifyPassword: string }> = {};

	const handleRegister = async () => {
		if (!formValues.email || !formValues.nickname || !formValues.password) {
			toasts.add({
				type: 'error',
				description: 'Invalid properties.'
			});
			return;
		}

		const res = await register({
			email: formValues.email,
			nickname: formValues.nickname,
			password: formValues.password
		});

		if (res.status == 'nickname_or_email_taken') {
			toasts.add({
				type: 'error',
				description: 'Nickname or email are already taken.'
			});
			return;
		}

		toasts.add({
			type: 'success',
			description: 'Registered!'
		});

		goto('/login');
	};
</script>

<form>
	<div class="bg-secondary rounded-xl p-6 mx-auto my-5 max-w-sm">
		<p><b>Choose a uniqe nickname:<b /></b></p>
		<input
			type="text"
			class="text-input w-full"
			placeholder="Enter your Username"
			name="nickname"
			bind:value={formValues.nickname}
			required
		/>
	</div>

	<div class="bg-secondary rounded-xl p-6 mx-auto my-5 max-w-sm">
		<p><b>Write your email:</b></p>
		<input
			type="email"
			class="text-input w-full"
			placeholder="Enter your Email"
			name="email"
			bind:value={formValues.email}
			required
		/>
	</div>

	<div class="bg-secondary rounded-xl p-6 mx-auto my-5 max-w-sm">
		<p><b>Verify email:</b></p>
		<input
			type="email"
			class="text-input w-full"
			placeholder="Enter your Email again"
			name="email"
			bind:value={formValues.verifyEmail}
			required
		/>
	</div>

	<div class="bg-secondary rounded-xl p-6 mx-auto my-5 max-w-sm">
		<p><b>Create a password:</b></p>
		<input
			type="password"
			class="text-input w-full"
			placeholder="Enter your Password"
			name="password"
			bind:value={formValues.password}
			required
			minlength="5"
			maxlength="20"
		/>
	</div>

	<div class="bg-secondary rounded-xl p-6 mx-auto my-5 max-w-sm">
		<p><b>Verify password:</b></p>
		<input
			type="password"
			class="text-input w-full"
			placeholder="Enter your Password again"
			name="password"
			bind:value={formValues.verifyPassword}
			required
			minlength="5"
			maxlength="20"
		/>
	</div>

	<button
		type="submit"
		on:click={handleRegister}
		class="bg-primary hover:bg-secondary box-border rounded-xl p-6 mx-auto my-5 w-full max-w-sm flex items-center justify-center text-2xl"
	>
		<p><b>Register</b></p>
	</button>

	<div class="mx-auto my-5 max-w-sm">
		<p>Already have a account? Login <a href="/login"><b>here!</b></a></p>
	</div>
</form>
