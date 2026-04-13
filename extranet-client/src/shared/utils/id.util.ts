/**
 * Safely extracts a string ID from various input types.
 * Handles:
 * - string: returns the string
 * - object with _id: returns object._id
 * - object with id: returns object.id
 * - null/undefined: returns empty string
 */
export const extractId = (idOrObject: any): string => {
  if (!idOrObject) return '';
  if (typeof idOrObject === 'string') return idOrObject;
  if (typeof idOrObject === 'object') {
    return idOrObject._id || idOrObject.id || '';
  }
  return String(idOrObject);
};
