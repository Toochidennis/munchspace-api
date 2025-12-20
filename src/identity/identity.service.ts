import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/infra/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class IdentityService {
  private constructor(private prisma: PrismaService) {}

  async register(email: string, pass: string) {
    const hashed = bcrypt.hashSync(pass, 10);
    return await this.prisma.user.create({
      data: {
        email,
        password: hashed,
      },
    });
  }

  async findByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }
}
