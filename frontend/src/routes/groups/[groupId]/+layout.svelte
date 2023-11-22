<script lang="ts">
	import { currentUser } from '$lib/stores/auth';
	import { GroupRole, type Member } from '$lib/types/group';
	import { UserRole } from '$lib/types/user';
	import type { PageData } from './$types';

	export let data: PageData;

	$: group = data.group;

	$: currentMember = group?.members?.find((m) => m.id === $currentUser?.id);
	$: joined = currentMember != undefined;

	const handleKick = (member: Member) => {
		/* TODO: Implement */
	};

	$: canKick =
		$currentUser?.role == UserRole.ADMIN ||
		currentMember?.group_role == GroupRole.ADMIN ||
		currentMember?.group_role == GroupRole.MOD;
</script>

<div class="grid grid-cols-12 grid-rows-2 gap-8">
	<div class="col-span-9">
		<slot />
	</div>
	<div class="col-span-3">
		<div class="flex flex-col gap-y-4">
			<div class="text-right">
				{#if !joined}
					<span class="hover:underline hover:cursor-pointer">request to join</span>
				{:else}
					<span class="hover:underline hover:cursor-pointer">leave</span>
				{/if}
			</div>
			<div>
				<span class="font-semibold">members ({group?.members?.length ?? 0}):</span>
				{#each group?.members ?? [] as member}
					<div class="grid grid-rows-2">
						<span>{member.nickname}</span>
						<span class="italic">{member.group_role}</span>
						{#if canKick && member.id !== $currentUser?.id}
							<div class="text-right col-start-2 row-start-2">
								<button on:click={() => handleKick(member)}>kick</button>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>

<style>
	button:hover {
		text-decoration: underline;
		cursor: pointer;
	}
</style>
