# Discord Bot

A Discord.js v14 bot with cross-runtime compatibility (Bun/Node.js).

## Installation

### Quick Start (Auto-detected Runtime)

1. Clone the repository
2. Copy `.env.example` to `.env.production.local` and fill in your values
3. Install dependencies and run:

```bash
# Install dependencies
npm install
# OR
bun install

# Run the bot (automatically detects and uses best available runtime)
npm run start
```

## Runtime Detection

The bot automatically detects the runtime environment and uses appropriate APIs:

- **Bun**: Uses native Bun APIs for optimal performance
- **Node.js**: Falls back to tsx with Node.js APIs for compatibility

## Requirements

- **Bun**: Latest version (recommended)
- **Node.js**: 24.0.0+ (fallback if bun is not installed)
- **TypeScript**: 5.0+

## Testing

The project includes a unified cross-runtime test suite that automatically detects the runtime and uses the appropriate testing framework:

```bash
# Run all tests (both Bun and Node.js)
npm test
# OR
bun test
```

This project was created using `bun init` in bun v1.2.17. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime, but the project is compatible with Node.js as a fallback.
