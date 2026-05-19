<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import {
		hydration,
		progress,
		remaining,
		nextReminderTime,
		totalDailyWater
	} from '$lib/stores/hydration';

	onMount(() => {
		if (!$hydration.settings.isConfigured) {
			goto('/welcome');
		}
	});

	function handleDrink() {
		hydration.logWaterIntake();
	}

	function handleUndo() {
		hydration.undoWaterIntake();
	}
</script>

<!-- The whole screen is the bottle -->
<div class="relative h-dvh w-screen overflow-hidden bg-sky-100">

	<!-- Water fill — drains from FULL to EMPTY as you drink -->
	<div
		class="absolute inset-x-0 bottom-0 bg-linear-to-t from-cyan-600 via-cyan-400 to-sky-300 transition-[height] duration-700 ease-in-out"
		style="height: {100 - $progress}%"
	>
		<!-- Wave anchored to water surface — bottom:100% guarantees no gap at any screen size -->
		<svg
			style="position: absolute; bottom: 100%; width: 100%; height: 40px;"
			viewBox="0 0 1440 40"
			preserveAspectRatio="none"
			aria-hidden="true"
		>
			<path
				d="M0,20 C360,40 720,0 1080,20 C1260,30 1380,10 1440,20 L1440,40 L0,40 Z"
				fill="#7dd3fc"
			/>
		</svg>
	</div>

	<!-- Graduation strip — full screen height, position set in Settings -->
	{#if $hydration.settings.bottlePosition !== 'center'}
		<div
		class="absolute top-0 h-full flex flex-col justify-evenly pointer-events-none z-1"
		style="{$hydration.settings.bottlePosition === 'left' ? 'left: 1.25rem;' : 'right: 1.25rem;'}"
		>
			{#each Array.from({ length: $hydration.settings.remindersPerDay }, (_, i) => i < $hydration.waterConsumed) as isConsumed, i (i)}
				<div
					class="flex items-center gap-1.5"
					style="{$hydration.settings.bottlePosition === 'left' ? 'flex-direction: row-reverse;' : ''}"
				>
					<!-- Tick mark — longer and brighter when still in water, shorter and dimmer when consumed -->
					<div
						style="
							height: 2px;
							width: {isConsumed ? '10px' : '22px'};
							background: {isConsumed ? 'rgba(14,165,233,0.35)' : 'rgba(255,255,255,0.95)'};
							transition: all 0.5s ease;
						"
					></div>
					<!-- Level number -->
					<span
						style="
							font-size: 9px;
							font-family: monospace;
							line-height: 1;
							color: {isConsumed ? 'rgba(14,165,233,0.35)' : 'rgba(255,255,255,0.95)'};
							transition: all 0.5s ease;
						"
					>
						{$hydration.settings.remindersPerDay - i}
					</span>
				</div>
			{/each}
		</div>
	{:else}
		<!-- Center: symmetric strip with ticks on both sides of a central spine -->
		<div
		class="absolute top-0 h-full flex flex-col justify-evenly items-center pointer-events-none z-1"
		style="left: 50%; transform: translateX(-50%);"
		>
			{#each Array.from({ length: $hydration.settings.remindersPerDay }, (_, i) => i < $hydration.waterConsumed) as isConsumed, i (i)}
				<div class="flex items-center gap-1">
					<div
						style="
							height: 2px;
							width: {isConsumed ? '8px' : '16px'};
							background: {isConsumed ? 'rgba(14,165,233,0.35)' : 'rgba(255,255,255,0.95)'};
							transition: all 0.5s ease;
						"
					></div>
					<span
						style="
							font-size: 9px; font-family: monospace; line-height: 1;
							min-width: 14px; text-align: center;
							color: {isConsumed ? 'rgba(14,165,233,0.35)' : 'rgba(255,255,255,0.95)'};
							transition: all 0.5s ease;
						"
					>
						{$hydration.settings.remindersPerDay - i}
					</span>
					<div
						style="
							height: 2px;
							width: {isConsumed ? '8px' : '16px'};
							background: {isConsumed ? 'rgba(14,165,233,0.35)' : 'rgba(255,255,255,0.95)'};
							transition: all 0.5s ease;
						"
					></div>
				</div>
			{/each}
		</div>
	{/if}

	<!-- App bar -->
	<div class="absolute top-0 inset-x-0 z-10 flex items-center px-4" style="height: 3.5rem;">
		<div class="w-10">
			{#if $hydration.waterConsumed > 0}
				<button
					onclick={handleUndo}
					class="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm transition-transform active:scale-95"
					style="background: rgba(14,165,233,0.2); border: 1.5px solid rgba(14,165,233,0.45); color: white;"
					aria-label="Undo"
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
						<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>
					</svg>
				</button>
			{/if}
		</div>
		<div class="flex-1 text-center">
			<span class="text-base font-bold text-sky-900 tracking-wide">rehydrate</span>
		</div>
		<div class="w-10 flex justify-end">
			<a
				href="/settings"
				class="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm transition-transform active:scale-95"
				style="background: rgba(14,165,233,0.2); border: 1.5px solid rgba(14,165,233,0.45); color: white;"
				aria-label="Settings"
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
					<circle cx="12" cy="12" r="3"/>
				</svg>
			</a>
		</div>
	</div>

	<!-- Center: drink button or completion message -->
	<div class="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
		{#if $hydration.waterConsumed >= $hydration.settings.remindersPerDay}
			<p class="text-3xl font-bold text-emerald-800">🎉 Fully hydrated!</p>
		{:else}
			<button
				onclick={handleDrink}
				class="pointer-events-auto rounded-full bg-white px-14 py-6 text-2xl font-bold text-cyan-600 shadow-2xl transition-transform active:scale-95"
			>
				💧 Drink
			</button>
		{/if}
	</div>

	<!-- Bottom: ml info -->
	<div class="absolute bottom-0 inset-x-0 z-10 flex flex-col items-center pb-10 text-center">
		{#if $hydration.waterConsumed >= $hydration.settings.remindersPerDay}
			<p class="text-lg font-semibold text-sky-800">{$totalDailyWater}ml consumed today</p>
		{:else}
			<p class="text-4xl font-bold text-sky-900">
				{$hydration.waterConsumed * $hydration.settings.waterAmountPerReminder}<span class="text-xl font-normal text-sky-700"> ml</span>
			</p>
			<p class="mt-1 text-sm text-sky-700/90">
				of {$totalDailyWater}ml &middot; {$remaining} sip{$remaining !== 1 ? 's' : ''} to go
			</p>
			{#if $nextReminderTime}
				<p class="mt-2 text-xs text-sky-800/70">Next reminder at <span class="font-semibold">{$nextReminderTime}</span></p>
			{/if}
		{/if}
	</div>
</div>
