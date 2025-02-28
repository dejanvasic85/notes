<script lang="ts">
	import { fly } from 'svelte/transition';
	import { createDropdownMenu, melt } from '@melt-ui/svelte';

	import type { IconName } from '$lib/icons';
	import Icon from './Icon.svelte';
	import UserAvatar from './UserAvatar.svelte';

	type Props = {
		userPicture: string;
		email: string;
		name: string;
	};

	let { userPicture, email, name }: Props = $props();

	const {
		elements: { trigger, menu, item },
		states: { open }
	} = createDropdownMenu({
		forceVisible: true,
		loop: true,
		preventScroll: true,
		closeOnOutsideClick: true,
		positioning: { placement: 'bottom-end' }
	});

	type MenuLinkProps = {
		href: string;
		text: string;
		borderTop?: boolean;
		icon: IconName;
	};
</script>

{#snippet MenuLink({ borderTop = false, href, icon, text }: MenuLinkProps)}
	{#if borderTop}
		<div class="mt-2 border-t border-gray-200 dark:border-darkBorder"></div>
	{/if}
	<a
		use:melt={$item}
		class="hover:bg-slate mt-2 flex w-full gap-2 rounded-lg p-2 hover:bg-background dark:hover:bg-darkHover"
		{href}
	>
		<Icon {icon} fill="none" />
		<span>{text}</span>
	</a>
{/snippet}

<button type="button" use:melt={$trigger} aria-label="user menu">
	<UserAvatar picture={userPicture} {name} size={8} />
</button>

{#if $open}
	<div
		class="menu z-dropdown flex w-72 flex-col justify-between rounded-lg border bg-white p-6 dark:border-darkBorder dark:bg-dark"
		use:melt={$menu}
		transition:fly={{ duration: 150, y: -10 }}
	>
		<div class="flex">
			<UserAvatar picture={userPicture} {name} size={8} />
			<div class="ml-4 flex flex-col truncate">
				<span class="truncate font-bold">{name}</span>
				<span class="truncate text-xs text-gray-500">{email}</span>
			</div>
		</div>
		{@render MenuLink({
			text: 'Account settings',
			href: '/my/account',
			icon: 'cog'
		})}
		{@render MenuLink({
			text: 'Logout',
			href: '/api/auth/logout',
			icon: 'arrow-left-start-on-rectangle',
			borderTop: true
		})}
	</div>
{/if}
