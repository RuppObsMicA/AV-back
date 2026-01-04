import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from './users.model';
import { InjectModel } from '@nestjs/sequelize';
import { CreateUserDto } from './dto/create-user.dto';
import { RolesService } from 'src/roles/roles.service';
import { AddRoleDto } from './dto/add-role.dto';
import { BanUserDto } from './dto/ban-user.dto';

@Injectable()
export class UsersService {

    constructor(@InjectModel(User) private userRepository: typeof User, private roleService: RolesService) { }

    async createUser(userDto: CreateUserDto) {
        const candidate = await this.getUserByEmail(userDto.email);

        if (candidate) {
            throw new HttpException('Email exists', HttpStatus.BAD_REQUEST);
        }

        const user = await this.userRepository.create(userDto);

        const role = await this.roleService.getRoleByValue('ADMIN');

        await user.$set('roles', [role!.id])
        user.roles = [role!]
        return user;
    }

    async getAllUsers() {
        const users = await this.userRepository.findAll({ include: { all: true } });
        return users;
    }

    async getUserByEmail(email: string) {
        const user = await this.userRepository.findOne({ where: { email }, include: { all: true } })
        return user;
    }

    async addRole(dto: AddRoleDto) {
        const user = await this.userRepository.findByPk(dto.userId);

        const role = await this.roleService.getRoleByValue(dto.value);

        if (role && user) {
            await user?.$add('role', role.id);
            return dto;
        }
        throw new HttpException('User or role not found', HttpStatus.NOT_FOUND )
    }

    async ban(dto: BanUserDto) {
        const user = await this.userRepository.findByPk(dto.userId);

        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND )
        }

        user.dataValues.banned = true;
        user.dataValues.banReason = dto.banReason;

        await user?.save();

        return user;

    }

    // Create pending user
    async createPendingUser(data: {
        email: string;
        confirmationHash: string;
        confirmationExpires: Date;
    }) {
        const user = await this.userRepository.create({
            email: data.email,
            password: null, // password not set yet
            confirmationHash: data.confirmationHash,
            confirmationExpires: data.confirmationExpires,
            status: 'pending',
        });

        // Assign default role (not ADMIN, but normal!)
        const role = await this.roleService.getRoleByValue('normal');

        if (role) {
            await user.$set('roles', [role.id]);
            user.roles = [role];
        }

        return user;
    }

    // Get user by confirmation hash
    async getUserByConfirmationHash(hash: string) {
        const user = await this.userRepository.findOne({
            where: { confirmationHash: hash },
            include: { all: true },
        });
        return user;
    }
}
