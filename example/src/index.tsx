/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    AbstractElement,
    ObservedAttributes,
    Transformers,
    atom,
    a,
} from "atomicity";

type Attributes = {
    name: string;
    age: number;
    "show-button": boolean;
};

const transformers: Transformers<Attributes> = {
    name: [(arg) => arg, ""],
    age: [(arg) => parseInt(arg, 10), 0],
    "show-button": [(arg) => arg !== "false", false],
};

class Test extends AbstractElement<Attributes> {
    #counter = atom(0);

    constructor() {
        super(transformers);
    }

    #handleClick = () => {
        this.#counter.set(this.#counter() + 1);
    };

    #listEntries = () => {
        return new Array(this.#counter())
            .fill(undefined)
            .map((_, i) => <li>List Entry: {i}</li>);
    };

    static get observedAttributes(): ObservedAttributes<Attributes> {
        return ["name", "age"];
    }

    render() {
        return (
            <div>
                <button onClick={() => this.#handleClick()} id="test">
                    Click Me
                </button>
                <h1>SomeList (Total: {this.#counter})</h1>
                <ul>
                    {this.#listEntries}
                    {this.#counter}
                    {this.#listEntries}
                </ul>
            </div>
        );
    }
}

customElements.define("my-elem", Test);
