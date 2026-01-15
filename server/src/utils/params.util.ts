// Utility to safely extract string params from Express 5+ where params can be string | string[]
export class ParamsUtil {
  static getString(param: string | string[] | undefined): string {
    if (Array.isArray(param)) {
      return param[0] || '';
    }
    return param || '';
  }
}
