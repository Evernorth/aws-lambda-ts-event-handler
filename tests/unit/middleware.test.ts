/**
 * Test Middleware
 *
 * @group unit/types/all
 */
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { Handler, Middleware, wrapWithMiddlewares } from '../../src/middleware';
import { ArgsDict, BaseProxyEvent, JSONData } from '../../src/types';

describe('wrapWithMiddlewares', () => {
  const mockEvent: BaseProxyEvent = {
    httpMethod: 'GET',
    path: '/test',
    body: null,
    headers: {},
    isBase64Encoded: false,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
  } as APIGatewayProxyEvent;
  const mockContext: Context = {
    awsRequestId: '123',
    functionName: 'test',
    invokedFunctionArn: 'arn',
    logGroupName: 'group',
    logStreamName: 'stream',
    memoryLimitInMB: '128',
  } as Context;
  const mockArgs: ArgsDict = {};

  const mockHandler: Handler<JSONData> = jest.fn(
    async (_event, _context, _args) => {
      return { message: 'handler response' };
    },
  );

  const mockMiddleware1: Middleware<JSONData> = jest.fn(
    async (_event, _context, _args, next) => {
      const result = await next();
      return { ...result, middleware1: true };
    },
  );

  const mockMiddleware2: Middleware<JSONData> = jest.fn(
    async (_event, _context, _args, next) => {
      const result = await next();
      return { ...result, middleware2: true };
    },
  );

  it('should call handler without middlewares', async () => {
    const wrappedHandler = wrapWithMiddlewares([], mockHandler);
    const response = await wrappedHandler(mockEvent, mockContext, mockArgs);

    expect(mockHandler).toHaveBeenCalledWith(mockEvent, mockContext, mockArgs);
    expect(response).toEqual({ message: 'handler response' });
  });

  it('should call handler with middlewares', async () => {
    const wrappedHandler = wrapWithMiddlewares(
      [mockMiddleware1, mockMiddleware2],
      mockHandler,
    );
    const response = await wrappedHandler(mockEvent, mockContext, mockArgs);

    expect(mockHandler).toHaveBeenCalledWith(mockEvent, mockContext, mockArgs);
    expect(mockMiddleware1).toHaveBeenCalledWith(
      mockEvent,
      mockContext,
      mockArgs,
      expect.any(Function),
    );
    expect(mockMiddleware2).toHaveBeenCalledWith(
      mockEvent,
      mockContext,
      mockArgs,
      expect.any(Function),
    );
    expect(response).toEqual({
      message: 'handler response',
      middleware1: true,
      middleware2: true,
    });
  });

  it('should handle middleware errors', async () => {
    const errorMiddleware: Middleware<JSONData> = jest.fn(
      async (_event, _context, _args, _next) => {
        throw new Error('middleware error');
      },
    );

    const wrappedHandler = wrapWithMiddlewares([errorMiddleware], mockHandler);

    await expect(
      wrappedHandler(mockEvent, mockContext, mockArgs),
    ).rejects.toThrow('middleware error');
  });
});
