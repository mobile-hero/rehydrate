<script lang="ts">
	import { goto } from '$app/navigation';
	import { hydration, validateSettings, progress } from '$lib/stores/hydration';

	let wakeTime = $state($hydration.settings.wakeTime);
	let sleepTime = $state($hydration.settings.sleepTime);
	let remindersPerDay = $state($hydration.settings.remindersPerDay);
	let waterAmountPerReminder = $state($hydration.settings.waterAmountPerReminder);
	let bottlePosition = $state<'left' | 'center' | 'right'>($hydration.settings.bottlePosition ?? 'center');
	let errors: string[] = $state([]);
	let successMessage = $state('');

	$effect(() => {
		wakeTime = $hydration.settings.wakeTime;
		sleepTime = $hydration.settings.sleepTime;
		remindersPerDay = $hydration.settings.remindersPerDay;
		waterAmountPerReminder = $hydration.settings.waterAmountPerReminder;
		bottlePosition = $hydration.settings.bottlePosition ?? 'center';
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
			waterAmountPerReminder,
			bottlePosition
		});

		successMessage = 'Settings saved!';
		setTimeout(() => goto('/'), 1200);
	}

	function handleReset() {
		if (confirm('Are you sure? This will reset all your data.')) {
			hydration.reset();
		}
	}

	let showNotifPreview = $state(false);
	let notifBlocked = $state(false);
	let notifHideTimer: ReturnType<typeof setTimeout>;

	async function testNotification() {
		clearTimeout(notifHideTimer);
		notifBlocked = false;
		showNotifPreview = true;

		if ('Notification' in window) {
			if (Notification.permission === 'default') {
				await Notification.requestPermission();
			}
			if (Notification.permission === 'granted') {
				new Notification('rehydrate 💧', {
					body: `Time to drink! ${waterAmountPerReminder}ml to stay on track.`
				});
			} else if (Notification.permission === 'denied') {
				notifBlocked = true;
			}
		}

		notifHideTimer = setTimeout(() => { showNotifPreview = false; }, 5000);
	}

	// Mirrored position — "back of the bottle" flips the strip side
	const mirroredPosition = $derived(
		$hydration.settings.bottlePosition === 'left' ? 'right' :
		$hydration.settings.bottlePosition === 'right' ? 'left' : 'center'
	);
</script>

