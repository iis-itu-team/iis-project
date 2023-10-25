<script lang="ts">
	import type { Group } from "$lib/types/group";

    export let data: { group: Group };

    $: group = data.group;
</script>

<p>Group: {group.title}</p>