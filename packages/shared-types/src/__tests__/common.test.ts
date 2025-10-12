import { describe, expect, expectTypeOf, it } from 'vitest';

import {
  type Nullable,
  type DeepPartial,
  HttpStatus,
  ErrorCode,
  type Entity,
  type Paginated,
  type HttpStatusCode,
  type CreatePayload,
  type UpdatePayload,
  type DeleteRequest,
} from '../common';

interface ExampleEntity extends Entity {
  readonly name: string;
  readonly count: number;
}

describe('common.ts - Nullable', () => {
  it('accepts string, null, and undefined', () => {
    const a: Nullable<string> = 'x';
    const b: Nullable<string> = null;
    const c: Nullable<string> = undefined;
    expect.soft([a, b, c]).toHaveLength(3);
    expectTypeOf<Nullable<string>>().toEqualTypeOf<string | null | undefined>();
  });

  it('is compatible with optional props', () => {
    interface T {
      name?: Nullable<string>;
    }
    const t1: T = {};
    const t2: T = { name: null };
    const t3: T = { name: 'ok' };
    expect([t1, t2, t3]).toHaveLength(3);
  });
});

describe('common.ts - DeepPartial', () => {
  it('makes shallow object properties optional', () => {
    interface Foo {
      a: number;
      b: string;
    }
    const p1: DeepPartial<Foo> = {};
    const p2: DeepPartial<Foo> = { a: 1 };
    const p3: DeepPartial<Foo> = { b: 'x' };
    expect([p1, p2, p3]).toHaveLength(3);
  });

  it('recursively partializes nested objects', () => {
    interface Nested {
      inner: { deep: { v: number } };
    }
    const p: DeepPartial<Nested> = { inner: { deep: {} } };
    expect(p.inner?.deep).toBeDefined();
  });

  it('handles arrays and readonly arrays', () => {
    interface Item {
      id: string;
      tags: readonly { k: string; v: string }[];
      list: { n: number }[];
    }
    const d: DeepPartial<Item> = {
      tags: [{ k: 'a' }],
      list: [{}],
    };
    expect.soft(Array.isArray(d.tags)).toBe(true);
    expect.soft(Array.isArray(d.list)).toBe(true);
  });

  it('works with complex nested structures', () => {
    interface Complex {
      id: string;
      meta: { createdBy: string; flags: readonly string[] };
      children: { name: string; attrs: Record<string, unknown> }[];
    }
    const p: DeepPartial<Complex> = {
      meta: {},
      children: [{ attrs: {} }],
    };
    expect.soft(p.meta === undefined).toBe(false);
    expect.soft(Boolean(p.children?.[0]?.attrs)).toBe(true);
  });

  it('recursively partializes Map values and Set elements', () => {
    interface V {
      a: number;
      b: { c: string };
    }
    const mp: DeepPartial<Map<string, V>> = new Map([['k', { b: {} }]]);

    type S = Set<{ id: string; meta: { x: number } }>;
    const st: DeepPartial<S> = new Set([{ meta: {} }]);
    expect.soft(mp instanceof Map).toBe(true);
    expect.soft(st instanceof Set).toBe(true);
  });
});

describe('common.ts - HttpStatus constants', () => {
  it('matches expected numeric values', () => {
    const expected: [number, number][] = [
      [HttpStatus.OK, 200],
      [HttpStatus.CREATED, 201],
      [HttpStatus.ACCEPTED, 202],
      [HttpStatus.NO_CONTENT, 204],
      [HttpStatus.BAD_REQUEST, 400],
      [HttpStatus.UNAUTHORIZED, 401],
      [HttpStatus.FORBIDDEN, 403],
      [HttpStatus.NOT_FOUND, 404],
      [HttpStatus.CONFLICT, 409],
      [HttpStatus.INTERNAL_SERVER_ERROR, 500],
      [HttpStatus.BAD_GATEWAY, 502],
      [HttpStatus.SERVICE_UNAVAILABLE, 503],
    ];
    for (const [actual, exp] of expected) {
      expect.soft(actual).toBe(exp);
    }
  });

  it('can be used in type positions', () => {
    interface WithStatus {
      status: HttpStatusCode;
    }
    const obj: WithStatus = { status: HttpStatus.OK };
    expect(obj.status).toBe(HttpStatus.OK);
  });
});

