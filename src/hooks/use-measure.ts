import { useEffect, useState, useRef, useMemo } from "react";

function createDebounce<T extends (...args: unknown[]) => void>(
    callback: T,
    ms: number,
) {
    let timeoutId: number;

    return (...args: Parameters<T>): void => {
        window.clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => callback(...args), ms);
    };
}

declare type ResizeObserverCallback = (
    entries: unknown[],
    observer: ResizeObserver,
) => void;
declare class ResizeObserver {
    constructor(callback: ResizeObserverCallback);
    observe(target: Element, options?: unknown): void;
    unobserve(target: Element): void;
    disconnect(): void;
    static toString(): string;
}

export interface RectReadOnly {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
    readonly top: number;
    readonly right: number;
    readonly bottom: number;
    readonly left: number;
    [key: string]: number;
}

type HTMLOrSVGElement = HTMLElement | SVGElement;

type Result = [
    (element: HTMLOrSVGElement | null) => void,
    RectReadOnly,
    () => void,
];

type State = {
    element: HTMLOrSVGElement | null;
    scrollContainers: HTMLOrSVGElement[] | null;
    resizeObserver: ResizeObserver | null;
    lastBounds: RectReadOnly;
    orientationHandler: null | (() => void);
};

export type Options = {
    debounce?: number | { scroll: number; resize: number };
    scroll?: boolean;
    polyfill?: new (cb: ResizeObserverCallback) => ResizeObserver;
    offsetSize?: boolean;
};

function useMeasure(
    { debounce, scroll, offsetSize, polyfill }: Options = {
        debounce: 0,
        scroll: false,
        offsetSize: false,
    },
): Result {
    const ResizeObserver =
        polyfill ??
        (typeof window === "undefined"
            ? class ResizeObserver {}
            : window.ResizeObserver);

    if (!ResizeObserver) {
        throw new Error(
            "This browser does not support ResizeObserver out of the box. See: https://github.com/react-spring/react-use-measure/#resize-observer-polyfills",
        );
    }

    const [bounds, set] = useState<RectReadOnly>({
        left: 0,
        top: 0,
        width: 0,
        height: 0,
        bottom: 0,
        right: 0,
        x: 0,
        y: 0,
    });

    const state = useRef<State>({
        element: null,
        scrollContainers: null,
        resizeObserver: null,
        lastBounds: bounds,
        orientationHandler: null,
    });

    const scrollDebounce = debounce
        ? typeof debounce === "number"
            ? debounce
            : debounce.scroll
        : null;
    const resizeDebounce = debounce
        ? typeof debounce === "number"
            ? debounce
            : debounce.resize
        : null;

    const mounted = useRef(false);
    useEffect(() => {
        mounted.current = true;
        return () => void (mounted.current = false);
    });

    const [forceRefresh, resizeChange, scrollChange] = useMemo(() => {
        const callback = () => {
            if (!state.current.element) return;
            const { left, top, width, height, bottom, right, x, y } =
                state.current.element.getBoundingClientRect() as unknown as RectReadOnly;

            const size = {
                left,
                top,
                width,
                height,
                bottom,
                right,
                x,
                y,
            };

            if (state.current.element instanceof HTMLElement && offsetSize) {
                size.height = state.current.element.offsetHeight;
                size.width = state.current.element.offsetWidth;
            }

            Object.freeze(size);
            if (
                mounted.current &&
                !areBoundsEqual(state.current.lastBounds, size)
            )
                set((state.current.lastBounds = size));
        };
        return [
            callback,
            resizeDebounce
                ? createDebounce(callback, resizeDebounce)
                : callback,
            scrollDebounce
                ? createDebounce(callback, scrollDebounce)
                : callback,
        ];
    }, [set, offsetSize, scrollDebounce, resizeDebounce]);

    function removeListeners() {
        if (state.current.scrollContainers) {
            state.current.scrollContainers.forEach((element) =>
                element.removeEventListener("scroll", scrollChange, true),
            );
            state.current.scrollContainers = null;
        }

        if (state.current.resizeObserver) {
            state.current.resizeObserver.disconnect();
            state.current.resizeObserver = null;
        }

        if (state.current.orientationHandler) {
            if (
                "orientation" in screen &&
                "removeEventListener" in screen.orientation
            ) {
                screen.orientation.removeEventListener(
                    "change",
                    state.current.orientationHandler,
                );
            } else if ("onorientationchange" in window) {
                window.removeEventListener(
                    "orientationchange",
                    state.current.orientationHandler,
                );
            }
        }
    }

    function addListeners() {
        if (!state.current.element) return;
        //@ts-expect-error foo
        state.current.resizeObserver = new ResizeObserver(scrollChange);
        //@ts-expect-error bar
        state.current.resizeObserver.observe(state.current.element);
        if (scroll && state.current.scrollContainers) {
            state.current.scrollContainers.forEach((scrollContainer) =>
                scrollContainer.addEventListener("scroll", scrollChange, {
                    capture: true,
                    passive: true,
                }),
            );
        }

        state.current.orientationHandler = () => {
            scrollChange();
        };

        if (
            "orientation" in screen &&
            "addEventListener" in screen.orientation
        ) {
            screen.orientation.addEventListener(
                "change",
                state.current.orientationHandler,
            );
        } else if ("onorientationchange" in window) {
            window.addEventListener(
                "orientationchange",
                state.current.orientationHandler,
            );
        }
    }

    const ref = (node: HTMLOrSVGElement | null) => {
        if (!node || node === state.current.element) return;
        removeListeners();
        state.current.element = node;
        state.current.scrollContainers = findScrollContainers(node);
        addListeners();
    };

    useOnWindowScroll(scrollChange, Boolean(scroll));
    useOnWindowResize(resizeChange);

    useEffect(() => {
        removeListeners();
        addListeners();
    }, [scroll, scrollChange, resizeChange]);

    useEffect(() => removeListeners, []);
    return [ref, bounds, forceRefresh];
}

function useOnWindowResize(onWindowResize: (event: Event) => void) {
    useEffect(() => {
        const cb = onWindowResize;
        window.addEventListener("resize", cb);
        return () => void window.removeEventListener("resize", cb);
    }, [onWindowResize]);
}
function useOnWindowScroll(onScroll: () => void, enabled: boolean) {
    useEffect(() => {
        if (enabled) {
            const cb = onScroll;
            window.addEventListener("scroll", cb, {
                capture: true,
                passive: true,
            });
            return () => void window.removeEventListener("scroll", cb, true);
        }
    }, [onScroll, enabled]);
}

function findScrollContainers(
    element: HTMLOrSVGElement | null,
): HTMLOrSVGElement[] {
    const result: HTMLOrSVGElement[] = [];
    if (!element || element === document.body) return result;
    const { overflow, overflowX, overflowY } = window.getComputedStyle(element);
    if (
        [overflow, overflowX, overflowY].some(
            (prop) => prop === "auto" || prop === "scroll",
        )
    )
        result.push(element);
    return [...result, ...findScrollContainers(element.parentElement)];
}

const keys: (keyof RectReadOnly)[] = [
    "x",
    "y",
    "top",
    "bottom",
    "left",
    "right",
    "width",
    "height",
];
const areBoundsEqual = (a: RectReadOnly, b: RectReadOnly): boolean =>
    keys.every((key) => a[key] === b[key]);

export { useMeasure };
