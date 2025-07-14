# Discord Bot

A Discord.js v14 bot built with TypeScript and Bun runtime, featuring word games, utility commands, and interactive features.

## Quick Start

1. Clone the repository
2. Copy `.env.example` to `.env.production.local` and fill in your Discord bot token
3. Install dependencies and run:

```bash
# Install dependencies
bun install

# Run the bot
bun run dev        # Development mode
bun run start      # Production mode
```

## Requirements

- **Bun**: Latest version (recommended for best performance)
- **Node.js**: 24.0.0+ (fallback support via tsx)
- **TypeScript**: 5.0+

## Development

### Adding Commands

1. Create a `.ts` file in `src/commands/`
2. Export a default object implementing the `Command` interface
3. Use `ErrorEmbed` from `core/functions` for consistent error handling

### Error Handling

Commands use a standardized error system:

```typescript
import { ErrorEmbed } from '../core/functions';

// Throw user-friendly errors
throw ErrorEmbed("Error Title", "Description");
```

This project uses Bun as the primary runtime with TypeScript for type safety and modern Discord.js patterns.
