<script>
	// TODO: check if emails and passwords match

	let password = '';
	let nickname = '';
	let email = '';

	const register = async () => {
		try {
			const response = await fetch('http://127.0.0.1:9000/api/v1/auth/register', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ nickname, email, password })
			});
		} catch (error) {
			console.error('An error occurred:', error);
			alert('An error occurred. Please check the console for details.');
		}
	};
</script>

<form on:submit={register}>
	<div class="bg-secondary rounded-xl p-6 mx-auto mx-10 my-5 max-w-sm">
		<p><b>Choose a uniqe nickname:<b></p>
		<input type="text" class="text-input w-full" placeholder="Enter your Username" name="nickname" required/>
	</div>

	<div class="bg-secondary rounded-xl p-6 mx-auto mx-10 my-5 max-w-sm">
		<p>Write your email:</p>
		<input type="email" class="text-input w-full" placeholder="Enter your Email" name="email" required />
	</div>

	<div class="bg-secondary rounded-xl p-6 mx-auto mx-10 my-5 max-w-sm">
		<p>Verify email:</p>
		<input type="email" class="text-input w-full" placeholder="Enter your Email again" name="email" required/>
	</div>

	<div class="bg-secondary rounded-xl p-6 mx-auto mx-10 my-5 max-w-sm">
		<p>Create a password:</p>
		<input type="password" class="text-input w-full" placeholder="Enter your Password" name="password" required minlength="5" maxlength="20"/>
	</div>

	<div class="bg-secondary rounded-xl p-6 mx-auto mx-10 my-5 max-w-sm">
		<p>Verify password:</p>
		<input type="password" class="text-input w-full" placeholder="Enter your Password again" name="password" required minlength="5" maxlength="20"/>
	</div>

	<button type="submit" class="bg-primary hover:bg-secondary box-border rounded-xl p-6 mx-auto mx-10 my-5 w-full max-w-sm flex items-center justify-center text-2xl">
		<p><b>Register</b></p>
	</button>

	<div class="mx-auto mx-10 my-5 max-w-sm">
		<p><a href="/login">Already have a account? Login here!</a></p>
	</div>
</form>
