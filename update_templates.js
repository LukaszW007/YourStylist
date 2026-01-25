const fs = require('fs');
const path = require('path');

// Read the existing templates
const templatesPath = path.join(__dirname, 'src', 'data', 'new_layering_templates.json');
const templates = JSON.parse(fs.readFileSync(templatesPath, 'utf-8'));

function determineTucking(slotName, subcategories, layerCount) {
  // Base layers - optional
  if (slotName === 'base_layer' || slotName === 'top_layer') {
    return 'optional';
  }
  
  // Shirt layers in 3-4 layer outfits - always tucked
  if (slotName === 'shirt_layer' && layerCount >= 3) {
    return 'always';
  }
  
  // Turtleneck in 3-4 layer outfits - always tucked
  if (slotName === 'turtleneck_layer' && layerCount >= 3) {
    return 'always';
  }
  
  // Thin sweaters - optional
  if (subcategories.includes('Sweater') && layerCount >= 3) {
    return 'optional';
  }
  
  // Cardigans, Shawl Cardigans - never tucked
  if (subcategories.some(s => s.includes('Cardigan') || s === 'Shawl Cardigan' || s === 'Blazer')) {
    return 'never';
  }
  
  // Outer layers - never tucked
  if (slotName === 'outer_layer' || slotName === 'vest_layer') {
    return 'never';
  }
  
  // Mid layer - check contents
  if (slotName === 'mid_layer') {
    if (subcategories.some(s => s.includes('Cardigan'))) return 'never';
    if (subcategories.includes('Sweater')) return 'optional';
    if (subcategories.includes('Blazer')) return 'never';
    return 'never';
  }
  
  // Polo layer
  if (slotName === 'polo_layer') {
    return layerCount >= 3 ? 'always' : 'optional';
  }
  
  // Shirt in 2-layer casual - optional
  if (slotName === 'shirt_layer' && layerCount == 2) {
    return 'optional';
  }
  
  return 'optional';
}

function determineButtoning(slotName, subcategories, minTemp) {
  const subcatStr = subcategories.join(' ');
  
  // T-shirts, und ershirts
  if (slotName === 'base_layer' || subcatStr.includes('T-shirt') || subcatStr.includes('Undershirt')) {
    return 'n/a';
  }
  
  // Polo - always one undone
  if (subcatStr.includes('Polo') || slotName === 'polo_layer') {
    return 'always_one_undone';
  }
  
  // Henley - always one undone
  if (subcatStr.includes('Henley')) {
    return 'always_one_undone';
  }
  
  // Shirts - depends on temperature
  if (slotName === 'shirt_layer') {
    // Hot weather (17°C+)
    if (minTemp >= 17) {
      return 'unbuttoned_over_base';
    } else {
      return 'one_button_undone';
    }
  }
  
  // Linen, summer shirts
  if (subcatStr.includes('Linen') ||subcatStr.includes('Seersucker') || 
      subcatStr.includes('Short-sleeve') || subcatStr.includes('Hawaiian')) {
    return 'unbuttoned_over_base';
  }
  
  // Flannel - can be worn open
  if (subcatStr.includes('Flannel')) {
    return 'unbuttoned_over_base';
  }
  
  // Everything else
  return 'n/a';
}

// Process each template
templates.forEach(template => {
  const layerCount = template.layer_count || 1;
  const minTemp = template.min_temp_c || 0;
  
  if (template.slots) {
    template.slots.forEach(slot => {
      const slotName = slot.slot_name || '';
      const subcategories = slot.allowed_subcategories || [];
      
      // Add tucked_in attribute
      slot.tucked_in = determineTucking(slotName, subcategories, layerCount);
      
      // Add buttoning attribute
      slot.buttoning = determineButtoning(slotName, subcategories, minTemp);
    });
  }
});

// Write back to file
fs.writeFileSync(templatesPath, JSON.stringify(templates, null, 2), 'utf-8');

console.log(`✅ Successfully updated ${templates.length} templates`);
console.log('\nSample of first template:');
console.log(JSON.stringify(templates[0], null, 2));
