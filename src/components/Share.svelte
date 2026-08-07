<script lang="ts">
	import type { FriendSelection } from '$lib/types';
	import { DropdownMenu } from 'bits-ui';
	import { UserPlus, CirclePlus, Check } from '@lucide/svelte';
	import { fly } from 'svelte/transition';

	import UserAvatar from './UserAvatar.svelte';
	import { buildButtonClass } from '$lib/button';
	import { durationFastMs, easeMove, reduceMotion } from '$lib/motion';

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

	const avatarSize = 8;
	const iconSize = 20;
	const checkSize = 16;
	const checkStrokeWidth = 3;
	const menuOffset = 8;

	const triggerClass = `${buildButtonClass('ghost')} relative`;

	// Rows hover on background rather than a ring, and clear the 44px minimum
	// target — see docs/design-system §5.
	const rowClass =
		'rounded-control hover:bg-accent-soft flex min-h-11 w-full items-center gap-3 px-2 transition-colors duration-(--duration-fast)';

	let { friends, noteId, ontogglefriend }: Props = $props();

	const sharedCount = $derived(friends.filter(({ selected }) => selected).length);
	const triggerLabel = $derived(
		sharedCount === 0
			? 'Manage sharing'
			: `Manage sharing, shared with ${sharedCount} ${sharedCount === 1 ? 'person' : 'people'}`
	);
</script>

<!--
	The state is carried by the row's own role="menuitemcheckbox"/aria-checked,
	so this box is decorative. line-strong rather than line: it conveys state,
	and plain --color-line sits below the 3:1 WCAG 1.4.11 needs.
-->
{#snippet selectionBox(selected: boolean)}
	<span
		class="rounded-chip ml-auto flex size-6 shrink-0 items-center justify-center transition-colors duration-(--duration-fast) {selected
			? 'bg-accent text-on-accent'
			: 'border-line-strong border-2'}"
		aria-hidden="true"
	>
		{#if selected}
			<Check size={checkSize} strokeWidth={checkStrokeWidth} />
		{/if}
	</span>
{/snippet}

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<button {...props} type="button" class={triggerClass} aria-label={triggerLabel}>
				<UserPlus />
				{#if sharedCount > 0}
					<span
						class="bg-accent text-on-accent absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full text-xs font-semibold"
						aria-hidden="true"
					>
						{sharedCount}
					</span>
				{/if}
			</button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Portal>
		<!-- collisionPadding keeps the panel off the screen edge when it is pushed
			inward on a narrow viewport, which it otherwise sits flush against. -->
		<DropdownMenu.Content
			forceMount
			loop
			side="bottom"
			align="end"
			sideOffset={menuOffset}
			collisionPadding={menuOffset}
		>
			{#snippet child({ props, open, wrapperProps })}
				{#if open}
					<div {...wrapperProps}>
						<div
							{...props}
							transition:fly={{ duration: reduceMotion(durationFastMs), y: -10, easing: easeMove }}
							class="z-dropdown bg-raised border-line rounded-card shadow-lifted flex w-80 max-w-[calc(100vw-2rem)] flex-col border p-2"
						>
							<DropdownMenu.Group>
								<DropdownMenu.GroupHeading class="text-label text-ink-muted px-2 py-2 uppercase">
									Share with
								</DropdownMenu.GroupHeading>
								{#if friends.length === 0}
									<p class="text-small text-ink-muted px-2 pb-2">
										No friends yet. Invite someone to share this note.
									</p>
								{:else}
									<div class="max-h-72 overflow-y-auto">
										{#each friends as { id, noteEditorId, name, email, picture, selected } (id)}
											<!-- The avatar is aria-hidden, so this text is the row's whole
												accessible name — it can't be allowed to fall through to empty. -->
											{@const friendName = name ?? email ?? 'Unnamed friend'}
											<DropdownMenu.CheckboxItem
												checked={selected}
												closeOnSelect={false}
												onCheckedChange={() =>
													ontogglefriend({
														id: noteEditorId,
														friendUserId: id,
														selected: !selected
													})}
												class={rowClass}
											>
												<!-- The row's own text already names the friend; without this the
													avatar's alt text doubles it up in the accessible name. -->
												<span class="flex shrink-0" aria-hidden="true">
													<UserAvatar
														picture={picture ?? ''}
														name={friendName}
														size={avatarSize}
														showTooltip={false}
													/>
												</span>
												<span class="truncate">{friendName}</span>
												{@render selectionBox(selected)}
											</DropdownMenu.CheckboxItem>
										{/each}
									</div>
								{/if}
							</DropdownMenu.Group>
							<DropdownMenu.Separator class="border-line-soft my-2 border-t" />
							<DropdownMenu.Item>
								{#snippet child({ props: itemProps })}
									<a {...itemProps} class={rowClass} href={`/my/friends/add?noteId=${noteId}`}>
										<!-- Sized to the avatars above it so every row shares one
											leading column. -->
										<span
											class="bg-accent-soft text-accent-strong flex size-8 shrink-0 items-center justify-center rounded-full"
											aria-hidden="true"
										>
											<CirclePlus size={iconSize} />
										</span>
										<span>Invite friend</span>
									</a>
								{/snippet}
							</DropdownMenu.Item>
						</div>
					</div>
				{/if}
			{/snippet}
		</DropdownMenu.Content>
	</DropdownMenu.Portal>
</DropdownMenu.Root>
