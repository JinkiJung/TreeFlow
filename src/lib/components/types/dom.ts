import { EdgeLinkTypes, type NodeData, type EdgeData } from ".";
import { edgelinkSize } from "../stores";

export const isMouseEvent = (event: MouseEvent | TouchEvent): event is MouseEvent => 'clientX' in event;

export const getEventPosition = (event: MouseEvent | TouchEvent, bounds?: DOMRect) => {
  const isMouse = isMouseEvent(event);
  const evtX = isMouse ? event.clientX : event.touches?.[0].clientX;
  const evtY = isMouse ? event.clientY : event.touches?.[0].clientY;

  return {
    x: evtX - (bounds?.left ?? 0),
    y: evtY - (bounds?.top ?? 0),
  };
};

export const getEdgeEndpoint = (node: NodeData, type: EdgeLinkTypes) => {
  if (type === EdgeLinkTypes.Start) {
    return {
      x: node.position.x + edgelinkSize / 2,
      y: node.position.y + edgelinkSize / 2,
    };
  } else if (type === EdgeLinkTypes.End) {
    return {
      x: node.position.x + node.size.width - edgelinkSize / 2,
      y: node.position.y + node.size.height - edgelinkSize / 2,
    };
  } else {
    return {
      x: 0,
      y: 0,
    };
  }
};

export const updateAllEdgeEndpoints = (edges: EdgeData[], nodes: NodeData[]): EdgeData[] => {
  for (const edge of edges) {

    /* TODO: need to deal with situations when it is undefined
    */ 
    if (edge.fromId) {
      const node = nodes.find((n) => n.id === edge.fromId);
      if (node) {
        const endpoint = getEdgeEndpoint(node, EdgeLinkTypes.End);
        edge.from = endpoint;
      }
    }

    if (edge.toId) {
      const node = nodes.find((n) => n.id === edge.toId);
      if (node) {
        const endpoint = getEdgeEndpoint(node, EdgeLinkTypes.Start);
        edge.to = endpoint;
      }
    }
  }
  return edges;
};

export const pauseEvent = (event: MouseEvent | TouchEvent) => {
  if(event.stopPropagation) event.stopPropagation();
  if(event.preventDefault) event.preventDefault();
  return false;
}