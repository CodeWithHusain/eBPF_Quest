import test from 'node:test';
import assert from 'node:assert';
import { isValidSlug, sanitizeString, isValidEmail, validateIntRange } from '../src/lib/validation/index.js';
import { cn } from '../src/lib/utils/cn.js';

test('validation: isValidSlug should validate valid and reject invalid slugs', () => {
  assert.strictEqual(isValidSlug('intro-to-linux'), true);
  assert.strictEqual(isValidSlug('ebpf-fundamentals-101'), true);
  assert.strictEqual(isValidSlug('invalid_slug'), false);
  assert.strictEqual(isValidSlug('../traversal'), false);
  assert.strictEqual(isValidSlug('<script>'), false);
  assert.strictEqual(isValidSlug(''), false);
  assert.strictEqual(isValidSlug(null), false);
});

test('validation: sanitizeString should escape dangerous HTML characters', () => {
  assert.strictEqual(sanitizeString('Hello World'), 'Hello World');
  assert.strictEqual(sanitizeString('<script>alert(1)</script>'), '&lt;script&gt;alert(1)&lt;&#x2F;script&gt;');
  assert.strictEqual(sanitizeString('  trimmed  '), 'trimmed');
  assert.strictEqual(sanitizeString(123), '');
});

test('validation: isValidEmail should validate email addresses', () => {
  assert.strictEqual(isValidEmail('student@bpfquest.org'), true);
  assert.strictEqual(isValidEmail('invalid-email'), false);
  assert.strictEqual(isValidEmail(''), false);
  assert.strictEqual(isValidEmail(null), false);
});

test('validation: validateIntRange should enforce integer bounds', () => {
  assert.strictEqual(validateIntRange(10, 0, 100), 10);
  assert.strictEqual(validateIntRange('25', 0, 100), 25);
  assert.strictEqual(validateIntRange(-5, 0, 100), null);
  assert.strictEqual(validateIntRange(150, 0, 100), null);
  assert.strictEqual(validateIntRange('not-a-number', 0, 100), null);
});

test('utils: cn should join class names and filter falsy values', () => {
  assert.strictEqual(cn('btn', 'btn-primary'), 'btn btn-primary');
  assert.strictEqual(cn('btn', false && 'active', null, undefined, 'btn-lg'), 'btn btn-lg');
  assert.strictEqual(cn(), '');
});
