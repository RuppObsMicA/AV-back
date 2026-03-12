import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

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

        // 3. Seed default users
        console.log('\n👤 Seeding default users...');
        const defaultUsers = [
            { email: 'admin@admin.com', password: 'admin123', role: 'ADMIN' },
            { email: 'user1@test.com', password: 'user1123', role: 'normal' },
            { email: 'user2@test.com', password: 'user2123', role: 'normal' },
        ];

        for (const userData of defaultUsers) {
            const existing = await prisma.user.findUnique({ where: { email: userData.email } });

            if (!existing) {
                const hashedPassword = await bcrypt.hash(userData.password, 5);
                const role = await prisma.role.findUnique({ where: { value: userData.role } });

                await prisma.user.create({
                    data: {
                        email: userData.email,
                        password: hashedPassword,
                        status: 'active', // skip email confirmation for seed users
                        roles: { create: { roleId: role!.id } },
                    },
                });
                console.log(`✅ User created: ${userData.email} / ${userData.password}`);
            } else {
                console.log(`⏭️  User "${userData.email}" already exists, skipping`);
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
