/**
 * CSS validation utilities for safe style generation
 */

/**
 * Validate and sanitize a numeric value for CSS
 * @param value - The value to validate
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @param defaultValue - Default value if validation fails
 * @returns Validated numeric value
 */
export function validateNumeric(
  value: number | string | undefined,
  min: number,
  max: number,
  defaultValue: number
): number {
  if (value === undefined || value === null) {
    return defaultValue;
  }
  
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num) || !Number.isFinite(num)) {
    return defaultValue;
  }
  
  return Math.max(min, Math.min(max, num));
}

/**
 * Validate and sanitize a color value for CSS
 * @param color - The color value to validate
 * @returns Validated color string or empty string if invalid
 */
export function validateColor(color: string | undefined): string {
  if (!color) return '';
  
  // Remove any potentially dangerous characters
  const sanitized = color.trim().replace(/[^a-zA-Z0-9#(),.\s-]/g, '');
  
  // Check for common color formats
  const hexPattern = /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/;
  const rgbPattern = /^rgb\(\s*([01]?\d\d?|2[0-4]\d|25[0-5])\s*,\s*([01]?\d\d?|2[0-4]\d|25[0-5])\s*,\s*([01]?\d\d?|2[0-4]\d|25[0-5])\s*\)$/;
  const rgbaPattern = /^rgba\(\s*([01]?\d\d?|2[0-4]\d|25[0-5])\s*,\s*([01]?\d\d?|2[0-4]\d|25[0-5])\s*,\s*([01]?\d\d?|2[0-4]\d|25[0-5])\s*,\s*[0-9.]+\s*\)$/;
  const namedColors = ['black', 'white', 'red', 'green', 'blue', 'yellow', 'cyan', 'magenta', 
    'gray', 'grey', 'silver', 'maroon', 'olive', 'lime', 'aqua', 'teal', 'navy', 
    'fuchsia', 'purple', 'transparent'];
  
  if (hexPattern.test(sanitized) || 
      rgbPattern.test(sanitized) || 
      rgbaPattern.test(sanitized) ||
      namedColors.includes(sanitized.toLowerCase())) {
    return sanitized;
  }
  
  return '';
}

/**
 * Validate and sanitize a CSS unit value
 * @param value - The value with unit to validate
 * @param allowedUnits - Array of allowed units
 * @returns Validated value with unit or empty string if invalid
 */
export function validateCSSValue(
  value: string | number | undefined,
  allowedUnits: string[] = ['px', 'pt', 'em', 'rem', '%', 'vw', 'vh']
): string {
  if (value === undefined || value === null) return '';
  
  // Handle numeric values - assume pixels
  if (typeof value === 'number') {
    const validated = validateNumeric(value, 0, 10000, 0);
    return validated > 0 ? `${validated}px` : '';
  }
  
  const stringValue = String(value).trim();
  
  // Check for unit at the end
  const match = stringValue.match(/^(-?\d*\.?\d+)\s*([a-zA-Z%]+)?$/);
  if (!match) return '';
  
  const [, numPart, unit = 'px'] = match;
  const num = parseFloat(numPart!);
  
  if (isNaN(num) || !Number.isFinite(num)) return '';
  
  // Validate the unit
  if (!allowedUnits.includes(unit.toLowerCase())) return '';
  
  // Apply reasonable bounds based on unit
  let min = 0;
  let max = 10000;
  
  if (unit === '%') {
    max = 100;
  } else if (unit === 'vw' || unit === 'vh') {
    max = 100;
  }
  
  const validated = validateNumeric(num, min, max, 0);
  return validated > 0 ? `${validated}${unit}` : '';
}

/**
 * Validate border style
 * @param style - The border style to validate
 * @returns Valid border style or 'solid' as default
 */
export function validateBorderStyle(style: string | undefined): string {
  const validStyles = [
    'none', 'hidden', 'dotted', 'dashed', 'solid', 'double',
    'groove', 'ridge', 'inset', 'outset'
  ];
  
  if (!style) return 'solid';
  
  const normalized = style.toLowerCase().trim();
  return validStyles.includes(normalized) ? normalized : 'solid';
}

/**
 * Escape CSS string values to prevent injection
 * @param value - The value to escape
 * @returns Escaped string safe for CSS
 */
export function escapeCSSString(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}