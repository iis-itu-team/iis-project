import { client } from '$lib/http/http.js';
import type { Group } from '$lib/types/group';
import type { ResponseFormat } from '$lib/types/response.js';
import type { Thread } from '$lib/types/thread';

export async function load({ params }) {
    const groupId = params.groupId;

    const groups = await client.get<ResponseFormat<Group>>(`/groups/${groupId}`);

    // load threads in this group

    const threads = await client.get<ResponseFormat<Thread[]>>(`/groups/${groupId}/threads`);

    return {
        group: groups.data.data,
        threads: threads.data.data
    }
}