import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'dev-users.json');

/**
 * Checks if an error thrown by Prisma is a connection/reachability failure
 */
export function isDbConnectionError(error) {
  if (!error) return false;
  const msg = String(error.message || '');
  const code = String(error.code || '');

  return (
    code === 'P1001' || // Can't reach database server
    code === 'P1002' || // The database server was reached but timed out
    code === 'P1003' || // Database does not exist
    code === 'P1017' || // Server has closed the connection
    msg.includes("Can't reach database server") ||
    msg.includes('connection refused') ||
    msg.includes('ECONNREFUSED') ||
    msg.includes('timed out') ||
    msg.includes('connect ECONNREFUSED')
  );
}

/**
 * Reads local dev data safely
 */
function readDevData() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      const initial = { users: [], accounts: [] };
      fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf8');
      return initial;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('[devStore] Failed to read dev database:', err.message);
    return { users: [], accounts: [] };
  }
}

/**
 * Writes local dev data atomically
 */
function writeDevData(data) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tempFile = `${DATA_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tempFile, DATA_FILE);
  } catch (err) {
    console.error('[devStore] Failed to write dev database:', err.message);
  }
}

export function devGetUserById(id) {
  if (!id) return null;
  const data = readDevData();
  const user = data.users.find((u) => u.id === id);
  if (!user) return null;
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

export function devGetUserByEmail(email) {
  if (!email) return null;
  const data = readDevData();
  const normalized = email.toLowerCase().trim();
  const user = data.users.find((u) => u.email?.toLowerCase() === normalized);
  return user || null;
}

export function devGetUserByUsername(username) {
  if (!username) return null;
  const data = readDevData();
  const normalized = username.toLowerCase().trim();
  const user = data.users.find((u) => u.username?.toLowerCase() === normalized);
  if (!user) return null;
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

export function devGetRawUserByIdentifier(identifier) {
  if (!identifier) return null;
  const data = readDevData();
  const normalized = identifier.toLowerCase().trim();
  return (
    data.users.find(
      (u) =>
        u.email?.toLowerCase() === normalized ||
        u.username?.toLowerCase() === normalized
    ) || null
  );
}

export function devCreateUser({ email, username, name, passwordHash, image = null }) {
  const data = readDevData();
  const now = new Date().toISOString();

  const newUser = {
    id: crypto.randomUUID(),
    email: email.toLowerCase().trim(),
    username: username.toLowerCase().trim(),
    name: name || username,
    passwordHash: passwordHash || null,
    image: image || null,
    bio: null,
    role: 'STUDENT',
    createdAt: now,
    updatedAt: now,
  };

  data.users.push(newUser);
  writeDevData(data);

  console.log(`[devStore] Created user '${newUser.username}' in local storage (.data/dev-users.json)`);

  const { passwordHash: _, ...safeUser } = newUser;
  return safeUser;
}

export function devUpdateUser(id, updateData) {
  const data = readDevData();
  const idx = data.users.findIndex((u) => u.id === id);
  if (idx === -1) return null;

  const now = new Date().toISOString();
  data.users[idx] = {
    ...data.users[idx],
    ...updateData,
    updatedAt: now,
  };

  writeDevData(data);
  const { passwordHash, ...safeUser } = data.users[idx];
  return safeUser;
}

export function devGetAccount(provider, providerAccountId) {
  const data = readDevData();
  return (
    data.accounts.find(
      (a) => a.provider === provider && a.providerAccountId === String(providerAccountId)
    ) || null
  );
}

export function devLinkAccount(accountData) {
  const data = readDevData();
  const newAccount = {
    id: crypto.randomUUID(),
    ...accountData,
    providerAccountId: String(accountData.providerAccountId),
  };
  data.accounts.push(newAccount);
  writeDevData(data);
  return newAccount;
}
