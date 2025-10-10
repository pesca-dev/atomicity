# Atomicity

Lightweight library for creating fast, reactive WebComponents with JSX support and signals-based state management.

[![npm version](https://img.shields.io/npm/v/@pesca-dev/atomicity.svg)](https://www.npmjs.com/package/@pesca-dev/atomicity)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Why Atomicity?

Building web components with vanilla JavaScript can be verbose and lacks reactivity out of the box. Popular frameworks like React and Vue are powerful but come with significant bundle sizes and complexity. Atomicity bridges this gap by providing:

- **Tiny footprint**: Minimal JavaScript that won't bloat your bundle
- **Native Web Components**: Standards-based, framework-agnostic components
- **Fine-grained reactivity**: Automatic dependency tracking with signals - only updates what changed
- **JSX support**: Familiar syntax for building component templates
- **Zero dependencies**: No external dependencies to worry about
- **TypeScript-first**: Full type safety for better developer experience

Perfect for building lightweight, performant web applications or embedding components in any web project.

## Installation

```bash
npm install @pesca-dev/atomicity
```

Or via JSR:

```bash
npx jsr add @pesca-dev/atomicity
```

## Quick Start

### 1. Configure TypeScript

Add JSX configuration to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "jsx": "react",
    "jsxFactory": "a"
  }
}
```

### 2. Create Your First Component

```tsx
import { AbstractElement, ObservedAttributes, Transformers, atom, a } from '@pesca-dev/atomicity';

// Define your component's attributes
type Attributes = {
  count: number;
};

// Define how to parse attributes from HTML
const transformers: Transformers<Attributes> = {
  count: [(arg) => parseInt(arg, 10), 0], // [parser, default]
};

class CounterElement extends AbstractElement<Attributes> {
  // Create reactive state with atom
  #internalCount = atom(0);

  constructor() {
    super(transformers, false); // false = no shadow DOM
  }

  // Declare which attributes to observe
  static get observedAttributes(): ObservedAttributes<Attributes> {
    return ['count'];
  }

