import bcrypt from 'bcryptjs';
import { prisma } from './prisma.js';
import { validateUsername, validateDisplayName, validateBio, validatePassword } from '../validation/auth.js';
import { isValidEmail } from '../validation/index.js';
import {
  isDbConnectionError,
  devGetUserById,
  devGetUserByEmail,
  devGetUserByUsername,
  devGetRawUserByIdentifier,
  devCreateUser,
  devUpdateUser,
} from './devStore.js';

/**
 * Server-side User Database Service Layer
 * Encapsulates all database operations for user accounts, profiles, and auth.
 * Automatically falls back to resilient local development storage when PostgreSQL is offline.
 */

const USER_SELECT_PUBLIC = {
  id: true,
  name: true,
  email: true,
  username: true,
  image: true,
  bio: true,
  role: true,
  createdAt: true,
  updatedAt: true,
};

/**
 * Finds user by unique ID (excluding passwordHash)
 */
export async function getUserById(id) {
  if (!id || typeof id !== 'string') return null;
  try {
    return await prisma.user.findUnique({
      where: { id },
      select: USER_SELECT_PUBLIC,
    });
  } catch (error) {
    if (isDbConnectionError(error)) {
      return devGetUserById(id);
    }
    console.error('[users.getUserById] Database error:', error.message);
    return null;
  }
}

/**
 * Finds user by unique email address
 */
export async function getUserByEmail(email) {
  if (!email || typeof email !== 'string') return null;
  try {
    return await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
  } catch (error) {
    if (isDbConnectionError(error)) {
      return devGetUserByEmail(email);
    }
    console.error('[users.getUserByEmail] Database error:', error.message);
    return null;
  }
}

/**
 * Finds user by unique username
 */
export async function getUserByUsername(username) {
  if (!username || typeof username !== 'string') return null;
  try {
    return await prisma.user.findUnique({
      where: { username: username.toLowerCase().trim() },
      select: USER_SELECT_PUBLIC,
    });
  } catch (error) {
    if (isDbConnectionError(error)) {
      return devGetUserByUsername(username);
    }
    console.error('[users.getUserByUsername] Database error:', error.message);
    return null;
  }
}

/**
 * Registers a new user with email, username, and password.
 * Performs validation, checks uniqueness, hashes password with bcrypt.
 * Persists to PostgreSQL if online, or local devStore if offline in development.
 */
export async function createUser({ email, username, password, name = '' }) {
  // Validate email
  if (!isValidEmail(email)) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  // Validate username
  const usernameCheck = validateUsername(username);
  if (!usernameCheck.isValid) {
    return { success: false, error: usernameCheck.error };
  }
  const normalizedUsername = usernameCheck.normalizedUsername;

  // Validate password
  const passwordCheck = validatePassword(password);
  if (!passwordCheck.isValid) {
    return { success: false, error: passwordCheck.error };
  }

  // Validate name
  const nameCheck = validateDisplayName(name);
  const sanitizedName = nameCheck.sanitizedName || normalizedUsername;

  const normalizedEmail = email.toLowerCase().trim();

  try {
    // Check if email already registered
    const existingEmail = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });
    if (existingEmail) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    // Check if username already taken
    const existingUsername = await prisma.user.findUnique({
      where: { username: normalizedUsername },
      select: { id: true },
    });
    if (existingUsername) {
      return { success: false, error: 'This username is already taken. Please choose another.' };
    }

    // Hash password with bcrypt
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        username: normalizedUsername,
        name: sanitizedName,
        passwordHash,
      },
      select: USER_SELECT_PUBLIC,
    });

    return { success: true, user };
  } catch (error) {
    if (isDbConnectionError(error)) {
      console.warn('[users.createUser] PostgreSQL offline. Storing new account in local development store (.data/dev-users.json).');

      // Check dev store uniqueness
      const devEmail = devGetUserByEmail(normalizedEmail);
      if (devEmail) {
        return { success: false, error: 'An account with this email already exists.' };
      }

      const devUsername = devGetUserByUsername(normalizedUsername);
      if (devUsername) {
        return { success: false, error: 'This username is already taken. Please choose another.' };
      }

      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      const user = devCreateUser({
        email: normalizedEmail,
        username: normalizedUsername,
        name: sanitizedName,
        passwordHash,
      });

      return { success: true, user };
    }

    console.error('[users.createUser] Error creating user:', error.message);
    return { success: false, error: 'Unable to create account. Please try again later.' };
  }
}

