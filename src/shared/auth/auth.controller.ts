import {
  Controller,
  HttpCode,
  HttpStatus,
  NotImplementedException,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  login() {
    throw new NotImplementedException();
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  logout() {
    throw new NotImplementedException();
  }
}
