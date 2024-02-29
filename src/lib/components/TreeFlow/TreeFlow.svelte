<script lang="ts">
	import { onDestroy, onMount } from "svelte";
	import EdgeCanvas from "../Canvas/EdgeCanvas.svelte";
	import NodeCanvas from "../Canvas/NodeCanvas.svelte";
	import { Edge } from "../Edge";
	import { edgeStore, sectionHeight, nodeStore, minNodeHeight, minNodeWidth } from "../stores";
	import { getEventPosition, type EdgeData, type NodeData, type XYPosition, EdgeLinkTypes, ResizeDirection, type Size } from "../types";
	import { getEdgeEndpoint, isRightMB, updateAllEdgeEndpoints } from "../types/dom";
	import { newNode } from "$lib/interaction/newNode";
	import { DefaultNode } from "../Node";
	import { NODECANVAS_SURFIX } from "../constant";
    
	export let width: number = 0;
	export let height: number = 0;

	let container: HTMLDivElement;
	let containerBounds: DOMRect | null = null;
	let nodes: NodeData[];
	let edges: EdgeData[];
	let newNodeTemplate: NodeData = newNode();

	let selectedNodeIds: string[] = [];
	let newEdge: EdgeData | null = null;
	let hoveredNodeCanvas: HTMLElement | null = null;

	let offsetX = 0;
	let offsetY = 0;
	let offsetRawX = 0;
	let offsetRawY = 0;
	let offsetAbsY = 0;
	let offsetAbsX = 0;
	let nodeOrgPosition: XYPosition = {x: 0, y: 0};
	let nodeOrgSize: Size = {width: 0, height: 0};
	let parentNodeSizeOfSelected: Size = {width: 0, height: 0};
	let dragNode = false;
	let dragEdgeLink = false;
	let dragContainer = false;
	let resizeDirection: ResizeDirection = ResizeDirection.None;
	let newEdgeCandidate: EdgeData | null = null;
	let nodeCanvasColor: string = 'rgba(230,230,230,0.0)';
	let nodeBackgroundColor: string = 'rgb(230,230,230)';

	const unsubscribeNodeStore = nodeStore.subscribe((value) => {
		nodes = value;
		// TODO: OPTIMIZED: if a node without edge is moved
		edgeStore.set(edges);
	});

	const unsubscribeEdgeStore = edgeStore.subscribe((value) => {
		edges = updateAllEdgeEndpoints(value, nodes);
	});

	onDestroy(() => {
		unsubscribeNodeStore();
		unsubscribeEdgeStore();
	});

	const dragNodeStart = (event: CustomEvent<{ node: NodeData; event: MouseEvent | TouchEvent; }>) => {
		event.detail.event.stopPropagation();
		if (isRightMB(event.detail.event as MouseEvent) || dragEdgeLink || dragContainer)
			return ;
		containerBounds = container.getBoundingClientRect();
		dragNode = true;
		selectNode(event.detail.node);
		let nodeSelected = event.detail.node;
		let pos = getEventPosition(event.detail.event, containerBounds);
		offsetX = pos.x - nodeSelected.position.x;
		offsetY = pos.y - nodeSelected.position.y;
		document.onmousemove = dragNodeMove;
		document.onmouseleave = handleMouseleave;
		document.onmouseup = dragNodeEnd;
	}

	const dragNodeMove = ( event: MouseEvent | TouchEvent) => {
		event.stopPropagation();
		containerBounds = container.getBoundingClientRect();
		let pos = getEventPosition(event, containerBounds);
		if (dragEdgeLink && newEdge) {
			updateNewEdge(pos);
		}
		else if (dragNode) {
			updateNodePositionForDrag(pos, true);
			showParent(event as MouseEvent);
		}
	}

	const dragNodeEnd = () => {
		dragNode = false;
		dragEdgeLink = false;
		document.onmousemove = null;
		document.onmouseleave = null;
		document.onmouseenter = null;
		// if there is selected node IDs, make false to all selected node's selected property
		if (selectedNodeIds.length) {
			nodeStore.set(nodes.map((node) => {
				if (selectedNodeIds.includes(node.id!)) {
					return {
						...node,
						selected: false
					} as NodeData; // Explicitly define the type here
				}
				return node;
			}));
			if (hoveredNodeCanvas) {
				// get hovered node canvas id 
				const parentIdToBeUpdated = hoveredNodeCanvas.getAttribute('id')?.replace(NODECANVAS_SURFIX, '') === 'root' ? undefined : hoveredNodeCanvas.getAttribute('id')?.replace(NODECANVAS_SURFIX, '');
				// first fetch parent IDs into array from selected nodes in order to empty children of them
				const parentIdOutdated = nodes.filter((node) => selectedNodeIds.includes(node.id!)).map((node) => node.parent).pop();
				// if parent id is changed, then update the nodes
				if (parentIdToBeUpdated !== parentIdOutdated){
					// get current parent node's position if currentParentId is not undefined
					const parentOutdated = parentIdOutdated ? nodes.filter((node) => parentIdOutdated === node.id).pop() : undefined;
					const parentToBeUpdated = parentIdToBeUpdated ? nodes.filter((node) => parentIdToBeUpdated === node.id).pop() : undefined;
					const parentPositionOutdated = aggregateItselfAndParentPosition(parentOutdated);
					const parentPositionToBeUpdated = aggregateItselfAndParentPosition(parentToBeUpdated);
					nodeStore.set(nodes.map((node) => {
						// for parent outdated
						if (parentIdOutdated && parentIdOutdated.includes(node.id!)) {
							const children = node.children?.filter((child) => !selectedNodeIds.includes(child));
							return {
								...node,
								children,
								size: children?.length ?
									node.size :
									{
										width: node.size.width,
										height: minNodeHeight,
									},
							} as NodeData; // Explicitly define the type here
						}
						// for parent for update
						if (parentIdToBeUpdated && parentIdToBeUpdated === node.id) {
							return {
								...node,
								children: node.children ? [...node.children, ...selectedNodeIds] : selectedNodeIds,
							} as NodeData; // Explicitly define the type here
						}
						// node to be assigned
						if (selectedNodeIds.includes(node.id!)) {
							return {
								...node,
								position: parentIdToBeUpdated ?
									fitInside(
										node.position.x + parentPositionOutdated?.x! - parentPositionToBeUpdated?.x!,
										node.position.y + parentPositionOutdated?.y! - parentPositionToBeUpdated?.y!,
									) :
									{
										x: node.position.x + parentPositionOutdated?.x!,
										y: node.position.y + parentPositionOutdated?.y!,
									},
								parent: parentIdToBeUpdated === 'root' ? undefined : parentIdToBeUpdated,
							} as NodeData; // Explicitly define the type here
						}
						return node;
					}));
				} else {
					nodeStore.set(nodes.map((node) => {
						if (selectedNodeIds.includes(node.id!)) {
							return {
								...node,
								position: fitInside(node.position.x, node.position.y),
							} as NodeData; // Explicitly define the type here
						}
						return node;
					}));
				}
				hoveredNodeCanvas.style.setProperty('box-shadow', '0px 0px 0px 0px #09A9A9');
				hoveredNodeCanvas = null;
			}
		}
		selectedNodeIds = [];
		parentNodeSizeOfSelected = {width: 0, height: 0};
		if (newEdge) {
			newEdge = null;
		}
	}

	// if x position is negative, then set it to 0, and if y position is smaller than sectionHeight * 2, then set it to sectionHeight * 2
	const fitInside = (x: number, y: number): XYPosition => {
		return {
			x: x < 0 ? 0 : x,
			y: y < sectionHeight * 2 ? sectionHeight * 2 : y,
		};
	}

	// function aggregate all parent's position and return its sum
	const aggregateItselfAndParentPosition = (node: NodeData | undefined): XYPosition => {
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

	const showParent = ( event: MouseEvent) => {
		event.stopPropagation();
		containerBounds = container.getBoundingClientRect();
		let pos = getEventPosition(event, containerBounds);
		// pick top overlaid nodecanvas
		const nodeCanvas = pickTopNodeCanvas(event.clientX, event.clientY, selectedNodeIds[0]);
		// change nodeCanvas background color to blue
		if (nodeCanvas) {
			if (hoveredNodeCanvas !== nodeCanvas) {
				hoveredNodeCanvas?.style.setProperty('box-shadow', '0px 0px 0px 0px #09A9A9');
			}
			nodeCanvas?.style.setProperty('box-shadow', '0px 0px 0px 4px #09A9A9');
			hoveredNodeCanvas = nodeCanvas;
		}
	}

	// filter currently dragging element
	const isNotMyNodeCanvas = (id: string, nodeCanvas: HTMLElement) => {
		return nodeCanvas.getAttribute('id') !== NODECANVAS_SURFIX + id;
	}

	// return true if two given html elements are overlapped
	const isOverlapped = (element: HTMLElement, target: HTMLElement) => {
		const rect1 = element.getBoundingClientRect();
		const rect2 = target.getBoundingClientRect();
		return !(
			rect1.top > rect2.bottom ||
			rect1.right < rect2.left ||
			rect1.bottom < rect2.top ||
			rect1.left > rect2.right
		);
	}

	const pickTopNodeCanvas = (offsetX: number, offsetY: number, id: string): HTMLElement | undefined => {
		// filter elements that are not nodecanvas
		const elements = document.elementsFromPoint(offsetX, offsetY);
		// return bool if region of selfCanvas and one of elements are overlapped
		const selfCanvas: HTMLElement = document.getElementById(NODECANVAS_SURFIX + id)!;
		return Array.from(elements).filter((element) => element.classList.contains('nodecanvas') && isNotMyNodeCanvas(id, element as HTMLElement) && isOverlapped(element as HTMLElement, selfCanvas)).shift() as HTMLElement;
	}

	const handleMouseleave = (event: MouseEvent | TouchEvent) => {
		event.stopPropagation();
		document.onmousemove = null;
		document.onmouseenter = handleMouseEnter;
	}

	const handleMouseEnter = (event: MouseEvent | TouchEvent) => {
		event.stopPropagation();
		if((event.type === 'mousedown' || event.type === 'touchstart') && selectedNodeIds.length) {
			document.onmousemove = dragNodeMove;
		}
	}

	const updateNodePositionForDrag = (pos: XYPosition, active?: boolean) => {
		if (selectedNodeIds.length) {
			let selected: NodeData = nodes.filter((node) => selectedNodeIds.includes(node.id!)).pop()!;
			nodeStore.set(nodes.map((node) => {
				if (selected.id === node.id) {
					return {
						...node,
						selected: active ? active : false,
						position: {
							x: pos.x - offsetX,
							y: pos.y - offsetY,
						},
					} as NodeData; // Explicitly define the type here
				}
				return node;
			}));
		}
	}

	const updateNewEdge = (pos: XYPosition) => {
		if (newEdge) {
			if (newEdge.from) {
				newEdge.to = {
					x: pos.x,
					y: pos.y,
				};
			} else {
				newEdge.from = {
					x: pos.x,
					y: pos.y,
				};
			}
		}
	}

	const selectNode = (node: NodeData) => {
		selectedNodeIds = [node.id!];
	};

	const linkEdgeStart = (event: CustomEvent<{ node: NodeData; type: EdgeLinkTypes; event: MouseEvent | TouchEvent; }>) => {
		dragEdgeLink = true;

		//selectNode(e.detail.node);
		event.detail.event.stopPropagation();
		containerBounds = container.getBoundingClientRect();
		if (event.detail.type === EdgeLinkTypes.Start) {
			newEdge = {
				id: 'new',
				fromId: event.detail.node.id,
				fromType: EdgeLinkTypes.Start,
				from: {
					... getEdgeEndpoint(event.detail.node, EdgeLinkTypes.Start)
				},
				data: {
					label: 'edge 1',
				}
			};	
		} else {
			newEdge = {
				id: 'new',
				toId: event.detail.node.id,
				toType: EdgeLinkTypes.End,
				to: {
					... getEdgeEndpoint(event.detail.node, EdgeLinkTypes.End)
				},
				data: {
					label: 'edge 1',
				}
			};
		}

		let pos = getEventPosition(event.detail.event, containerBounds);
		offsetX = pos.x - event.detail.node.position.x;
		offsetY = pos.y - event.detail.node.position.y;

		document.onmousemove = dragNodeMove;
		document.onmouseleave = handleMouseleave;
		document.onmouseup = dragNodeEnd;
	}

	const linkEdgeEnd = (event: CustomEvent<{ node: NodeData; type: EdgeLinkTypes; event: MouseEvent | TouchEvent; }>) => {
		dragEdgeLink = false;
		//selectNode(e.detail.node);
		event.detail.event.stopPropagation();
		document.onmousemove = null;
		document.onmouseleave = null;
		document.onmouseenter = null;
		newEdge = null;
		if (newEdgeCandidate) {
			edgeStore.set([...edges, newEdgeCandidate]);
			nodeStore.set(nodes);
			newEdgeCandidate = null;
		}
	}

	const linkEdgeOverlap = (event: CustomEvent<{ node: NodeData; type: EdgeLinkTypes; event: MouseEvent | TouchEvent; }>) => {
		event.detail.event.stopPropagation();
		if (dragEdgeLink && newEdge) {
			if (newEdge.fromId !== event.detail.node.id) {
				if (newEdge.fromId && event.detail.type === EdgeLinkTypes.End) {
					// assign toId
					newEdgeCandidate = {
						...newEdge,
						id: newEdge.fromId + '-' + event.detail.node.id,
						toId: event.detail.node.id,
						toType: EdgeLinkTypes.End,
						to: {
							... getEdgeEndpoint(event.detail.node, event.detail.type)
						}
					};
				} else if (newEdge.toId && event.detail.type === EdgeLinkTypes.Start) {
					// assign fromId
					newEdgeCandidate = {
						...newEdge,
						id: newEdge.fromId + '-' + event.detail.node.id,
						fromId: event.detail.node.id,
						fromType: EdgeLinkTypes.Start,
						from: {
							... getEdgeEndpoint(event.detail.node, event.detail.type)
						}
					};
				}
			}
		}
	}

	// function that fetches the size of parent node of selected node
	const getParentSize = (node: NodeData) => {
		if (node.parent) {
			const parent = nodes.filter((n) => n.id === node.parent).pop();
			if (parent) {
				return parent.size;
			}
		}
		// else fetch canvas size
		return { width, height };
	}

	const resizeStart = (event: CustomEvent<{ nodeId: string, direction: ResizeDirection, event: MouseEvent | TouchEvent; }>) => {
		dragContainer = true;

		event.detail.event.stopPropagation();
		resizeDirection = event.detail.direction;
		selectedNodeIds = [event.detail.nodeId];
		let selected: NodeData = nodes.filter((node) => selectedNodeIds.includes(node.id!)).pop()!;
		nodeOrgPosition = selected.position;
		nodeOrgSize = selected.size;
		containerBounds = container.getBoundingClientRect();

		parentNodeSizeOfSelected = getParentSize(selected); 

		let pos = getEventPosition(event.detail.event, containerBounds);
		offsetX = pos.x - selected.position.x - selected.size.width;
		offsetY = pos.y - selected.position.y - selected.size.height;
		offsetRawY = pos.y - selected.position.y;
		offsetAbsY = pos.y;
		offsetAbsX = pos.x;
		offsetRawX = pos.x;

		document.onmousemove = resizeMove;
		//document.onmouseleave = handleMouseleave;
		document.onmouseup = resizeStop;
	}

	const resizeMove = ( event: MouseEvent | TouchEvent) => {
		event.stopPropagation();
		containerBounds = container.getBoundingClientRect();
		let pos = getEventPosition(event, containerBounds);
		const currentX = pos.x - offsetRawX;
		const currentY = pos.y - offsetRawY;
		const currentWidth = nodeOrgSize.width + (offsetAbsX - pos.x);
		const currentHeight = nodeOrgSize.height + (offsetAbsY - pos.y);
		const currentHeightOpposite = nodeOrgSize.height - offsetAbsY + pos.y;
		const currentWidthOpposite = nodeOrgSize.width - offsetAbsX + pos.x;

		if (dragContainer) {
			let selected: NodeData = nodes.filter((node) => selectedNodeIds.includes(node.id!)).pop()!;
			switch(resizeDirection) {
				case ResizeDirection.Top:
					// update node's y and height
					updateNodeForResize(selected, {
							width: selected.size.width,
							height: currentHeight < minNodeHeight ? minNodeHeight :
								currentY < 0 ? 
									nodeOrgPosition.y + nodeOrgSize.height :
								currentHeight,
						},
						{
							x: selected.position.x,
							y: currentY < 0 ? 0 : 
								currentHeight < minNodeHeight ? nodeOrgPosition.y + nodeOrgSize.height - minNodeHeight:
									currentY,
						}
					);
					break;
				case ResizeDirection.Bottom:
					// update node's height
					updateNodeForResize(selected, {
							width: selected.size.width,
							height: nodeOrgSize.height - offsetAbsY + pos.y < minNodeHeight ? minNodeHeight :
								currentHeightOpposite + nodeOrgPosition.y > parentNodeSizeOfSelected.height ? parentNodeSizeOfSelected.height - nodeOrgPosition.y :
								currentHeightOpposite,
						});
					break;
				case ResizeDirection.Left:
					// update node's x and width
					updateNodeForResize(selected, {
							width: currentWidth < minNodeWidth ? minNodeWidth :
							nodeOrgPosition.x + currentX < 0 ? nodeOrgPosition.x + nodeOrgSize.width : currentWidth,
							height: selected.size.height,
						},
						{
							x: nodeOrgPosition.x + currentX < 0 ? 0 :
								currentWidth < minNodeWidth ? nodeOrgPosition.x + nodeOrgSize.width - minNodeWidth : nodeOrgPosition.x + currentX,
							y: selected.position.y,
						}
					);
					break;
				case ResizeDirection.Right:
					// update node's width
					updateNodeForResize(selected, {
							width: nodeOrgSize.width - offsetAbsX + pos.x < minNodeWidth ? minNodeWidth :
								currentWidthOpposite + nodeOrgPosition.x > parentNodeSizeOfSelected.width ? parentNodeSizeOfSelected.width - nodeOrgPosition.x :
								currentWidthOpposite,
							height: selected.size.height,
						});
					break;
				default:
					break;
			}
		}
	}

	const updateNodeForResize = (selected: NodeData, size: Size, pos?: XYPosition) => {
		if (selectedNodeIds.length) {
			nodeStore.set(nodes.map((node) => {
				if (selected.id === node.id) {
					return {
						...selected,
						position: pos? pos : selected.position,
						size,
					} as NodeData; // Explicitly define the type here
				}
				return node;
			}));
		}
	}
	
	const resizeStop = () => {
		dragContainer = false;
		document.onmousemove = null;
		document.onmouseleave = null;
		document.onmouseenter = null;
	}

	export const addNode = (parent?: NodeData): NodeData => {
		const newNode = {...newNodeTemplate,
			id: 'node' + (nodes.length + 1),
			data: {
				label: 'node ' + (nodes.length + 1),
			},
			parent: parent?.id,
			depth: parent?.depth ? parent.depth + 1 : 0,	
		};
		nodeStore.set([...nodes, newNode]);
		return newNode;
	}

	const addChild = (node: NodeData): NodeData => {
		const newNode = addNode(node);
		if (node.children && node.children.length > 0) {
			node.children.push(newNode.id!);
		} else {
			node.children = [newNode.id!];
		}
		return newNode;
	}

</script>

<div>
	<div bind:this={container} style="position: relative; width: {width}px; height: {height}px;">
		<NodeCanvas backgroundColor={nodeCanvasColor} owningNode={'root'} {width} {height}>
			{#each nodes as node}
				{#if node.parent === undefined}
					<DefaultNode
						{nodes}
						nodeId = {node.id}
						backgroundColor={nodeBackgroundColor}
						on:nodedragstart={dragNodeStart}
						handleMousedown={dragNodeStart}
						handleMouseup={dragNodeEnd}
						{linkEdgeStart}
						{linkEdgeEnd}
						{linkEdgeOverlap}
						{resizeStart}
						{addChild}
					/>
				{/if}
			{/each}
		</NodeCanvas>
		<EdgeCanvas {width} {height} hasBackground={false}>
			{#each edges as edge}
				<Edge {edge} />
			{/each}
			{#if newEdge}
				<Edge edge={newEdge} />
			{/if}
		</EdgeCanvas>
	</div>
</div>
