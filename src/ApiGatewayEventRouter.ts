/* eslint-disable @typescript-eslint/no-explicit-any */

import zlib from 'node:zlib';
import {
  Response,
  Route,
  CORSConfig,
  JSONData,
  Context,
  HTTPMethod,
  BaseProxyEvent,
  Headers,
  PathPattern,
  ArgsDict,
  AsyncFunction,
  ResponseInterface,
} from './types';
import { Context as LambdaContext } from 'aws-lambda';
import { Middleware, wrapWithMiddlewares } from './middleware';
import { lookupKeyFromMap } from './utils';
import {
  MIME_TYPE,
  ProblemDocument,
  ProblemTypes,
} from './types/http-problem-details';

enum ProxyEventType {
  APIGatewayProxyEvent = 'APIGatewayProxyEvent',
  APIGatewayProxyEventV2 = 'APIGatewayProxyEventV2',
  ALBEvent = 'ALBEvent',
  LambdaFunctionUrlEvent = 'LambdaFunctionUrlEvent',
}

const DYNAMIC_ROUTE_PATTERN: RegExp = /<(\w+)>/g;
const SAFE_URI: string = "-._~()'!*:@,;=";
const UNSAFE_URI: string = '%<> \\[\\]{}|^';
const NAMED_GROUP_BOUNDARY_PATTERN: string = `(?<$1>[${SAFE_URI}${UNSAFE_URI}\\w]+)`;
const ROUTE_REGEX: string = '^{}$';

export {
  ApiGatewayResolver,
  BaseRouter,
  ProxyEventType,
  ResponseBuilder,
  Router,
};

/**
 * Standard APIGateway Response builder
 */
class ResponseBuilder {
  constructor(
    public response: Response,
    public route?: Route,
  ) {}

  /**
   * Builds a standard APIGatewayProxyResponseEvent
   *
   * @param event Incoming Event
   * @param cors CORS configuration
   * @returns JSONData
   */
  public build(event: BaseProxyEvent, cors?: CORSConfig): JSONData {
    this.route && this._route(event, cors);

    if (this.response.body instanceof Buffer) {
      this.response.base64Encoded = true;
      this.response.body = this.response.body.toString('base64');
    }

    return {
      statusCode: this.response.statusCode,
      body: this.response.body,
      isBase64Encoded: this.response.base64Encoded || false,
      headers: { ...this.response.headers },
    };
  }

  /**
   * Sets CORS, Cache-Control & Compress HTTP Headers based on the configuration
   *
   * @param event Incoming Event
   * @param cors  CORS configuration
   */
  private _route(event: BaseProxyEvent, cors?: CORSConfig): void {
    const { headers } = event;
    const { cors: enableCORS, cacheControl, compress } = this.route as Route;

    if (enableCORS !== false && cors) {
      this.addCORS(cors);
    }
    if (cacheControl) {
      this.addCacheControl(cacheControl);
    }
    if (compress && headers?.['accept-encoding']?.includes('gzip')) {
      this.compress();
    }
  }

  /**
   * ADD CORS Headers
   *
   * @param cors CORS Configuration
   */
  private addCORS(cors: CORSConfig): void {
    const { headers: responseHeaders } = this.response;

    if (responseHeaders) {
      for (const [key, value] of Object.entries(cors.headers())) {
        responseHeaders[key] = value;
      }
    }
  }

  /**
   * ADD Cache-Control Headers
   *
   * @param cacheControl Cache-Control configuration
   */
  private addCacheControl(cacheControl: string): void {
    const { headers: responseHeaders, statusCode } = this.response;

    if (responseHeaders) {
      responseHeaders['Cache-Control'] =
        statusCode === 200 ? cacheControl : 'no-cache';
    }
  }

  /**
   * ADD Content-Encoding Headers (for compression)
   */
  private compress(): void {
    const { headers: responseHeaders, body } = this.response;

    if (responseHeaders) {
      responseHeaders['Content-Encoding'] = 'gzip';
    }
    if (body) {
      this.response.body = zlib.gzipSync(
        Buffer.isBuffer(body) ? body : Buffer.from(body),
      );
    }
  }
}

/**
 * Base Router
 */
abstract class BaseRouter {
  public context: Context = new Map();
  public currentEvent?: BaseProxyEvent;
  public lambdaContext?: LambdaContext;

  public addRoute(
    method: HTTPMethod,
    rule: string,
    func: AsyncFunction,
    cors?: boolean,
    compress?: boolean,
    cacheControl?: string,
    middlewares?: Middleware[],
  ): void {
    this.registerRoute(
      func,
      rule,
      method,
      cors,
      compress,
      cacheControl,
      middlewares ?? [],
    );
  }

  public appendContext(additionalContext?: Context): void {
    this.context = new Map([
      ...this.context.entries(),
      ...(additionalContext?.entries() || []),
    ]);
  }

  public clearContext(): void {
    this.context?.clear();
  }

