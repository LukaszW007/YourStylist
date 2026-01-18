/**
 * Input sanitization utilities to prevent XSS and code injection attacks
 */

/**
 * Sanitizes user text input to prevent XSS/code injection
 * - Strips HTML tags
 * - Removes JavaScript protocols and event handlers
 * - Limits length to prevent DoS
 * 
 * @param input - Raw user input string
 * @param maxLength - Maximum allowed length (default: 500)
 * @returns Sanitized string safe for storage and display
 */
export function sanitizeTextInput(input: string | null | undefined, maxLength: number = 500): string {
  if (!input) return '';
  
  return input
    .trim()
    .slice(0, maxLength) // Prevent excessive length
    .replace(/[<>]/g, '') // Remove HTML brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers (onclick=, onerror=, etc)
    .replace(/&lt;script&gt;/gi, '') // Remove script tags (encoded)
    .replace(/data:/gi, ''); // Remove data: URIs
}

/**
 * Validates that a value is in the allowed enum list
 * Type guard function for TypeScript
 * 
 * @param value - Value to check
 * @param allowedValues - Array of allowed values
 * @returns True if value is in allowed list
 */
export function validateEnum<T extends readonly string[]>(
  value: string | null | undefined,
  allowedValues: T
): value is T[number] {
  if (!value) return false;
  return allowedValues.includes(value as T[number]);
}
