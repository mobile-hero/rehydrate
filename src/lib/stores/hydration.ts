import { writable, derived, type Readable } from 'svelte/store';

export interface HydrationSettings {
	wakeTime: string; // HH:MM format
	sleepTime: string; // HH:MM format
	remindersPerDay: number;
	waterAmountPerReminder: number; // in ml
	isConfigured: boolean;
	bottlePosition: 'left' | 'center' | 'right';
}

export interface HydrationState {
	settings: HydrationSettings;
	waterConsumed: number; // Number of reminders completed
	lastUpdated: string; // ISO date string
}

const STORAGE_KEY = 'rehydrate_state';

function createHydrationStore() {
	// Initialize from localStorage
	let initialState: HydrationState = {
		settings: {
			wakeTime: '08:00',
			sleepTime: '23:00',
			remindersPerDay: 8,
			waterAmountPerReminder: 250, // 250ml = 8oz
			isConfigured: false,
			bottlePosition: 'center'
		},
		waterConsumed: 0,
		lastUpdated: new Date().toISOString()
	};

	if (typeof window !== 'undefined') {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			try {
				initialState = JSON.parse(stored);
			} catch (e) {
				console.error('Failed to parse stored hydration state', e);
			}
		}
	}

	const { subscribe, set, update } = writable<HydrationState>(initialState);

	// Persist to localStorage on change
	subscribe((state) => {
		if (typeof window !== 'undefined') {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
		}
	});

	return {
		subscribe,
		updateSettings: (settings: Partial<HydrationSettings>) => {
			update((state) => ({
				...state,
				settings: { ...state.settings, ...settings },
				lastUpdated: new Date().toISOString()
			}));
		},
		logWaterIntake: () => {
			update((state) => ({
				...state,
				waterConsumed: Math.min(state.waterConsumed + 1, state.settings.remindersPerDay),
				lastUpdated: new Date().toISOString()
			}));
		},
		resetDaily: () => {
			update((state) => ({
				...state,
				waterConsumed: 0,
				lastUpdated: new Date().toISOString()
			}));
		},
		undoWaterIntake: () => {
			update((state) => ({
				...state,
				waterConsumed: Math.max(state.waterConsumed - 1, 0),
				lastUpdated: new Date().toISOString()
			}));
		},
		reset: () => {
			set({
				settings: {
					wakeTime: '08:00',
					sleepTime: '23:00',
					remindersPerDay: 8,
					waterAmountPerReminder: 250,
					isConfigured: false,
					bottlePosition: 'center'
				},
				waterConsumed: 0,
				lastUpdated: new Date().toISOString()
			});
		}
	};
}

export const hydration = createHydrationStore();

// Derived stores for computed values
export const progress: Readable<number> = derived(hydration, ($hydration) =>
	$hydration.settings.remindersPerDay > 0
		? ($hydration.waterConsumed / $hydration.settings.remindersPerDay) * 100
		: 0
);

export const remaining: Readable<number> = derived(hydration, ($hydration) =>
	Math.max($hydration.settings.remindersPerDay - $hydration.waterConsumed, 0)
);

export const totalDailyWater: Readable<number> = derived(
	hydration,
	($hydration) => $hydration.settings.remindersPerDay * $hydration.settings.waterAmountPerReminder
);

export const nextReminderTime: Readable<string | null> = derived(hydration, ($hydration) => {
	const { wakeTime, sleepTime, remindersPerDay, isConfigured } = $hydration.settings;
	if (!isConfigured || remindersPerDay <= 0) return null;

	const nextIndex = $hydration.waterConsumed + 1;
	if (nextIndex > remindersPerDay) return null;

	// Parse times
	const [wakeHour, wakeMin] = wakeTime.split(':').map(Number);
	const [sleepHour, sleepMin] = sleepTime.split(':').map(Number);

	const wakeDate = new Date();
	wakeDate.setHours(wakeHour, wakeMin, 0);

	const sleepDate = new Date();
	sleepDate.setHours(sleepHour, sleepMin, 0);

	// If sleep time is earlier than wake time, it's next day
	if (sleepDate < wakeDate) {
		sleepDate.setDate(sleepDate.getDate() + 1);
	}

	const wakeTimestamp = wakeDate.getTime();
	const sleepTimestamp = sleepDate.getTime();
	const totalInterval = (sleepTimestamp - wakeTimestamp) / remindersPerDay;
	const nextReminderTimestamp = wakeTimestamp + totalInterval * (nextIndex - 1);

	const nextTime = new Date(nextReminderTimestamp);
	return nextTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
});