  public delete(
    rule: string,
    middlewares?: Middleware[],
    cors?: boolean,
    compress?: boolean,
    cacheControl?: string,
  ) {
    return (
      target: any,
      propertyKey: string,
      _descriptor: PropertyDescriptor,
    ) => {
      this.registerRoute(
        target[propertyKey],
        rule,
        'DELETE',
        cors,
        compress,
        cacheControl,
        middlewares ?? [],
      );
    };
  }

  public get(
    rule: string,
    middlewares?: Middleware[],
    cors?: boolean,
    compress?: boolean,
    cacheControl?: string,
  ) {
    return (
      target: any,
      propertyKey: string,
      _descriptor: PropertyDescriptor,
    ) => {
      this.registerRoute(
        target[propertyKey],
        rule,
        'GET',
        cors,
        compress,
        cacheControl,
        middlewares ?? [],
      );
    };
  }

  public patch(
    rule: string,
    middlewares?: Middleware[],
    cors?: boolean,
    compress?: boolean,
    cacheControl?: string,
  ) {
    return (
      target: any,
      propertyKey: string,
      _descriptor: PropertyDescriptor,
    ) => {
      this.registerRoute(
        target[propertyKey],
        rule,
        'PATCH',
        cors,
        compress,
        cacheControl,
        middlewares ?? [],
      );
    };
  }

  public post(
    rule: string,
    middlewares?: Middleware[],
    cors?: boolean,
    compress?: boolean,
    cacheControl?: string,
  ) {
    return (
      target: any,
      propertyKey: string,
      _descriptor: PropertyDescriptor,
    ) => {
      this.registerRoute(
        target[propertyKey],
        rule,
        'POST',
        cors,
        compress,
        cacheControl,
        middlewares ?? [],
      );
    };
  }

  public put(
    rule: string,
    middlewares?: Middleware[],
    cors?: boolean,
    compress?: boolean,
    cacheControl?: string,
  ) {
    return (
      target: any,
      propertyKey: string,
      _descriptor: PropertyDescriptor,
    ) => {
      this.registerRoute(
        target[propertyKey],
        rule,
        'PUT',
        cors,
        compress,
        cacheControl,
        middlewares ?? [],
      );
    };
  }

  public abstract registerRoute(
    func: AsyncFunction,
    rule: string,
    method: HTTPMethod,
    cors?: boolean,
    compress?: boolean,
    cacheControl?: string,
    middlewares?: Middleware[],
  ): void;

  public route(
    rule: string,
    method: HTTPMethod,
    middlewares?: Middleware[],
    cors?: boolean,
    compress?: boolean,
    cacheControl?: string,
  ) {
    return (
      target: any,
      propertyKey: string,
      _descriptor: PropertyDescriptor,
    ) => {
      this.registerRoute(
        target[propertyKey],
        rule,
        method,
        cors,
        compress,
        cacheControl,
        middlewares ?? [],
      );
    };
  }
}

/**
 * Router for APIGateway Proxy Events
 */
class ApiGatewayResolver extends BaseRouter {
  public context: Context = new Map();
  public corsEnabled = false;
  public corsMethods: HTTPMethod = ['OPTIONS'];
  public routeKeys = new Set<string>();
  public routes: Route[] = [];

  constructor(
    public proxyType: ProxyEventType = ProxyEventType.APIGatewayProxyEvent,
    public cors?: CORSConfig,
    public debug?: boolean,
    public stripPrefixes: string[] = [],
  ) {
    super();
    this.corsEnabled = cors ? true : false;
  }

  /**
   * Add routes from the router
   *
   * @param router Event Router
   * @param prefix Base HTTP path
   */
  public includeRoutes(router: Router, prefix: string): void {
    for (const route of router.routes) {
      const routeText =
        route.rule instanceof RegExp ? route.rule.source : route.rule;
      if (prefix) {
        const prefixedPath =
          prefix === '/' ? routeText : `${prefix}${routeText}`;
        route.rule = this.compilePathRegex(prefixedPath);
        this.routes.push(route);
        this.routeKeys.add(routeText);
      }
    }
  }

  /**
   * Standard HTTP 404 Response
   *
   * @param method HTTP Method
   * @returns ResponseBuilder
   */
  public notFoundResponse(method: string): ResponseBuilder {
    let headers: Headers = {};
    if (this.cors) {
      headers = this.cors.headers();
      if (method === 'OPTIONS') {
        headers['Access-Control-Allow-Methods'] = (this.corsMethods as string[])
          .sort()
          .join(',');

        return new ResponseBuilder(new Response(204, undefined, '', headers));
      }
    }

    // IETF RFC 9457 compliant error response
    const notFoundProblemDocument = ProblemDocument.fromType(
      ProblemTypes.notFound,
      'No route found for the HTTP path',
    );

    return new ResponseBuilder(
      new Response(
        404,
        MIME_TYPE,
        JSON.stringify(notFoundProblemDocument),
        headers,
      ),
    );
  }

