import { client } from '$lib/http/http.js';
import type { Message, Thread } from '$lib/types';
import type { ResponseFormat } from '$lib/types/response.js';

export async function load({ params }) {
    const groupId = params.groupId;
    const threadId = params.threadId;

    const thread = await client.get<ResponseFormat<Thread>>(`/threads/${threadId}`);

    const messages = await client.get<ResponseFormat<Message[]>>(`/groups/${groupId}/threads/${threadId}/messages`, {
        params: {
            expand: "owner"
        }
    });

    return {
        messages: messages.data.data,
        thread: thread.data.data
    }
}
