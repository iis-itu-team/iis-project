<script>
	let threads = Array.from({ length: 9 }, (_, i) => i);
</script>

<div class="p-8 text-white font-bold text-6xl">
	<p>Public Groups:</p>
</div>

<figure class="bg-secondary rounded-xl p-8 dark:bg-slate-800">
	{#each threads as thread (thread)}
	<div class="text-left p-8 text-white text-2xl">
		<span class="font-bold text-4xl">Group 1</span>
		<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt</p>
		<p>ut labore et dolore magna aliqua. Feugiat in fermentum posuere urna nec tincidunt </p>
		<p>praesent semper feugiat.</p>
	</div>
	{/each}

</figure>