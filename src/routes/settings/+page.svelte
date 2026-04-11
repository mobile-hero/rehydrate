<script lang="ts">
	import { goto } from '$app/navigation';
	import { hydration, validateSettings } from '$lib/stores/hydration';

	let wakeTime = $state($hydration.settings.wakeTime);
	let sleepTime = $state($hydration.settings.sleepTime);
	let remindersPerDay = $state($hydration.settings.remindersPerDay);
	let waterAmountPerReminder = $state($hydration.settings.waterAmountPerReminder);
	let errors: string[] = $state([]);
	let successMessage = $state('');

	$effect(() => {
		wakeTime = $hydration.settings.wakeTime;
		sleepTime = $hydration.settings.sleepTime;
		remindersPerDay = $hydration.settings.remindersPerDay;
		waterAmountPerReminder = $hydration.settings.waterAmountPerReminder;
	});

	function handleSave(event: Event) {
		event.preventDefault();
		errors = [];
		successMessage = '';

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
			waterAmountPerReminder
		});

		successMessage = 'Settings updated! ✓';
		setTimeout(() => {
			goto('/');
		}, 1500);
	}

	function handleReset() {
		if (confirm('Are you sure? This will reset all your data.')) {
			hydration.reset();
			// Variables will automatically update due to reactive statements
		}
	}
</script>

<div class="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 px-4 py-8">
	<div class="mx-auto max-w-md space-y-8">
		<!-- Header -->
		<div class="space-y-2">
			<h1 class="text-3xl font-bold text-blue-600">⚙️ Settings</h1>
			<p class="text-gray-600">Adjust your hydration parameters</p>
		</div>

		<!-- Settings Form -->
		<form
			onsubmit={handleSave}
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

			<!-- Current Settings Info -->
			<div class="space-y-2 rounded-lg bg-blue-50 p-4">
				<p class="text-sm font-semibold text-blue-900">📊 Current Configuration:</p>
				<p class="text-sm text-blue-800">
					<strong>Hydration Goal:</strong> Drink {waterAmountPerReminder}ml every
					<strong>{Math.round(1440 / remindersPerDay)} minutes</strong>
					between your wake and sleep times.
				</p>
				<p class="text-sm text-blue-800">
					<strong>Total daily goal:</strong>
					{remindersPerDay * waterAmountPerReminder}ml
				</p>
				<p class="text-sm text-blue-800">
					<strong>Active Hours:</strong>
					{wakeTime} to {sleepTime}
				</p>
			</div>

			<!-- Success Message -->
			{#if successMessage}
				<div class="space-y-2 rounded-lg bg-green-50 p-4">
					<p class="text-sm text-green-700">{successMessage}</p>
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

			<!-- Action Buttons -->
			<div class="space-y-2">
				<button
					type="submit"
					class="w-full rounded-lg bg-gradient-to-r from-blue-400 to-cyan-400 py-3 font-semibold text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
				>
					Save Settings 💾
				</button>

				<button
					type="button"
					onclick={handleReset}
					class="w-full rounded-lg border-2 border-red-300 py-2 font-semibold text-red-600 transition-colors hover:bg-red-50"
				>
					Reset All Data 🔄
				</button>
			</div>
		</form>

		<!-- Info Box -->
		<div class="space-y-2 rounded-lg bg-amber-50 p-4">
			<p class="text-sm font-semibold text-amber-900">ℹ️ Note:</p>
			<p class="text-sm text-amber-800">
				Changing your settings will adjust your hydration reminders but won't reset your daily
				progress. Check <a href="/issues" class="underline">ISSUES.md</a> for known considerations.
			</p>
		</div>
	</div>
</div>
