import { User } from '../users.model';

export class UserSerializer {
    static toResponse(user: User) {
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
            status: null,        // TODO: will be loaded from related table
            role: user.roles?.[0] || null,
            subscribePlan: null, // TODO: will be loaded from related table
            __entity: 'User',
            title: user.title // using virtual field (getter)
        };
    }
}
