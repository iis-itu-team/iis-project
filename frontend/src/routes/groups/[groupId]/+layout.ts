import { client } from '$lib/http/http.js';
import type { Group } from '$lib/types/group';
import type { ResponseFormat } from '$lib/types/response.js';
import type { Thread } from '$lib/types/thread';

export async function load({ params }) {
    const groupId = params.groupId;

    const group = await client.get<ResponseFormat<Group>>(`/groups/${groupId}`, {
        params: {
            expand: ["members"].join(",")
        }
    });

    // load threads in this group

    const threads = await client.get<ResponseFormat<Thread[]>>(`/groups/${groupId}/threads`);

    return {
        group: group.data.data,
        threads: threads.data.data
    }
}