import type { Size, XYPosition } from ".";

export type Container = {
    position: XYPosition;
    size: Size;
    owningNode?: string;
}