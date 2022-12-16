import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard, RolesGuard } from '../guards';
import { RoleProtected } from './role-protected.decorator';
import { Role } from '../../common/enums/role.enum';

export function Auth(...roles: Role[]) {
  return applyDecorators(RoleProtected(...roles), UseGuards(JwtAuthGuard, RolesGuard));
}

export function InheritAuth(strategy: string, ...roles: Role[]) {
  return applyDecorators(
    RoleProtected(...roles),
    UseGuards(AuthGuard(strategy), RolesGuard),
  );
}