// Exact Date of the next reminder (used by the scheduler)
export const nextReminderDate: Readable<Date | null> = derived(hydration, ($hydration) => {
	const { wakeTime, sleepTime, remindersPerDay, isConfigured } = $hydration.settings;
	if (!isConfigured || remindersPerDay <= 0) return null;

	const nextIndex = $hydration.waterConsumed + 1;
	if (nextIndex > remindersPerDay) return null;

	const [wakeHour, wakeMin] = wakeTime.split(':').map(Number);
	const [sleepHour, sleepMin] = sleepTime.split(':').map(Number);

	const wakeDate = new Date();
	wakeDate.setHours(wakeHour, wakeMin, 0, 0);

	const sleepDate = new Date();
	sleepDate.setHours(sleepHour, sleepMin, 0, 0);

	if (sleepDate < wakeDate) {
		sleepDate.setDate(sleepDate.getDate() + 1);
	}

	const totalInterval = (sleepDate.getTime() - wakeDate.getTime()) / remindersPerDay;
	return new Date(wakeDate.getTime() + totalInterval * (nextIndex - 1));
});

export function playReminderSound() {
	try {
		new Audio('/reminder.wav').play();
	} catch {
		// Audio unavailable
	}
}

/**
 * Start watching nextReminderDate and fire a browser notification + chime when
 * the scheduled time arrives. Returns a cleanup function to call on unmount.
 */
/**
 * Show a notification via the Service Worker registration so it appears in the
 * OS notification bar even when the tab is focused (plain `new Notification()`
 * is silently suppressed by Chrome/Edge when the page is active).
 */
export async function showReminderNotification(title: string, body: string): Promise<void> {
	if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
	try {
		if ('serviceWorker' in navigator) {
			const reg = await navigator.serviceWorker.getRegistration();
			if (reg) {
				await reg.showNotification(title, { body });
				return;
			}
		}
	} catch {
		// fall through
	}
	new Notification(title, { body });
}

export function startReminderScheduler(): () => void {
	let timeoutId: ReturnType<typeof setTimeout> | null = null;

	const unsubscribe = nextReminderDate.subscribe((date) => {
		if (timeoutId !== null) {
			clearTimeout(timeoutId);
			timeoutId = null;
		}
		if (!date) return;

		const delay = date.getTime() - Date.now();
		if (delay <= 0) return; // reminder time already passed

		timeoutId = setTimeout(() => {
			timeoutId = null;
			playReminderSound();
			showReminderNotification('Time to drink water! 💧', 'Stay hydrated — take a sip now.');
		}, delay);
	});

	return () => {
		unsubscribe();
		if (timeoutId !== null) clearTimeout(timeoutId);
	};
}

// Validation helper
export function validateSettings(settings: Partial<HydrationSettings>): {
	valid: boolean;
	errors: string[];
} {
	const errors: string[] = [];

	if (settings.wakeTime) {
		if (!/^\d{2}:\d{2}$/.test(settings.wakeTime)) {
			errors.push('Wake time must be in HH:MM format');
		}
	}

	if (settings.sleepTime) {
		if (!/^\d{2}:\d{2}$/.test(settings.sleepTime)) {
			errors.push('Sleep time must be in HH:MM format');
		}
	}

	if (settings.remindersPerDay !== undefined) {
		if (!Number.isInteger(settings.remindersPerDay) || settings.remindersPerDay < 1) {
			errors.push('Reminders per day must be at least 1');
		}
		if (settings.remindersPerDay > 20) {
			errors.push('Reminders per day cannot exceed 20');
		}
	}

	if (settings.waterAmountPerReminder !== undefined) {
		if (
			!Number.isInteger(settings.waterAmountPerReminder) ||
			settings.waterAmountPerReminder < 50
		) {
			errors.push('Water amount per reminder must be at least 50ml');
		}
		if (settings.waterAmountPerReminder > 1000) {
			errors.push('Water amount per reminder cannot exceed 1000ml');
		}
	}

	// Cross-field validation
	if (settings.wakeTime && settings.sleepTime) {
		const [wakeHour, wakeMin] = settings.wakeTime.split(':').map(Number);
		const [sleepHour, sleepMin] = settings.sleepTime.split(':').map(Number);

		const wakeTotal = wakeHour * 60 + wakeMin;
		const sleepTotal = sleepHour * 60 + sleepMin;

		// Allow wrapping to next day, but not same time
		if (wakeTotal === sleepTotal) {
			errors.push('Wake time and sleep time cannot be the same');
		}
	}

	return {
		valid: errors.length === 0,
		errors
	};
}
