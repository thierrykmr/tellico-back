import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserRole } from 'src/module/user/entities/user.entity';
import { Reflector } from '@nestjs/core';
import { AuthenticatedUserDto } from 'src/module/user/dto/authenticated-user.dto';
import { ROLES_KEY } from '../decorators';



@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }const req = context.switchToHttp().getRequest();
    const user: AuthenticatedUserDto = req.user;
    return requiredRoles.some((role) => user.role === role);

  }
}
