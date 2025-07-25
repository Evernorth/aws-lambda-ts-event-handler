/**
 * Utility types and functions for handling key-value pairs.
 * Typically used for HTTP Headers, Query parameters, and path parameters.
 *
 * @module utils
 */

/** Key-Value pairs Type typically used for HTTP Headers, Query parameters, path parameters. */
type MapType = { [name: string]: string | undefined } | null;

/**
 * Looks up the value for the key from the provided key-value pairs in a case-insensitive manner.
 *
 * @param map - Key-value pair object.
 * @param lookupKey - The key that must be looked up in the key-value pair.
 * @returns The value for the key, or undefined if the key is not found.
 * @throws Will throw an error if the lookupKey is not a string.
 *
 * @example
 * ```ts
 * const contentType = lookupKeyFromMap(response.headers, 'Content-Type');
 * ```
 */
const lookupKeyFromMap = <T = string>(
  map: MapType,
  lookupKey: string,
): T | undefined => {
  if (typeof lookupKey !== 'string') {
    throw new Error('lookupKey must be a string');
  }

  if (!map) return undefined;

  const lowercaseLookupKey = lookupKey.toLowerCase();

  return Object.entries(map).find(
    ([key]) => key.toLowerCase() === lowercaseLookupKey,
  )?.[1] as T | undefined;
};

export { MapType, lookupKeyFromMap };
