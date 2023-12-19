import type { EdgeLinkTypes, Size, XYPosition } from ".";

export type EdgeData<T = any> = {
    id: string;
    fromId?: string;
    toId?: string;
    fromType?: EdgeLinkTypes;
    toType?: EdgeLinkTypes;
    from?: XYPosition;
    to?: XYPosition;
    data: T;
}