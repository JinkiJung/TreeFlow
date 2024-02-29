import type NodeCanvas from "$lib/components/Canvas/NodeCanvas.svelte";
import { EdgeLinkTypes, type NodeData } from "$lib/components/types"

export const newNode = (canvas?: NodeCanvas): NodeData => {
    return {
        position: {
            x: 10,
            y: 10,
        },
        // get absolute position from parent canvas
        absolutePosition: {
            x: 10,
            y: 10,
        },
        size: {
            width: 160,
            height: 60,
        },
        data: {
            label: '',
        },
        startLinker: {
            type: EdgeLinkTypes.Start,
            connected: false,
            highlighted: false,
            selected: false,
        },
        endLinker: {
            type: EdgeLinkTypes.End,
            connected: false,
            highlighted: false,
            selected: false,
        },
        depth: 0,
    } as NodeData
};