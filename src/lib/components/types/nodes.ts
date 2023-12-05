import type { Size, XYPosition } from ".";

export type Node<T = any> = {
    id?: string;
    position: XYPosition;
    size: Size;
    data: T;
}