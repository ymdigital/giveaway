import "server-only";
import { createRateLimiter } from "./rate-limit";

const MINUTE_MS = 60_000;

// Slows down code guessing on the list-open endpoint.
export const openListLimiter = createRateLimiter(30, MINUTE_MS);
export const createListLimiter = createRateLimiter(10, MINUTE_MS);
export const previewLimiter = createRateLimiter(60, MINUTE_MS);
