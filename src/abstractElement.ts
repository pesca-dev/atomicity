import { Atoms, createAtoms } from "./signals";

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

    #attrs: Atoms<Attributes>;

    #root?: ShadowRoot | null;

    constructor(transformers: Transformers<Attributes>, useShadow = false) {
        super();

        this.#transformers = transformers;

        if (useShadow) {
            this.#root = this.attachShadow({ mode: "open" });
        }

        const defaults = Object.entries(transformers).reduce<Attributes>(
            (memo, [prop, value]) => {
                memo[prop as keyof Attributes] = (
                    value as unknown[]
                )[1] as Attributes[typeof prop];
                return memo;
            },
            {} as Attributes,
        );

        this.#attrs = createAtoms(defaults);
    }

    protected get attrs(): Atoms<Attributes> {
        return this.#attrs;
    }

    replaceChildren(...nodes: (string | Node)[]): void {
        if (this.#root) {
            this.#root.replaceChildren(...nodes);
        } else {
            super.replaceChildren(...nodes);
        }
    }

    connectedCallback(): void {
        this.replaceChildren(this.render() as string | Node);
    }

    attributeChangedCallback(
        key: keyof Attributes,
        oldValue: string,
        newValue: string,
    ) {
        if (oldValue != newValue) {
            this.attrs[key].set(this.#transformers[key][0](newValue));
        }
    }

    abstract render(): unknown;
}
