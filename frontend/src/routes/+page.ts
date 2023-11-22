import { client } from "$lib/http/http";
import type { Group } from "$lib/types/group";
import type { ResponseFormat } from "$lib/types/response";

export async function load() {
    const groupsRes = await client.get<ResponseFormat<Group[]>>("/groups");

    return {
        groups: groupsRes.data.data
    };
}