type Signal = () => any;

let runningSignal: Signal | undefined = undefined;

function createAtoms<T extends { [key: string]: any }>(values: T): any {
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
      set: (newVal: any) => {
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

export type Transformers<Attributes extends {}> = {
  [key in keyof Attributes]: [
    (arg: string) => Attributes[key],
    Attributes[key],
  ];
};

export type ObservedAttributes<Attributes> = (keyof Attributes)[];

export abstract class AbstractElement<
  Attributes extends {},
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
        memo[prop as keyof Attributes] = (value as any)[1] as any;
        return memo;
      },
      {} as Attributes,
    );

    this.#attrs = createAtoms(defaults);
  }

  protected get attrs(): Attributes {
    return this.#attrs;
  }

  connectedCallback(): void {
    this.#root.replaceChildren(this.render());
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

  abstract render(): any;
}

export function createElement(
  tag: string,
  _: any,
  ...children: (() => any | HTMLElement | any)[]
) {
  const elem = document.createElement(tag);

  createSignal(() => {
    console.log(`signal for ${tag}`);
    elem.innerHTML = "";
    for (const child of children) {
      if (typeof child === "function") {
        elem.innerHTML += child();
      } else {
        if ((child as any) instanceof HTMLElement) {
          elem.appendChild(child);
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
