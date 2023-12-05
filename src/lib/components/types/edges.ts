import type { Size, XYPosition } from ".";

export type Edge<T = any> = {
    id: string;
    from: string;
    to: string;
    data: T;
}