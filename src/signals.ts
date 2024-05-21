export type Signal = () => unknown;

let runningSignal: Signal | undefined = undefined;

export type Atoms<T extends { [key: string]: unknown }> = {
    [key in keyof T]: Atom<T[key]>;
};

export function createAtoms<T extends { [key: string]: unknown }>(
    values: T,
): Atoms<T> {
    const atoms: { [key: string]: Atom } = {};

    Object.entries(values).forEach(([key, val]) => {
        atoms[key] = atom(val);
    });

    return atoms as Atoms<T>;
}

export interface Atom<Value = unknown> {
    (): Value;
    set(newValue: Value): void;
    get(): Value;
}

export function atom<Value = unknown>(value: Value): Atom<Value> {
    const signals = new Set<Signal>();

    const getter = () => {
        if (runningSignal) {
            signals.add(runningSignal);
        }

        return value;
    };

    Object.defineProperty(getter, "get", {
        value: getter,
    });

    Object.defineProperty(getter, "set", {
        value: (newVal: Value) => {
            value = newVal;
            signals.forEach((sig) => runSignal(sig));
        },
    });

    return getter as Atom<Value>;
}

export function createSignal(sig: Signal): void {
    runSignal(sig);
}

function runSignal(sig: Signal): void {
    const temp = runningSignal;
    runningSignal = sig;
    sig();
    runningSignal = temp;
}
