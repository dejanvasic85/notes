<script lang="ts">
	import { fly } from 'svelte/transition';
	import { DropdownMenu } from 'bits-ui';

	import { durationFastMs, easeMove, reduceMotion } from '$lib/motion';
	import { playCue } from '$lib/sound';
	import { Download, Settings, LogOut, type LucideIcon } from '@lucide/svelte';
	import UserAvatar from './UserAvatar.svelte';
	import InstallInstructions from './InstallInstructions.svelte';
	import { getInstallState } from '$lib/state/installState.svelte';

	type Props = {
		userPicture: string;
		email: string;
		name: string;
	};

	let { userPicture, email, name }: Props = $props();

	const installState = getInstallState();

	let showInstructions = $state(false);

	function handleInstall() {
		playCue('press');

		if (installState.needsManualSteps) {
			showInstructions = true;
			return;
		}

		installState.promptInstall();
	}

	type MenuLinkProps = {
		href: string;
		text: string;
		borderTop?: boolean;
		reload?: boolean;
		icon: LucideIcon;
		itemProps: Record<string, unknown>;
	};
</script>

{#snippet MenuLink({
	borderTop = false,
	href,
	icon: Icon,
	text,
	itemProps,
	reload = false
}: MenuLinkProps)}
	{#if borderTop}
		<div class="border-line mt-2 border-t"></div>
	{/if}
	<a
		{...itemProps}
		class="hover:bg-accent-soft rounded-control mt-2 flex w-full gap-2 p-2"
		{href}
		data-sveltekit-reload={reload ? true : undefined}
	>
		<Icon />
		<span>{text}</span>
	</a>
{/snippet}

{#snippet MenuButton({
	icon: Icon,
	text,
	itemProps
}: Omit<MenuLinkProps, 'href' | 'reload' | 'borderTop'>)}
	<!-- itemProps carries bits-ui's own selection handling, so the action is wired
	     through DropdownMenu.Item's onSelect rather than an onclick that would
	     override it and leave the menu open. -->
	<button
		{...itemProps}
		type="button"
		class="hover:bg-accent-soft rounded-control mt-2 flex w-full gap-2 p-2"
	>
		<Icon aria-hidden="true" />
		<span>{text}</span>
	</button>
{/snippet}

<DropdownMenu.Root onOpenChange={(open) => open && playCue('press')}>
	<DropdownMenu.Trigger aria-label="user menu">
		<UserAvatar picture={userPicture} {name} size={8} showTooltip={false} />
	</DropdownMenu.Trigger>
	<DropdownMenu.Portal>
		<DropdownMenu.Content forceMount loop side="bottom" align="end">
			{#snippet child({ props, open, wrapperProps })}
				{#if open}
					<div {...wrapperProps}>
						<div
							{...props}
							transition:fly={{ duration: reduceMotion(durationFastMs), y: -10, easing: easeMove }}
							class="menu z-dropdown bg-paper border-line rounded-card flex w-72 flex-col justify-between border p-6"
						>
							<div class="flex">
								<UserAvatar picture={userPicture} {name} size={8} showTooltip={false} />
								<div class="ml-4 flex flex-col truncate">
									<span class="truncate font-bold">{name}</span>
									<span class="text-ink-muted truncate text-xs">{email}</span>
								</div>
							</div>
							<DropdownMenu.Item onSelect={() => playCue('press')}>
								{#snippet child({ props: itemProps })}
									{@render MenuLink({
										text: 'Account settings',
										href: '/my/account',
										icon: Settings,
										itemProps
									})}
								{/snippet}
							</DropdownMenu.Item>
							{#if installState.canInstall}
								<DropdownMenu.Item onSelect={handleInstall}>
									{#snippet child({ props: itemProps })}
										{@render MenuButton({
											text: 'Install app',
											icon: Download,
											itemProps
										})}
									{/snippet}
								</DropdownMenu.Item>
							{/if}
							<DropdownMenu.Item onSelect={() => playCue('press')}>
								{#snippet child({ props: itemProps })}
									{@render MenuLink({
										text: 'Logout',
										href: '/api/auth/logout',
										icon: LogOut,
										borderTop: true,
										reload: true,
										itemProps
									})}
								{/snippet}
							</DropdownMenu.Item>
						</div>
					</div>
				{/if}
			{/snippet}
		</DropdownMenu.Content>
	</DropdownMenu.Portal>
</DropdownMenu.Root>

<InstallInstructions bind:show={showInstructions} />
