/**
 * Utility for joining CSS class names conditionally.
 * Filters out falsy values like null, undefined, false, and empty strings.
 * 
 * @param  {...(string|boolean|null|undefined)} classes 
 * @returns {string} Concatenated class string
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default cn;
