import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { UserEntity } from './entities/user.entity';
import { PrismaService } from '../prisma/prisma.service';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(REQUEST) private readonly request: Request,
    private readonly jwtService: JwtService,
  ) {}

  async createUser(
    ...args: Parameters<PrismaService['user']['create']>
  ): Promise<UserEntity> {
    return await this.prismaService.user.create(...args);
  }

  async updateUser(
    ...args: Parameters<PrismaService['user']['update']>
  ): Promise<UserEntity> {
    return await this.prismaService.user.update(...args);
  }

  async findUnique(
    ...args: Parameters<PrismaService['user']['findUnique']>
  ): Promise<UserEntity | null> {
    return await this.prismaService.user.findUnique(...args);
  }

  async findFirst(
    ...args: Parameters<PrismaService['user']['findFirst']>
  ): Promise<UserEntity | null> {
    return await this.prismaService.user.findFirst(...args);
  }

  async findMany(
    ...args: Parameters<PrismaService['user']['findMany']>
  ): Promise<Array<UserEntity>> {
    return await this.prismaService.user.findMany(...args);
  }

  async getUser(): Promise<UserEntity | null> {
    const [_, type, token] =
      /^(Bearer)\s(.+)/.exec(
        this.request?.cookies?.['Authorization'] ??
          this.request?.cookies?.['authorization'],
      ) ?? [];

    if (!token)
      throw new HttpException('Missing token.', HttpStatus.UNAUTHORIZED);

    let user: UserEntity | null = null;

    if (type !== 'Bearer') {
      throw new HttpException('Invalid token type.', HttpStatus.UNAUTHORIZED);
    }

    const info = this.jwtService.decode(token) as { email: string };

    user = await this.findUnique({
      where: {
        email: info.email,
      },
    });

    if (!user)
      throw new HttpException('User not found.', HttpStatus.UNAUTHORIZED);

    return user;
  }
}
