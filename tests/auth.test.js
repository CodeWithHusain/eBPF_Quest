import test from 'node:test';
import assert from 'node:assert';
import bcrypt from 'bcryptjs';
import {
  validateUsername,
  validateDisplayName,
  validateBio,
  validatePassword,
  RESERVED_USERNAMES,
} from '../src/lib/validation/auth.js';

test('auth validation: validateUsername allows valid usernames', () => {
  const cases = ['torvalds', 'kernel_dev', 'bpf_hacker1', 'ebpf_fan', 'student99'];
  for (const username of cases) {
    const res = validateUsername(username);
    assert.strictEqual(res.isValid, true, `Expected "${username}" to be valid`);
    assert.strictEqual(res.normalizedUsername, username.toLowerCase());
  }
});

test('auth validation: validateUsername rejects invalid length or characters', () => {
  // Too short (< 3)
  assert.strictEqual(validateUsername('ab').isValid, false);
  assert.strictEqual(validateUsername('').isValid, false);
  assert.strictEqual(validateUsername(null).isValid, false);

  // Too long (> 30)
  assert.strictEqual(validateUsername('a'.repeat(31)).isValid, false);

  // Invalid characters
  assert.strictEqual(validateUsername('user-name').isValid, false); // only underscores allowed in regex
  assert.strictEqual(validateUsername('user@domain').isValid, false);
  assert.strictEqual(validateUsername('user name').isValid, false);
  assert.strictEqual(validateUsername('<script>').isValid, false);
});

test('auth validation: validateUsername blocks reserved system handles', () => {
  const blocked = ['admin', 'root', 'bpfquest', 'system', 'api', 'auth', 'settings', 'profile', 'dashboard', 'kernel', 'ebpf'];
  for (const name of blocked) {
    assert.ok(RESERVED_USERNAMES.has(name), `Expected "${name}" to be in RESERVED_USERNAMES`);
    const res = validateUsername(name);
    assert.strictEqual(res.isValid, false, `Expected reserved name "${name}" to be rejected`);
    assert.ok(res.error.includes('reserved'));
  }
});

test('auth validation: validateDisplayName sanitizes and checks length', () => {
  const valid = validateDisplayName('Linus Torvalds');
  assert.strictEqual(valid.isValid, true);
  assert.strictEqual(valid.sanitizedName, 'Linus Torvalds');

  const dangerous = validateDisplayName('<b>Hacker</b>');
  assert.strictEqual(dangerous.isValid, true);
  assert.strictEqual(dangerous.sanitizedName, '&lt;b&gt;Hacker&lt;&#x2F;b&gt;');

  const tooLong = validateDisplayName('A'.repeat(55));
  assert.strictEqual(tooLong.isValid, false);
});

test('auth validation: validateBio sanitizes and enforces limits', () => {
  const valid = validateBio('Kernel observer exploring XDP');
  assert.strictEqual(valid.isValid, true);

  const tooLong = validateBio('A'.repeat(255));
  assert.strictEqual(tooLong.isValid, false);
});

test('auth validation: validatePassword enforces length requirement', () => {
  assert.strictEqual(validatePassword('short').isValid, false);
  assert.strictEqual(validatePassword('securePassword123').isValid, true);
  assert.strictEqual(validatePassword('').isValid, false);
});

test('bcrypt: securely hashes and verifies password with constant-time comparison', async () => {
  const plain = 'superSecretKernelKey123!';
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(plain, salt);

  assert.notStrictEqual(plain, hash);
  assert.ok(hash.startsWith('$2'));

  const isMatch = await bcrypt.compare(plain, hash);
  assert.strictEqual(isMatch, true);

  const isWrong = await bcrypt.compare('wrongPassword', hash);
  assert.strictEqual(isWrong, false);
});
