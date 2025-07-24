/**
 * Test HTTP Problem Details
 *
 * @group unit/types/all
 */

import { v4 as uuidv4 } from 'uuid';
import {
  MIME_TYPE,
  UUID_PREFIX,
  ProblemType,
  ProblemDocument,
  ProblemTypes,
  Problems,
} from '../../../src/types/http-problem-details';

// Mock uuid for consistent testing
jest.mock('uuid');

describe('Module: http-problem-details', () => {
  // Setup for consistent UUID
  beforeEach(() => {
    (uuidv4 as jest.Mock).mockReturnValue('test-uuid-value');
  });

  describe('Constants', () => {
    test('should export MIME_TYPE constant', () => {
      expect(MIME_TYPE).toBeDefined();
      expect(MIME_TYPE).toEqual('application/problem+json');
    });

    test('should export UUID_PREFIX constant', () => {
      expect(UUID_PREFIX).toBeDefined();
      expect(UUID_PREFIX).toEqual('urn:uuid:');
    });
  });

  describe('ProblemTypes', () => {
    test('should define all standard HTTP problem types', () => {
      expect(ProblemTypes.badRequest).toBeDefined();
      expect(ProblemTypes.unauthorized).toBeDefined();
      expect(ProblemTypes.forbidden).toBeDefined();
      expect(ProblemTypes.notFound).toBeDefined();
      expect(ProblemTypes.methodNotAllowed).toBeDefined();
      expect(ProblemTypes.conflict).toBeDefined();
      expect(ProblemTypes.tooManyRequests).toBeDefined();
      expect(ProblemTypes.internalServerError).toBeDefined();
      expect(ProblemTypes.badGateway).toBeDefined();
      expect(ProblemTypes.serviceUnavailable).toBeDefined();
      expect(ProblemTypes.gatewayTimeout).toBeDefined();
    });

    test('should have correct properties for each problem type', () => {
      // Test a few representative types
      expect(ProblemTypes.badRequest.code).toEqual(400);
      expect(ProblemTypes.badRequest.urn).toEqual('urn:problems:bad-request');
      expect(ProblemTypes.badRequest.title).toEqual(
        'Request could not be processed because it is invalid.',
      );

      expect(ProblemTypes.notFound.code).toEqual(404);
      expect(ProblemTypes.notFound.urn).toEqual('urn:problems:not-found');
      expect(ProblemTypes.notFound.title).toEqual(
        'The specified resource could not be found.',
      );

      expect(ProblemTypes.internalServerError.code).toEqual(500);
      expect(ProblemTypes.internalServerError.urn).toEqual(
        'urn:problems:internal-server-error',
      );
      expect(ProblemTypes.internalServerError.title).toEqual(
        'An unexpected error occurred.',
      );
    });
  });

  describe('Class: ProblemDocument', () => {
    test('should create a problem document with provided values', () => {
      const now = new Date();
      // Save the original Date constructor
      const OriginalDate = global.Date;
      // Mock Date to return a fixed value
      global.Date = jest.fn(() => now) as any;
      global.Date.UTC = OriginalDate.UTC;
      global.Date.parse = OriginalDate.parse;
      global.Date.now = OriginalDate.now;

      const problemDoc = new ProblemDocument({
        type: 'test:type',
        status: 418,
        title: "I'm a teapot",
        detail: 'Cannot brew coffee in a teapot',
        instance: 'test:instance',
        extensions: { key: 'value' },
      });

      expect(problemDoc.type).toEqual('test:type');
      expect(problemDoc.status).toEqual(418);
      expect(problemDoc.title).toEqual("I'm a teapot");
      expect(problemDoc.detail).toEqual('Cannot brew coffee in a teapot');
      expect(problemDoc.instance).toEqual('test:instance');
      expect(problemDoc.created).toEqual(now.toISOString());
      expect(problemDoc.extensions).toEqual({ key: 'value' });

      // Restore the original Date constructor
      global.Date = OriginalDate;
    });

    test('should generate instance if not provided', () => {
      const problemDoc = new ProblemDocument({
        status: 500,
      });

      expect(problemDoc.instance).toEqual(`${UUID_PREFIX}test-uuid-value`);
    });

    test('should create a problem document from a problem type', () => {
      const now = new Date();
      // Save the original Date constructor
      const OriginalDate = global.Date;
      // Mock Date to return a fixed value
      global.Date = jest.fn(() => now) as any;
      global.Date.UTC = OriginalDate.UTC;
      global.Date.parse = OriginalDate.parse;
      global.Date.now = OriginalDate.now;

      const problemType: ProblemType = {
        code: 418,
        urn: 'test:type',
        title: 'Test Title',
      };

      const detail = 'Test detail';
      const extensions = { key: 'value' };

      const problemDoc = ProblemDocument.fromType(
        problemType,
        detail,
        extensions,
      );

      expect(problemDoc.type).toEqual(problemType.urn);
      expect(problemDoc.status).toEqual(problemType.code);
      expect(problemDoc.title).toEqual(problemType.title);
      expect(problemDoc.detail).toEqual(detail);
      expect(problemDoc.instance).toEqual(`${UUID_PREFIX}test-uuid-value`);
      expect(problemDoc.created).toEqual(now.toISOString());
      expect(problemDoc.extensions).toEqual(extensions);

      // Restore the original Date constructor
      global.Date = OriginalDate;
    });
  });

  describe('Problems Helper', () => {
    test('should create a badRequest problem document', () => {
      const detail = 'Invalid input';
      const extensions = { fields: ['name', 'email'] };
      const problem = Problems.badRequest(detail, extensions);

      expect(problem.type).toEqual(ProblemTypes.badRequest.urn);
      expect(problem.status).toEqual(ProblemTypes.badRequest.code);
      expect(problem.title).toEqual(ProblemTypes.badRequest.title);
      expect(problem.detail).toEqual(detail);
      expect(problem.extensions).toEqual(extensions);
    });

    test('should create an unauthorized problem document', () => {
      const detail = 'Authentication required';
      const problem = Problems.unauthorized(detail);

      expect(problem.type).toEqual(ProblemTypes.unauthorized.urn);
      expect(problem.status).toEqual(ProblemTypes.unauthorized.code);
      expect(problem.title).toEqual(ProblemTypes.unauthorized.title);
      expect(problem.detail).toEqual(detail);
    });

    test('should create a forbidden problem document', () => {
      const detail = 'Access denied';
      const problem = Problems.forbidden(detail);

      expect(problem.type).toEqual(ProblemTypes.forbidden.urn);
      expect(problem.status).toEqual(ProblemTypes.forbidden.code);
      expect(problem.title).toEqual(ProblemTypes.forbidden.title);
      expect(problem.detail).toEqual(detail);
    });

    test('should create a notFound problem document', () => {
      const detail = 'Resource not found';
      const problem = Problems.notFound(detail);

      expect(problem.type).toEqual(ProblemTypes.notFound.urn);
      expect(problem.status).toEqual(ProblemTypes.notFound.code);
      expect(problem.title).toEqual(ProblemTypes.notFound.title);
      expect(problem.detail).toEqual(detail);
    });

    test('should create a methodNotAllowed problem document', () => {
      const detail = 'Method not allowed';
      const problem = Problems.methodNotAllowed(detail);

      expect(problem.type).toEqual(ProblemTypes.methodNotAllowed.urn);
      expect(problem.status).toEqual(ProblemTypes.methodNotAllowed.code);
      expect(problem.title).toEqual(ProblemTypes.methodNotAllowed.title);
      expect(problem.detail).toEqual(detail);
    });

    test('should create a conflict problem document', () => {
      const detail = 'Resource already exists';
      const problem = Problems.conflict(detail);

      expect(problem.type).toEqual(ProblemTypes.conflict.urn);
      expect(problem.status).toEqual(ProblemTypes.conflict.code);
      expect(problem.title).toEqual(ProblemTypes.conflict.title);
      expect(problem.detail).toEqual(detail);
    });

    test('should create a tooManyRequests problem document', () => {
      const detail = 'Rate limit exceeded';
      const problem = Problems.tooManyRequests(detail);

      expect(problem.type).toEqual(ProblemTypes.tooManyRequests.urn);
      expect(problem.status).toEqual(ProblemTypes.tooManyRequests.code);
      expect(problem.title).toEqual(ProblemTypes.tooManyRequests.title);
      expect(problem.detail).toEqual(detail);
    });

    test('should create an internalServerError problem document', () => {
      const problem = Problems.internalServerError();

      expect(problem.type).toEqual(ProblemTypes.internalServerError.urn);
      expect(problem.status).toEqual(ProblemTypes.internalServerError.code);
      expect(problem.title).toEqual(ProblemTypes.internalServerError.title);
    });

    test('should create a badGateway problem document', () => {
      const detail = 'Invalid upstream response';
      const problem = Problems.badGateway(detail);

      expect(problem.type).toEqual(ProblemTypes.badGateway.urn);
      expect(problem.status).toEqual(ProblemTypes.badGateway.code);
      expect(problem.title).toEqual(ProblemTypes.badGateway.title);
      expect(problem.detail).toEqual(detail);
    });

    test('should create a serviceUnavailable problem document', () => {
      const detail = 'Service is down for maintenance';
      const problem = Problems.serviceUnavailable(detail);

      expect(problem.type).toEqual(ProblemTypes.serviceUnavailable.urn);
      expect(problem.status).toEqual(ProblemTypes.serviceUnavailable.code);
      expect(problem.title).toEqual(ProblemTypes.serviceUnavailable.title);
      expect(problem.detail).toEqual(detail);
    });

    test('should create a gatewayTimeout problem document', () => {
      const detail = 'Upstream server timed out';
      const problem = Problems.gatewayTimeout(detail);

      expect(problem.type).toEqual(ProblemTypes.gatewayTimeout.urn);
      expect(problem.status).toEqual(ProblemTypes.gatewayTimeout.code);
      expect(problem.title).toEqual(ProblemTypes.gatewayTimeout.title);
      expect(problem.detail).toEqual(detail);
    });
  });
});