<!-- Back of the bottle — same water world, mirrored strip -->
<div class="relative min-h-dvh overflow-x-hidden bg-sky-100">

	<!-- Water fill (fixed so it stays while scrolling) -->
	<div
		class="fixed inset-x-0 bottom-0 bg-linear-to-t from-cyan-600 via-cyan-400 to-sky-300 transition-[height] duration-700 ease-in-out"
		style="height: {100 - $progress}%"
	>
		<svg
			style="position: absolute; bottom: 100%; width: 100%; height: 40px;"
			viewBox="0 0 1440 40"
			preserveAspectRatio="none"
			aria-hidden="true"
		>
			<path d="M0,20 C360,40 720,0 1080,20 C1260,30 1380,10 1440,20 L1440,40 L0,40 Z" fill="#7dd3fc" />
		</svg>
	</div>

	<!-- Graduation strip (fixed, mirrored side — back of bottle) -->
	{#if mirroredPosition !== 'center'}
		<div
			class="fixed top-0 h-full flex flex-col justify-evenly pointer-events-none z-1"
			style="
				{mirroredPosition === 'left' ? 'left: 1.25rem;' : 'right: 1.25rem;'}
				padding-top: 3.5rem;
				padding-bottom: 5.5rem;
			"
		>
			{#each Array.from({ length: $hydration.settings.remindersPerDay }, (_, i) => i < $hydration.waterConsumed) as isConsumed, i (i)}
				<div
					class="flex items-center gap-1.5"
					style="{mirroredPosition === 'left' ? 'flex-direction: row-reverse;' : ''}"
				>
					<div style="height: 2px; width: {isConsumed ? '10px' : '22px'}; background: {isConsumed ? 'rgba(14,165,233,0.35)' : 'rgba(255,255,255,0.95)'}; transition: all 0.5s ease;"></div>
					<span style="font-size: 9px; font-family: monospace; line-height: 1; color: {isConsumed ? 'rgba(14,165,233,0.35)' : 'rgba(255,255,255,0.95)'}; transition: all 0.5s ease;">
						{$hydration.settings.remindersPerDay - i}
					</span>
				</div>
			{/each}
		</div>
	{:else}
		<div
			class="fixed top-0 h-full flex flex-col justify-evenly items-center pointer-events-none z-1"
			style="left: 50%; transform: translateX(-50%); padding-top: 3.5rem; padding-bottom: 5.5rem;"
		>
			{#each Array.from({ length: $hydration.settings.remindersPerDay }, (_, i) => i < $hydration.waterConsumed) as isConsumed, i (i)}
				<div class="flex items-center gap-1">
					<div style="height: 2px; width: {isConsumed ? '8px' : '16px'}; background: {isConsumed ? 'rgba(14,165,233,0.35)' : 'rgba(255,255,255,0.95)'}; transition: all 0.5s ease;"></div>
					<span style="font-size: 9px; font-family: monospace; line-height: 1; min-width: 14px; text-align: center; color: {isConsumed ? 'rgba(14,165,233,0.35)' : 'rgba(255,255,255,0.95)'}; transition: all 0.5s ease;">
						{$hydration.settings.remindersPerDay - i}
					</span>
					<div style="height: 2px; width: {isConsumed ? '8px' : '16px'}; background: {isConsumed ? 'rgba(14,165,233,0.35)' : 'rgba(255,255,255,0.95)'}; transition: all 0.5s ease;"></div>
				</div>
			{/each}
		</div>
	{/if}

	<!-- Scrollable content -->
	<div class="relative z-10 px-4 pb-16">

		<!-- Organic header — back arrow + centered title (matches front page app bar) -->
		<div class="relative flex items-center justify-center mb-6 px-1" style="height: 3.5rem;">
			<a
				href="/"
				class="absolute left-0 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm transition-transform active:scale-95"
				style="background: rgba(14,165,233,0.2); border: 1.5px solid rgba(14,165,233,0.45); color: white;"
				aria-label="Back"
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
					<path d="m15 18-6-6 6-6"/>
				</svg>
			</a>
			<div class="text-center">
				<h1 class="text-xl font-bold text-sky-900 tracking-wide">Settings</h1>
				<p class="text-xs text-sky-700/80">back of the bottle</p>
			</div>
		</div>

		<!-- Form -->
		<form onsubmit={handleSave} class="space-y-4">

			<!-- Schedule card -->
			<div
				class="rounded-2xl p-4 space-y-3"
				style="background: rgba(14,165,233,0.15); backdrop-filter: blur(12px); border: 1.5px solid rgba(14,165,233,0.3);"
			>
				<p class="text-xs font-bold uppercase tracking-widest text-sky-700/80">Schedule</p>
				<div class="flex gap-3">
					<div class="flex-1 space-y-1">
						<label for="wake" class="block text-xs font-semibold text-sky-900">Wake up</label>
						<input
							id="wake"
							type="time"
							bind:value={wakeTime}
							class="w-full rounded-xl px-3 py-2 text-base font-semibold text-sky-900 transition-colors focus:outline-none"
							style="background: rgba(255,255,255,0.75); border: 1.5px solid rgba(255,255,255,0.6); backdrop-filter: blur(4px);"
							required
						/>
					</div>
					<div class="flex-1 space-y-1">
						<label for="sleep" class="block text-xs font-semibold text-sky-900">Sleep</label>
						<input
							id="sleep"
							type="time"
							bind:value={sleepTime}
							class="w-full rounded-xl px-3 py-2 text-base font-semibold text-sky-900 transition-colors focus:outline-none"
							style="background: rgba(255,255,255,0.75); border: 1.5px solid rgba(255,255,255,0.6); backdrop-filter: blur(4px);"
							required
						/>
					</div>
				</div>
			</div>

			<!-- Intake card -->
			<div
				class="rounded-2xl p-4 space-y-3"
				style="background: rgba(14,165,233,0.15); backdrop-filter: blur(12px); border: 1.5px solid rgba(14,165,233,0.3);"
			>
				<p class="text-xs font-bold uppercase tracking-widest text-sky-700/80">Intake</p>
				<div class="flex gap-3">
					<div class="flex-1 space-y-1">
						<label for="reminders" class="block text-xs font-semibold text-sky-900">Sips / day</label>
						<input
							id="reminders"
							type="number"
							bind:value={remindersPerDay}
							min="1"
							max="20"
							class="w-full rounded-xl px-3 py-2 text-base font-semibold text-sky-900 focus:outline-none"
							style="background: rgba(255,255,255,0.75); border: 1.5px solid rgba(255,255,255,0.6); backdrop-filter: blur(4px);"
							required
						/>
					</div>
					<div class="flex-1 space-y-1">
						<label for="waterAmount" class="block text-xs font-semibold text-sky-900">ml / sip</label>
						<input
							id="waterAmount"
							type="number"
							bind:value={waterAmountPerReminder}
							min="50"
							max="1000"
							step="25"
							class="w-full rounded-xl px-3 py-2 text-base font-semibold text-sky-900 focus:outline-none"
							style="background: rgba(255,255,255,0.75); border: 1.5px solid rgba(255,255,255,0.6); backdrop-filter: blur(4px);"
							required
						/>
					</div>
				</div>
			</div>

			<!-- Indicator position card -->
			<div
				class="rounded-2xl p-4 space-y-3"
				style="background: rgba(14,165,233,0.15); backdrop-filter: blur(12px); border: 1.5px solid rgba(14,165,233,0.3);"
			>
				<p class="text-xs font-bold uppercase tracking-widest text-sky-700/80">Strip position</p>
				<p class="text-xs text-sky-700">Where the level marks appear on the bottle</p>
				<div class="flex gap-2">
					{#each (['left', 'center', 'right'] as const) as pos}
						<button
							type="button"
							onclick={() => bottlePosition = pos}
							class="flex-1 rounded-xl py-2.5 text-sm font-bold capitalize transition-all active:scale-95"
							style="
								{bottlePosition === pos
									? 'background: rgba(255,255,255,0.92); color: #0891b2; border: 2px solid rgba(255,255,255,0.92);'
									: 'background: rgba(14,165,233,0.25); color: white; border: 2px solid rgba(255,255,255,0.55);'}
							"
						>
							{pos}
						</button>
					{/each}
				</div>
			</div>

			<!-- Summary card -->
			<div
				class="rounded-2xl p-4 space-y-2"
				style="background: rgba(14,165,233,0.1); backdrop-filter: blur(8px); border: 1.5px solid rgba(14,165,233,0.2);"
			>
				<p class="text-xs font-bold uppercase tracking-widest text-sky-700/70">Daily summary</p>
				<div class="flex justify-between text-sm text-sky-800">
					<span>Total goal</span>
					<span class="font-bold">{remindersPerDay * waterAmountPerReminder} ml</span>
				</div>
				<div class="flex justify-between text-sm text-sky-800">
					<span>Interval</span>
					<span class="font-bold">every {Math.round(1440 / remindersPerDay)} min</span>
				</div>
				<div class="flex justify-between text-sm text-sky-800">
					<span>Active hours</span>
					<span class="font-bold">{wakeTime} – {sleepTime}</span>
				</div>
			</div>

			<!-- Notification test card -->
			<div
				class="rounded-2xl p-4 space-y-3"
				style="background: rgba(14,165,233,0.15); backdrop-filter: blur(12px); border: 1.5px solid rgba(14,165,233,0.3);"
			>
				<p class="text-xs font-bold uppercase tracking-widest text-sky-700/80">Notifications</p>
				<p class="text-xs text-sky-700">Preview what your drink reminders will look like</p>
				<button
					type="button"
					onclick={testNotification}
					class="w-full rounded-xl py-2.5 text-sm font-bold text-white transition-transform active:scale-95 flex items-center justify-center gap-2"
					style="background: rgba(14,165,233,0.35); border: 1.5px solid rgba(14,165,233,0.5);"
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
						<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
					</svg>
					Send test notification
				</button>
			</div>

			<!-- Feedback messages -->
			{#if successMessage}
				<div class="rounded-2xl px-5 py-4" style="background: rgba(16,185,129,0.2); border: 1.5px solid rgba(16,185,129,0.4);">
					<p class="text-sm font-semibold text-emerald-800">✓ {successMessage}</p>
				</div>
			{/if}
			{#if errors.length > 0}
				<div class="rounded-2xl px-5 py-4" style="background: rgba(239,68,68,0.15); border: 1.5px solid rgba(239,68,68,0.35);">
					{#each errors as error}
						<p class="text-sm text-red-800">⚠ {error}</p>
					{/each}
				</div>
			{/if}

			<!-- Action buttons -->
			<div class="space-y-3 pt-1">
				<button
					type="submit"
					class="w-full rounded-full bg-white py-4 text-lg font-bold text-cyan-600 shadow-2xl transition-transform active:scale-95"
				>
					💾 Save Settings
				</button>
				<button
					type="button"
					onclick={handleReset}
					class="w-full rounded-full py-3 text-sm font-semibold transition-transform active:scale-95"
					style="background: rgba(239,68,68,0.15); border: 1.5px solid rgba(239,68,68,0.4); color: #991b1b; backdrop-filter: blur(4px);"
				>
					Reset All Data
				</button>
			</div>
		</form>
	</div>

	<!-- In-app notification preview banner -->
	{#if showNotifPreview}
		<div
			class="fixed top-4 inset-x-4 z-50 rounded-2xl p-3.5 flex items-start gap-3 shadow-2xl"
			style="background: rgba(255,255,255,0.92); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.8);"
		>
			<!-- App icon -->
			<div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style="background: rgba(14,165,233,0.2);">
				<span style="font-size: 20px;">💧</span>
			</div>
			<!-- Content -->
			<div class="flex-1 min-w-0">
				<div class="flex items-center justify-between gap-2">
					<span class="text-xs font-bold text-sky-900 tracking-wide">rehydrate · now</span>
				</div>
				{#if notifBlocked}
					<p class="text-xs text-red-700 mt-0.5">Notifications blocked — enable them in browser settings</p>
				{:else}
					<p class="text-sm font-semibold text-sky-900 mt-0.5">Time to drink! 💧</p>
					<p class="text-xs text-sky-700">{waterAmountPerReminder}ml to stay on track.</p>
				{/if}
			</div>
			<!-- Dismiss -->
			<button
				type="button"
				onclick={() => { showNotifPreview = false; clearTimeout(notifHideTimer); }}
				class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-opacity hover:opacity-70"
				style="background: rgba(0,0,0,0.08); color: #475569;"
				aria-label="Dismiss"
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
					<path d="M18 6 6 18M6 6l12 12"/>
				</svg>
			</button>
		</div>
	{/if}
</div>
