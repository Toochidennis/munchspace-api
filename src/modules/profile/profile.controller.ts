import { User } from '@/modules/auth/decorators/user.decorator';
import { AccessJwtGuard } from '@/shared/guards/access-jwt.guard';
import {
  Controller,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProfileService } from '@/modules/profile/profile.service';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiAuthBearer } from '@/shared/decorators/swagger-auth.decorators';

@ApiTags('Profile')
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @ApiAuthBearer()
  @ApiOperation({
    summary: 'Get current user profile',
    description:
      'Retrieve the profile information for the authenticated user based on their role (CUSTOMER, VENDOR, RIDER, ADMIN).',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully',
    schema: {
      example: {
        userId: 'cuid_example_123',
        email: 'john.doe@example.com',
        phone: '+2348012345678',
        role: 'CUSTOMER',
        firstName: 'John',
        lastName: 'Doe',
        isVerified: true,
        isActive: true,
        createdAt: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing bearer token',
  })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  @HttpCode(HttpStatus.OK)
  @Get('me')
  @UseGuards(AccessJwtGuard)
  async me(@User() user: { userId: string; role: Role }) {
    return await this.profileService.resolveProfile(user.userId, user.role);
  }
}
