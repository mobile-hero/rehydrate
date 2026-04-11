# 💧 Rehydrate

A personal water reminder and tracking app to help you stay hydrated throughout the day.

## Features

- **Home Page**: Visual water tracking with an interactive water level display mimicking a bottle
- **Welcome Page**: Initial setup with wake/sleep times and hydration goals
- **Settings Page**: Adjust your hydration parameters at any time
- **Smart Intervals**: Reminders are spaced evenly based on your wake-to-sleep window and desired frequency
- **Multiple Languages**: Localized in English, Spanish, and Indonesian

## Getting Started

### Prerequisites
- Node.js 18+ or Bun
- npm, pnpm, yarn, or bun package manager

### Installation

```sh
# Install dependencies
npm install
# or
bun install
```

### Development

```sh
npm run dev
# or
bun dev

# Open browser to http://localhost:5173
```

## How It Works

1. **Setup**: On first visit, you'll configure:
   - Wake up time (when you start your day)
   - Sleep time (when you go to bed)
   - Number of times you want to drink water per day

2. **Hydration Goal**: The app calculates:
   - Your available hours (wake to sleep)
   - Even reminder intervals
   - Total water intake recommendation

3. **Tracking**: 
   - Log each time you drink
   - Visual progress through the day
   - See how many reminders/glasses you have left

## App Structure

```
src/
├── routes/
│   ├── +page.svelte           # Home - Water tracking
│   ├── welcome/
│   │   └── +page.svelte       # Welcome - Initial setup
│   └── settings/
│       └── +page.svelte       # Settings - Adjust parameters
├── lib/
│   └── stores/
│       └── hydration.ts       # State management
└── app.html
```

## Development

For detailed development setup and commands, see [DEVELOPMENT.md](DEVELOPMENT.md).

### Available Scripts

```sh
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run check        # Type check
npm run lint         # Lint and format check
npm run format       # Format code
npm run test:unit    # Run unit tests
npm run test:e2e     # Run e2e tests
```

## Known Issues & Considerations

See [ISSUES.md](ISSUES.md) for known issues, edge cases, and validation considerations.

## Tech Stack

- **Framework**: [SvelteKit](https://kit.svelte.dev)
- **Styling**: [Tailwind CSS](https://tailwindcss.com)
- **Language**: [TypeScript](https://www.typescriptlang.org)
- **i18n**: [Paraglide.js](https://inlang.com/m/gerre34r/library-inlang-paraglideJs)
- **Testing**: [Vitest](https://vitest.dev) + [Playwright](https://playwright.dev)

## License

Personal project
