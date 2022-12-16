import { SetMetadata } from '@nestjs/common';
import { Role } from '../../common/enums/role.enum';

export const META_ROLES_KEY = 'userRoles';
export const RoleProtected = (...roles: Role[]) => SetMetadata(META_ROLES_KEY, roles);
