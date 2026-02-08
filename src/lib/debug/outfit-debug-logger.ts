/**
 * Outfit Debug Logger
 * Handles creation and saving of debug markdown files for outfit generation
 */

import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

/**
 * Template validation result for a single template
 */
export interface TemplateValidationLog {
    templateName: string;
    isValid: boolean;
    missingSlots?: Array<{
        slotName: string;
        allowedSubcategories: string[];
    }>;
}

/**
 * Data structure for debug markdown creation
 */
export interface OutfitDebugData {
    styleContext: string;
    validTemplates: any[];
    selectedTemplate: any;
    filteredGarments: any[];
    uniqueGarmentsPerOutfit: Map<string, any[]>;
    templateValidationLogs?: TemplateValidationLog[];
    inventorySnapshot?: any[];
}

/**
 * Creates a debug markdown file with outfit generation data
 * File is saved with timestamp in filename for tracking
 * 
 * @param data - Debug data to include in the markdown file
 * @returns Path to created file, or null if failed
 */
export async function createOutfitDebugMarkdown(data: OutfitDebugData): Promise<string | null> {
    try {
        const now = new Date();
        const timestamp = now.toISOString()
            .replace(/:/g, '-')
            .replace(/\./g, '-')
            .slice(0, -1); // Format: 2026-02-07T11-34-55-123
        
        const filename = `outfit-debug-${timestamp}.md`;
        const debugDir = join(process.cwd(), 'debug-logs');
        
        // Ensure debug directory exists
        await mkdir(debugDir, { recursive: true });
        
        const filepath = join(debugDir, filename);
        
        // Build markdown content
        let markdown = buildMarkdownContent(data, now);
        
        // Write to file
        await writeFile(filepath, markdown, 'utf-8');
        console.log(`📝 [DEBUG] Created debug markdown: ${filepath}`);
        
        return filepath;
    } catch (error) {
        console.error(`❌ [DEBUG] Failed to create debug markdown:`, error);
        return null;
    }
}

/**
 * Builds the complete markdown content from debug data
 */
function buildMarkdownContent(data: OutfitDebugData, timestamp: Date): string {
    let markdown = `# Outfit Generation Debug Log\n\n`;
    markdown += `**Generated:** ${timestamp.toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' })}\n\n`;
    markdown += `---\n\n`;
    
    // Style Context
    markdown += buildStyleContextSection(data.styleContext);
    
    // Template Validation Logs (NEW)
    if (data.templateValidationLogs && data.templateValidationLogs.length > 0) {
        markdown += buildTemplateValidationSection(data.templateValidationLogs);
    }
    
    // Valid Templates
    markdown += buildValidTemplatesSection(data.validTemplates);
    
    // Selected Template
    markdown += buildSelectedTemplateSection(data.selectedTemplate);
    
    // Filtered Garments
    markdown += buildFilteredGarmentsSection(data.filteredGarments);
    
    // Unique Garments per Outfit
    markdown += buildUniqueGarmentsSection(data.uniqueGarmentsPerOutfit);
    
    return markdown;
}

/**
 * Builds the style context section
 */
function buildStyleContextSection(styleContext: string): string {
    let section = `## 📚 Style Context\n\n`;
    section += `${styleContext || 'No style context available'}\n\n`;
    section += `---\n\n`;
    return section;
}

/**
 * Builds the template validation section (NEW)
 */
function buildTemplateValidationSection(validationLogs: TemplateValidationLog[]): string {
    let section = `## 🔍 Template Validation Results\n\n`;
    section += `*Checking which templates can be fulfilled with current inventory*\n\n`;
    
    validationLogs.forEach((log, idx) => {
        const icon = log.isValid ? '✅' : '❌';
        section += `### ${icon} ${idx + 1}. ${log.templateName}\n\n`;
        
        if (log.isValid) {
            section += `**Status:** Valid - all required slots can be fulfilled\n\n`;
        } else {
            section += `**Status:** Invalid - missing required items\n\n`;
            if (log.missingSlots && log.missingSlots.length > 0) {
                section += `**Missing Slots:**\n`;
                log.missingSlots.forEach(slot => {
                    section += `- **${slot.slotName}**: needs ${slot.allowedSubcategories.join(' OR ')}\n`;
                });
                section += `\n`;
            }
        }
    });
    
    section += `---\n\n`;
    return section;
}

/**
 * Builds the valid templates section
 */
