import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script to run database seeds with Prisma
 * Runs with command: npm run seed
 */
async function main() {
    console.log('🌱 Starting database seeding...\n');

    try {
        // 1. Seed roles
        console.log('📋 Seeding roles...');
        const roles = [
            {
                value: 'normal',
                description: 'Normal user of the system with basic permissions'
            },
            {
                value: 'superuser',
                description: 'Superuser with elevated permissions (can manage users and content)'
            },
            {
                value: 'ADMIN',
                description: 'Administrator with full system access'
            }
        ];

        for (const roleData of roles) {
            const existingRole = await prisma.role.findUnique({
                where: { value: roleData.value }
            });

            if (!existingRole) {
                await prisma.role.create({ data: roleData });
                console.log(`✅ Role "${roleData.value}" created`);
            } else {
                console.log(`⏭️  Role "${roleData.value}" already exists, skipping`);
            }
        }

        console.log('\n✅ Database seeding completed successfully!');
    } catch (error) {
        console.error('\n❌ Error during seeding:', error);
        throw error;
    }
}

main()
    .catch((error) => {
        console.error('Failed to seed database:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
