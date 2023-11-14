import { goto } from "$app/navigation";
import { client } from "$lib/http/http";
import type { LoginInput, RegisterInput, ResponseFormat, User } from "$lib/types";
import { get, writable } from "svelte/store";

export let currentUser = writable<User|null>(null);

export const login = async (input: LoginInput) => {
    const res = await client.post<ResponseFormat<User>>(`/auth/login`, input);

    // login endpoint should auth the user as well
    // on success, set the current user
    if (res.status === 200 && res.data.status === 'success') {
        currentUser.set(res.data.data!);
        console.log("Logged in as " + get(currentUser)?.email);
    }

    return res.data;
}

export const register = async (input: RegisterInput) => {
    const res = await client.post<ResponseFormat<void>>(`/auth/register`, input);

    return res.data;
}

// send an /auth/me request to see if we're logged in, if yes, set the current user
export const attemptLoad = async () => {
    const res = await client.post<ResponseFormat<User>>(`/auth/me`);

    if (res.status === 200 && res.data.status === 'success') {
        currentUser.set(res.data.data!);
        console.log("Loaded in through cookie as " + get(currentUser)?.email);
    }
}

// if not logged in, redirect to login
export const ensureCurrentUser = () => {
    const user = get(currentUser);

    if (user == null) {
        goto('/login');
    }

    return user;
}