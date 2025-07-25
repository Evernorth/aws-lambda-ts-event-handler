import { APIGatewayProxyEvent } from 'aws-lambda';
import {
  Headers,
  MultiValueHeaders,
  MultiValueQueryStringParameters,
  QueryStringParameters,
} from './common';

/**
 * Base model for an HTTP Gateway Proxy event
 *
 * @category Model
 */
interface HTTPBaseProxyEvent {
  /** HTTP URL path */
  path?: string;

  /** JSON stringified Request body */
  body: string | null;

  /** HTTP Headers */
  headers: Headers;

  /** HTTP Multi-value headers */
  multiValueHeaders?: MultiValueHeaders;

  /** HTTP Request body transformed after parsing based on a schema */
  parsedBody?: unknown;

  /** HTTP Method */
  httpMethod: string;

  /** base-64 encoded indicator */
  isBase64Encoded: boolean;

  /** HTTP Query parameters */
  queryStringParameters?: QueryStringParameters;

  /** HTTP multi-value Query parameter */
  multiValueQueryStringParameters?: MultiValueQueryStringParameters;
}

/** Base type for HTTP Proxy event */
type BaseProxyEvent = HTTPBaseProxyEvent | APIGatewayProxyEvent;

/**
 * Abstract class representing a HTTP Proxy event
 *
 * @category Model
 */
abstract class HTTPProxyEvent implements HTTPBaseProxyEvent {
  public path?: string;
  public body: string | null = null;
  public headers: Headers = {};
  public multiValueHeaders?: MultiValueHeaders;
  public parsedBody?: unknown;
  public httpMethod: string = '';
  public isBase64Encoded: boolean = false;
  public queryStringParameters?: QueryStringParameters;
  public multiValueQueryStringParameters?: MultiValueQueryStringParameters;

  constructor(event: Partial<HTTPBaseProxyEvent>) {
    Object.assign(this, event);
  }

  /**
   * Validates the HTTP Proxy event
   * @throws Error if validation fails
   */
  validate(): void {
    if (!this.httpMethod) {
      throw new Error('HTTP method is required');
    }
    if (!this.headers) {
      throw new Error('HTTP headers are required');
    }
  }
}

export { BaseProxyEvent, HTTPBaseProxyEvent, HTTPProxyEvent };
