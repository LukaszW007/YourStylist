// Validation constants for garment scanner
// These match the AI scanner prompt options

// Fabric Weave options (from scanner prompt line 36-53)
export const FABRIC_WEAVE_OPTIONS = [
  "Standard",
  "Twill",
  "Oxford",
  "Poplin",
  "Flannel",
  "Seersucker",
  "Fresco",
  "Tweed",
  "Corduroy",
  "Knit Chunky",
  "Knit Fine",
  "Jersey",
  "Piqué",
  "Satin",
  "Velvet",
  "Ripstop",
  "Denim",
] as const;

// Thermal Profile options (from scanner prompt line 55-60 + database)
export const THERMAL_PROFILE_OPTIONS = [
  "Ultra-Light",
  "Light",
  "Mid",
  "Heavy",
  "Insulated",
] as const;


export type FabricWeave = typeof FABRIC_WEAVE_OPTIONS[number];
export type ThermalProfile = typeof THERMAL_PROFILE_OPTIONS[number];
