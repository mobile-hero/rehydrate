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
	import { Page, Navbar, Block, BlockTitle, Button } from 'konsta/svelte';

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

<Page class="bg-surface-1">
	<Navbar title="Rehydrate" subtitle="Drink more, feel better" />

	<Block strong class="mx-4 mt-4 rounded-3xl">
		<BlockTitle class="text-center">Hydration Label</BlockTitle>
		<div class="px-4 pb-6 text-center text-sm text-surface-6">
			Your water bottle drains as you drink. Keep going!
		</div>
		<div class="row items-center justify-between px-4">
			<div>
				<p class="text-sm text-surface-6">Daily goal</p>
				<p class="text-xl font-semibold">{$totalDailyWater}ml</p>
			</div>
			<div class="text-right">
				<p class="text-sm text-surface-6">Per sip</p>
				<p class="text-xl font-semibold">{$hydration.settings.waterAmountPerReminder}ml</p>
			</div>
		</div>
	</Block>

	<Block class="mt-4 rounded-[36px] overflow-hidden px-0 py-0 mx-4 shadow-xl">
		<div class="relative mx-auto h-[420px] w-[220px] max-w-full">
			<div class="absolute left-1/2 top-0 h-12 w-16 -translate-x-1/2 rounded-b-[24px] bg-surface-2 shadow-inner"></div>
			<div class="absolute inset-x-0 top-10 bottom-0 mx-auto h-[calc(100%-48px)] w-[180px] rounded-[40px] border-4 border-surface-3 bg-surface-2 shadow-inner">
				<div
					class="absolute left-0 right-0 bottom-0 rounded-b-[36px] bg-gradient-to-t from-cyan-500 via-cyan-400 to-sky-200 transition-all duration-500"
					style="height: {100 - $progress}%"
				></div>
			</div>
			<div class="absolute inset-x-0 top-10 mx-auto h-14 w-24 rounded-full bg-white/90 text-center text-sm font-semibold leading-14 text-surface-10 shadow-lg">
				<div class="pt-3">{Math.max(0, $hydration.settings.remindersPerDay - $hydration.waterConsumed)} left</div>
			</div>
		</div>
	</Block>

	<Block strong class="mx-4 mt-4 rounded-3xl text-center">
		<p class="text-sm text-surface-6">Session Progress</p>
		<p class="mt-2 text-3xl font-semibold text-surface-10">{$hydration.waterConsumed}/{$hydration.settings.remindersPerDay}</p>
		<p class="mt-1 text-sm text-surface-6">{remaining} reminder{$remaining !== 1 ? 's' : ''} left</p>
	</Block>

	<Block strong class="mx-4 mt-4 rounded-3xl text-center">
		<p class="text-sm text-surface-6">Next Reminder</p>
		<p class="mt-3 text-2xl font-semibold text-surface-10">
			{#if $nextReminderTime && $hydration.waterConsumed < $hydration.settings.remindersPerDay}
				{$nextReminderTime}
			{:else}
				{$hydration.waterConsumed >= $hydration.settings.remindersPerDay
					? 'You’re done for today!'
					: 'No reminder set yet'}
			{/if}
		</p>
	</Block>

	<Block class="mx-4 mt-4 rounded-3xl p-4">
		<div class="space-y-3">
			<Button large class="w-full" disabled={$hydration.waterConsumed >= $hydration.settings.remindersPerDay} onclick={handleDrink}>
				Drink Water
			</Button>
			{#if $hydration.waterConsumed > 0}
				<Button large outline class="w-full" onclick={handleUndo}>
					Undo Last
				</Button>
			{/if}
			<a href="/settings" class="button button-large button-outline w-full">
				Settings
			</a>
		</div>
	</Block>
</Page>