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

  static get observedAttributes(): ObservedAttributes<Attributes> {
    return ["name", "age"];
  }

  render() {
    return (
      <div>
        <button onClick={() => this.#handleClick()} id="test">
          Click Me
        </button>
        {this.#counter}
      </div>
    );
  }
}

customElements.define("my-elem", Test);
