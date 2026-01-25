import json

# Read the existing templates
with open(r'F:\Worskpace\YourStylistApp\gentstylo\src\data\new_layering_templates.json', 'r', encoding='utf-8') as f:
    templates = json.load(f)

def determine_tucking(slot_name, subcategories, layer_count):
    """Determine tucking rule based on slot and context"""
    # Base layers - optional
    if slot_name in ['base_layer', 'top_layer']:
        return 'optional'
    
    # Shirt layers in 3-4 layer outfits - always tucked
    if slot_name in ['shirt_layer'] and layer_count >= 3:
        return 'always'
    
    # Turtleneck in 3-4 layer outfits - always tucked
    if slot_name in ['turtleneck_layer'] and layer_count >= 3:
        return 'always'
    
    # Thin sweaters when explicitly mentioned - check subcategories
    if 'Sweater' in subcategories and layer_count >= 3:
        # Could be thin merino - let's mark as optional for safety
        return 'optional'
    
    # Cardigans, Shawl Cardigans - never tucked
    if any(x in subcategories for x in ['Cardigan', 'Shawl Cardigan', 'Blazer']):
        return 'never'
    
    # Outer layers - never tucked
    if slot_name in ['outer_layer', 'vest_layer', 'mid_layer']:
        # Check if it's a cardigan type
        if any(x in subcategories for x in ['Cardigan', 'Shawl Cardigan']):
            return 'never'
        # Blazer, Sweater in mid-layer
        if 'Sweater' in subcategories:
            return 'optional'
        return 'never'
    
    # Polo layer - optional
    if slot_name == 'polo_layer':
        return 'always' if layer_count >= 3 else 'optional'
    
    # Shirt in 2-layer casual - optional
    if slot_name == 'shirt_layer' and layer_count == 2:
        return 'optional'
    
    return 'optional'

def determine_buttoning(slot_name, subcategories, temp_range):
    """Determine buttoning rule based on slot and temperature"""
    # T-shirts, undershirts, sweaters without buttons
    if slot_name in ['base_layer'] or 'T-shirt' in str(subcategories) or 'Undershirt' in str(subcategories):
        return 'n/a'
    
    # Polo - always one undone
    if 'Polo' in str(subcategories) or slot_name == 'polo_layer':
        return 'always_one_undone'
    
    # Henley - always one undone
    if 'Henley' in str(subcategories):
        return 'always_one_undone'
    
   # Shirts - depends on temperature and context
    if slot_name in ['shirt_layer']:
        # Hot weather (19°C+) - can be worn open or half-buttoned
        if temp_range and temp_range.get('min_temp_c', 0) >= 17:
            return 'unbuttoned_over_base'  # Summer casual
        else:
            return 'one_button_undone'  # Standard business/smart casual
    
    # Linen shirt in summer templates
    if 'Linen' in str(subcategories):
        return 'unbuttoned_over_base'
    
    # Short-sleeve shirts
    if 'Short-sleeve' in str(subcategories) or 'Hawaiian' in str(subcategories):
        return 'unbuttoned_over_base'
    
    # Cardigans, Blazers, Vests - button rules vary but not critical
    if any(x in str(subcategories) for x in ['Cardigan', 'Blazer', 'Vest', 'Jacket', 'Coat', 'Parka', 'Sweater', 'Turtleneck']):
        return 'n/a'
    
    # Flannel - can be worn either way
    if 'Flannel' in str(subcategories):
        return 'unbuttoned_over_base'
    
    return 'n/a'

# Process each template
for template in templates:
    layer_count = template.get('layer_count', 1)
    temp_info = {
        'min_temp_c': template.get('min_temp_c'),
        'max_temp_c': template.get('max_temp_c')
    }
    
    if 'slots' in template:
        for slot in template['slots']:
            slot_name = slot.get('slot_name', '')
            subcategories = slot.get('allowed_subcategories', [])
            
            # Add tucked_in attribute
            slot['tucked_in'] = determine_tucking(slot_name, subcategories, layer_count)
            
            # Add buttoning attribute
            slot['buttoning'] = determine_buttoning(slot_name, subcategories, temp_info)

# Write back to file
with open(r'F:\Worskpace\YourStylistApp\gentstylo\src\data\new_layering_templates.json', 'w', encoding='utf-8') as f:
    json.dump(templates, f, indent=2, ensure_ascii=False)

print(f"✅ Successfully updated {len(templates)} templates")
print("\nSample of first template:")
print(json.dumps(templates[0], indent=2, ensure_ascii=False))
