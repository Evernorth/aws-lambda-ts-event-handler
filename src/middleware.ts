import { Context } from 'aws-lambda';
import { ArgsDict, BaseProxyEvent, JSONData, Response } from './types';

/**
 * HTTP middleware function that wraps the route invocation in an AWS Lambda function.
 *
 * @typeParam T - The response type of the middleware function.
 */
type Middleware<T = JSONData | Response> = (
  event: BaseProxyEvent,
  context: Context,
  args: ArgsDict,
  next: () => Promise<T>,
) => Promise<T>;

/**
 * Model for an AWS Lambda HTTP handler function.
 *
 * @typeParam T - The response type of the handler function.
 */
type Handler<T = JSONData | Response> = (
  event: BaseProxyEvent,
  context: Context,
  args?: ArgsDict,
) => Promise<T>;

/**
 * Wraps the AWS Lambda handler function with the provided middlewares.
 *
 * @remarks
 * The middlewares are stacked in a classic onion-like pattern.
 *
 * @typeParam T - The response type of the handler function.
 *
 * @param middlewares - Middlewares that must be wrapped around the handler.
 * @param handler - The handler function.
 * @param args - Arguments for the handler function.
 * @returns A handler function that is wrapped around the middlewares.
 *
 * @throws Will throw an error if the middleware or handler function fails.
 *
 * @template T - The response type of the handler function.
 */
const wrapWithMiddlewares =
  <T>(
    middlewares: Middleware<T>[],
    handler: Handler<T>,
    _args?: ArgsDict,
  ): Handler<T> =>
  async (
    event: BaseProxyEvent,
    context: Context,
    args?: ArgsDict,
  ): Promise<T> => {
    const chain = middlewares.reduceRight(
      (next: () => Promise<T>, middleware: Middleware<T>) => () =>
        middleware(event, context, args, next),
      () => handler(event, context, args || {}),
    );
    return chain();
  };

export { Handler, Middleware, wrapWithMiddlewares };
