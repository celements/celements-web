export type Maybe<T> = T | null | undefined;

/**
 * Type guard to check if a value is not nullable
 */
const nonNullable = <T>(value: Maybe<T>): value is NonNullable<T> => value != null;

/**
 * Type to make all properties of a type non-nullable
 */
export type NonNullableProps<T> = {
  [key in keyof T]-?: NonNullable<T[key]>;
};
/**
 * Type guard to check if all properties of a value are not nullable
 */
const nonNullableProps = <T>(value: Maybe<T>): value is NonNullableProps<T> =>
  value != null && Object.values(value).every((v) => v != null);

/**
 * Type to make a specific property of a type non-nullable
 */
export type NonNullableProp<T, K extends keyof T> = T & {
  [key in K]-?: NonNullable<T[key]>;
};
/**
 * Type guard to check if a specific property of a value is not nullable
 */
const nonNullableProp = <T, K extends keyof T>(
  value: Maybe<T>,
  key: K
): value is NonNullableProp<T, K> => value?.[key] != null;

/**
 * Type guard to check if a given key is a key of an object T
 */
const isin = <T extends object>(key: PropertyKey, obj: T): key is keyof T => key in obj;

export { nonNullable, nonNullableProps, nonNullableProp, isin };
