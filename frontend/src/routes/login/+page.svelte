<script>
	let nickname = '';
	let password = '';
	let message = '';

	const login = async () => {
		try {
			const response = await fetch('http://127.0.0.1:9000/api/v1/auth/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ nickname, password })
			});
			const data = await response.json();
			alert(data.message);
		} catch (error) {
			console.error('An error occurred:', error);
			alert('An error occurred. Please check the console for details.');
		}
	};
</script>

<form on:submit={login}>
    <div class="bg-secondary rounded-xl p-6 mx-auto mx-10 my-10 max-w-sm">
        <p>Enter your Nickname:</p>
		<input type="text" class="text-input" bind:value={nickname} required />
	</div>

    <div class="bg-secondary rounded-xl p-6 mx-auto mx-10 my-10 max-w-sm">
        <p>Password:</p>
		<input type="password" class="text-input" bind:value={password} required />
	</div>

	<div class="mx-auto max-w-sm">
		<p><a href="/password_reset">Forgot your password?</a></p>
	</div>

	<button type="submit" class="bg-primary hover:bg-secondary box-border rounded-xl p-6 mx-auto mx-10 my-10 max-w-sm flex items-center">
		<p>
			<b>Log in</b>
		</p>
	</button>

	<div class="mx-auto mx-10 my-10 max-w-sm">
		<label>
			<input type="checkbox" checked="unchecked" name="remember" />Remember me
		</label>
		<p>
			<a href="/register">Not registered yet? Create your acount here!</a>
		</p>
	</div>
</form>
