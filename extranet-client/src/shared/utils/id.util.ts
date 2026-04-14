/**
 * Safely extracts a string ID from various input types.
 * Handles:
 * - string: returns the string
 * - object with _id: returns object._id (recursively if needed)
 * - object with id: returns object.id (recursively if needed)
 * - null/undefined: returns empty string
 */
export const extractId = (idOrObject: any): string => {
  if (!idOrObject) return '';
  if (typeof idOrObject === 'string') return idOrObject;
  console.log("idOrObject", idOrObject);

  if (typeof idOrObject === 'object') {
    // If it's already an ID string-like object (e.g. BSON ObjectId in some contexts)
    if (idOrObject.toString && typeof idOrObject.toString === 'function' && idOrObject._bsontype === 'ObjectID') {
        return idOrObject.toString();
    }

    const id = idOrObject._id || idOrObject.id;
    if (id) {
        if (typeof id === 'string') return id;
        return extractId(id); // Recurse if the _id field is itself an object
    }
  }

  return '';
};
