# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Atomicity is a lightweight library for creating fast WebComponents with JSX support and a signals-based reactivity system. It provides a minimal API for building reactive web components with automatic dependency tracking.

## Development Commands

- **Build**: `npm run build` or `just build` - Compiles TypeScript and builds the library with Vite
- **Lint**: `npm run lint` or `just lint` - Runs ESLint on the src/ directory
- **Bundle**: `just bundle` - Creates an npm package tarball
- **Example App**: `cd example && npm install && npm run dev` - Runs the example application

## Architecture Overview

### Core Components

The library consists of three main modules:

1. **Signals System** (`src/signals.ts`)
   - Provides fine-grained reactivity with automatic dependency tracking
   - `atom<T>(value: T)`: Creates a reactive primitive that tracks subscribers
   - `createSignal(fn)`: Wraps a function to track atom dependencies and re-run on changes
   - `createAtoms<T>(obj)`: Creates multiple atoms from an object of values
   - Atoms use getter/setter pattern: `myAtom()` reads, `myAtom.set(val)` writes

2. **JSX Factory** (`src/createElement.ts`)
   - Custom createElement function (exported as `a` for JSX pragma)
   - Handles reactive children: functions are treated as signals and re-render automatically
   - Supports reactive attributes: function values create signals that update the DOM
   - Event handlers: properties starting with "on" are registered as event listeners
   - Special handling for nested signal children with anchor-based insertion

3. **AbstractElement Base Class** (`src/abstractElement.ts`)
   - Extends HTMLElement for creating custom web components
   - Constructor accepts `transformers` (for attribute parsing) and `useShadow` flag
   - `transformers`: Maps attribute names to `[parser, defaultValue]` tuples
   - `attrs`: Reactive atoms created from observed attributes
   - `render()`: Abstract method that returns JSX to be rendered
   - Automatically re-renders when attributes change via `attributeChangedCallback`

### JSX Configuration

The library uses a custom JSX pragma. TypeScript projects should configure:

```json
{
  "compilerOptions": {
    "jsx": "react",
    "jsxFactory": "a"
  }
}
```

Import the factory: `import { a } from "atomicity"`

### Reactivity Model

- **Dependency Tracking**: When a signal runs, any atoms it accesses are automatically tracked
- **Updates**: Setting an atom's value triggers all dependent signals to re-run
- **Rendering**: Signal children in JSX are wrapped in `createSignal()` for automatic updates
- **Anchors**: The createElement function uses anchor nodes to maintain correct DOM insertion order for dynamic children

### Web Component Pattern

To create a custom element:

1. Extend `AbstractElement<AttributesType>`
2. Define attribute transformers and defaults in constructor
3. Declare `static observedAttributes` array
4. Implement `render()` method returning JSX
5. Register with `customElements.define(name, class)`

Example structure:
```tsx
class MyElement extends AbstractElement<{ count: number }> {
  #state = atom(0);

  constructor() {
    super({ count: [(s) => parseInt(s), 0] }, false);
  }

  static get observedAttributes() { return ["count"]; }

  render() {
    return <div>{this.#state}</div>;
  }
}
```

## Key Conventions

- **Exports**: The JSX factory is exported as `a` (short for atom/atomicity)
- **Signals as Children**: Functions in JSX children are treated as reactive signals
- **Signals as Attributes**: Function attribute values create reactive DOM updates
- **Private Fields**: Use `#field` syntax for component internal state
- **TypeScript**: Strict mode enabled, all code must be properly typed
- **Build Output**: Single ESM bundle in `dist/index.js` with generated `.d.ts` files

## Testing and Examples

The `example/` directory contains a working demo that:
- Links to the parent package via `"atomicity": ".."`
- Demonstrates AbstractElement usage with transformers
- Shows reactive state with counters and dynamic lists
- Run with `cd example && npm run dev`

## Publishing

- Published to npm as `@pesca-dev/atomicity`
- Also published to JSR (see `jsr.json`)
- Version managed in `package.json`
