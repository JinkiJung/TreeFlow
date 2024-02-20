import type { NodeData, Size } from "$lib/components/types";

export const calculateCanvasSize = (nodes: NodeData[], childrenIds: string[], width: number, height: number, yOffset: number): Size => {
    if (childrenIds.length === 0) return { width, height };

    const nodePositions = childrenIds!.map((nodeId) => {
        const node = nodes.filter((n) => n.id === nodeId).pop();
        if (node)
            return {
                x: node.position.x + node.size.width,
                y: node.position.y + node.size.height
            };
        else return { x: 0, y: 0 };
    });

    const maxX = Math.max(...nodePositions.map((pos) => pos.x));
    const maxY = Math.max(...nodePositions.map((pos) => pos.y));

    const size = {
        width: maxX + 20,
        height: maxY + 40 + yOffset
    };
    return size;
};