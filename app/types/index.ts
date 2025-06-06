export interface SwatchValue {
  hex: string;
  stop: number;
  h: number;
  hScale: number;
  s: number;
  sScale: number;
  l: number;
}

export type Mode = `hex` | `p-3` | `oklch` | `hsl`;

export interface PaletteConfig {
  id: string;
  name: string;
  value: string;
  valueStop: number;
  swatches: SwatchValue[];
  useLightness: boolean;
  hBelow: number;
  hAbove: number;
  sBelow: number;
  sAbove: number;
  lMin: number;
  lMax: number;
  mode: Mode;
}

export type Version = "3" | "4";
