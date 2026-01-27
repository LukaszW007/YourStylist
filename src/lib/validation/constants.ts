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
  "Moleskin",
  "Terry Cloth",
  "Chambray",
  "Canvas",
] as const;

// Thermal Profile options (from scanner prompt line 55-60 + database)
// Order: coldest resistance first
export const THERMAL_PROFILE_OPTIONS = [
  "Ultra-Light",   // CLO 0-0.2 (tank top, thin tshirt)
  "Light",         // CLO 0.2-0.4 (cotton shirt, thin sweater)
  "Mid",           // CLO 0.4-0.7 (blazer, cardigan)
  "Heavy",         // CLO 0.7-1.5 (overcoat, pea coat)
  "Ultra-Heavy",   // CLO 1.5+ (parka, shearling, puffer)
  "Insulated",     // Technical fill (down, primaloft)
] as const;


export type FabricWeave = typeof FABRIC_WEAVE_OPTIONS[number];
export type ThermalProfile = typeof THERMAL_PROFILE_OPTIONS[number];
