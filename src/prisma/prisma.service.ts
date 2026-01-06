import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    async onModuleInit() {
        // Connect to database when module initializes
        await this.$connect();
        console.log('✅ Prisma connected to database');
    }

    async onModuleDestroy() {
        // Disconnect from database when module destroys
        await this.$disconnect();
        console.log('❌ Prisma disconnected from database');
    }

    // Helper method for soft deletes (if needed)
    async softDelete<T>(model: any, where: any): Promise<T> {
        return model.update({
            where,
            data: { deletedAt: new Date() },
        });
    }
}
