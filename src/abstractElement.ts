import { createAtoms } from "./signals";

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
