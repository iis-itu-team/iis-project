<script lang="ts">
	import type { Group } from "$lib/types";
	import { currentUser } from "$lib/stores/auth";
	import { Visibility } from "$lib/types/visibility";
	import { Membership } from "$lib/types/group";

    export let groups: Group[];

	$: group_type = groups.at(0)?.visibility
	$: clickable = (group_type == Visibility.PUBLIC) || (group_type == Visibility.PROTECTED && $currentUser != null)
</script>

<div class="flex flex-col gap-y-4 p-2">
    {#each groups as group}
        <div class="flex flex-row items-center justify-between p-2 bg-background-light rounded-lg">
			{#if group.membership == Membership.TRUE || clickable}
            <a
                href="/groups/{group.id}"
                class="text-left text-white text-lg font-semibold hover:underline">{group.title}</a
            >
			{:else}
            <p
                class="text-left text-gray text-lg">{group.title}</p
            >
			{/if}
            <div class="hover:underline hover:cursor-pointer">
                <span>request to join</span>
            </div>
        </div>
    {/each}
</div>
