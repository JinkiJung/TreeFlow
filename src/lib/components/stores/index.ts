import { writable } from "svelte/store";
import type { NodeData, EdgeData } from "../types";

export const nodeStore = writable([] as NodeData[]);
export const edgeStore = writable([] as EdgeData[]);

export const endpointSize = 20;