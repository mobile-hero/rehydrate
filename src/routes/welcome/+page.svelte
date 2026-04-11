<script lang="ts">
	import { goto } from '$app/navigation';
	import { hydration, validateSettings } from '$lib/stores/hydration';
	import * as m from '$lib/paraglide/messages';

	let wakeTime = $hydration.settings.wakeTime;
	let sleepTime = $hydration.settings.sleepTime;
	let remindersPerDay = $hydration.settings.remindersPerDay;
	let waterAmountPerReminder = $hydration.settings.waterAmountPerReminder;
	let errors: string[] = [];
	let showAnimation = false;

	function handleSubmit() {
		errors = [];
		const validation = validateSettings({
			wakeTime,
			sleepTime,
			remindersPerDay,
			waterAmountPerReminder
		});

		if (!validation.valid) {
			errors = validation.errors;
			return;
		}

		hydration.updateSettings({
			wakeTime,
			sleepTime,
			remindersPerDay,
			waterAmountPerReminder,
			isConfigured: true
		});

		showAnimation = true;
		setTimeout(() => {
			goto('/');
		}, 2000);
	}
</script>

<div
	class="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 px-4"
>
	{#if showAnimation}
		<!-- Drinking Animation -->
		<div class="flex flex-col items-center gap-8">
			<h1 class="text-3xl font-bold text-blue-600">Great! Let's hydrate!</h1>
			<div class="relative h-64 w-40 rounded-b-3xl border-4 border-blue-400 bg-white shadow-lg">
				<!-- Water inside bottle -->
				<div
					class="absolute right-0 bottom-0 left-0 rounded-b-2xl bg-gradient-to-t from-cyan-400 to-blue-300 transition-all duration-1000"
					style="height: 0%; animation: fillWater 1.5s ease-in forwards;"
				/>

				<!-- Glass emoji -->
				<div
					class="absolute inset-0 flex items-center justify-center text-4xl transition-all duration-700"
					style="animation: tilt 0.6s ease-in-out infinite;"
				>
					💧
				</div>
			</div>
			<p class="text-center text-xl text-gray-600">Drink up! Redirecting...</p>
		</div>
	{:else}
		<!-- Setup Form -->
		<div class="w-full max-w-md space-y-8">
			<div class="space-y-2 text-center">
				<h1 class="text-4xl font-bold text-blue-600">💧 Welcome to Rehydrate</h1>
				<p class="text-gray-600">Let's set up your hydration reminders</p>
			</div>

			<form
				on:submit|preventDefault={handleSubmit}
				class="space-y-6 rounded-2xl bg-white p-8 shadow-lg"
			>
				<!-- Wake Time -->
				<div class="space-y-2">
					<label for="wake" class="block text-sm font-semibold text-gray-700"> Wake up time </label>
					<input
						id="wake"
						type="time"
						bind:value={wakeTime}
						class="w-full rounded-lg border-2 border-gray-200 px-4 py-2 text-lg transition-colors focus:border-blue-400 focus:outline-none"
						required
					/>
				</div>

				<!-- Sleep Time -->
				<div class="space-y-2">
					<label for="sleep" class="block text-sm font-semibold text-gray-700"> Sleep time </label>
					<input
						id="sleep"
						type="time"
						bind:value={sleepTime}
						class="w-full rounded-lg border-2 border-gray-200 px-4 py-2 text-lg transition-colors focus:border-blue-400 focus:outline-none"
						required
					/>
				</div>

				<!-- Reminders Per Day -->
				<div class="space-y-2">
					<label for="reminders" class="block text-sm font-semibold text-gray-700">
						How many times to drink per day?
					</label>
					<div class="flex items-center gap-4">
						<input
							id="reminders"
							type="number"
							bind:value={remindersPerDay}
							min="1"
							max="20"
							class="flex-1 rounded-lg border-2 border-gray-200 px-4 py-2 text-lg transition-colors focus:border-blue-400 focus:outline-none"
							required
						/>
						<span class="text-2xl">🥤</span>
					</div>
					<p class="text-sm text-gray-500">Recommended: 8-10 times per day</p>
				</div>

				<!-- Water Amount Per Reminder -->
				<div class="space-y-2">
					<label for="waterAmount" class="block text-sm font-semibold text-gray-700">
						How much water per reminder?
					</label>
					<div class="flex items-center gap-4">
						<input
							id="waterAmount"
							type="number"
							bind:value={waterAmountPerReminder}
							min="50"
							max="1000"
							step="25"
							class="flex-1 rounded-lg border-2 border-gray-200 px-4 py-2 text-lg transition-colors focus:border-blue-400 focus:outline-none"
							required
						/>
						<span class="text-lg font-semibold text-gray-600">ml</span>
					</div>
					<p class="text-sm text-gray-500">Recommended: 200-300ml per reminder</p>
				</div>

				<!-- Water Intake Info -->
				{#if remindersPerDay > 0}
					<div class="space-y-2 rounded-lg bg-blue-50 p-4">
						<p class="text-sm font-semibold text-blue-900">💧 Hydration Goal:</p>
						<p class="text-sm text-blue-800">
							<strong>Drink {waterAmountPerReminder}ml</strong> every
							<strong>{Math.round(1440 / remindersPerDay)} minutes</strong>
							between your wake and sleep times.
						</p>
						<p class="text-sm text-blue-800">
							<strong>Total daily goal:</strong>
							{remindersPerDay * waterAmountPerReminder}ml
						</p>
					</div>
				{/if}

				<!-- Error Messages -->
				{#if errors.length > 0}
					<div class="space-y-2 rounded-lg bg-red-50 p-4">
						{#each errors as error}
							<p class="text-sm text-red-700">⚠️ {error}</p>
						{/each}
					</div>
				{/if}

				<!-- Submit Button -->
				<button
					type="submit"
					class="w-full rounded-lg bg-gradient-to-r from-blue-400 to-cyan-400 py-3 font-semibold text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
				>
					Start Hydrating! 💧
				</button>
			</form>
		</div>
	{/if}
</div>

<style>
	:global(html, body) {
		height: 100%;
	}

	@keyframes fillWater {
		from {
			height: 0%;
		}
		to {
			height: 85%;
		}
	}

	@keyframes tilt {
		0%,
		100% {
			transform: rotate(0deg);
		}
		50% {
			transform: rotate(-15deg);
		}
	}
</style>
