<script lang="ts">
	import type { Group } from "$lib/types";

    export let groups: Group[];
</script>

<div class="flex flex-col gap-y-4 p-2">
    {#each groups as group}
        <div class="flex flex-row items-center justify-between p-2 bg-background-light rounded-lg">
            <a
                href="/groups/{group.id}"
                class="text-left text-white text-lg font-semibold hover:underline">{group.title}</a
            >
            <div class="hover:underline hover:cursor-pointer">
                <span>request to join</span>
            </div>
        </div>
    {/each}
</div>