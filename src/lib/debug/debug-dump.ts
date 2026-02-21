/**
 * Universal Debug Dump Utility
 * Quick and easy content dump to markdown files
 */

import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

/**
 * 🚀 UNIVERSAL DEBUG DUMP - Quick and easy content dump to markdown file
 * 
 * Usage examples:
 * ```typescript
 * import { debugDump } from '@/lib/debug/debug-dump';
 * 
 * // Dump any string
 * await debugDump("My content", "test");
 * 
 * // Dump JSON object
 * await debugDump(JSON.stringify(myObject, null, 2), "api-response", "json");
 * 
 * // Dump with custom title
 * await debugDump(promptText, "llm-prompt", "text", "LLM Request Analysis");
 * 
 * // Dump any variable for inspection
 * await debugDump(JSON.stringify(someVariable, null, 2), "variable-dump", "json");
 * ```
 * 
 * @param content - Content to dump (string)
 * @param prefix - Filename prefix (e.g., "test", "api-response")
 * @param language - Code block language (default: "text", can be "json", "typescript", etc.)
 * @param title - Optional custom title for the markdown file
 * @returns Path to created file, or null if failed
 */
export async function debugDump(
    content: string,
    prefix: string = "debug",
    language: string = "text",
    title?: string
): Promise<string | null> {
    try {
        const now = new Date();
        const timestamp = now.toISOString()
            .replace(/:/g, '-')
            .replace(/\./g, '-')
            .slice(0, -1);
        
        const filename = `${prefix}-${timestamp}.md`;
        const debugDir = join(process.cwd(), 'debug-logs');
        
        await mkdir(debugDir, { recursive: true });
        const filepath = join(debugDir, filename);
        
        // Build markdown
        let markdown = `# ${title || `Debug Dump: ${prefix}`}\n\n`;
        markdown += `**Generated:** ${now.toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' })}\n\n`;
        markdown += `**Timestamp:** ${timestamp}\n\n`;
        markdown += `---\n\n`;
        markdown += `\`\`\`${language}\n${content}\n\`\`\`\n`;
        
        await writeFile(filepath, markdown, 'utf-8');
        console.log(`📝 [DEBUG-DUMP] Created: ${filepath}`);
        
        return filepath;
    } catch (error) {
        console.error(`❌ [DEBUG-DUMP] Failed:`, error);
        return null;
    }
}
