import { RoleGuard } from './role-guard.guard';

import { Reflector } from '@nestjs/core';

describe('RoleGuard', () => {
  it('should be defined', () => {
    const reflector = {} as Reflector; // mock or stub
    expect(new RoleGuard(reflector)).toBeDefined();
  });
});
