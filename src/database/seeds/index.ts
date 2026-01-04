import { rolesSeed } from './roles.seed';
import { assignRolesToExistingUsersSeed } from './assign-roles-to-existing-users.seed';

/**
 * Main function to run all seeds
 * Execution order is important! First create base data (roles),
 * then dependent data (users with roles)
 */
export const runSeeds = async () => {
    console.log('🌱 Starting database seeding...\n');

    try {
        // 1. Roles (base entity on which users depend)
        console.log('📋 Seeding roles...');
        await rolesSeed();

        // 2. Assign roles to existing users (if they don't have roles)
        await assignRolesToExistingUsersSeed();

        // 3. Other seeds can be added here
        // await usersSeed();
        // await categoriesSeed();

        console.log('\n✅ Database seeding completed successfully!');
    } catch (error) {
        console.error('\n❌ Error during seeding:', error);
        throw error;
    }
};
