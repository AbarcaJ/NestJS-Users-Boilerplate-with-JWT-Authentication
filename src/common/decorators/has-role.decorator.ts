import { User } from 'src/models/user/schemas';
import { Role } from '../enums';

export const hasRole = (user: User, ...roles: Role[]) =>
  roles.some((role) => user.role === role);
