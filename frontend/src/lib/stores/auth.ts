import { goto } from "$app/navigation";
import { client } from "$lib/http/http";
import type { LoginInput, RegisterInput, ResponseFormat, User } from "$lib/types";
import { get, writable } from "svelte/store";
import { fetchRequests } from "./requests";

export let currentUser = writable<User | undefined | null>(null);

export const login = async (input: LoginInput) => {
    const res = await client.post<ResponseFormat<User>>(`/auth/login`, input);

    // login endpoint should auth the user as well
    // on success, set the current user
    if (res.status === 200 && res.data.status === 'success') {
        currentUser.set(res.data.data!);
        console.log("Logged in as " + get(currentUser)?.email);
    }

    await fetchRequests();

    return res.data;
}

export const logout = async () => {
    const res = await client.post<ResponseFormat<void>>('/auth/logout');

    if (res.status === 200 && res.data.status === 'success') {
        currentUser.set(null);
        console.log('logged out');
    }

    return;
}

export const register = async (input: RegisterInput) => {
    const res = await client.post<ResponseFormat<void>>(`/auth/register`, input);

    return res.data;
}

// send an /auth/me request to see if we're logged in, if yes, set the current user
export const attemptLoad = async () => {

    // only attempt to load if no user is loaded
    if (get(currentUser)) {
        return;
    }

    const res = await client.get<ResponseFormat<User>>(`/auth/me`);

    if (res.status === 200 && res.data.status === 'success') {
        currentUser.set(res.data.data!);
        console.log("Loaded in through cookie as " + get(currentUser)?.email);

        await fetchRequests();

        return res.data.data!;
    }

    return undefined;
}

// if not logged in, redirect to login
export const ensureLoggedIn = async () => {
    const user = get(currentUser);

    if (user == null) {
        // attempt to load from cookie and /auth/me req
        const loadedUser = await attemptLoad();

        if (loadedUser) {
            return loadedUser;
        }

        goto('/login');
        return;
    }

    return user;
}
