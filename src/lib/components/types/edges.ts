import type { Size, XYPosition } from ".";

export type EdgeData<T = any> = {
    id: string;
    fromId: string;
    toId: string;
    from?: XYPosition;
    to?: XYPosition;
    data: T;
}