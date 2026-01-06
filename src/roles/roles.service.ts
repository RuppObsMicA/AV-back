import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class RolesService {
    constructor(private prisma: PrismaService) {}

    async createRole(dto: CreateRoleDto): Promise<Role> {
        const role = await this.prisma.role.create({
            data: dto,
        });
        return role;
    }

    async getRoleByValue(value: string): Promise<Role> {
        const role = await this.prisma.role.findUnique({
            where: { value },
        });

        if (!role) {
            throw new NotFoundException(`Role with value '${value}' not found`);
        }

        return role;
    }
}
