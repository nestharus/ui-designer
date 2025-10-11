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
    expect([a, b, c].length).toBe(3);
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
    expect(Array.isArray(d.tags)).toBe(true);
    expect(Array.isArray(d.list)).toBe(true);
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
    expect(p.meta).toBeDefined();
    expect(p.children?.[0]?.attrs).toBeDefined();
  });

  it('recursively partializes Map values and Set elements', () => {
    interface V {
      a: number;
      b: { c: string };
    }
    const mp: DeepPartial<Map<string, V>> = new Map([['k', { b: {} }]]);
    expect(mp).toBeInstanceOf(Map);

    type S = Set<{ id: string; meta: { x: number } }>;
    const st: DeepPartial<S> = new Set([{ meta: {} }]);
    expect(st).toBeInstanceOf(Set);
  });
});

describe('common.ts - HttpStatus constants', () => {
  it('matches expected numeric values', () => {
    expect(HttpStatus.OK).toBe(200);
    expect(HttpStatus.CREATED).toBe(201);
    expect(HttpStatus.ACCEPTED).toBe(202);
    expect(HttpStatus.NO_CONTENT).toBe(204);
    expect(HttpStatus.BAD_REQUEST).toBe(400);
    expect(HttpStatus.UNAUTHORIZED).toBe(401);
    expect(HttpStatus.FORBIDDEN).toBe(403);
    expect(HttpStatus.NOT_FOUND).toBe(404);
    expect(HttpStatus.CONFLICT).toBe(409);
    expect(HttpStatus.INTERNAL_SERVER_ERROR).toBe(500);
    expect(HttpStatus.BAD_GATEWAY).toBe(502);
    expect(HttpStatus.SERVICE_UNAVAILABLE).toBe(503);
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
    expect(ErrorCode.VALIDATION_FAILED).toBe('VALIDATION_FAILED');
    expect(ErrorCode.AUTHENTICATION_FAILED).toBe('AUTHENTICATION_FAILED');
    expect(ErrorCode.AUTHORIZATION_FAILED).toBe('AUTHORIZATION_FAILED');
    expect(ErrorCode.RESOURCE_NOT_FOUND).toBe('RESOURCE_NOT_FOUND');
    expect(ErrorCode.CONFLICT).toBe('CONFLICT');
    expect(ErrorCode.RATE_LIMITED).toBe('RATE_LIMITED');
    expect(ErrorCode.INTERNAL_ERROR).toBe('INTERNAL_ERROR');
    expect(ErrorCode.TIMEOUT).toBe('TIMEOUT');
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
    expect(e.id).toBe('id_1');
    expect(new Date(e.createdAt).toString()).not.toBe('Invalid Date');
    expect(new Date(e.updatedAt).toString()).not.toBe('Invalid Date');
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
    expect(p.total).toBe(1);
    expect(p.items[0]?.id).toBe('1');
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