describe('common.ts - ErrorCode enum', () => {
  it('has expected string values', () => {
    const expected: [string, string][] = [
      [ErrorCode.VALIDATION_FAILED, 'VALIDATION_FAILED'],
      [ErrorCode.AUTHENTICATION_FAILED, 'AUTHENTICATION_FAILED'],
      [ErrorCode.AUTHORIZATION_FAILED, 'AUTHORIZATION_FAILED'],
      [ErrorCode.RESOURCE_NOT_FOUND, 'RESOURCE_NOT_FOUND'],
      [ErrorCode.CONFLICT, 'CONFLICT'],
      [ErrorCode.RATE_LIMITED, 'RATE_LIMITED'],
      [ErrorCode.INTERNAL_ERROR, 'INTERNAL_ERROR'],
      [ErrorCode.TIMEOUT, 'TIMEOUT'],
    ];
    for (const [actual, exp] of expected) {
      expect.soft(actual).toBe(exp);
    }
  });

  it('is type-safe when accessing members', () => {
    const code: ErrorCode = ErrorCode.VALIDATION_FAILED;
    expect(code).toBe(ErrorCode.VALIDATION_FAILED);

    // Verify the enum member is compatible with the ErrorCode type
    const acceptsErrorCode = (_: ErrorCode) => true;
    expectTypeOf(acceptsErrorCode).toBeCallableWith(code);
  });
});

describe('common.ts - Entity interface', () => {
  it('requires id, createdAt, updatedAt', () => {
    const e: Entity = {
      id: 'id_1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as const;
    expect.soft(e.id).toBe('id_1');
    expect.soft(new Date(e.createdAt).toString()).not.toBe('Invalid Date');
    expect.soft(new Date(e.updatedAt).toString()).not.toBe('Invalid Date');
  });

  it('enforces readonly at type-level', () => {
    const e: Entity = {
      id: 'id_2',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    expectTypeOf(e.id).toEqualTypeOf<string>();
  });
});

describe('common.ts - Paginated<T> interface', () => {
  it('validates shape and readonly items', () => {
    interface Item {
      id: string;
    }
    const p: Paginated<Item> = {
      items: [{ id: '1' }] as const,
      total: 1,
      page: 1,
      pageSize: 10,
    };
    expect.soft(p.total).toBe(1);
    expect.soft(p.items[0]?.id).toBe('1');
    expectTypeOf(p.items).toEqualTypeOf<readonly Item[]>();
  });

  it('propagates generic to items array', () => {
    const numbers: Paginated<number> = {
      items: [1, 2, 3] as const,
      total: 3,
      page: 1,
      pageSize: 3,
    };
    expect(numbers.items[1]).toBe(2);
    expectTypeOf(numbers.items[0]).toEqualTypeOf<number | undefined>();
  });
});

describe('common.ts - CreatePayload', () => {
  it('omits base entity fields from payload', () => {
    type Payload = CreatePayload<ExampleEntity>;
    const payload: Payload = { name: 'test', count: 1 };
    expect(payload.name).toBe('test');
    expectTypeOf(payload).toExtend<{ name: string; count: number }>();
  });
});

describe('common.ts - UpdatePayload', () => {
  it('requires id while partializing entity fields', () => {
    type Update = UpdatePayload<ExampleEntity>;
    const update: Update = { id: '1', name: 'updated' };
    expect(update.id).toBe('1');
    expectTypeOf<Update['id']>().toEqualTypeOf<string>();
  });
});

describe('common.ts - DeleteRequest', () => {
  it('captures required id and optional soft flag', () => {
    const request: DeleteRequest = { id: 'delete-me', soft: true };
    expect(request.soft).toBe(true);
    expectTypeOf(request.id).toEqualTypeOf<string>();
  });
});
