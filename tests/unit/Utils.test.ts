import { BaseProxyEvent } from '../../src/types';
import { lookupKeyFromMap } from '../../src/utils';

/**
 * Utils tests
 *
 * @group unit/utils/all
 */
describe('Class: Utils', () => {
  describe('Feature: Utils Testing', () => {
    test('should lookup headers from Incoming event if available', () => {
      const event = {
        httpMethod: 'GET',
        path: '/v1/multi/one',
        body: 'OK',
        headers: {
          'x-test': 'x-test-value'
        },
        isBase64Encoded: true,
        queryStringParameters: {
          'test-query': 'query-value'
        },
        pathParameters: {},
        multiValueHeaders: {},
        multiValueQueryStringParameters: {},
        stageVariables: {},
        resource: 'dummy'
      } as unknown as BaseProxyEvent;

      const result = lookupKeyFromMap(event.headers, 'x-test');
      expect(event.headers).toBeDefined();
      expect(result).toBeDefined();
      expect(result).toEqual('x-test-value');
    });

    test('lookup should return undefined if header is unavailable in Incoming event', () => {
      const event = {
        httpMethod: 'GET',
        path: '/v1/multi/one',
        body: 'OK',
        headers: {
        },
        isBase64Encoded: true,
        queryStringParameters: {},
        multiValueQueryStringParameters: {},
      } as BaseProxyEvent;

      const result = lookupKeyFromMap(event.headers, 'x-test');
      expect(result).toBeUndefined();
    });

  });
});
