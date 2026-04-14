// Utility to safely extract string params from Express 5+ where params can be string | string[]
export class ParamsUtil {
  static getString(param: string | string[] | undefined): string {
    if (Array.isArray(param)) {
      return param[0] || '';
    }
    return param || '';
  }

  /**
   * Safely extracts a string ID from various input types.
   * Handles:
   * - string: returns the string
   * - object with _id: returns object._id (recursively if needed)
   * - object with id: returns object.id (recursively if needed)
   * - null/undefined: returns empty string
   */
  static extractId(idOrObject: any): string {
    if (!idOrObject) return '';
    if (typeof idOrObject === 'string') return idOrObject;

    if (typeof idOrObject === 'object') {
      // Handle Mongoose/BSON ObjectId
      if (
        idOrObject.toString &&
        typeof idOrObject.toString === 'function' &&
        (idOrObject._bsontype === 'ObjectID' || idOrObject.constructor.name === 'ObjectId')
      ) {
        return idOrObject.toString();
      }

      const id = idOrObject._id || idOrObject.id;
      if (id) {
        if (typeof id === 'string') return id;
        return this.extractId(id); // Recurse if the _id field is itself an object
      }
    }

    return '';
  }
}
