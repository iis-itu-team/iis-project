<script>
	import { currentUser, login } from "$lib/stores/auth";

	let email = '';
	let password = '';
	let message = '';

	const handleLogin = async () => {
		const res = await login({
			email,
			password
		})

		if (res.status !== 'success') {
			// TODO: show error toast
			alert("Something went wrong.")
			return
		}

		alert(`Logged in as ${$currentUser?.nickname}`)
	};
</script>

<form on:submit={handleLogin}>
    <div class="bg-secondary rounded-xl p-6 mx-auto mx-10 my-5 max-w-sm">
        <p><b>Enter your email:</b></p>
		<input type="text" class="text-input w-full" bind:value={email} required />
	</div>

    <div class="bg-secondary rounded-xl p-6 mx-auto mx-10 my-5 max-w-sm">
        <p><b>Password:</b></p>
		<input type="password" class="text-input w-full" bind:value={password} required />
	</div>

	<div class="mx-auto max-w-sm">
		<p><a href="/password_reset">Forgot your password?</a></p>
	</div>

	<button type="submit" class="bg-primary hover:bg-secondary box-border rounded-xl p-6 mx-auto mx-10 my-5 w-full max-w-sm flex items-center justify-center text-2xl">
		<p><b>Log in</b></p>
	</button>

	<div class="mx-auto mx-10 my-5 max-w-sm">
		<label>
			<input type="checkbox" checked="unchecked" name="remember" />Remember me
		</label>
		<p>
			Not registered yet? Create your acount <a href="/register"><b>here!</b></a>
		</p>
	</div>
</form>
