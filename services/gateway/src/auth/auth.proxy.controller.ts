import { Body, Controller, Get, Headers, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthProxyController {
  constructor(private readonly http: HttpService) {}

  @Post('register')
  async register(@Body() body: unknown) {
    const response = await firstValueFrom(
      this.http.post(this.authServiceUrl('/auth/register'), body)
    );
    return response.data;
  }

  @Post('login')
  async login(@Body() body: unknown) {
    const response = await firstValueFrom(
      this.http.post(this.authServiceUrl('/auth/login'), body)
    );
    return response.data;
  }

  @Post('refresh')
  async refresh(@Body() body: unknown) {
    const response = await firstValueFrom(
      this.http.post(this.authServiceUrl('/auth/refresh'), body)
    );
    return response.data;
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: { user?: unknown }) {
    return req.user ?? {};
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin-check')
  adminCheck() {
    return { status: 'ok' };
  }

  private authServiceUrl(path: string) {
    const base = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
    return `${base}${path}`;
  }
}
