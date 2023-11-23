// import { client } from "$lib/http/http";
// import type { Group } from "$lib/types/group";
// import type { ResponseFormat } from "$lib/types/response";
// import { toasts } from 'svelte-toasts';
// 
// export async function load() {
//     const groupsRes = await client.get<ResponseFormat<Group[]>>("/groups");
// 
// 	if (groupsRes.status === 200 && groupsRes.data.status === 'success') {
//     	return {
//        		groups: groupsRes.data.data
//     	};
// 	} else {
// 		toasts.add({
// 			type: 'error',
// 			description: 'Failed loading groups'
// 		});
// 	}
// }
