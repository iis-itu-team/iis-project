import { client } from '$lib/http/http.js';
import type { Group } from '$lib/types/group';
import type { ResponseFormat } from '$lib/types/response.js';

export async function load({ params }) {
    const groupId = params.groupId;

    const group = await client.get<ResponseFormat<Group>>(`/groups/${groupId}`);

    return {
        group: group.data.data
    }
}