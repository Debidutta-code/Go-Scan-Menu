/**
 * Safely extracts a string ID from various input types.
 * Handles:
 * - string: returns the string (filters out '[object Object]')
 * - object with _id: returns object._id (recursively if needed)
 * - object with id: returns object.id (recursively if needed)
 * - object with toString(): returns result of toString() if not default
 * - null/undefined: returns empty string
 */
export const extractId = (idOrObject: any): string => {
  if (!idOrObject) return '';

  if (typeof idOrObject === 'string') {
    return (idOrObject === '[object Object]' || idOrObject === '[object%20Object]') ? '' : idOrObject;
  }

  if (typeof idOrObject === 'object') {
    // 1. Try common ID fields
    const id = idOrObject._id || idOrObject.id;
    if (id) {
      if (typeof id === 'string') {
        return (id === '[object Object]' || id === '[object%20Object]') ? '' : id;
      }
      return extractId(id); // Recurse if the _id field is itself an object
    }

    // 2. Try to handle BSON/Mongoose ObjectId or objects with custom toString
    if (idOrObject.toString && typeof idOrObject.toString === 'function') {
      try {
        const str = idOrObject.toString();
        // Only return if it's a meaningful ID string and not the default object representation
        if (str && typeof str === 'string' && str !== '[object Object]' && str !== '[object%20Object]') {
          return str;
        }
      } catch (e) {
        // Fall through if toString fails
      }
    }
  }

  return '';
};
