import { sanitizeString } from './index.js';

export const RESERVED_USERNAMES = new Set([
  'admin',
  'administrator',
  'root',
  'bpfquest',
  'system',
  'sys',
  'api',
  'auth',
  'login',
  'signin',
  'signup',
  'register',
  'settings',
  'profile',
  'dashboard',
  'learn',
  'missions',
  'playground',
  'labs',
  'docs',
  'mod',
  'moderator',
  'superuser',
  'operator',
  'daemon',
  'kernel',
  'ebpf',
  'null',
  'undefined',
  'anonymous',
  'guest',
  'support',
  'security',
  'privacy',
]);

/**
 * Validates and normalizes a username.
 * Returns { isValid: boolean, error?: string, normalizedUsername?: string }
 */
export function validateUsername(username) {
  if (!username || typeof username !== 'string') {
    return { isValid: false, error: 'Username is required.' };
  }

  const trimmed = username.trim();

  if (trimmed.length < 3) {
    return { isValid: false, error: 'Username must be at least 3 characters long.' };
  }

  if (trimmed.length > 30) {
    return { isValid: false, error: 'Username must not exceed 30 characters.' };
  }

  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!usernameRegex.test(trimmed)) {
    return {
      isValid: false,
      error: 'Username can only contain letters, numbers, and underscores.',
    };
  }

  const normalized = trimmed.toLowerCase();

  if (RESERVED_USERNAMES.has(normalized)) {
    return {
      isValid: false,
      error: 'This username is reserved and cannot be registered.',
    };
  }

  return { isValid: true, normalizedUsername: normalized };
}

/**
 * Validates display name.
 */
export function validateDisplayName(name) {
  if (!name) return { isValid: true, sanitizedName: '' };
  if (typeof name !== 'string') {
    return { isValid: false, error: 'Display name must be text.' };
  }

  const trimmed = name.trim();
  if (trimmed.length > 50) {
    return { isValid: false, error: 'Display name must not exceed 50 characters.' };
  }

  return { isValid: true, sanitizedName: sanitizeString(trimmed) };
}

/**
 * Validates user bio.
 */
export function validateBio(bio) {
  if (!bio) return { isValid: true, sanitizedBio: '' };
  if (typeof bio !== 'string') {
    return { isValid: false, error: 'Bio must be text.' };
  }

  const trimmed = bio.trim();
  if (trimmed.length > 250) {
    return { isValid: false, error: 'Bio must not exceed 250 characters.' };
  }

  return { isValid: true, sanitizedBio: sanitizeString(trimmed) };
}

/**
 * Validates password complexity.
 */
export function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return { isValid: false, error: 'Password is required.' };
  }

  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long.' };
  }

  if (password.length > 128) {
    return { isValid: false, error: 'Password must not exceed 128 characters.' };
  }

  return { isValid: true };
}
