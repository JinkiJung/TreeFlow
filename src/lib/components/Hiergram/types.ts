import type { DOMAttributes } from "svelte/elements";
import type { Writable } from "svelte/store";
import type { Size } from "../types";
import type { EdgeData, NodeData } from "../types";

export type HiergramProps = DOMAttributes<HTMLDivElement> & {
    id?: string;
    dimensions?: Size;
    //nodes: Writable<Node[]>;
    //edges: Writable<Edge[]>;
    nodesProp: NodeData[];
    edgesProp: EdgeData[];
}