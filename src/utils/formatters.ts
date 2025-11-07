/**
 * Converts a string to title case for display purposes.
 * Handles underscores by replacing them with spaces and capitalizing each word.
 * 
 * @param str - The string to convert to title case
 * @returns The title-cased string
 * 
 * @example
 * toTitleCase('PETROL') // Returns 'Petrol'
 * toTitleCase('CREDIT_CARD') // Returns 'Credit Card'
 * toTitleCase('UPI') // Returns 'Upi'
 */
export function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

