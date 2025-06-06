import { DEFAULT_PALETTE_CONFIG } from "~/lib/constants";
import {
  clamp,
  hexToHSL,
  HSLToHex,
  lightnessFromHSLum,
  luminanceFromHex,
  unsignedModulo,
} from "~/lib/helpers";
import {
  createDistributionValues,
  createHueScale,
  createSaturationScale,
} from "~/lib/scales";
import type { PaletteConfig } from "~/types";

export function createSwatches(palette: PaletteConfig) {
  const { value, valueStop } = palette;

  // Tweaks may be passed in, otherwise use defaults
  const useLightness =
    palette.useLightness ?? DEFAULT_PALETTE_CONFIG.useLightness;
  const hBelow = palette.hBelow ?? DEFAULT_PALETTE_CONFIG.hBelow;
  const hAbove = palette.hAbove ?? DEFAULT_PALETTE_CONFIG.hAbove;
  const sBelow = palette.sBelow ?? DEFAULT_PALETTE_CONFIG.sBelow;
  const sAbove = palette.sAbove ?? DEFAULT_PALETTE_CONFIG.sAbove;
  const lMin = palette.lMin ?? DEFAULT_PALETTE_CONFIG.lMin;
  const lMax = palette.lMax ?? DEFAULT_PALETTE_CONFIG.lMax;

  // Create hue and saturation scales based on tweaks
  const hueScale = createHueScale(hBelow, hAbove, valueStop);
  const saturationScale = createSaturationScale(sBelow, sAbove, valueStop);

  // Get the base hex's H/S/L values
  const { h: valueH, s: valueS, l: valueL } = hexToHSL(value);

  // Create lightness scales based on tweak + lightness/luminance of current value
  const lightnessValue = useLightness ? valueL : luminanceFromHex(value);
  const distributionScale = createDistributionValues(
    lMin,
    lMax,
    lightnessValue,
    valueStop,
  );

  const swatches = hueScale.map(({ stop }, stopIndex) => {
    const newH = unsignedModulo(valueH + hueScale[stopIndex].tweak, 360);
    const newS = clamp(valueS + saturationScale[stopIndex].tweak, 0, 100);
    let newL = useLightness
      ? distributionScale[stopIndex].tweak
      : lightnessFromHSLum(newH, newS, distributionScale[stopIndex].tweak);
    newL = clamp(newL, 0, 100);

    const newHex = HSLToHex(newH, newS, newL);

    return {
      stop,
      // Sometimes the initial value is changed slightly during conversion,
      // overriding that with the original value
      hex:
        stop === valueStop ? `#${value.toUpperCase()}` : newHex.toUpperCase(),
      // Used in graphs
      h: newH,
      hScale:
        ((unsignedModulo(hueScale[stopIndex].tweak + 180, 360) - 180) / 180) *
        50,
      s: newS,
      sScale: newS - 50,
      l: newL,
    };
  });

  return swatches;
}