/**
 * Verifies email/username and password credentials.
 * Returns safe user object if valid, or null if invalid.
 */
export async function verifyCredentials(identifier, password) {
  if (!identifier || !password || typeof identifier !== 'string' || typeof password !== 'string') {
    return null;
  }

  const trimmedId = identifier.trim();

  try {
    // Check by email or username
    let user = null;
    if (trimmedId.includes('@')) {
      user = await prisma.user.findUnique({
        where: { email: trimmedId.toLowerCase() },
      });
    } else {
      user = await prisma.user.findUnique({
        where: { username: trimmedId.toLowerCase() },
      });
    }

    if (!user || !user.passwordHash) {
      return null;
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      image: user.image,
      role: user.role,
    };
  } catch (error) {
    if (isDbConnectionError(error)) {
      const devUser = devGetRawUserByIdentifier(trimmedId);
      if (!devUser || !devUser.passwordHash) {
        return null;
      }

      const isValid = await bcrypt.compare(password, devUser.passwordHash);
      if (!isValid) {
        return null;
      }

      return {
        id: devUser.id,
        name: devUser.name,
        email: devUser.email,
        username: devUser.username,
        image: devUser.image,
        role: devUser.role,
      };
    }

    console.error('[users.verifyCredentials] Verification error:', error.message);
    return null;
  }
}

/**
 * Updates a user profile (Display name, username, bio)
 */
export async function updateUserProfile(userId, { name, username, bio }) {
  if (!userId || typeof userId !== 'string') {
    return { success: false, error: 'Invalid user ID.' };
  }

  const updateData = {};

  if (name !== undefined) {
    const nameCheck = validateDisplayName(name);
    if (!nameCheck.isValid) return { success: false, error: nameCheck.error };
    updateData.name = nameCheck.sanitizedName;
  }

  if (bio !== undefined) {
    const bioCheck = validateBio(bio);
    if (!bioCheck.isValid) return { success: false, error: bioCheck.error };
    updateData.bio = bioCheck.sanitizedBio;
  }

  if (username !== undefined) {
    const usernameCheck = validateUsername(username);
    if (!usernameCheck.isValid) return { success: false, error: usernameCheck.error };
    const normalized = usernameCheck.normalizedUsername;

    // Check if another user owns this username
    try {
      const existing = await prisma.user.findUnique({
        where: { username: normalized },
        select: { id: true },
      });
      if (existing && existing.id !== userId) {
        return { success: false, error: 'Username is already in use by another engineer.' };
      }
    } catch (checkErr) {
      if (isDbConnectionError(checkErr)) {
        const existing = devGetUserByUsername(normalized);
        if (existing && existing.id !== userId) {
          return { success: false, error: 'Username is already in use by another engineer.' };
        }
      }
    }
    updateData.username = normalized;
  }

  try {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: USER_SELECT_PUBLIC,
    });
    return { success: true, user: updated };
  } catch (error) {
    if (isDbConnectionError(error)) {
      const updated = devUpdateUser(userId, updateData);
      if (!updated) {
        return { success: false, error: 'User not found in local store.' };
      }
      return { success: true, user: updated };
    }
    console.error('[users.updateUserProfile] Update error:', error.message);
    return { success: false, error: 'Failed to update profile. Please try again.' };
  }
}
