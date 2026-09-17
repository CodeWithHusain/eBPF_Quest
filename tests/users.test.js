import test from 'node:test';
import assert from 'node:assert';
import { createUser, verifyCredentials, updateUserProfile, getUserById, getUserByEmail, getUserByUsername } from '../src/lib/db/users.js';

test('users service: createUser rejects invalid email', async () => {
  const result = await createUser({
    email: 'not-an-email',
    username: 'valid_user',
    password: 'securePassword123',
  });
  assert.strictEqual(result.success, false);
  assert.ok(result.error.includes('valid email'));
});

test('users service: createUser rejects invalid username', async () => {
  const result = await createUser({
    email: 'test@bpfquest.org',
    username: 'a', // too short
    password: 'securePassword123',
  });
  assert.strictEqual(result.success, false);
  assert.ok(result.error.includes('at least 3 characters'));
});

test('users service: createUser rejects reserved username', async () => {
  const result = await createUser({
    email: 'admin@bpfquest.org',
    username: 'admin',
    password: 'securePassword123',
  });
  assert.strictEqual(result.success, false);
  assert.ok(result.error.includes('reserved'));
});

test('users service: createUser rejects weak password', async () => {
  const result = await createUser({
    email: 'student@bpfquest.org',
    username: 'student_99',
    password: '123',
  });
  assert.strictEqual(result.success, false);
  assert.ok(result.error.includes('at least 8 characters'));
});

test('users service: verifyCredentials returns null for empty or invalid input', async () => {
  assert.strictEqual(await verifyCredentials('', ''), null);
  assert.strictEqual(await verifyCredentials('nonexistent', 'wrongPassword'), null);
  assert.strictEqual(await verifyCredentials(null, null), null);
});

test('users service: updateUserProfile rejects invalid user ID', async () => {
  const result = await updateUserProfile('', { name: 'New Name' });
  assert.strictEqual(result.success, false);
  assert.strictEqual(result.error, 'Invalid user ID.');
});

test('users service: updateUserProfile rejects reserved username update', async () => {
  const result = await updateUserProfile('user-id-123', { username: 'root' });
  assert.strictEqual(result.success, false);
  assert.ok(result.error.includes('reserved'));
});

test('users service: getters return null for empty queries', async () => {
  assert.strictEqual(await getUserById(''), null);
  assert.strictEqual(await getUserById(null), null);
  assert.strictEqual(await getUserByEmail(''), null);
  assert.strictEqual(await getUserByUsername(''), null);
});

test('users service: createUser and verifyCredentials work successfully in dev fallback mode', async () => {
  const uniq = Date.now();
  const testUser = {
    email: `dev_engineer_${uniq}@kernel.org`,
    username: `dev_user_${uniq}`,
    password: 'SuperSecretPassword123!',
    name: 'Dev Engineer',
  };

  const created = await createUser(testUser);
  assert.strictEqual(created.success, true);
  assert.strictEqual(created.user.username, testUser.username);
  assert.strictEqual(created.user.email, testUser.email);

  // Verify credentials by username
  const verifiedUser = await verifyCredentials(testUser.username, 'SuperSecretPassword123!');
  assert.ok(verifiedUser);
  assert.strictEqual(verifiedUser.username, testUser.username);

  // Verify credentials by email
  const verifiedByEmail = await verifyCredentials(testUser.email, 'SuperSecretPassword123!');
  assert.ok(verifiedByEmail);
  assert.strictEqual(verifiedByEmail.email, testUser.email);

  // Reject invalid password
  const wrongPass = await verifyCredentials(testUser.username, 'WrongPassword123!');
  assert.strictEqual(wrongPass, null);

  // Reject duplicate registration
  const duplicate = await createUser(testUser);
  assert.strictEqual(duplicate.success, false);
});

