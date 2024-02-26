import { writable } from "svelte/store";
import type { NodeData, EdgeData } from "../types";

export const nodeStore = writable([] as NodeData[]);
export const edgeStore = writable([] as EdgeData[]);

export const sectionHeight = 24;
export const defaultNumberOfSections: number = 4;
export const minNodeWidth: number = 100;
export const minNodeHeight: number = sectionHeight * defaultNumberOfSections;