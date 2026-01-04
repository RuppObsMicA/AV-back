import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';

@ApiTags('Roles')
@Controller('roles')
export class RolesController {

    constructor(private roleService: RolesService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new role' })
    @ApiResponse({ status: 201, description: 'Role has been successfully created.' })
    @ApiResponse({ status: 400, description: 'Bad request - validation failed.' })
    create(@Body() dto: CreateRoleDto) {
        return this.roleService.createRole(dto);
    }

    @Get('/:value')
    @ApiOperation({ summary: 'Get role by value' })
    @ApiParam({ name: 'value', description: 'Role value (e.g., ADMIN, USER)', example: 'ADMIN' })
    @ApiResponse({ status: 200, description: 'Role found and returned successfully.' })
    @ApiResponse({ status: 404, description: 'Role not found.' })
    getByValue(@Param('value') value: string) {
        return this.roleService.getRoleByValue(value);
    }
}
