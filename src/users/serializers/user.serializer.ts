import { User } from '@prisma/client';

// Type for User with included relations (roles)
type UserWithRoles = User & {
    roles?: Array<{
        role: {
            id: number;
            value: string;
            description: string;
        };
    }>;
};

export class UserSerializer {
    static toResponse(user: UserWithRoles) {
        // Extract the first role value from the many-to-many relation
        const firstRole = user.roles?.[0]?.role || null;

        // Create title from firstName and lastName
        const title = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;

        return {
            id: user.id,
            email: user.email,
            provider: user.provider,
            socialId: user.socialId,
            firstName: user.firstName,
            lastName: user.lastName,
            newEmail: user.newEmail,
            dateBirth: user.dateBirth,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            deletedAt: user.deletedAt,
            isTwoFAEnabled: user.isTwoFAEnabled,
            directoryId: user.directoryId,
            organization: null, // TODO: will be loaded from related table
            photo: null,        // TODO: will be loaded from related table
            inputLanguage: null, // TODO: will be loaded from related table
            outputLanguage: null, // TODO: will be loaded from related table
            department: null,    // TODO: will be loaded from related table
            status: user.status,
            role: firstRole,
            subscribePlan: null, // TODO: will be loaded from related table
            __entity: 'User',
            title: title
        };
    }
}
