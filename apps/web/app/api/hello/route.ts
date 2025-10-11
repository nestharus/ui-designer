import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const querySchema = z.object({
  name: z.string().optional(),
});

export function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const params = Object.fromEntries(searchParams.entries());

  const result = querySchema.safeParse(params);

  if (!result.success) {
    return NextResponse.json(
      { error: 'Invalid query parameters', details: z.treeifyError(result.error) },
      { status: 400 }
    );
  }

  const { name } = result.data;

  return NextResponse.json({
    message: name ? `Hello, ${name}!` : 'Hello from UI Designer API',
    timestamp: new Date().toISOString(),
  });
}
