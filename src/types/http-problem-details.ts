import { v4 as uuidv4 } from 'uuid';
/**
 * Constants for Problem Details
 */
export const MIME_TYPE = 'application/problem+json';
export const UUID_PREFIX = 'urn:uuid:';

/**
 * Problem type definition as per RFC 9457
 */
export interface ProblemType {
  readonly code: number;
  readonly urn: string;
  readonly title: string;
}

/**
 * Problem document as per RFC 9457
 */
export class ProblemDocument {
  type?: string;
  status: number;
  title?: string;
  detail?: string;
  instance: string;
  created: string;
  extensions?: Record<string, unknown>;

  /**
   * Create a new problem document
   */
  constructor(options: {
    type?: string;
    status: number;
    title?: string;
    detail?: string;
    instance?: string;
    extensions?: Record<string, unknown>;
  }) {
    this.type = options.type;
    this.status = options.status;
    this.title = options.title;
    this.detail = options.detail;
    this.instance = options.instance || `${UUID_PREFIX}${uuidv4()}`;
    this.created = new Date().toISOString();
    this.extensions = options.extensions;
  }

  /**
   * Create a problem document from a problem type
   */
  static fromType(
    problemType: ProblemType,
    detail?: string,
    extensions?: Record<string, unknown>,
  ): ProblemDocument {
    return new ProblemDocument({
      type: problemType.urn,
      status: problemType.code,
      title: problemType.title,
      detail,
      extensions,
    });
  }
}

/**
 * Standard HTTP problem types
 */
export const ProblemTypes = {
  badRequest: {
    code: 400,
    urn: 'urn:problems:bad-request',
    title: 'Request could not be processed because it is invalid.',
  } as ProblemType,

  unauthorized: {
    code: 401,
    urn: 'urn:problems:unauthorized',
    title: 'Authentication required.',
  } as ProblemType,

  forbidden: {
    code: 403,
    urn: 'urn:problems:forbidden',
    title: 'User is not authorized to perform the requested operation.',
  } as ProblemType,

  notFound: {
    code: 404,
    urn: 'urn:problems:not-found',
    title: 'The specified resource could not be found.',
  } as ProblemType,

  methodNotAllowed: {
    code: 405,
    urn: 'urn:problems:method-not-allowed',
    title: 'The specified method is not allowed.',
  } as ProblemType,

  conflict: {
    code: 409,
    urn: 'urn:problems:conflict',
    title:
      'Request could not be completed due to a conflict with the current state of the resource.',
  } as ProblemType,

  tooManyRequests: {
    code: 429,
    urn: 'urn:problems:too-many-requests',
    title: 'User has sent too many requests.',
  } as ProblemType,

  internalServerError: {
    code: 500,
    urn: 'urn:problems:internal-server-error',
    title: 'An unexpected error occurred.',
  } as ProblemType,

  badGateway: {
    code: 502,
    urn: 'urn:problems:bad-gateway',
    title: 'Invalid response from upstream server.',
  } as ProblemType,

  serviceUnavailable: {
    code: 503,
    urn: 'urn:problems:service-unavailable',
    title: 'Service is temporarily unavailable.',
  } as ProblemType,

  gatewayTimeout: {
    code: 504,
    urn: 'urn:problems:gateway-timeout',
    title: 'Timeout invoking upstream server.',
  } as ProblemType,
};

/**
 * Helper for creating problem documents
 */
export const Problems = {
  badRequest: (detail?: string, extensions?: Record<string, unknown>) =>
    ProblemDocument.fromType(ProblemTypes.badRequest, detail, extensions),

  unauthorized: (detail?: string, extensions?: Record<string, unknown>) =>
    ProblemDocument.fromType(ProblemTypes.unauthorized, detail, extensions),

  forbidden: (detail?: string, extensions?: Record<string, unknown>) =>
    ProblemDocument.fromType(ProblemTypes.forbidden, detail, extensions),

  notFound: (detail?: string, extensions?: Record<string, unknown>) =>
    ProblemDocument.fromType(ProblemTypes.notFound, detail, extensions),

  methodNotAllowed: (detail?: string, extensions?: Record<string, unknown>) =>
    ProblemDocument.fromType(ProblemTypes.methodNotAllowed, detail, extensions),

  conflict: (detail?: string, extensions?: Record<string, unknown>) =>
    ProblemDocument.fromType(ProblemTypes.conflict, detail, extensions),

  tooManyRequests: (detail?: string, extensions?: Record<string, unknown>) =>
    ProblemDocument.fromType(ProblemTypes.tooManyRequests, detail, extensions),

  internalServerError: (
    detail?: string,
    extensions?: Record<string, unknown>,
  ) =>
    ProblemDocument.fromType(
      ProblemTypes.internalServerError,
      detail,
      extensions,
    ),

  badGateway: (detail?: string, extensions?: Record<string, unknown>) =>
    ProblemDocument.fromType(ProblemTypes.badGateway, detail, extensions),

  serviceUnavailable: (detail?: string, extensions?: Record<string, unknown>) =>
    ProblemDocument.fromType(
      ProblemTypes.serviceUnavailable,
      detail,
      extensions,
    ),

  gatewayTimeout: (detail?: string, extensions?: Record<string, unknown>) =>
    ProblemDocument.fromType(ProblemTypes.gatewayTimeout, detail, extensions),
};
