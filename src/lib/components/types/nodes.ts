import type { Size, XYPosition } from ".";

export type NodeData<T = any> = {
    id?: string;
    position: XYPosition;
    size: Size;
    data: T;
    hidden?: boolean;
    selected?: boolean;
    dragging?: boolean;
    draggable?: boolean;
    selectable?: boolean;
    connectable?: boolean;
    parentNode?: string;
}

export type NodeDragItem = {
    id: string;
    position: XYPosition;
    // distance from the mouse cursor to the node when start dragging
    distance: XYPosition;
    computed: {
      width: number | null;
      height: number | null;
      positionAbsolute: XYPosition;
    };
    parentNode?: string;
    dragging?: boolean;
    expandParent?: boolean;
  };

export enum EdgeLinkTypes {
    Start = 'start',
    End = 'end',
};