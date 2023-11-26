<script lang="ts">
	import type { Group, GroupRequest } from '$lib/types';
	import { currentUser } from '$lib/stores/auth';
	import { Visibility } from '$lib/types/visibility';
	import { Membership } from '$lib/types/group';
	import { groupRequests } from '$lib/stores/requests';
	import { requestToJoin } from '$lib/common/group';
	import { invalidateAll } from '$app/navigation';

	export let groups: (Group & { joinRequest?: GroupRequest })[];
	export let visibility: Visibility = Visibility.PUBLIC;

	$: clickable =
		visibility == Visibility.PUBLIC || (visibility == Visibility.PROTECTED && $currentUser != null);

	$: groups.forEach((g) => {
		g.joinRequest = $groupRequests.find((r) => r.group_id == g.id && r.user_id == $currentUser?.id);
	});
</script>

<div class="flex flex-col gap-y-4 p-2">
	{#each groups as group}
		<div class="flex flex-row items-center justify-between p-2 bg-background-light rounded-lg">
			{#if group.membership !== Membership.GUEST || clickable}
				<a
					href="/groups/{group.id}"
					class="text-left text-white text-lg font-semibold hover:underline">{group.title}</a
				>
			{:else}
				<p class="text-left text-gray text-lg">{group.title}</p>
			{/if}
			{#if $currentUser && group.membership === Membership.GUEST}
				{#if group.joinRequest}
					<span class="btn-disabled">{group.joinRequest.status}</span>
				{:else}
					<button
						class="btn"
						on:click={async () => {
							await requestToJoin(group);
							invalidateAll();
						}}>request to join</button
					>
				{/if}
			{/if}
		</div>
	{/each}
</div>
