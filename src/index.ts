import { Signal, createSignal } from "./signals";

export function createElement(
  tag: string,
  properties: Record<string, string>,
  ...children: (Signal | HTMLElement | unknown)[]
) {
  const elem = document.createElement(tag);

  for (const child of children) {
    if (typeof child === "function") {
      // we have a signal
      const text = document.createTextNode("");
      createSignal(() => {
        text.textContent = `${child()}`;
      });
      elem.appendChild(text);
    } else if (child instanceof HTMLElement) {
      // just a regular node
      elem.appendChild(child);
    } else {
      // we dont really know what this is
      elem.innerHTML += child;
    }
  }

  Object.entries(properties ?? {}).forEach(([key, value]) => {
    if (key.startsWith("on")) {
      // we have an event listener
      if (typeof value === "function") {
        elem.addEventListener(key.toLowerCase().slice(2), value);
      } else {
        console.warn("trying to add an event listener which is not a function");
      }
    } else if (typeof value === "string") {
      // we have a regular text attribute
      elem.setAttribute(key, value);
    } else if (typeof value === "function") {
      // we have a signal again
      createSignal(() => {
        elem.setAttribute(key, `${(value as () => unknown)()}`);
      });
    }
  });

  return elem;
}

export * from "./abstractElement";
export * from "./signals";

export { createElement as atomicity };
