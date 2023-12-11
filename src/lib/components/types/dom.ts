import { NodeEndpointTypes, type NodeData, type EdgeData } from ".";
import { endpointSize } from "../stores";

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

export const getEdgeEndpoint = (node: NodeData, type: NodeEndpointTypes) => {
  if (type === NodeEndpointTypes.Start) {
    return {
      x: node.position.x + endpointSize / 2,
      y: node.position.y + endpointSize / 2,
    };
  } else if (type === NodeEndpointTypes.End) {
    return {
      x: node.position.x + node.size.width - endpointSize / 2,
      y: node.position.y + node.size.height - endpointSize / 2,
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
        const endpoint = getEdgeEndpoint(node, NodeEndpointTypes.End);
        edge.from = endpoint;
      }
    }

    if (edge.toId) {
      const node = nodes.find((n) => n.id === edge.toId);
      if (node) {
        const endpoint = getEdgeEndpoint(node, NodeEndpointTypes.Start);
        edge.to = endpoint;
      }
    }
  }
  return edges;
};