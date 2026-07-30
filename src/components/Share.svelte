<script lang="ts">
	import type { FriendSelection } from '$lib/types';
	import { DropdownMenu } from 'bits-ui';
	import { UserPlus, CirclePlus, Check, Minus } from '@lucide/svelte';

	import Button from './Button.svelte';
	import { slide } from 'svelte/transition';
	import { durationTapMs, reduceMotion } from '$lib/motion';

	type ToggleFriendEvent = {
		id?: string;
		friendUserId: string;
		selected: boolean;
	};

	type Props = {
		friends: FriendSelection[];
		noteId: string;
		ontogglefriend: (event: ToggleFriendEvent) => void;
	};

	let { friends, noteId, ontogglefriend }: Props = $props();
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<div {...props}>
				<Button variant="ghost" label="Manage sharing">
					<UserPlus />
				</Button>
			</div>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Portal>
		<DropdownMenu.Content forceMount loop side="bottom">
			{#snippet child({ props, open, wrapperProps })}
				{#if open}
					<div {...wrapperProps}>
						<div
							{...props}
							in:slide={{ duration: reduceMotion(durationTapMs) }}
							class="z-dropdown bg-paper rounded-control shadow-lifted flex w-96 flex-col gap-1 border p-2"
						>
							<DropdownMenu.Item>
								{#snippet child({ props: itemProps })}
									<a
										{...itemProps}
										class="bg-paper rounded-control flex items-center p-2 hover:ring-2"
										href={`/my/friends/add?noteId=${noteId}`}
									>
										<CirclePlus size={30} /> &nbsp; Invite friend
									</a>
								{/snippet}
							</DropdownMenu.Item>
							{#each friends as { id, noteEditorId, name, selected } (id)}
								<DropdownMenu.CheckboxItem
									checked={selected}
									closeOnSelect={false}
									onCheckedChange={() =>
										ontogglefriend({ id: noteEditorId, friendUserId: id, selected: !selected })}
									aria-label={selected ? `${name}, selected` : `${name}, not selected`}
									class="bg-paper rounded-control flex items-center p-2 hover:ring-2"
								>
									{#if selected}
										<Check /> &nbsp;
									{:else}
										<Minus /> &nbsp;
									{/if}
									{name}
								</DropdownMenu.CheckboxItem>
							{/each}
						</div>
					</div>
				{/if}
			{/snippet}
		</DropdownMenu.Content>
	</DropdownMenu.Portal>
</DropdownMenu.Root>
