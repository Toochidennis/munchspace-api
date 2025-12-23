import { JwtAuthGuard } from '@/shared/auth/guards/jwt-auth.guard';
import { AuthenticatedUser } from '@/shared/auth/types/authenticated-user.type';
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { FastifyRequest } from 'fastify';

@Controller()
export class ProfileController {
  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() req: AuthenticatedUser & FastifyRequest) {
    return { req };
  }
}
