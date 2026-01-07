import { User } from '@prisma/client';

// Type for User with included relations (roles and languages)
type UserWithRoles = User & {
    roles?: Array<{
        role: {
            id: number;
            value: string;
            description: string;
        };
    }>;
    inputLanguage?: {
        id: number;
        name: string;
        code: string;
    } | null;
    outputLanguage?: {
        id: number;
        name: string;
        code: string;
    } | null;
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
            inputLanguage: user.inputLanguage || null,
            outputLanguage: user.outputLanguage || null,
            department: null,    // TODO: will be loaded from related table
            status: user.status,
            role: firstRole,
            subscribePlan: null, // TODO: will be loaded from related table
            __entity: 'User',
            title: title
        };
    }
}
