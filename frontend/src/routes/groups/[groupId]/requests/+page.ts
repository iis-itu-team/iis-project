import { client } from "$lib/http/http";
import type { ResponseFormat } from "$lib/types";
import type { GroupRequest } from "$lib/types/group";

export async function load({ params }) {
    const groupId = params.groupId

    const requestsRes = await client.get<ResponseFormat<GroupRequest[]>>(`/groups/${groupId}/requests`, {
        params: {
            expand: ["group", "user"].join(",")
        }
    });

    return {
        requests: requestsRes.data.data
    }
}
