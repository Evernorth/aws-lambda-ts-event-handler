import { Middleware } from '../middleware';
import { PathPattern, HTTPMethod, Path, AsyncFunction } from './common';

/**
 * Represents an HTTP route with method, URL pattern, handler function, and additional configurations.
 */
class Route {
  public method: HTTPMethod;
  public rule: Path | PathPattern;
  public func: AsyncFunction;
  public cors: boolean;
  public compress: boolean;
  public cacheControl?: string;
  public middlewares: Middleware[];

  /**
   * Constructs a new Route instance.
   *
   * @param method - The HTTP method(s) for the route.
   * @param rule - The URL pattern or path for the route.
   * @param func - The handler function to be called for the route.
   * @param cors - Whether to enable CORS for the route.
   * @param compress - Whether to enable compression for the route.
   * @param cacheControl - Cache control settings for the route.
   * @param middlewares - Array of middlewares to be applied to the route.
   * @throws {TypeError} If the method is not a string or an array of strings.
   */
  constructor(
    method: HTTPMethod,
    rule: Path | PathPattern,
    func: AsyncFunction,
    cors = false,
    compress = false,
    cacheControl?: string,
    middlewares: Middleware[] = [],
  ) {
    this.method = (Array.isArray(method) ? method : [method]).map((m) =>
      m.toUpperCase(),
    );
    this.rule = rule;
    this.func = func;
    this.cors = cors;
    this.compress = compress;
    this.cacheControl = cacheControl;
    this.middlewares = middlewares;
  }
}

export { Route };
