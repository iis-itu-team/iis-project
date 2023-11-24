import { goto } from "$app/navigation";
import { client } from "$lib/http/http";
import { UserRole, type Group, type LoginInput, type RegisterInput, type ResponseFormat, type User, Visibility } from "$lib/types";
import { get, writable } from "svelte/store";
import { fetchRequests } from "./requests";
import { error } from "@sveltejs/kit";
import { Membership } from "$lib/types/group";
import { toasts } from "svelte-toasts";

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

export enum AccessType {
    ADMIN,
    GROUP_ADMIN,
    GROUP_MOD,
    // group admin or mod or user admin
    GROUP_MANAGE,
    // group member
    GROUP_MEMBER,
    // group member of group public / protected
    GROUP_MEMBER_VISIBLE,
}

type CheckAccessOptions = {
    redirectTo?: string
    type: AccessType

    group?: Group
}

export const checkAccess = async (options: CheckAccessOptions) => {
    const deny = () => {
        if (options.redirectTo) {
            toasts.add({
                type: "error",
                description: "Not allowed here."
            });
            goto(options.redirectTo);
            return;
        }

        throw error(401, "Not allowed here.");
    }

    switch (options.type) {
        case AccessType.GROUP_MANAGE:
            if (!(await checkLoggedIn())) {
                deny();
                return;
            }

            if (options.group?.membership === Membership.ADMIN ||
                options.group?.membership === Membership.MOD ||
                get(currentUser)?.role === UserRole.ADMIN) {
                return;
            }

            deny();
            break;
        case AccessType.GROUP_ADMIN:
            if (!(await checkLoggedIn())) {
                deny();
                return;
            }

            if (options.group?.membership === Membership.ADMIN) {
                return;
            }

            deny();
            break;
        case AccessType.GROUP_MOD:
            if (!(await checkLoggedIn())) {
                deny();
                return;
            }

            if (options.group?.membership === Membership.MOD) {
                return;
            }

            deny();
            break;
        case AccessType.GROUP_MEMBER_VISIBLE:
            if (options.group?.visibility === Visibility.PUBLIC) {
                return;
            }

            if (!(await checkLoggedIn())) {
                deny();
                return;
            }

            // user is not a guest of the group
            if (options.group?.membership !== Membership.GUEST) {
                return;
            }

            // is logged in and the group is protected
            if (options.group?.visibility === Visibility.PROTECTED) {
                return;
            }

            // user is a guest and the group is private, send him off.
            deny();
            break;
        case AccessType.GROUP_MEMBER:
            if (options.group?.membership === Membership.GUEST) {
                deny();
                return;
            }
            break;
        case AccessType.ADMIN:
            if (get(currentUser)?.role !== UserRole.ADMIN) {
                deny();
                return;
            }
            break;
    }
}

// if not logged in, redirect to login
export const checkLoggedIn = async () => {
    const user = get(currentUser);

    if (user == null) {
        // attempt to load from cookie and /auth/me req
        const loadedUser = await attemptLoad();

        if (loadedUser) {
            return loadedUser;
        }
        return false;
    }

    return user;
}

// if not logged in, redirect to login
export const ensureLoggedIn = async () => {
    const user = checkLoggedIn();

    if (!user) {
        goto('/login');
    }
}
