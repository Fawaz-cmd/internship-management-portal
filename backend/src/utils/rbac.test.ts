import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { canAccess } from './rbac';
import { ROLES } from '../constants/roles';

describe('canAccess', () => {
  it('returns true when role is explicitly allowed', () => {
    assert.equal(canAccess(ROLES.ADMIN, [ROLES.ADMIN, ROLES.MENTOR]), true);
  });

  it('returns false when role is not allowed', () => {
    assert.equal(canAccess(ROLES.INTERN, [ROLES.ADMIN, ROLES.MENTOR]), false);
  });
});
