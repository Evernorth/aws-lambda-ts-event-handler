import { Router } from '../../src/ApiGatewayEventRouter';
import { AsyncFunction } from '../../src/types';

/**
 * Router tests
 *
 * @group unit/router/all
 */
describe('Class: Router', () => {
  describe('Feature: Base routing', () => {
    let router: Router;

    beforeEach(() => {
      router = new Router();
    });

    const testFunc: AsyncFunction<string> = (): Promise<string> =>
      Promise.resolve('');

    test('should register route declaratively', () => {
      router.registerRoute(testFunc, '/v1/test', 'GET');

      expect(router.routes).toHaveLength(1);
      expect(router.routes[0].method).toContain('GET');
      expect(router.routes[0].rule).toBe('/v1/test');
    });

    test('should register route via decorators', () => {
      // @ts-ignore
      class TestRouter {
        // @ts-ignore
        @router.route('GET', '/v1/test')
        public testFunc(): Promise<string> {
          return Promise.resolve('');
        }
      }

      expect(router.routes).toHaveLength(1);
      expect(router.routes[0].method).toContain('GET');
      expect(router.routes[0].rule).toBe('/v1/test');
    });
  });
});
