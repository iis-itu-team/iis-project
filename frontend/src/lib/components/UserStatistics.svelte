<script lang="ts">
	import type { Statistics } from '$lib/types/user';

	export let statistics: Statistics;

	const labels: {
		[Property in keyof Statistics]: string;
	} = {
		joinedGroups: 'Groups joined',
		messagesPosted: 'Messages posted',
		negativelyRated: 'Negatively rated messages',
		positivelyRated: 'Positively rated messages',
		ratingsSubmitted: 'Submitted ratings',
		userRating: 'User rating'
	};

	const entries = <T extends Object>(val: T): [keyof T, any][] => {
		return Object.entries(val) as [keyof T, any][];
	};
</script>

<div class="flex flex-col px-4 py-2 gap-y-2">
	{#each entries(statistics) as [k, stat]}
		<div
			class="border-b border-dotted border-secondary-light/50 flex flex-row gap-x-1 justify-between"
		>
			<span>{labels[k] ?? k}</span>
			<span class="font-semibold">{stat}</span>
		</div>
	{/each}
</div>
