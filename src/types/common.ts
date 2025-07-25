import { APIGatewayProxyEvent } from 'aws-lambda';

/**
 * Dictionary of arguments.
 */
type ArgsDict = Record<string, unknown> | undefined;

/**
 * HTTP headers.
 */
type Headers = Record<string, string | undefined>;

/**
 * HTTP multi-value headers.
 */
type MultiValueHeaders = Record<string, string[] | undefined>;

/**
 * Path parameters.
 */
type PathParameters = Record<string, string | undefined>;

/**
 * Query string parameters.
 */
type QueryStringParameters = Record<string, string | undefined>;

/**
 * Multi-value query string parameters.
 */
type MultiValueQueryStringParameters = Record<string, string[] | undefined>;

/**
 * URL path.
 */
type Path = string;

/**
 * URL path pattern as a regular expression.
 */
type PathPattern = RegExp;

/**
 * HTTP request body.
 */
type Body = string | Buffer | undefined;

/**
 * Optional string type.
 */
type OptionalString = string | undefined | null;

/**
 * JSON data.
 */
type JSONData = Record<string, unknown> | undefined;

/**
 * Supported content types.
 */
type ContentType =
  | 'text/html'
  | 'text/plain'
  | 'application/xml'
  | 'application/json'
  | 'application/xhtml+xml';

/**
 * Context map.
 */
type Context = Map<string, unknown>;

/**
 * HTTP method type.
 */
type HTTPMethod = string | string[];

/**
 * Base API Gateway Proxy Event without request context.
 */
type BaseAPIGatewayProxyEvent = Omit<APIGatewayProxyEvent, 'requestContext'>;

/**
 * Asynchronous function type.
 * @template T - Return type of the function.
 */
type AsyncFunction<T = unknown> = (...args: unknown[]) => Promise<T>;

export {
  ArgsDict,
  AsyncFunction,
  BaseAPIGatewayProxyEvent,
  Body,
  ContentType,
  Context,
  HTTPMethod,
  Headers,
  JSONData,
  MultiValueHeaders,
  MultiValueQueryStringParameters,
  OptionalString,
  Path,
  PathParameters,
  PathPattern,
  QueryStringParameters,
};
