<script lang="ts">
	import type { Pathname } from '$app/types';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { onNavigate } from '$app/navigation';
	import { locales, localizeHref } from '$lib/paraglide/runtime';
	import { startReminderScheduler } from '$lib/stores/hydration';
	import 'konsta/svelte/theme.css';
	import './layout.css';

	let { children } = $props();

	onMount(() => {
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.register('/sw.js').catch(() => {});
		}
		if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
			Notification.requestPermission();
		}
		return startReminderScheduler();
	});

	// Bottle-flip transition on navigation
	onNavigate((navigation) => {
		if (!document.startViewTransition) return;
		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>

{@render children()}

<div style="display:none">
	{#each locales as locale (locale)}
		<a href={resolve(localizeHref(page.url.pathname, { locale }) as Pathname)}>{locale}</a>
	{/each}
</div>
