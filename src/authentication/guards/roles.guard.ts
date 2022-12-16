import {
  Injectable,
  CanActivate,
  ExecutionContext,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from 'src/models/user/schemas/user.schema';
import { Role } from '../../common/enums/role.enum';
import { META_ROLES_KEY } from '../decorators';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(META_ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);

    if (!requiredRoles || !requiredRoles.length) {
      return true;
    }

    const request = ctx.switchToHttp().getRequest();
    const user = request.user as User;
    if (!user) {
      throw new InternalServerErrorException(
        'Using @AllowOnlyFor() on Public Route or Wrong Scope.',
      );
    }

    if (!requiredRoles.some((role) => user.role?.includes(role))) {
      throw new ForbiddenException(
        `Route is restricted to users with Roles [${requiredRoles.join(', ')}]`,
      );
    }
    return true;
  }
}
