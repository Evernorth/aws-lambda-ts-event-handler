/**
 * Test ApiGateway Handler
 *
 * @group unit/types/all
 */
import { jest } from '@jest/globals';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import {
  ApiGatewayResolver,
  ProxyEventType,
  ResponseBuilder,
  Router,
} from '../../src/ApiGatewayEventRouter';
import { Response } from '../../src/types/Response';
import { AsyncFunction, CORSConfig, JSONData, Route } from '../../src/types';
import { Middleware } from '../../src/middleware';

describe('Class: ApiGateway', () => {
  let app: ApiGatewayResolver;
  const testFunc: AsyncFunction<Response> = (): Promise<Response> =>
    Promise.resolve(new Response(200));

  beforeAll(() => {
    app = new ApiGatewayResolver();
  });

  const testCases: [
    string,
    string,
    string,
    number,
    { [key: string]: string }?,
  ][] = [
    ['GET', '/', '/', 200],
    ['GET', '/single', '/single', 200],
    ['GET', '/two/paths', '/two/paths', 200],
    ['GET', '/multiple/paths/in/url', '/multiple/paths/in/url', 200],
    ['GET', '/test', '/invalid/url', 404],
    ['POST', '/single', '/single', 200],
    ['PUT', '/single', '/single', 200],
    ['PATCH', '/single', '/single', 200],
    ['DELETE', '/single', '/single', 200],
    ['GET', '/single/<single_id>', '/single/1234', 200, { single_id: '1234' }],
    ['GET', '/single/test', '/single/test', 200],
    ['GET', '/single/<single_id>', '/invalid/1234', 404],
    [
      'GET',
      '/single/<single_id>/double/<double_id>',
      '/single/1234/double/5678',
      200,
      { single_id: '1234', double_id: '5678' },
    ],
    [
      'GET',
      '/single/<single_id>/double/<double_id>',
      '/single/1234/invalid/5678',
      404,
    ],
  ];

  describe.each(testCases)(
    'Pattern Match:',
    (
      routeMethod: string,
      routeRule: string,
      testPath: string,
      expectedHTTPCode: number,
      expectedPathParams?: { [key: string]: string },
    ) => {
      beforeAll(() => {
        app.addRoute(routeMethod, routeRule, testFunc);
      });

      test(`should resolve method: ${routeMethod} rule:${routeRule}`, async () => {
        const event = {
          httpMethod: routeMethod,
          path: testPath,
          body: null,
          headers: {},
          isBase64Encoded: false,
          queryStringParameters: null,
          multiValueQueryStringParameters: null,
        } as APIGatewayProxyEvent;

        const response = await app.resolve(event, {} as Context);
        expect(response?.statusCode).toEqual(expectedHTTPCode);
      });

      test(`should resolve path parameters in method: ${routeMethod} rule:${routeRule}`, async () => {
        const event = {
          httpMethod: routeMethod,
          path: testPath,
          body: null,
          headers: {},
          isBase64Encoded: false,
          queryStringParameters: null,
          multiValueQueryStringParameters: null,
        } as APIGatewayProxyEvent;

        const spyCallRoute = jest
          .spyOn(ApiGatewayResolver.prototype as any, 'callRoute')
          .mockImplementation(() => new ResponseBuilder(new Response(200)));

        await app.resolve(event, {} as Context);
        if (expectedHTTPCode === 200 && expectedPathParams) {
          expect(spyCallRoute).toHaveBeenCalled();
          expect(spyCallRoute.mock.calls[0][3]).toEqual(expectedPathParams);
        }

        spyCallRoute.mockRestore();
      });
    },
  );

  describe.each(testCases)(
    '(Decorator) Pattern Match:',
    (
      routeMethod,
      routeRule,
      testPath,
      expectedHTTPCode,
      expectedPathParams,
    ) => {
      const app: ApiGatewayResolver = new ApiGatewayResolver();

      beforeAll(() => {
        class TestRouter {
          @app.route(routeRule, routeMethod)
          public test(): void {}
        }
        new TestRouter();
      });

      test(`should resolve method: ${routeMethod} rule:${routeRule}`, async () => {
        const event = {
          httpMethod: routeMethod,
          path: testPath,
          body: null,
          headers: {},
          isBase64Encoded: false,
          queryStringParameters: null,
          multiValueQueryStringParameters: null,
        } as APIGatewayProxyEvent;

        const response = await app.resolve(event, {} as Context);
        expect(response?.statusCode).toEqual(expectedHTTPCode);
      });

      test(`should resolve path parameters in method: ${routeMethod} rule:${routeRule}`, async () => {
        const event = {
          httpMethod: routeMethod,
          path: testPath,
          body: null,
          headers: {},
          isBase64Encoded: false,
          queryStringParameters: null,
          multiValueQueryStringParameters: null,
        } as APIGatewayProxyEvent;

        const spyCallRoute = jest
          .spyOn(ApiGatewayResolver.prototype as any, 'callRoute')
          .mockImplementation(() => new ResponseBuilder(new Response(200)));

        await app.resolve(event, {} as Context);
        if (expectedHTTPCode === 200 && expectedPathParams) {
          expect(spyCallRoute).toHaveBeenCalled();
          expect(spyCallRoute.mock.calls[0][3]).toEqual(expectedPathParams);
        }

        spyCallRoute.mockRestore();
      });
    },
  );

  describe('Route Convenient HTTP method decorators test', () => {
    const app: ApiGatewayResolver = new ApiGatewayResolver();

    class TestRouter {
      @app.delete('/test')
      public deleteTest(): Response {
        return new Response(200);
      }

      @app.get('/test')
      public getTest(): Response {
        return new Response(200);
      }

      @app.patch('/test')
      public patchTest(): Response {
        return new Response(200);
      }

      @app.post('/test')
      public postTest(): Response {
        return new Response(200);
      }

      @app.put('/test')
      public putTest(): Response {
        return new Response(200);
      }
    }
    new TestRouter();

    const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

    describe.each(methods)('(Decorator) Pattern Match:', (routeMethod) => {
      test(`should resolve ${routeMethod} configured through decorators`, async () => {
        const event = {
          httpMethod: routeMethod,
          path: '/test',
          body: null,
          headers: {},
          isBase64Encoded: false,
          queryStringParameters: null,
          multiValueQueryStringParameters: null,
        } as APIGatewayProxyEvent;

        const response = await app.resolve(event, {} as Context);
        expect(response?.statusCode).toEqual(200);
      });
    });
  });

  describe('Feature: Multi-routers resolving', () => {
    let multiRouterApp: ApiGatewayResolver;
    const stripPrefixes = ['/base-path'];

    beforeEach(() => {
      multiRouterApp = new ApiGatewayResolver(
        ProxyEventType.APIGatewayProxyEventV2,
        new CORSConfig('*', ['test_header']),
        false,
        stripPrefixes,
      );
    });

    test('should resolve path when one router is added to BaseRouter', async () => {
      const event = {
        httpMethod: 'GET',
        path: '/v1/multi/one',
        body: null,
        headers: {},
        isBase64Encoded: false,
        queryStringParameters: null,
        multiValueQueryStringParameters: null,
      } as APIGatewayProxyEvent;

      const route = new Route('GET', '/multi/one', testFunc);
      const router = new Router();
      router.registerRoute(route.func, route.rule as string, route.method);

      multiRouterApp.includeRoutes(router, '/v1');
      const response = await multiRouterApp.resolve(event, {} as Context);
      expect(response?.statusCode).toEqual(200);
    });

    test('should resolve path when one router is added to BaseRouter with Cors Configuration', async () => {
      const event = {
        httpMethod: 'GET',
        path: '/v1/multi/one',
        body: null,
        headers: {},
        isBase64Encoded: false,
        queryStringParameters: null,
        multiValueQueryStringParameters: null,
      } as APIGatewayProxyEvent;

      const route = new Route('GET', '/v1/multi/one', testFunc, true);
      multiRouterApp.registerRoute(
        route.func,
        route.rule as string,
        route.method,
        route.cors,
      );

      const response = await multiRouterApp.resolve(event, {} as Context);
      expect(response?.statusCode).toEqual(200);
    });

    test('should resolve any path after stripping prefix', async () => {
      const event = {
        httpMethod: 'GET',
        path: '/base-path/v1/multi/one',
        body: null,
        headers: {},
        isBase64Encoded: false,
        queryStringParameters: null,
        multiValueQueryStringParameters: null,
      } as APIGatewayProxyEvent;

      const route = new Route('GET', new RegExp('/multi/one'), testFunc);
      const router = new Router();
      router.registerRoute(route.func, route.rule as string, route.method);

      multiRouterApp.includeRoutes(router, '/v1');
      const response = await multiRouterApp.resolve(event, {} as Context);
      expect(response?.statusCode).toEqual(200);
    });

    test('should resolve base path / after stripping prefix', async () => {
      const event = {
        httpMethod: 'GET',
        path: '/base-path',
        body: null,
        headers: {},
        isBase64Encoded: false,
        queryStringParameters: null,
        multiValueQueryStringParameters: null,
      } as APIGatewayProxyEvent;

      const route = new Route('GET', '/', testFunc);
      const router = new Router();
      router.registerRoute(route.func, route.rule as string, route.method);

      multiRouterApp.includeRoutes(router, '/');
      const response = await multiRouterApp.resolve(event, {} as Context);
      expect(response?.statusCode).toEqual(200);
    });

    test('should resolve options method', async () => {
      const event = {
        httpMethod: 'OPTIONS',
        path: '/base-path',
        body: null,
        headers: {},
        isBase64Encoded: false,
        queryStringParameters: null,
        multiValueQueryStringParameters: null,
      } as APIGatewayProxyEvent;

      const route = new Route('GET', '/', testFunc);
      const router = new Router();
      router.registerRoute(route.func, route.rule as string, route.method);

      multiRouterApp.includeRoutes(router, '/');
      const response = await multiRouterApp.resolve(event, {} as Context);
      expect(response?.statusCode).toEqual(204);
    });

    test('should resolve path when multiple routers are added to BaseRouter', async () => {
      const route = new Route('GET', '/multi/one', testFunc);
      const router1 = new Router();
      router1.registerRoute(route.func, route.rule as string, route.method);

      const router2 = new Router();
      router2.registerRoute(route.func, route.rule as string, route.method);

      multiRouterApp.includeRoutes(router1, '/v1');
      multiRouterApp.includeRoutes(router2, '/v2');

      let event = {
        httpMethod: 'GET',
        path: '/v1/multi/one',
        body: null,
        headers: {},
        isBase64Encoded: false,
        queryStringParameters: null,
        multiValueQueryStringParameters: null,
      } as APIGatewayProxyEvent;

      let response = await multiRouterApp.resolve(event, {} as Context);
      expect(response?.statusCode).toEqual(200);

      event.path = '/v2/multi/one';
      response = await multiRouterApp.resolve(event, {} as Context);
      expect(response?.statusCode).toEqual(200);
    });
  });

  describe('Feature: Middlewares', () => {
    let multiRouterApp: ApiGatewayResolver;
    const stripPrefixes = ['/base-path'];

    beforeEach(() => {
      multiRouterApp = new ApiGatewayResolver(
        ProxyEventType.APIGatewayProxyEventV2,
        new CORSConfig('*', ['test_header']),
        false,
        stripPrefixes,
      );
    });

    test('should resolve path when one router is added to BaseRouter', async () => {
      const event = {
        httpMethod: 'GET',
        path: '/v1/multi/one',
        body: null,
        headers: {},
        isBase64Encoded: false,
        queryStringParameters: null,
        multiValueQueryStringParameters: null,
      } as APIGatewayProxyEvent;

      const route = new Route('GET', '/multi/one', testFunc);
      const router = new Router();

      const TestMiddleware =
        (): Middleware<JSONData | Response> =>
        async (_event, _context, _args, next) =>
          await next();

      router.registerRoute(
        route.func,
        route.rule as string,
        route.method,
        route.cors,
        route.compress,
        route.cacheControl,
        [TestMiddleware()],
      );

      multiRouterApp.includeRoutes(router, '/v1');
      const response = await multiRouterApp.resolve(event, {} as Context);
      expect(response?.statusCode).toEqual(200);
    });
  });

  describe('Feature: Resolver context', () => {
    let app: ApiGatewayResolver;

    beforeAll(() => {
      app = new ApiGatewayResolver();
    });

    test('should be able to add additional context to resolver', () => {
      app.clearContext();
      app.appendContext(new Map());
      app.appendContext(new Map([['test_context', 'test_value']]));
      app.appendContext(new Map([['test_context', 'test_value']]));
      expect(app.context).toBeDefined();
      app.appendContext(new Map([['add_context', 'add_value']]));
      app.appendContext(new Map());
      app.appendContext(undefined);
      app.clearContext();
    });
  });
});
