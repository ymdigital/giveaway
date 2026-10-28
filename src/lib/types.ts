export const ACCENTS = ["pink", "lavender", "mint", "peach"] as const;
export type Accent = (typeof ACCENTS)[number];

export const COLOR_MODES = ["system", "light", "dark"] as const;
export type ColorMode = (typeof COLOR_MODES)[number];

export type Item = {
  id: string;
  url: string;
  title: string;
  pickup: string;
  note: string;
  image: string;
  author: string;
  collected: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ListData = {
  code: string;
  accent: Accent;
  colorMode: ColorMode;
  items: Item[];
};

export type Preview = {
  ok: boolean;
  image: string;
  author: string;
  name: string;
  text: string;
};

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string };
