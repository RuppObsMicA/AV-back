import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { runSeeds } from './seeds';

/**
 * Script to run database seeds
 * Runs with command: npm run seed
 */
async function bootstrap() {
    // Create NestJS application (needed for DB connection via Sequelize)
    const app = await NestFactory.createApplicationContext(AppModule);

    try {
        // Run all seeds
        await runSeeds();
    } catch (error) {
        console.error('Failed to seed database:', error);
        process.exit(1);
    } finally {
        // Close application
        await app.close();
    }
}

bootstrap();