function buildValidTemplatesSection(validTemplates: any[]): string {
    let section = `## 🎨 Valid Templates (${validTemplates.length})\n\n`;
    
    if (validTemplates.length > 0) {
        validTemplates.forEach((template, idx) => {
            section += `### ${idx + 1}. ${template.name}\n\n`;
            section += `- **Layer Count:** ${template.layer_count}\n`;
            section += `- **Temperature Range:** ${template.min_temp_c}°C to ${template.max_temp_c}°C\n`;
            section += `- **Description:** ${template.description || 'N/A'}\n`;
            section += `- **Required Layers:** ${JSON.stringify(template.required_layers || [])}\n`;
            
            if (template.slots && template.slots.length > 0) {
                section += `- **Slots:**\n`;
                template.slots.forEach((slot: any) => {
                    section += `  - **${slot.slot_name}** (${slot.required ? 'required' : 'optional'})\n`;
                    section += `    - Allowed: ${slot.allowed_subcategories?.join(', ') || 'N/A'}\n`;
                    section += `    - Tucked: ${slot.tucked_in || 'N/A'}\n`;
                    section += `    - Buttoning: ${slot.buttoning || 'N/A'}\n`;
                });
            }
            section += `\n`;
        });
    } else {
        section += `*No valid templates found*\n\n`;
    }
    
    section += `---\n\n`;
    return section;
}

/**
 * Builds the selected template section
 */
function buildSelectedTemplateSection(selectedTemplate: any): string {
    let section = `## ✅ Selected Template\n\n`;
    section += `**Name:** ${selectedTemplate.name}\n\n`;
    section += `**Layer Count:** ${selectedTemplate.layer_count}\n\n`;
    section += `**Temperature Range:** ${selectedTemplate.min_temp_c}°C to ${selectedTemplate.max_temp_c}°C\n\n`;
    section += `**Description:** ${selectedTemplate.description || 'N/A'}\n\n`;
    section += `**Required Layers:** ${JSON.stringify(selectedTemplate.required_layers || [])}\n\n`;
    
    if (selectedTemplate.slots && selectedTemplate.slots.length > 0) {
        section += `### Slots Configuration\n\n`;
        selectedTemplate.slots.forEach((slot: any) => {
            section += `#### ${slot.slot_name} (${slot.required ? 'REQUIRED' : 'optional'})\n\n`;
            section += `- **Allowed Subcategories:** ${slot.allowed_subcategories?.join(', ') || 'N/A'}\n`;
            section += `- **Tucked In:** ${slot.tucked_in || 'N/A'}\n`;
            section += `- **Buttoning:** ${slot.buttoning || 'N/A'}\n\n`;
        });
    }
    
    section += `---\n\n`;
    return section;
}

/**
 * Builds the filtered garments section
 */
function buildFilteredGarmentsSection(filteredGarments: any[]): string {
    let section = `## 👔 Filtered Garments (${filteredGarments.length})\n\n`;
    section += `*Garments that passed physics filtering and layering rules*\n\n`;
    
    if (filteredGarments.length > 0) {
        // Group by category
        const byCategory = filteredGarments.reduce((acc: any, g: any) => {
            const cat = g.category || 'Unknown';
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(g);
            return acc;
        }, {});
        
        Object.entries(byCategory).forEach(([category, garments]: [string, any]) => {
            section += `### ${category} (${garments.length})\n\n`;
            garments.forEach((g: any, idx: number) => {
                section += `${idx + 1}. **${g.full_name || g.name}**\n`;
                section += `   - ID: \`${g.id}\`\n`;
                section += `   - Subcategory: ${g.subcategory || 'N/A'}\n`;
                section += `   - Color: ${g.main_color_name || 'N/A'}\n`;
                section += `   - Material: ${Array.isArray(g.material) ? g.material.join(', ') : g.material || 'N/A'}\n`;
                section += `   - Layer Type: ${g.layer_type || 'N/A'}\n`;
                section += `   - Sleeve Length: ${g.sleeve_length || 'N/A'}\n`;
                section += `   - Comfort Range: ${g.comfort_min_c}°C to ${g.comfort_max_c}°C\n\n`;
            });
        });
    } else {
        section += `*No garments passed filtering*\n\n`;
    }
    
    section += `---\n\n`;
    return section;
}

/**
 * Builds the unique garments per outfit section
 */
function buildUniqueGarmentsSection(uniqueGarmentsPerOutfit: Map<string, any[]>): string {
    let section = `## 🎯 Unique Garments per Outfit\n\n`;
    
    if (uniqueGarmentsPerOutfit.size > 0) {
        Array.from(uniqueGarmentsPerOutfit.entries()).forEach(([outfitName, garments], idx) => {
            section += `### Outfit ${idx + 1}: ${outfitName}\n\n`;
            section += `**Total Items:** ${garments.length}\n\n`;
            
            garments.forEach((g: any, gIdx: number) => {
                section += `${gIdx + 1}. **${g.full_name || g.name}**\n`;
                section += `   - Category: ${g.category}\n`;
                section += `   - Subcategory: ${g.subcategory || 'N/A'}\n`;
                section += `   - Color: ${g.main_color_name || 'N/A'}\n`;
                section += `   - Layer Type: ${g.layer_type || 'N/A'}\n\n`;
            });
        });
    } else {
        section += `*No outfits generated*\n\n`;
    }
    
    return section;
}
