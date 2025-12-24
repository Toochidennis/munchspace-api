import { User } from '@/modules/auth/decorators/user.decorator';
import { JwtAuthGuard } from '@/shared/guards/access-jwt.guard';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ProfileService } from '@/modules/profile/profile.service';
import { Role } from '@prisma/client';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@User() user: { userId: string; role: Role }) {
    return await this.profileService.resolveProfile(user.userId, user.role);
  }
}
