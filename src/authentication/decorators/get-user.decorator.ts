import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

export const GetUser = createParamDecorator((data: string, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const user = request.user;
  if (!user)
    throw new InternalServerErrorException('Using @GetUser() Decorator on Public Route.');
  return !data ? user : user[data];
});
