<script lang="ts">
	import { goto } from '$app/navigation';
	import Form from '$lib/components/Form.svelte';
	import { client } from '$lib/http/http.js';
	import type { ResponseFormat, FormFields, Thread } from '$lib/types';
	import { toasts } from 'svelte-toasts';
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import { AccessType, checkAccess } from '$lib/stores/auth';

	export let data: PageData;

	onMount(() => {
		checkAccess({
			type: AccessType.GROUP_MANAGE,
			redirectTo: `/groups/${data.group?.id}`
		});
	});

	const fields: FormFields = {
		title: {
			title: 'Thread title',
			type: 'text',
			validate: (val?: any) => {
				if (!val || val.trim().length === 0) {
					return 'title cannot be empty';
				}
			}
		}
	};

	$: defaults = { title: data.thread?.title };

	const handleSubmit = async (values: any) => {
		const res = await client.put<ResponseFormat<Thread>>(`/threads/${data.thread?.id}`, values);

		if (res.status === 200 && res.data.status === 'success') {
			toasts.add({
				type: 'success',
				description: 'Thread updated.'
			});
			goto(`/groups/${data.group?.id}`, {
				invalidateAll: true
			});
			return true;
		}

		return res.data;
	};
</script>

<div class="max-w-md m-auto">
	<Form
		{fields}
		{defaults}
		onSubmit={handleSubmit}
		onCancel={() => goto(`/groups/${data.group?.id}`)}
	/>
</div>