  #increment = () => {
    this.#internalCount.set(this.#internalCount() + 1);
  };

  render() {
    return (
      <div>
        <h2>Counter: {this.#internalCount}</h2>
        <p>Initial count from attribute: {this.attrs.count}</p>
        <button onClick={this.#increment}>
          Increment
        </button>
      </div>
    );
  }
}

// Register the custom element
customElements.define('counter-element', CounterElement);
```

### 3. Use in HTML

```html
<counter-element count="5"></counter-element>
```

## Core Concepts

### Signals (Reactive Primitives)

Signals provide automatic reactivity. When you read from a signal inside a reactive context (like JSX), dependencies are automatically tracked.

```tsx
import { atom, createSignal } from '@pesca-dev/atomicity';

// Create a signal
const count = atom(0);

// Read the value
console.log(count()); // 0

// Update the value
count.set(1);

// Create a computed signal (auto-updates when dependencies change)
createSignal(() => {
  console.log('Count changed to:', count());
});
```

### Reactive JSX

Functions in JSX are treated as reactive signals and automatically re-render when their dependencies change:

```tsx
const items = atom(['Apple', 'Banana', 'Cherry']);

// This list automatically updates when items changes
<ul>
  {() => items().map(item => <li>{item}</li>)}
</ul>

// Reactive attributes
<div id={() => `item-${count()}`}>
  Content
</div>
```

### AbstractElement

Base class for creating custom web components with reactive attributes:

```tsx
class MyElement extends AbstractElement<{ name: string; age: number }> {
  constructor() {
    super(
      {
        name: [(s) => s, ''],           // string attribute
        age: [(s) => parseInt(s), 0],   // number attribute
      },
      false // use shadow DOM? (true/false)
    );
  }

  static get observedAttributes() {
    return ['name', 'age'];
  }

  render() {
    // Access reactive attributes via this.attrs
    return (
      <div>
        <p>Name: {this.attrs.name}</p>
        <p>Age: {this.attrs.age}</p>
      </div>
    );
  }
}
```

## Advanced Examples

### Dynamic Lists with Reactive State

```tsx
class TodoList extends AbstractElement {
  #todos = atom<string[]>([]);
  #input = atom('');

  constructor() {
    super({}, false);
  }

  static get observedAttributes() {
    return [];
  }

  #addTodo = () => {
    if (this.#input()) {
      this.#todos.set([...this.#todos(), this.#input()]);
      this.#input.set('');
    }
  };

  #handleInput = (e: Event) => {
    this.#input.set((e.target as HTMLInputElement).value);
  };

  render() {
    return (
      <div>
        <input
          type="text"
          value={this.#input}
          onInput={this.#handleInput}
        />
        <button onClick={this.#addTodo}>Add</button>
        <ul>
          {() => this.#todos().map(todo => (
            <li>{todo}</li>
          ))}
        </ul>
        <p>Total todos: {this.#todos.length}</p>
      </div>
    );
  }
}

customElements.define('todo-list', TodoList);
```

### Conditional Rendering

```tsx
class UserProfile extends AbstractElement {
  #isLoggedIn = atom(false);

  constructor() {
    super({}, false);
  }

  static get observedAttributes() {
    return [];
  }

  #toggleLogin = () => {
    this.#isLoggedIn.set(!this.#isLoggedIn());
  };

  render() {
    return (
      <div>
        {() => this.#isLoggedIn()
          ? <p>Welcome back!</p>
          : <p>Please log in</p>
        }
        <button onClick={this.#toggleLogin}>
          {() => this.#isLoggedIn() ? 'Logout' : 'Login'}
        </button>
      </div>
    );
  }
}

customElements.define('user-profile', UserProfile);
```

### Multiple Reactive Values

```tsx
const firstName = atom('John');
const lastName = atom('Doe');

// Automatically updates when either firstName or lastName changes
<div>
  {() => `${firstName()} ${lastName()}`}
</div>
```

### Creating Multiple Atoms from an Object

```tsx
import { createAtoms } from '@pesca-dev/atomicity';

const state = createAtoms({
  count: 0,
  name: 'Alice',
  isActive: true,
});

// Access like regular atoms
state.count.set(5);
console.log(state.name()); // 'Alice'
```

## API Reference

### `atom<T>(value: T): Atom<T>`

Creates a reactive primitive that tracks subscribers and notifies them of changes.

```tsx
const counter = atom(0);
counter();        // Read: returns 0
counter.get();    // Alternative read syntax
counter.set(5);   // Write: sets to 5
```

### `createSignal(fn: () => void): void`

Creates a reactive context. The function runs immediately and re-runs whenever any accessed atoms change.

```tsx
const name = atom('World');
createSignal(() => {
  console.log(`Hello, ${name()}!`);
});
// Logs: "Hello, World!"

name.set('Atomicity');
// Logs: "Hello, Atomicity!"
```

### `createAtoms<T>(obj: T): Atoms<T>`

Creates multiple atoms from an object of values.

```tsx
const state = createAtoms({ x: 0, y: 0 });
state.x.set(10);
```

### `AbstractElement<Attributes>`

Base class for creating reactive web components.

**Constructor Parameters:**
- `transformers`: Optional object mapping attribute names to `[parser, defaultValue]` tuples
- `useShadow`: Boolean indicating whether to use Shadow DOM (default: false)

**Properties:**
- `this.attrs`: Reactive atoms for each observed attribute

**Methods to Implement:**
- `render()`: Return JSX to render the component
- `static observedAttributes`: Array of attribute names to observe

### `createElement(tag, properties, ...children)`

JSX factory function (imported as `a`). Creates DOM elements with reactive support.

**Reactive Features:**
- Function children are treated as reactive signals
- Function attribute values create reactive attributes
- Event handlers (attributes starting with "on") are automatically registered

## Building and Development

```bash
# Install dependencies
npm install

# Build the library
npm run build

# Lint code
npm run lint

# Run example app
cd example
npm install
npm run dev
```

## Browser Support

Atomicity uses modern web standards:
- Custom Elements (Web Components)
- ES2020+ JavaScript features

Supported in all modern browsers (Chrome, Firefox, Safari, Edge). For older browsers, you may need polyfills.

## Comparison with Other Libraries

| Feature | Atomicity | React | Lit | Vanilla |
|---------|-----------|-------|-----|---------|
| Bundle Size | ~2KB | ~40KB | ~15KB | 0KB |
| Web Components | ✅ Native | ❌ Wrappers needed | ✅ Native | ✅ Manual |
| Reactivity | ✅ Signals | ✅ VDOM | ✅ Reactive props | ❌ Manual |
| JSX Support | ✅ | ✅ | ❌ Templates | ❌ |
| Learning Curve | Low | Medium | Medium | Low |
| TypeScript | ✅ First-class | ✅ Good | ✅ Good | ✅ Manual |

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © 2020 Louis Meyer

See [LICENSE](LICENSE) for more information.

## Links

- [GitHub Repository](https://github.com/pesca-dev/atomicity)
- [npm Package](https://www.npmjs.com/package/@pesca-dev/atomicity)
- [Report Issues](https://github.com/pesca-dev/atomicity/issues)
