import { client } from "$lib/http/http";
import type { GroupRequest, ResponseFormat } from "$lib/types";
import { get, writable } from "svelte/store";
import { toasts } from "svelte-toasts";

// group requests of the currently logged in user

export const groupRequests = writable<GroupRequest[]>([]);

export const fetchRequests = async () => {
    const res = await client.get<ResponseFormat<GroupRequest[]>>(`/requests`, {
        params: {
            me: "true"
        }
    });

    if (res.status !== 200) {
        toasts.add({
            type: "error",
            description: "Failed to load your group requests."
        });
        return;
    }

    groupRequests.set(res.data.data ?? []);
    console.log("Fetched group requests.");
}
