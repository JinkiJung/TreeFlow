import { EdgeLinkTypes, type NodeData, type EdgeData } from ".";
import { sectionHeight } from "../stores";

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
      x: node.position.x + sectionHeight / 2,
      y: node.position.y + sectionHeight / 2,
    };
  } else if (type === EdgeLinkTypes.End) {
    return {
      x: node.position.x + node.size.width - sectionHeight / 2,
      y: node.position.y + node.size.height - sectionHeight / 2,
    };
  } else {
    return {
      x: 0,
      y: 0,
    };
  }
};

export const updateAllEdgeEndpoints = (edges: EdgeData[], nodes: NodeData[]): EdgeData[] => {
  if (!edges || !nodes) return [];
  return edges.map((edge) => {
    if (edge.fromId && edge.fromType) {
      const node = nodes.find((n) => n.id === edge.fromId);
      if (node) {
        const endpoint = getEdgeEndpoint(node, edge.fromType);
        edge.from = endpoint;
      }
    }

    if (edge.toId && edge.toType) {
      const node = nodes.find((n) => n.id === edge.toId);
      if (node) {
        const endpoint = getEdgeEndpoint(node, edge.toType);
        edge.to = endpoint;
      }
    }
    return edge;
  });
};

export const isRightMB = (event: MouseEvent) => {
  let isRightCheck = false;
  if ("which" in event)  // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
    isRightCheck = event.which == 3; 
  else if ("button" in event)  // IE, Opera 
    isRightCheck = event.button == 2; 
  return isRightCheck;
}
