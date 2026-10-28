export const LIMITS = {
  url: 2000,
  title: 120,
  pickup: 80,
  note: 500,
  image: 2000,
  author: 100,
} as const;

export const MAX_ITEMS_PER_LIST = 500;
export const HTTP_URL_PATTERN = /^https?:\/\/\S+$/i;
