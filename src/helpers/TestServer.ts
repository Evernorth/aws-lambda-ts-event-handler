import { Context, Handler as AWSHandler } from 'aws-lambda';
import { Handler } from '../middleware';
import {
  IncomingMessage,
  createServer,
  ServerResponse,
  Server,
} from 'node:http';
import {
  BaseProxyEvent,
  MultiValueHeaders,
  Response,
  Headers,
  QueryStringParameters,
  MultiValueQueryStringParameters,
  ResponseInterface,
  ContentType,
} from '../types';
import { lookupKeyFromMap } from '../utils';
import {
  MIME_TYPE,
  ProblemDocument,
  ProblemTypes,
} from '../types/http-problem-details';

const TEST_SERVER_PORT = Number(process.env.TEST_SERVER_PORT) || 4000;
process.env.MODE = 'LOCAL';

/**
 * A simplistic HTTP test server for local testing
 *
 * @category Local Testing
 */
class LocalTestServer {
  /** AWS Lambda handler function */
  public handlerFn: Handler;

  /** An HTTP Server */
  private server: Server;

  /** instance of the `LocalTestServer` */
  private static instance: LocalTestServer;

  private constructor(handlerFn: Handler | AWSHandler) {
    this.handlerFn = handlerFn as unknown as Handler;
    this.server = createServer();
    this.registerHandler();
  }

  /**
   * Creates a singleton instance of `LocalTestServer` and returns it
   *
   * @param handlerFn AWS Lambda handler function that the test server routes requests to
   * @returns an instance of `LocalTestServer`
   */
  public static getInstance(handlerFn: Handler | AWSHandler): LocalTestServer {
    if (!this.instance) {
      this.instance = new LocalTestServer(handlerFn);
    }

    return this.instance;
  }

  /**
   * Starts the HTTP server
   *
   * @param port HTTP server port
   */
  public start(port: number = TEST_SERVER_PORT): void {
    this.server.listen(port, () =>
      console.log(`Test server listening on port ${port}`),
    );
  }

  /**
   * Creates an AWS Lambda function aligned HTTP request (APIGateway Proxy request)
   *
   * @param req incoming HTTP request
   * @returns a Base proxy event (APIGateway Proxy request)
   *
   * @internal
   */
  private async constructRequestEvent(
    req: IncomingMessage,
  ): Promise<BaseProxyEvent> {
    try {
      const { url, method, headers: reqHeaders } = req;
      const [path, queryString] = (url as string).split('?');
      const queryStringParameters: QueryStringParameters = {};
      const multiValueQueryStringParameters: MultiValueQueryStringParameters =
        {};

      if (queryString) {
        queryString.split('&').forEach((token) => {
          const [key, value] = token.split('=');
          const values = value.split(',').map((s) => s.trim());
          if (values.length > 1) {
            multiValueQueryStringParameters[key] = values;
          } else {
            queryStringParameters[key] = value;
          }
        });
      }

      const headers: Headers = {};
      const multiValueHeaders: MultiValueHeaders = {};
      Object.entries(reqHeaders).forEach(([key, value]) => {
        const values = (value as string).split(',').map((s) => s.trim());
        if (values.length > 1) {
          multiValueHeaders[key] = values;
        } else {
          headers[key] = value as string;
        }
      });

      const bodyChunks: Buffer[] = [];
      for await (const chunk of req) {
        bodyChunks.push(chunk);
      }
      const body = Buffer.concat(bodyChunks).toString();
      if (!headers['content-length']) {
        headers['content-length'] = String(Buffer.byteLength(body));
      }

      return {
        httpMethod: method as string,
        path,
        headers,
        multiValueHeaders,
        queryStringParameters,
        multiValueQueryStringParameters,
        body,
        requestContext: {},
      } as BaseProxyEvent;
    } catch (error) {
      console.error('Error constructing request event:', error);
      throw new Error('Failed to construct request event');
    }
  }

  /**
   * Creates an HTTP server response from the AWS Lambda handler's response.
   *
   * @param handlerResponse response from the Handler
   * @param res HTTP response
   * @param contentType HTTP content type
   *
   * @internal
   */
  private constructResponse(
    handlerResponse: Response,
    res: ServerResponse,
    contentType?: ContentType,
  ): void {
    try {
      res.statusCode = handlerResponse.statusCode;
      const cType = contentType || 'application/json';

      if (handlerResponse.headers) {
        Object.entries(handlerResponse.headers).forEach(([key, value]) => {
          res.setHeader(key, value as string);
        });
      }

      let body = '';
      if (handlerResponse.body) {
        if (typeof handlerResponse.body !== 'string') {
          body = JSON.stringify(handlerResponse.body);
          res.setHeader('content-type', cType);
        } else {
          body = handlerResponse.body as string;
        }
      }

      res.setHeader('content-length', String(Buffer.byteLength(body)));
      res.write(body);
    } catch (error) {
      console.error('Error constructing response:', error);

      // IETF RFC 9457 compliant error response
      const internalServerErrorProblemDocument = ProblemDocument.fromType(
        ProblemTypes.internalServerError,
        `Error constructing response: ${error}`,
      );

      res.statusCode = 500;
      res.setHeader('content-type', MIME_TYPE);
      res.write(JSON.stringify(internalServerErrorProblemDocument));
    } finally {
      res.end();
    }
  }

  /**
   * Registers the AWS Lambda handler function to the HTTP server
   */
  private registerHandler(): void {
    this.server.on(
      'request',
      async (req: IncomingMessage, res: ServerResponse) => {
        try {
          const event = await this.constructRequestEvent(req);
          const handlerResponse = await this.handlerFn(event, {} as Context);
          this.constructResponse(
            this.toResponse(handlerResponse as Response),
            res,
          );
        } catch (error) {
          console.error('Error handling request:', error);

          // IETF RFC 9457 compliant error response
          const internalServerErrorProblemDocument = ProblemDocument.fromType(
            ProblemTypes.internalServerError,
            `Error handling request: ${error}`,
          );
          res.statusCode = 500;
          res.setHeader('Content-Type', MIME_TYPE);
          res.write(JSON.stringify(internalServerErrorProblemDocument));
          res.end();
        }
      },
    );
  }

  /**
   * Convert to HTTP Response format
   *
   * @param result result from the handler function
   * @param contentType HTTP content type
   * @returns standard HTTP response structure for synchronous AWS Lambda function
   */
  private toResponse(result: Response, contentType?: ContentType): Response {
    if (result instanceof Response) {
      return result;
    }

    const response = result as ResponseInterface;
    const cType =
      contentType ??
      lookupKeyFromMap(response.headers, 'Content-Type') ??
      'application/json';

    return new Response(
      response.statusCode,
      cType,
      response.body,
      response.headers,
    );
  }
}

export { LocalTestServer, TEST_SERVER_PORT };
