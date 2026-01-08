import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto, RoleInput } from './dto/register.dto';

const ACCESS_TTL = '15m';
const REFRESH_TTL = '7d';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly jwt: JwtService) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new BadRequestException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        role: dto.role === RoleInput.ADMIN ? 'ADMIN' : 'USER'
      }
    });

    return { id: user.id, email: user.email, role: user.role };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueTokens(user.id, user.email, user.role);
  }

  async refresh(dto: RefreshDto) {
    let payload: { sub: string; email: string; role: string };
    try {
      payload = await this.jwt.verifyAsync(dto.refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const stored = await this.prisma.refreshToken.findFirst({
      where: {
        userId: payload.sub
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!stored) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const valid = await bcrypt.compare(dto.refreshToken, stored.tokenHash);
    if (!valid || stored.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    return this.issueTokens(payload.sub, payload.email, payload.role);
  }

  private async issueTokens(userId: string, email: string, role: string) {
    const accessToken = await this.jwt.signAsync(
      { sub: userId, email, role },
      {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: process.env.JWT_ACCESS_TTL || ACCESS_TTL
      }
    );

    const refreshToken = await this.jwt.signAsync(
      { sub: userId, email, role },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_TTL || REFRESH_TTL
      }
    );

    const tokenHash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date(Date.now() + this.parseTtlToMs(process.env.JWT_REFRESH_TTL || REFRESH_TTL));

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt
      }
    });

    return { accessToken, refreshToken, tokenType: 'Bearer', expiresIn: process.env.JWT_ACCESS_TTL || ACCESS_TTL };
  }

  private parseTtlToMs(ttl: string): number {
    if (ttl.endsWith('m')) {
      return Number(ttl.replace('m', '')) * 60 * 1000;
    }
    if (ttl.endsWith('h')) {
      return Number(ttl.replace('h', '')) * 60 * 60 * 1000;
    }
    if (ttl.endsWith('d')) {
      return Number(ttl.replace('d', '')) * 24 * 60 * 60 * 1000;
    }
    return Number(ttl) * 1000;
  }
}
