<script lang="ts">
	import type { FriendSelection } from '$lib/types';
	import { DropdownMenu } from 'bits-ui';
	import { UserPlus, CirclePlus, Check, Minus } from '@lucide/svelte';

	import Button from './Button.svelte';
	import { slide } from 'svelte/transition';

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
							in:slide={{ duration: 100 }}
							class="z-dropdown dark:bg-dark flex w-96 flex-col gap-1 rounded-lg border bg-white p-2 shadow-lg"
						>
							<DropdownMenu.Item>
								{#snippet child({ props: itemProps })}
									<a
										{...itemProps}
										class="dark:bg-dark flex items-center rounded-lg bg-white p-2 hover:ring-2"
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
									class="dark:bg-dark flex items-center rounded-lg bg-white p-2 hover:ring-2"
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
