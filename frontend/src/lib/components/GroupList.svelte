<script lang="ts">
		import type { Group } from "$lib/types";
	import { currentUser } from "$lib/stores/auth";
	import { Visibility } from "$lib/types/visibility";

    export let groups: Group[];

	let readable: boolean = true;
	let group_type: Visibility = groups.at(0)?.visibility ?? Visibility.PUBLIC;

	if (group_type == Visibility.PROTECTED) {
		readable = $currentUser != null;
	}
	
	if (group_type == Visibility.PRIVATE) {
		// TODO
		readable = false;
	}
</script>

<div class="flex flex-col gap-y-4 p-2">
    {#each groups as group}
        <div class="flex flex-row items-center justify-between p-2 bg-background-light rounded-lg">
			{#if readable}
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
