import { Headers } from './common';

/**
 * CORS Configuration
 *
 * @category Model
 */
class CORSConfig {
  private static readonly REQUIRED_HEADERS: string[] = [
    'Authorization',
    'Content-Type',
    'X-Amz-Date',
    'X-Api-Key',
    'X-Amz-Security-Token',
  ];

  public allowOrigin: string;
  public allowHeaders: string[];
  public exposeHeaders: string[];
  public maxAge?: number;
  public allowCredentials: boolean;

  /**
   * Constructs a new instance of the CorsConfig class.
   *
   * @param allowOrigin - Specifies the allowed origin for CORS requests. Defaults to '*'.
   *                      For security, it is recommended to specify specific allow-listed domains.
   * @param allowHeaders - An array of allowed HTTP headers for CORS requests. Defaults to an empty array.
   * @param exposeHeaders - An array of HTTP headers that are safe to expose to the browser. Defaults to an empty array.
   * @param maxAge - The maximum time (in seconds) that the results of a preflight request can be cached. Optional.
   * @param allowCredentials - Indicates whether credentials (cookies, authorization headers, etc.) are allowed in CORS requests. Defaults to false.
   */
  constructor(
    allowOrigin: string = '*',
    allowHeaders: string[] = [],
    exposeHeaders: string[] = [],
    maxAge?: number,
    allowCredentials: boolean = false,
  ) {
    this.allowOrigin = allowOrigin;
    this.allowHeaders = this.initializeAllowHeaders(allowHeaders);
    this.exposeHeaders = exposeHeaders;
    this.maxAge = maxAge;
    this.allowCredentials = allowCredentials;
  }

  private initializeAllowHeaders(allowHeaders: string[]): string[] {
    return allowHeaders.includes('*')
      ? ['*']
      : [...new Set([...CORSConfig.REQUIRED_HEADERS, ...allowHeaders])];
  }

  public headers(): Headers {
    const headers: Headers = {
      'Access-Control-Allow-Origin': this.allowOrigin,
      'Access-Control-Allow-Headers': this.allowHeaders.join(','),
    };

    if (this.exposeHeaders.length > 0) {
      headers['Access-Control-Expose-Headers'] = this.exposeHeaders.join(',');
    }

    if (this.maxAge !== undefined) {
      headers['Access-Control-Max-Age'] = this.maxAge.toString();
    }

    if (this.allowCredentials) {
      headers['Access-Control-Allow-Credentials'] = 'true';
    }

    return headers;
  }
}

export { CORSConfig };
