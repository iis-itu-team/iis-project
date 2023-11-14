<script>
	import { goto } from "$app/navigation";
	import { register } from "$lib/stores/auth";

	// TODO: check if emails and passwords match

	let password = '';
	let nickname = '';
	let email = '';

	const handleRegister = async () => {
		const res = await register({
			nickname,
			email,
			password
		});

		if (res.status != 'success') {
			// TODO: display error toast
			alert('Something went wrong.');
			return;
		}

		alert("Successfully registered");

		goto('/login');
	};
</script>

<form on:submit={handleRegister}>
	<div class="bg-secondary rounded-xl p-6 mx-auto mx-10 my-5 max-w-sm">
		<p><b>Choose a uniqe nickname:<b></p>
		<input type="text" class="text-input w-full" placeholder="Enter your Username" name="nickname" required/>
	</div>

	<div class="bg-secondary rounded-xl p-6 mx-auto mx-10 my-5 max-w-sm">
		<p><b>Write your email:</b></p>
		<input type="email" class="text-input w-full" placeholder="Enter your Email" name="email" required />
	</div>

	<div class="bg-secondary rounded-xl p-6 mx-auto mx-10 my-5 max-w-sm">
		<p><b>Verify email:</b></p>
		<input type="email" class="text-input w-full" placeholder="Enter your Email again" name="email" required/>
	</div>

	<div class="bg-secondary rounded-xl p-6 mx-auto mx-10 my-5 max-w-sm">
		<p><b>Create a password:</b></p>
		<input type="password" class="text-input w-full" placeholder="Enter your Password" name="password" required minlength="5" maxlength="20"/>
	</div>

	<div class="bg-secondary rounded-xl p-6 mx-auto mx-10 my-5 max-w-sm">
		<p><b>Verify password:</b></p>
		<input type="password" class="text-input w-full" placeholder="Enter your Password again" name="password" required minlength="5" maxlength="20"/>
	</div>

	<button type="submit" class="bg-primary hover:bg-secondary box-border rounded-xl p-6 mx-auto mx-10 my-5 w-full max-w-sm flex items-center justify-center text-2xl">
		<p><b>Register</b><b></b></p>
	</button>

	<div class="mx-auto mx-10 my-5 max-w-sm">
		<p>Already have a account? Login <a href="/login"><b>here!</b></a></p>
	</div>
</form>
