<script lang="ts">
	import Form from '$lib/components/Form.svelte';
	import { client } from '$lib/http/http';
	import { setCrumbs, showCrumbs } from '$lib/stores/breadcrumbs';
	import type { Group, ResponseFormat } from '$lib/types';
	import type { FormFields } from '$lib/types/form';
	import { groupVisibilityRadioOptions } from '$lib/types/visibility';
	import { toasts } from 'svelte-toasts';
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { AccessType, checkAccess } from '$lib/stores/auth';

	export let data: PageData;

	onMount(() => {
		checkAccess({
			type: AccessType.GROUP_MANAGE,
			redirectTo: `/groups/${data.group?.id}`,
			group: data.group
		});
	});

	showCrumbs(true);
	setCrumbs([
		{
			text: 'Groups'
		},
		{
			text: data.group?.title,
			href: `/groups/${data.group?.id}`
		},
		{
			text: 'Edit',
			selected: true
		}
	]);

	const fields: FormFields = {
		title: {
			title: 'Title',
			type: 'text'
		},
		visibility: {
			title: 'Visibility',
			type: 'radio',
			radioOptions: groupVisibilityRadioOptions
		}
	};

	$: defaults = {
		title: data.group?.title,
		visibility: data.group?.visibility
	};

	const handleSubmit = async (values: any) => {
		const res = await client.put<ResponseFormat<Group>>(`/groups/${data.group?.id}`, values);

		if (res.status === 200 && res.data.status === 'success') {
			toasts.add({
				type: 'success',
				description: 'Group updated.'
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
