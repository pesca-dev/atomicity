// eslint-disable-next-line @typescript-eslint/ban-types
type IsNotFunction<T> = T extends Function ? never : T;

type EventKeys = `on${Capitalize<keyof HTMLElementEventMap>}`;

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    export namespace JSX {
        // The return type of our JSX Factory: this could be anything
        export type Element = HTMLElement;

        // IntrinsicElementMap grabs all the standard HTML tags in the TS DOM lib.
        export interface IntrinsicElements extends IntrinsicElementMap {}

        // The following are custom types, not part of TS's known JSX namespace:
        type IntrinsicElementMap = {
            [K in keyof HTMLElementTagNameMap]: {
                [k in Exclude<
                    keyof HTMLElementTagNameMap[K],
                    `on${keyof HTMLElementEventMap}`
                >]?: IsNotFunction<HTMLElementTagNameMap[K][k]>;
            } & {
                [key in EventKeys]?: (ev: Event) => unknown;
            };
        };

        export interface Component {
            (properties?: { [key: string]: unknown }, children?: Node[]): Node;
        }
    }
}

export { createElement as a } from "./createElement";
export * from "./abstractElement";
export * from "./signals";
