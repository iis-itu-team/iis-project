<script lang="ts">
    import { invalidateAll } from "$app/navigation";

    export let pageFirst: number = 0
    export let pageLast: number = 0
    export let pageCurrent: number = 0

    export let updateFunction: (() => any) = (() => {
        invalidateAll()
    })


    let pageNumbers: number[] = []

    const generateNumbers: (first: number, last: number) => void = ((first, last) => {
        pageNumbers = []
        for (let i: number = first; i <= last; i++) {
            pageNumbers.push(i)
        }
    })

    $: triggerPageFirst = generateNumbers(pageFirst, pageLast)
    $: triggerPageLast = generateNumbers(pageFirst, pageLast)

    async function updateData(pageNumber: number) {
        pageCurrent = pageNumber
        updateFunction()
    }
</script>

<div class="grid grid-flow-row grid-cols-10 gap-4 m-auto justify-center">
    {#each pageNumbers as pageNumber}
        <div class="...">
            <button
                type="button"
                class={pageCurrent == pageNumber ? "btn-yes" : "btn-no"}
                on:click={async () => await updateData(pageNumber)}
            >
                {pageNumber}
            </button>
        </div>
    {/each}
</div>
