import { calculateCanvasSize, getSizeWithMinHeight } from "$lib/util/nodeResizer";
import type { NodeData, Size, XYPosition } from ".";
import { sectionHeight } from "../stores";

export const preprocessNodes = (nodes: NodeData[]): NodeData[] => {
    return setAbsolutePosition(adjustNodeSize(nodes));
}

// set absolute position for each node
const setAbsolutePosition = (nodes: NodeData[]): NodeData[] => {
    return nodes.map((node) => {
        const position = aggregateItselfAndParentPosition(nodes, node);
        return {
            ...node,
            absolutePosition: position,
        };
    });
}

const adjustNodeSize = (nodes: NodeData[]): NodeData[] => {
    // if node has children, calculate its size based on children
    return nodes.map((node) => {
        if (node.children && node.children.length > 0) {
            const children = nodes.filter((n) => node.children!.includes(n.id!));
            const size = calculateCanvasSize(nodes, children.map((n) => n.id!), node.size.width, node.size.height, sectionHeight * 3);
            node.size = size;
            return {
                ...node,
                size,
            };
        }
        else {
            return {...node, size: getSizeWithMinHeight(node.size)};
        }
    });
}

// function aggregate all parent's position and return its sum
export const aggregateItselfAndParentPosition = (nodes: NodeData[], node: NodeData | undefined): XYPosition => {
    if (!node) {
      return {x: 0, y: 0};
    }
    let parent = node.parent;
    let position = { x: node.position.x, y: node.position.y }; // hard copy
    while (parent) {
      let parentNode = nodes.filter((node) => node.id === parent).pop();
      if (parentNode) {
        position.x += parentNode.position.x;
        position.y += parentNode.position.y;
        parent = parentNode.parent;
      } else {
        break;
      }
    }
    return position;
  }

  // function that fetches the size of parent node of selected node
export const getParentSize = (nodes: NodeData[], node: NodeData, canvasSize: Size) => {
    if (node.parent) {
        const parent = nodes.filter((n) => n.id === node.parent).pop();
        if (parent) {
            return parent.size;
        }
    }
    // else fetch canvas size
    return canvasSize;
}

// function that fetches the position of parent node of selected node
export const getParentAbsPosition = (nodes: NodeData[], node: NodeData): XYPosition => {
    if (node.parent) {
        const parent = nodes.filter((n) => n.id === node.parent).pop();
        if (parent && parent.absolutePosition) {
            return parent.absolutePosition!;
        }
    }
    // else fetch canvas size
    return { x: 0, y: 0 };
}