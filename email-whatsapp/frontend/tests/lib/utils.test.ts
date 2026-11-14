import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn', () => {
  it('concatena classes com espaçamento', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('remove conflitos de display', () => {
    expect(cn('flex', 'hidden')).toBe('hidden');
  });
});
