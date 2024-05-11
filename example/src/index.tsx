import Atomicity, {
  AbstractElement,
  ObservedAttributes,
  Transformers,
} from "atomicity";

type Attributes = {
  name: string;
  age: number;
};

const transformers: Transformers<Attributes> = {
  name: [(arg) => arg, ""],
  age: [(arg) => parseInt(arg, 10), 0],
};

class Test extends AbstractElement<Attributes> {
  constructor() {
    super(transformers);

    console.log(this.attrs);
  }

  static get observedAttributes(): ObservedAttributes<Attributes> {
    return ["name", "age"];
  }

  render() {
    return (
      <div>
        {this.attrs.age}
        <span>
          {this.attrs.name} {this.attrs.age}
        </span>
      </div>
    );
  }
}

customElements.define("my-elem", Test);
