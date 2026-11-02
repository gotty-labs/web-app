/**
 * Fills `{key}` placeholders in a dictionary template. A missing (or nullish) value
 * leaves its placeholder visible, so a wrong key shows up as `{key}`, never "undefined".
 */
export function fillTemplate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => String(values[key] ?? match))
}
