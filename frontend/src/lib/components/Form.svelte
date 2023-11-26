<script lang="ts">
	import type { ResponseFormat } from '$lib/types';
	import Input from '$lib/components/Input.svelte';
	import type { FormFields } from '$lib/types/form';

	export let onSubmit: (values: any) => Promise<ResponseFormat<any> | undefined | boolean>;
	export let requireChanges: boolean = true;
	export let defaults: any = {};
	export let fields: FormFields;
	export let errors: any = {};

	export let submitText: string = 'save';
	export let onCancel: (() => void) | undefined = undefined;
	export let cancelText: string = 'cancel';

	const values: any = {
		...defaults
	};

	let hasErrors: boolean = false;

	const validate = (values: any) => {
		hasErrors = false;
		Object.entries(fields).forEach(([key, options]) => {
			const value = values[key];

			const validate = (options as any).validate;

			errors[key] = validate ? validate(value, values) : undefined;

			if (errors[key]) {
				hasErrors = true;
			}
		});
	};

	const hasChanges = (values: any, defaults: any) => {
		let changes: boolean = false;

		Object.keys(fields).forEach((field) => {
			const value = values[field];
			const def = defaults[field];

			if (value != def) {
				changes = true;
			}
		});
		return changes;
	};

	$: validate(values);
	$: containsChanges = hasChanges(values, defaults);
	$: canSubmit = !hasErrors && (!requireChanges || containsChanges);

	const handleSubmit = async () => {
		if (!canSubmit) {
			return;
		}

		const res = await onSubmit(values);

		if (res === true) {
			errors = {};
			hasErrors = false;
			return;
		}

		if (res === false || res === undefined) {
			return;
		}

		if (res.status === 'validation_fail') {
			const validationErrors = res.data as unknown as any[];

			validationErrors.forEach((val: { rule: string; field: string; message: string }) => {
				errors[val.field] = val.message;
			});
			return;
		}
	};
</script>

<form method="post" on:submit|preventDefault class="flex flex-col gap-y-4 m-auto w-full">
	{#each Object.entries(fields) as [field, options]}
		{#if options.type === 'radio'}
			<p class="text-lg">{options.title}</p>
			{#each options.radioOptions ?? [] as option}
				<div class="flex flex-row gap-x-4 items-center justify-start">
					<input
						class="w-6 h-6 hover:cursor-pointer accent-primary"
						name={option.value}
						bind:group={values.visibility}
						id={option.value}
						type="radio"
						value={option.value}
					/>
					<div class="flex flex-col">
						<label class="text-lg bold" for={option.value}>{option.text}</label>
						<p class="text-md text-gray-300">{option.description}</p>
					</div>
				</div>
			{/each}
		{:else}
			<Input
				name={field}
				type={options.type}
				title={options.title}
				bind:value={values[field]}
				bind:error={errors[field]}
			/>
		{/if}
	{/each}

	<!-- reverse order to make the submit button first () -->
	<div class="flex flex-row-reverse gap-x-4 justify-center">
		<button
			type="submit"
			disabled={!canSubmit}
			class={canSubmit ? 'btn-yes' : 'btn-disabled'}
			on:click|preventDefault={handleSubmit}
		>
			{submitText}
		</button>
		{#if onCancel}
			<button class="btn-no" type="button" on:click={onCancel}>
				{cancelText}
			</button>
		{/if}
	</div>
</form>
