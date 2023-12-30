import type { EdgeLinkTypes } from ".";

export type XYPosition = {
    x: number;
    y: number;
}

export type Size = {
    width: number;
    height: number;
}

export type EdgeLinkData = {
    type: EdgeLinkTypes;
    selected: boolean;
    connected: boolean;
    highlighted: boolean;
}
