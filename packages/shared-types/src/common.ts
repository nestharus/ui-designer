export type Nullable<T> = T | null | undefined;

type Primitive = string | number | boolean | bigint | symbol | null | undefined;

type BuiltInObject =
  | Date
  | RegExp
  | ((...args: never[]) => unknown)
  | Promise<unknown>
  | Error
  | URL
  | URLSearchParams
  | ArrayBuffer
  | DataView
  | WeakMap<object, unknown>
  | WeakSet<object>
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array
  | BigInt64Array
  | BigUint64Array;

export type DeepPartial<T> = T extends Primitive
  ? T
  : T extends readonly (infer U)[]
    ? readonly DeepPartial<U>[]
    : T extends (infer U)[]
      ? DeepPartial<U>[]
      : T extends ReadonlyMap<infer K, infer V>
        ? ReadonlyMap<K, DeepPartial<V>>
        : T extends Map<infer K, infer V>
          ? Map<K, DeepPartial<V>>
          : T extends ReadonlySet<infer U>
            ? ReadonlySet<DeepPartial<U>>
            : T extends Set<infer U>
              ? Set<DeepPartial<U>>
              : T extends Promise<infer U>
                ? Promise<DeepPartial<U>>
                : T extends BuiltInObject
                  ? T
                  : T extends object
                    ? { [K in keyof T]?: DeepPartial<T[K]> }
                    : T;

export enum ErrorCode {
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  AUTHORIZATION_FAILED = 'AUTHORIZATION_FAILED',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  CONFLICT = 'CONFLICT',
  RATE_LIMITED = 'RATE_LIMITED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  TIMEOUT = 'TIMEOUT',
}

export interface Entity {
  readonly id: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface Paginated<T> {
  readonly items: readonly T[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
}

export type CreatePayload<T extends Entity> = Omit<T, keyof Entity>;

export type UpdatePayload<T extends Entity> = Partial<Omit<T, keyof Entity>> & {
  readonly id: T['id'];
};

export interface DeleteRequest {
  readonly id: string;
  readonly soft?: boolean;
}
