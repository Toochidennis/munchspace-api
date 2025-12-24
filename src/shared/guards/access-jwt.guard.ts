import { AuthGuard } from '@nestjs/passport';

export class AccessJwtGuard extends AuthGuard('jwt') {}
