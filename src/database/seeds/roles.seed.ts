import { Role } from '../../roles/roles.model';

export const rolesSeed = async () => {
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
        // Check if role exists
        const existingRole = await Role.findOne({ where: { value: roleData.value } });

        if (!existingRole) {
            // Create role only if it doesn't exist
            await Role.create(roleData);
            console.log(`✅ Role "${roleData.value}" created`);
        } else {
            console.log(`⏭️  Role "${roleData.value}" already exists, skipping`);
        }
    }
};
