<script lang="ts">
	import { goto } from '$app/navigation';
	import Form from '$lib/components/Form.svelte';
	import { client } from '$lib/http/http';
	import { currentUser } from '$lib/stores/auth';
	import { setCrumbs, showCrumbs } from '$lib/stores/breadcrumbs';
	import type { Group, ResponseFormat, Thread } from '$lib/types';
	import type { FormFields } from '$lib/types/form';
	import { get } from 'svelte/store';

	export let data: { group: Group };

	$: group = data.group;

	showCrumbs(true);
	$: setCrumbs([
		{
			text: 'Groups'
		},
		{
			text: `${group.title}`,
			href: `/groups/${group.id}`
		},
		{
			text: 'Create a new thread',
			selected: true
		}
	]);

	const fields: FormFields = {
		title: {
			validate(val?: any) {
				if (!val || val.trim().length === 0) {
					return 'enter a title for the thread';
				}
			},
			title: 'Thread title',
			type: 'text'
		}
	};

	const handleSubmit = async (values: any) => {
		const user = get(currentUser);

		const data = {
			...values,
			ownerId: user!.id
		};

		const res = await client.post<ResponseFormat<Thread>>(`/groups/${group.id}/threads`, data);

		if (res.status === 201 && res.data.status === 'success') {
			goto(`/groups/${group.id}`, {
				invalidateAll: true
			});
			return true;
		}

		return res.data;
	};
</script>

<div class="m-auto max-w-md p-10">
	<Form
		{fields}
		onSubmit={handleSubmit}
		onCancel={() => goto(`/groups/${group.id}`)}
		submitText="create"
	/>
</div>