  /**
   * Register an HTTP route to the Router
   *
   * @param func Handler function
   * @param rule Path pattern
   * @param method HTTP method
   * @param cors CORS enabled/disabled
   * @param compress Compression enabled/disabled
   * @param cacheControl Cache-Control configuration
   * @param middlewares Middlewares that applies for this route
   */
  public registerRoute(
    func: AsyncFunction,
    rule: string,
    method: HTTPMethod,
    cors?: boolean,
    compress?: boolean,
    cacheControl?: string,
    middlewares?: Middleware[],
  ): void {
    const corsEnabled = cors ?? this.corsEnabled;
    for (const item of [method].flat()) {
      this.routes.push(
        new Route(
          method,
          this.compilePathRegex(rule),
          func,
          corsEnabled,
          compress,
          cacheControl,
          middlewares ?? [],
        ),
      );
      this.routeKeys.add(`${method}_${rule}`);
      if (corsEnabled) {
        (this.corsMethods as string[]).push(item.toUpperCase());
      }
    }
  }

  /**
   * Resolves the HTTP route to invoke for the incoming event and processes it
   *
   * @param event Incoming Event
   * @param context Lambda Context
   * @returns Response from route
   */
  public async resolve(
    event: BaseProxyEvent,
    context: LambdaContext,
  ): Promise<JSONData> {
    this.currentEvent = event;
    this.lambdaContext = context;

    return (await this._resolve()).build(
      this.currentEvent as BaseProxyEvent,
      this.cors,
    );
  }

  private async _resolve(): Promise<ResponseBuilder> {
    const method = this.currentEvent?.httpMethod?.toUpperCase() as string;
    const path = this.removePrefix(this.currentEvent?.path as string);
    this.routes.sort((a, b) =>
      b.rule.toString().localeCompare(a.rule.toString()),
    );
    for (const route of this.routes) {
      if (!route.method.includes(method)) {
        continue;
      }
      if (route.rule instanceof RegExp) {
        const matches = path.match(route.rule);
        if (matches) {
          return this.callRoute(route, this.currentEvent, this.lambdaContext, {
            ...matches.groups,
          });
        }
      }
    }

    return this.notFoundResponse(method);
  }

  private async callRoute(
    route: Route,
    event: BaseProxyEvent | undefined,
    context: LambdaContext | undefined,
    args: ArgsDict,
  ): Promise<ResponseBuilder> {
    return new ResponseBuilder(
      this.toResponse(
        await wrapWithMiddlewares<JSONData | Response>(
          route.middlewares,
          route.func as AsyncFunction<JSONData | Response>,
          args,
        )(event as BaseProxyEvent, context as LambdaContext, args),
      ),
      route,
    );
  }

  private compilePathRegex(rule: string, baseRegex = ROUTE_REGEX): PathPattern {
    const ruleRegex = rule.replace(
      DYNAMIC_ROUTE_PATTERN,
      NAMED_GROUP_BOUNDARY_PATTERN,
    );

    return new RegExp(baseRegex.replace('{}', ruleRegex));
  }

  private removePrefix(path: string): string {
    if (this.stripPrefixes) {
      for (const prefix of this.stripPrefixes) {
        if (path === prefix) {
          return '/';
        }
        if (path.startsWith(prefix)) {
          return path.slice(prefix.length);
        }
      }
    }

    return path;
  }

  private toResponse(result: Response | JSONData): Response {
    if (result instanceof Response) {
      return result;
    }

    if (
      result &&
      typeof result == 'object' &&
      'statusCode' in result &&
      'body' in result
    ) {
      const response = result as unknown as ResponseInterface;
      const contentType =
        lookupKeyFromMap(response.headers, 'Content-Type') ??
        response.contentType ??
        'application/json';

      return new Response(
        response.statusCode,
        contentType,
        response.body,
        response.headers,
      );
    }

    return new Response(200, 'application/json', JSON.stringify(result));
  }
}

/**
 * Simple Router
 */
class Router extends BaseRouter {
  public routes: Route[] = [];

  public registerRoute(
    func: AsyncFunction,
    rule: string,
    method: HTTPMethod,
    cors?: boolean,
    compress?: boolean,
    cacheControl?: string,
    middlewares?: Middleware[],
  ): void {
    this.routes.push(
      new Route(
        method,
        rule,
        func,
        cors,
        compress,
        cacheControl,
        middlewares ?? [],
      ),
    );
  }

  public route(
    method: HTTPMethod,
    rule: string,
    middlewares?: Middleware[],
    cors?: boolean,
    compress?: boolean,
    cacheControl?: string,
  ): any {
    return (
      _target: any,
      _propertyKey: string,
      _descriptor: PropertyDescriptor,
    ) => {
      this.registerRoute(
        _target[_propertyKey],
        rule,
        method,
        cors,
        compress,
        cacheControl,
        middlewares ?? [],
      );
    };
  }
}
