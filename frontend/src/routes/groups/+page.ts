import { client } from "$lib/http/http";
import type { ResponseFormat, Group } from "$lib/types";
import { currentUser } from "$lib/stores/auth";
import { get } from "svelte/store";

export const ssr = false;

export async function load() {
    const userGroups = await client.get<ResponseFormat<Group[]>>("/groups", {
        params: {
            userId: get(currentUser)?.id
        }
    });

    return {
        userGroups: userGroups.data.data
    };
}