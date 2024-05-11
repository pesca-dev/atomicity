type Signal = () => unknown;

let runningSignal: Signal | undefined = undefined;

function createAtoms<T extends { [key: string]: unknown }>(values: T): unknown {
  const atoms = {};

  Object.entries(values).forEach(([key, val]) => {
    const signals = new Set<Signal>();

    const getter = () => {
      if (runningSignal) {
        signals.add(runningSignal);
      }
      return val;
    };

    Object.defineProperty(atoms, key, {
      get: () => {
        return getter;
      },
      set: (newVal: unknown) => {
        val = newVal;
        signals.forEach((sig) => runSignal(sig));
      },
    });
  });

  return atoms;
}

function createSignal(sig: Signal): void {
  runSignal(sig);
}

function runSignal(sig: Signal): void {
  const temp = runningSignal;
  runningSignal = sig;
  sig();
  runningSignal = temp;
}

export type Transformers<Attributes extends object> = {
  [key in keyof Attributes]: [
    (arg: string) => Attributes[key],
    Attributes[key],
  ];
};

export type ObservedAttributes<Attributes> = (keyof Attributes)[];

export abstract class AbstractElement<
  Attributes extends Record<string, unknown>,
> extends HTMLElement {
  #transformers: Transformers<Attributes>;

  #root: ShadowRoot;

  #attrs: Attributes;

  constructor(transformers: Transformers<Attributes>) {
    super();

    this.#transformers = transformers;

    this.#root = this.attachShadow({ mode: "open" });

    const defaults = Object.entries(transformers).reduce<Attributes>(
      (memo, [prop, value]) => {
        memo[prop as keyof Attributes] = (
          value as unknown[]
        )[1] as Attributes[typeof prop];
        return memo;
      },
      {} as Attributes,
    );

    this.#attrs = createAtoms(defaults) as Attributes;
  }

  protected get attrs(): Attributes {
    return this.#attrs;
  }

  connectedCallback(): void {
    this.#root.replaceChildren(this.render() as string | Node);
  }

  attributeChangedCallback(
    key: keyof Attributes,
    oldValue: string,
    newValue: string,
  ) {
    if (oldValue != newValue) {
      this.attrs[key] = this.#transformers[key][0](newValue);
    }
  }

  abstract render(): unknown;
}

export function createElement(
  tag: string,
  _: unknown,
  ...children: (Signal | HTMLElement | unknown)[]
) {
  const elem = document.createElement(tag);

  createSignal(() => {
    console.log(`signal for ${tag}`);
    elem.innerHTML = "";
    for (const child of children) {
      if (typeof child === "function") {
        elem.innerHTML += child();
      } else {
        if ((child as unknown) instanceof HTMLElement) {
          elem.appendChild(child as Node);
        } else {
          elem.innerHTML += child;
        }
      }
    }
  });

  return elem;
}

export default {
  createElement,
};
