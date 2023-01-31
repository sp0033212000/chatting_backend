import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserEntity } from '../service/user/entities/user.entity';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    console.log(request.user);
    console.log(request.users);
    return request.user as UserEntity | null;
  },
);
