/**
 * Test Logger class
 *
 * @group unit/types/all
 */

import { BaseAPIGatewayProxyEvent, HTTPProxyEvent } from '../../../src/types';

describe('Class: BaseProxyEvent', () => {
  describe('Feature: HTTPProxyEvent', () => {
    test('should be able to cast APIGatewayProxyEvent to base event', () => {
      const event = {
        resource: '/v1/multi/one',
        httpMethod: 'GET',
        path: '/v1/multi/one',
        body: 'null',
        headers: {
          'test-header': 'test-value',
        },
        isBase64Encoded: false,
        multiValueHeaders: {},
        pathParameters: null,
        stageVariables: null,
        queryStringParameters: null,
        multiValueQueryStringParameters: null,
      } as BaseAPIGatewayProxyEvent;
      expect(event).toBeDefined();
      expect(event.resource).toBe('/v1/multi/one');
      expect(event.httpMethod).toBe('GET');
      expect(event.path).toBe('/v1/multi/one');
      expect(event.body).toBe('null');
      expect(event.headers['test-header']).toBe('test-value');
      expect(event.isBase64Encoded).toBe(false);
      expect(event.multiValueHeaders).toEqual({});
      expect(event.pathParameters).toBeNull();
      expect(event.stageVariables).toBeNull();
      expect(event.queryStringParameters).toBeNull();
      expect(event.multiValueQueryStringParameters).toBeNull();
    });

    test('should handle missing optional fields', () => {
      const event = {
        resource: '/v1/multi/one',
        httpMethod: 'POST',
        path: '/v1/multi/one',
        body: 'null',
        headers: {
          'test-header': 'test-value',
        },
        isBase64Encoded: false,
      } as unknown as BaseAPIGatewayProxyEvent;
      expect(event).toBeDefined();
      expect(event.resource).toBe('/v1/multi/one');
      expect(event.httpMethod).toBe('POST');
      expect(event.path).toBe('/v1/multi/one');
      expect(event.body).toBe('null');
      expect(event.headers['test-header']).toBe('test-value');
      expect(event.isBase64Encoded).toBe(false);
      expect(event.multiValueHeaders).toBeUndefined();
      expect(event.pathParameters).toBeUndefined();
      expect(event.stageVariables).toBeUndefined();
      expect(event.queryStringParameters).toBeUndefined();
      expect(event.multiValueQueryStringParameters).toBeUndefined();
    });

    test('should validate HTTPProxyEvent with all required fields', () => {
      const event = {
        httpMethod: 'PUT',
        body: 'test-body',
        headers: {
          'Content-Type': 'application/json',
        },
        isBase64Encoded: false,
        validate: HTTPProxyEvent.prototype.validate,
      } as HTTPProxyEvent;
      expect(() => event.validate()).not.toThrow();
    });

    const event1 = {
      body: 'test-body',
      headers: {
        'Content-Type': 'application/json',
      },
      isBase64Encoded: false,
      validate: HTTPProxyEvent.prototype.validate,
    } as unknown as HTTPProxyEvent;
    expect(() => event1.validate()).toThrow('HTTP method is required');

    const event2 = {
      httpMethod: 'DELETE',
      body: 'test-body',
      isBase64Encoded: false,
      validate: HTTPProxyEvent.prototype.validate,
    } as HTTPProxyEvent;
    expect(() => event2.validate()).toThrow('HTTP headers are required');
  });
});
