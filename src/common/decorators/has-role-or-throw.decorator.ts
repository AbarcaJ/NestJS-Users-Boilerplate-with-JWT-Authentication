import { ForbiddenException } from '@nestjs/common';
import { User } from 'src/models/user/schemas';
import { Role } from '../enums';
import { hasRole } from './has-role.decorator';

export const hasRoleOrThrow = (user: User, ...roles: Role[]) => {
  if (hasRole(user, ...roles)) return true;
  throw new ForbiddenException('User does not meet role requeriments.');
};
