import { writable } from "svelte/store";
import type { NodeData } from "../types";

export const nodes = writable([] as NodeData[]);
export const edges = writable([]);
