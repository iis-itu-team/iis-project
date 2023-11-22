<script lang="ts">
	import { setCrumbs, showCrumbs } from "$lib/stores/breadcrumbs";

    showCrumbs(true);
    setCrumbs([
        {
            text: "Groups",
            href: "/groups",
            selected: true
        }
    ])
</script>

<p>Your groups!</p>
