<script lang="ts">
	import { currentUser, ensureLoggedIn } from '$lib/stores/auth';
	import { toasts } from 'svelte-toasts';
	import { client } from "$lib/http/http";
	import { get } from 'svelte/store';
	import type { User, ResponseFormat } from '$lib/types';
	import { showCrumbs } from '$lib/stores/breadcrumbs';
	import { logout } from '$lib/stores/auth';
	import { goto } from '$app/navigation';

	showCrumbs(false);
	ensureLoggedIn();

	let editing_email = false;
	let editing_nickname = false;

	let email = get(currentUser)?.email;
	let nickname = get(currentUser)?.nickname;
	let id = get(currentUser)?.id;

	function set_edit_email(value: boolean): void {
		editing_email = value;
	};

	function set_edit_nickname(value: boolean): void {
		editing_nickname = value;
	};

	const update_email = async () => {
		const res = await client.put<ResponseFormat<User>>("/users/" + id, {email: email});

		if (res.status === 200 && res.data.status === 'success'){
			toasts.add({
				type: 'success',
				description: "Successfully changed email to " + email
			});

			currentUser.set(res.data.data!);
		} else {
			toasts.add({
				type: 'error',
				description: "Failed to change email"
			});
		}
	};

	const update_nickname = async () => {
		const res = await client.put<ResponseFormat<User>>("/users/" + id, {nickname: nickname});

		if (res.status === 200 && res.data.status === 'success'){
			toasts.add({
				type: 'success',
				description: "Successfully changed nickname to " + nickname
			});

			currentUser.set(res.data.data!);
		} else {
			toasts.add({
				type: 'error',
				description: "Failed to change nickname"
			});
		}
	};

	const user_logout = async () => {
		await logout();
		
		goto('/login');
	}
</script>

<div class="text-center">
	<p>Your fancy account!</p>

	<br>
	
	<p><b>Email:</b></p>
	{#if !editing_email}
		<d>{$currentUser?.email}</d>
		<button
		    class="bg-primary hover:bg-secondary box-border rounded-xl p-6 mx-auto my-5 w-full max-w-sm flex items-center justify-center text-2xl"
			on:click={() => set_edit_email(true)}
		>
		    <p><b>Edit</b></p>
		</button>
	{:else}
		<form on:submit={() => {set_edit_email(false); update_email()}}>
			<div class="bg-secondary rounded-xl p-6 mx-auto my-5 max-w-sm">
         		<p><b>Enter your new email:</b></p>
         		<input type="text" class="text-input w-full" bind:value={email} required />
			</div>

			<button
			    type="submit"
			    class="bg-primary hover:bg-secondary box-border rounded-xl p-6 mx-auto my-5 w-full max-w-sm flex items-center justify-center text-2xl"
			>
			    <p><b>Save</b></p>
			</button>
		</form>
	{/if}

	<p><b>Nickname:</b></p>
	{#if !editing_nickname}
		<p>{$currentUser?.nickname}</p>
		<button
		    class="bg-primary hover:bg-secondary box-border rounded-xl p-6 mx-auto my-5 w-full max-w-sm flex items-center justify-center text-2xl"
			on:click={() => set_edit_nickname(true)}
		>
		    <p><b>Edit</b></p>
		</button>
	{:else}
		<form on:submit={() => {set_edit_nickname(false); update_nickname()}}>
			<div class="bg-secondary rounded-xl p-6 mx-auto my-5 max-w-sm">
         		<p><b>Enter your new nickname:</b></p>
         		<input type="text" class="text-input w-full" bind:value={nickname} required />
			</div>

			<button
			    type="submit"
			    class="bg-primary hover:bg-secondary box-border rounded-xl p-6 mx-auto my-5 w-full max-w-sm flex items-center justify-center text-2xl"
			>
			    <p><b>Save</b></p>
			</button>
		</form>
	{/if}

	<br>

	<button
		on:click={user_logout}
	    class="bg-primary hover:bg-secondary box-border rounded-xl p-6 mx-auto my-5 w-full max-w-sm flex items-center justify-center text-2xl"
	>
 	   <p><b>Logout</b></p>
	</button>
</div>
