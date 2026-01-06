import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { RolesService } from 'src/roles/roles.service';
import { AddRoleDto } from './dto/add-role.dto';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
    constructor(
        private prisma: PrismaService,
        private roleService: RolesService
    ) {}

    async createUser(userDto: CreateUserDto): Promise<User> {
        const candidate = await this.getUserByEmail(userDto.email);

        if (candidate) {
            throw new BadRequestException('Email already exists');
        }

        const role = await this.roleService.getRoleByValue('ADMIN');

        const user = await this.prisma.user.create({
            data: {
                email: userDto.email,
                password: userDto.password,
                roles: {
                    create: {
                        roleId: role.id,
                    },
                },
            },
            include: {
                roles: {
                    include: {
                        role: true,
                    },
                },
            },
        });

        return user;
    }

    async getAllUsers(): Promise<User[]> {
        const users = await this.prisma.user.findMany({
            include: {
                roles: {
                    include: {
                        role: true,
                    },
                },
            },
        });
        return users;
    }

    async getUserByEmail(email: string): Promise<User | null> {
        const user = await this.prisma.user.findUnique({
            where: { email },
            include: {
                roles: {
                    include: {
                        role: true,
                    },
                },
            },
        });
        return user;
    }

    async addRole(dto: AddRoleDto): Promise<AddRoleDto> {
        const user = await this.prisma.user.findUnique({
            where: { id: dto.userId },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const role = await this.roleService.getRoleByValue(dto.value);

        await this.prisma.userRole.create({
            data: {
                userId: dto.userId,
                roleId: role.id,
            },
        });

        return dto;
    }

    async createPendingUser(data: {
        email: string;
        confirmationHash: string;
        confirmationExpires: Date;
    }): Promise<User> {
        const role = await this.roleService.getRoleByValue('normal');

        const user = await this.prisma.user.create({
            data: {
                email: data.email,
                password: null,
                confirmationHash: data.confirmationHash,
                confirmationExpires: data.confirmationExpires,
                status: 'pending',
                roles: {
                    create: {
                        roleId: role.id,
                    },
                },
            },
            include: {
                roles: {
                    include: {
                        role: true,
                    },
                },
            },
        });

        return user;
    }

    async getUserByConfirmationHash(hash: string): Promise<User | null> {
        const user = await this.prisma.user.findUnique({
            where: { confirmationHash: hash },
            include: {
                roles: {
                    include: {
                        role: true,
                    },
                },
            },
        });
        return user;
    }
}
