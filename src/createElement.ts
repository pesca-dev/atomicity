import { Signal, createSignal } from "./signals";

export function createElement(
    tag: string,
    properties: Record<string, string>,
    ...children: (Signal | HTMLElement | unknown)[]
) {
    const elem = document.createElement(tag);

    let setAnchor: undefined | ((n: Node) => void);

    for (const child of children) {
        if (typeof child === "function") {
            const anchorSetter = setAnchor;

            // an anchor to insert before
            let anchor: Node | undefined;

            // set the setter so subsequent nodes can set themselves
            setAnchor = (n) => {
                anchor = n;
            };

            let children: ChildNode[] = [];

            createSignal(() => {
                const renderedChild = child();

                // cleanup old children
                for (const child of children) {
                    child.remove();
                }
                children = [];

                // check if we have an array or not
                const newChildren = Array.isArray(renderedChild)
                    ? renderedChild
                    : [renderedChild];

                // render all new children accordingly and insert them into the dom
                for (const child of newChildren) {
                    if (child instanceof HTMLElement) {
                        if (anchor) {
                            // if we have an anchor, we simply insert before that
                            elem.insertBefore(child, anchor);
                        } else {
                            // if we do not have an anchor, i.e., nothing rendered itself after us,
                            // we just append
                            elem.appendChild(child);
                        }
                        children.push(child);
                    } else {
                        const textNode = document.createTextNode(`${child}`);
                        if (anchor) {
                            // if we have an anchor, we simply insert before that
                            elem.insertBefore(textNode, anchor);
                        } else {
                            // if we do not have an anchor, i.e., nothing rendered itself after us,
                            // we just append
                            elem.appendChild(textNode);
                        }
                        children.push(textNode);
                    }
                }

                // if we actually rendered something, set the anchor for the previous element
                if (children[0]) {
                    anchorSetter?.(children[0]);
                }
            });
        } else if (child instanceof HTMLElement) {
            // just a regular node
            elem.appendChild(child);
            setAnchor?.(child);
        } else {
            // we dont really know what this is
            const textNode = document.createTextNode(`${child}`);
            elem.appendChild(textNode);
            setAnchor?.(textNode);
        }
    }

    Object.entries(properties ?? {}).forEach(([key, value]) => {
        if (key.startsWith("on")) {
            // we have an event listener
            if (typeof value === "function") {
                elem.addEventListener(key.toLowerCase().slice(2), value);
            } else {
                console.warn(
                    "trying to add an event listener which is not a function",
                );
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
