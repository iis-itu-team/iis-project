<script lang="ts">
	import { goto } from '$app/navigation';
	import Form from '$lib/components/Form.svelte';
	import { client } from '$lib/http/http';
	import { setCrumbs, showCrumbs } from '$lib/stores/breadcrumbs';
	import { Visibility, type Group, type ResponseFormat } from '$lib/types';
	import type { FormFields } from '$lib/types/form';
	import { toasts } from 'svelte-toasts';

	showCrumbs(true);

	setCrumbs([
		{
			text: 'Groups',
			href: '/groups'
		},
		{
			text: 'Create a new group',
			selected: true
		}
	]);

	const handleSubmit = async (values: any) => {
		const res = await client.post<ResponseFormat<Group>>('/groups', {
			title: values.title,
			visibility: values.visibility
		});

		if (res.status === 201 && res.data.status === 'success') {
			toasts.add({
				type: 'success',
				description: `Group ${res.data.data?.title} created.`
			});
			goto(`/groups/${res.data.data?.id}`);
			return true;
		}

		return res.data;
	};

	let errors: any = {};
	const fields: FormFields = {
		title: {
			validate(val?: any) {
				if (!val || val.trim().length === 0) {
					return 'enter a title for your group';
				}
			},
			title: 'Group title',
			type: 'text'
		},
		visibilityOptions: {
			title: 'Visibility',
			type: 'radio',
			radioOptions: [
				{
					value: 'private',
					text: 'Private',
					description: 'No one can see inside your group.'
				},
				{
					value: 'protected',
					text: 'Protected',
					description: 'Only registered users can see inside your group.'
				},
				{
					value: 'public',
					text: 'Public',
					description: 'Anyone can see inside your group.'
				}
			]
		}
	};
	const defaults = {
		visibility: Visibility.PUBLIC
	};
</script>

<div class="m-auto p-10 max-w-md">
	<Form bind:errors {fields} onSubmit={handleSubmit} {defaults} onCancel={() => goto('/')} />
</div>
