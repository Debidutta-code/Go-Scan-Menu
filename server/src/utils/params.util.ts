// Utility to safely extract string params from Express 5+ where params can be string | string[]
export class ParamsUtil {
  static getString(param: string | string[] | undefined): string {
    let value = '';
    if (Array.isArray(param)) {
      value = param[0] || '';
    } else {
      value = param || '';
    }

    // Filter out malformed "[object Object]" strings from frontend bugs
    if (value === '[object Object]' || value === '[object%20Object]') {
      return '';
    }

    return value;
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

    if (typeof idOrObject === 'string') {
      if (idOrObject === '[object Object]' || idOrObject === '[object%20Object]') {
        return '';
      }
      return idOrObject;
    }

    if (typeof idOrObject === 'object') {
      // Handle Mongoose/BSON ObjectId
      if (
        idOrObject.toString &&
        typeof idOrObject.toString === 'function' &&
        (idOrObject._bsontype === 'ObjectID' || idOrObject.constructor.name === 'ObjectId')
      ) {
        const str = idOrObject.toString();
        if (str === '[object Object]' || str === '[object%20Object]') {
          return '';
        }
        return str;
      }

      const id = idOrObject._id || idOrObject.id;
      if (id) {
        if (typeof id === 'string') {
          if (id === '[object Object]' || id === '[object%20Object]') {
            return '';
          }
          return id;
        }
        return this.extractId(id); // Recurse if the _id field is itself an object
      }
    }

    return '';
  }
}
