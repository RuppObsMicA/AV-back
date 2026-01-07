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

        // 2. Seed languages
        console.log('\n🌍 Seeding languages...');
        const languages = [
            {
                id: 1,
                name: 'English',
                code: 'en',
                direction: 'ltr'  // Left-to-right
            },
            {
                id: 2,
                name: 'Russian',
                code: 'ru',
                direction: 'ltr'
            },
            {
                id: 3,
                name: 'Spanish',
                code: 'es',
                direction: 'ltr'
            },
            {
                id: 4,
                name: 'French',
                code: 'fr',
                direction: 'ltr'
            },
            {
                id: 5,
                name: 'Arabic',
                code: 'ar',
                direction: 'rtl'  // Right-to-left
            }
        ];

        for (const languageData of languages) {
            const existingLanguage = await prisma.language.findUnique({
                where: { code: languageData.code }
            });

            if (!existingLanguage) {
                await prisma.language.create({ data: languageData });
                console.log(`✅ Language "${languageData.name}" (${languageData.code}) created with ID ${languageData.id}`);
            } else {
                console.log(`⏭️  Language "${languageData.name}" already exists, skipping`);
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
