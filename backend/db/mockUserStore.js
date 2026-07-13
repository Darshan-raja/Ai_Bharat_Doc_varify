import { randomUUID } from 'crypto';

const users = new Map();

const clone = (value) => JSON.parse(JSON.stringify(value));

const normalizeEmail = (email) => (email || '').trim().toLowerCase();
const normalizePhone = (phoneNumber) => (phoneNumber || '').trim();

const applyUpdate = (user, update) => {
  if (!update || typeof update !== 'object') {
    return user;
  }

  if (update.$set && typeof update.$set === 'object') {
    Object.assign(user, update.$set);
  }

  if (update.$unset && Object.prototype.hasOwnProperty.call(update.$unset, 'otp')) {
    delete user.otp;
  }

  if (update.$push && update.$push.lastResults) {
    if (!Array.isArray(user.lastResults)) {
      user.lastResults = [];
    }
    user.lastResults.push(update.$push.lastResults);
  }

  for (const [key, value] of Object.entries(update)) {
    if (!key.startsWith('$')) {
      user[key] = value;
    }
  }

  user.updatedAt = new Date();
  return user;
};

export const createMockUser = (data) => {
  const id = randomUUID();
  const user = {
    _id: id,
    firstname: '',
    lastname: '',
    email: '',
    phoneNumber: '',
    workingDomain: '',
    organization: '',
    status: 'pending',
    rejectionReason: null,
    lastResults: [],
    otp: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...data,
  };

  users.set(id, user);
  return clone(user);
};

export const findMockUserById = (id) => {
  const user = users.get(id);
  return user ? clone(user) : null;
};

export const findMockUserByEmail = (email) => {
  const targetEmail = normalizeEmail(email);
  for (const user of users.values()) {
    if (normalizeEmail(user.email) === targetEmail) {
      return clone(user);
    }
  }
  return null;
};

export const findMockUserByPhone = (phoneNumber) => {
  const targetPhone = normalizePhone(phoneNumber);
  for (const user of users.values()) {
    if (normalizePhone(user.phoneNumber) === targetPhone) {
      return clone(user);
    }
  }
  return null;
};

export const listMockUsers = (filterFn = () => true) => {
  return Array.from(users.values()).filter(filterFn).map(clone);
};

export const countMockUsers = (filterFn = () => true) => {
  return Array.from(users.values()).filter(filterFn).length;
};

export const updateMockUserById = (id, update) => {
  const user = users.get(id);
  if (!user) {
    return null;
  }

  applyUpdate(user, update);
  return clone(user);
};

export const findMockUserByIdAndProject = (id, projection) => {
  const user = users.get(id);
  if (!user) {
    return null;
  }

  const result = clone(user);
  if (projection === 'lastResults') {
    return {
      lastResults: result.lastResults || [],
    };
  }

  return result;
};
