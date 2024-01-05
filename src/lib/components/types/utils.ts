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

export enum ResizeDirection {
    None = 'none',
    Top = 'top',
    TopRight = 'top-right',
    Right = 'right',
    BottomRight = 'bottom-right',
    Bottom = 'bottom',
    BottomLeft = 'bottom-left',
    Left = 'left',
    TopLeft = 'top-left',
};