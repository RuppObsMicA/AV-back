import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { UsersModule } from './users/users.module';
import { ConfigModule } from "@nestjs/config";
import { User } from "./users/users.model";
import { RolesModule } from './roles/roles.module';
import { Role } from "./roles/roles.model";
import { UserRoles } from "./roles/user-roles.model";
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';

// Function to parse DATABASE_URL into connection config
function getDatabaseConfig() {
    const databaseUrl = process.env.DATABASE_URL;

    if (databaseUrl) {
        // Parse DATABASE_URL: postgres://user:pass@host:port/database
        const url = new URL(databaseUrl);
        return {
            dialect: 'postgres' as const,
            host: url.hostname,
            port: parseInt(url.port, 10),
            username: url.username,
            password: url.password,
            database: url.pathname.slice(1), // Remove leading /
            models: [User, Role, UserRoles],
            autoLoadModels: true,
            synchronize: true,
            sync: { alter: true },
            logging: false, // Disable SQL logging in production
        };
    }

    // Local development with separate environment variables
    return {
        dialect: 'postgres' as const,
        host: process.env.POSTGRES_HOST,
        port: process.env.POSTGRES_PORT as unknown as number,
        username: process.env.POSTGRES_USERNAME,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DB,
        models: [User, Role, UserRoles],
        autoLoadModels: true,
        synchronize: true,
        sync: { alter: true },
    };
}

@Module({
    controllers: [AppController],
    providers: [],
    imports: [
        ConfigModule.forRoot({
            envFilePath: `.${process.env.NODE_ENV}.env`,
        }),
        SequelizeModule.forRoot(getDatabaseConfig()),
        UsersModule,
        RolesModule,
        AuthModule,
  ],
})
export class AppModule {
    
}