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

	let isFirstVisit = true;

	onMount(() => {
		// Redirect to welcome if not configured
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

<div class="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
	{#if $hydration.settings.isConfigured}
		<div class="mx-auto flex h-screen max-w-2xl flex-col items-center justify-between py-6">
			<!-- Header -->
			<div class="w-full space-y-2 text-center">
				<h1 class="text-4xl font-bold text-blue-600">💧 Rehydrate</h1>
				<p class="text-gray-600">Stay hydrated, stay healthy</p>
			</div>

			<!-- Main Content -->
			<div class="flex w-full flex-col items-center gap-8 lg:flex-row lg:gap-12">
				<!-- Left side: Water Bottle Visualization -->
				<div class="flex flex-1 flex-col items-center justify-center gap-4">
					<!-- Bottle Container -->
					<div class="relative h-96 w-32">
						<!-- Bottle shape -->
						<div
							class="absolute inset-0 rounded-t-xl rounded-b-3xl border-4 border-blue-400 bg-white shadow-2xl"
						>
							<!-- Water inside bottle with glass effect -->
							<div
								class="absolute right-0 bottom-0 left-0 rounded-b-2xl bg-gradient-to-t from-cyan-400 via-blue-300 to-transparent transition-all duration-500"
								style="height: {$progress}%"
							>
								<!-- Wave effect -->
								<div class="absolute inset-0 rounded-b-2xl opacity-30">
									<div
										class="h-full w-full"
										style="background-image: url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 1200 120%22><path d=%22M0,50 Q300,0 600,50 T1200,50 L1200,120 L0,120 Z%22 fill=%22%23ffffff%22 opacity=%220.3%22/></svg>'); background-repeat: repeat-x; background-size: 600px 60px; animation: wave 15s linear infinite;"
									/>
								</div>
							</div>

							<!-- Bottle highlights for glass effect -->
							<div class="absolute top-2 left-2 h-16 w-2 rounded-full bg-white opacity-40" />
						</div>

						<!-- Steps markers on the bottle -->
						<div
							class="absolute inset-y-0 right-0 flex flex-col justify-between pr-2 text-xs font-semibold text-gray-600"
						>
							{#each Array(5) as _, i}
								<div class="flex items-center gap-1">
									<span>{Math.round((i + 1) * 20)}%</span>
									<div class="h-px w-2 bg-gray-300" />
								</div>
							{/each}
						</div>
					</div>

					<!-- Progress Text -->
					<div class="space-y-1 text-center">
						<p class="text-4xl font-bold text-blue-600">
							{$hydration.waterConsumed}/{$hydration.settings.remindersPerDay}
						</p>
						<p class="text-gray-600">
							{$remaining} reminder{$remaining !== 1 ? 's' : ''} left
						</p>
					</div>
				</div>

				<!-- Right side: Controls and Info -->
				<div class="flex flex-1 flex-col gap-6">
					<!-- Main Drink Button -->
					<button
						on:click={handleDrink}
						disabled={$hydration.waterConsumed >= $hydration.settings.remindersPerDay}
						class="rounded-2xl bg-gradient-to-r from-blue-400 to-cyan-400 px-8 py-6 text-center text-3xl font-bold text-white shadow-2xl transition-all hover:scale-110 active:scale-95 disabled:scale-100 disabled:opacity-50"
					>
						🥤 I Drank Water!
					</button>

					<!-- Undo Button -->
					{#if $hydration.waterConsumed > 0}
						<button
							on:click={handleUndo}
							class="rounded-xl border-2 border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-100"
						>
							↶ Undo Last
						</button>
					{/if}

					<!-- Info Cards -->
					<div class="space-y-4">
						<!-- Today's Schedule -->
						<div class="rounded-xl bg-white p-5 shadow-md">
							<p class="text-sm font-semibold text-gray-700">⏰ Today's Schedule</p>
							<div class="mt-2 space-y-1 text-sm text-gray-600">
								<p>
									<strong>Active Hours:</strong>
									{$hydration.settings.wakeTime} - {$hydration.settings.sleepTime}
								</p>
								<p>
									<strong>Interval:</strong>
									{Math.round(1440 / $hydration.settings.remindersPerDay)} min
								</p>
								<p>
									<strong>Per reminder:</strong>
									{$hydration.settings.waterAmountPerReminder}ml
								</p>
								<p>
									<strong>Daily goal:</strong>
									{$totalDailyWater}ml
								</p>
							</div>
						</div>

						<!-- Next Reminder -->
						{#if $nextReminderTime && $hydration.waterConsumed < $hydration.settings.remindersPerDay}
							<div class="rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 p-5 shadow-md">
								<p class="text-sm font-semibold text-amber-900">🔔 Next Reminder</p>
								<p class="mt-2 text-2xl font-bold text-amber-700">{$nextReminderTime}</p>
							</div>
						{:else if $hydration.waterConsumed >= $hydration.settings.remindersPerDay}
							<div class="rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 p-5 shadow-md">
								<p class="text-sm font-semibold text-green-900">✨ All Done!</p>
								<p class="mt-2 text-sm text-green-700">Great job staying hydrated today! 🎉</p>
							</div>
						{/if}

						<!-- Settings Link -->
						<a
							href="/settings"
							class="block rounded-xl border-2 border-blue-200 bg-blue-50 p-4 text-center font-semibold text-blue-700 transition-colors hover:bg-blue-100"
						>
							⚙️ Settings
						</a>
					</div>
				</div>
			</div>

			<!-- Footer -->
			<div class="mt-8 text-center text-sm text-gray-500">
				<p>Last updated: {new Date($hydration.lastUpdated).toLocaleTimeString()}</p>
			</div>
		</div>
	{/if}
</div>

<style>
	@keyframes wave {
		0% {
			background-position: 0 0;
		}
		100% {
			background-position: 600px 0;
		}
	}
</style>
