// Utility to safely extract string params from Express 5+ where params can be string | string[]
export class ParamsUtil {
  static getString(param: string | string[] | undefined): string {
    if (Array.isArray(param)) {
      return param[0] || '';
    }
    return param || '';
  }

  /**
   * Safely extracts an ID string from a value that could be a string, a Mongoose ObjectId,
   * or a populated Mongoose document with an `_id` property.
   */
  static extractId(val: any): string | undefined {
    if (!val) return undefined;
    if (typeof val === 'object' && val._id) return val._id.toString();
    return val.toString();
  }
}
