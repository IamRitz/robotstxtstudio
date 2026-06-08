/**
 * Boundary validation schemas (Zod).
 *
 * The ONLY place `zod` is imported in the domain/data layers. Route handlers and
 * forms parse untrusted input here, then hand typed models to pure feature logic.
 * Keeps `src/types` framework- and dependency-independent (PRD §16).
 */
export * from "./primitives";
export * from "./crawler";
export * from "./generator";
export * from "./requests";
