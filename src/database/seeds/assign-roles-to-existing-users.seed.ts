import { User } from '../../users/users.model';
import { Role } from '../../roles/roles.model';

/**
 * Assigns 'normal' role to all users who don't have roles
 * Used for fixing data in existing database
 */
export const assignRolesToExistingUsersSeed = async () => {
    console.log('👥 Assigning roles to existing users without roles...');

    // Find 'normal' role
    const normalRole = await Role.findOne({ where: { value: 'normal' } });

    if (!normalRole) {
        console.log('❌ Role "normal" not found! Run roles seed first.');
        return;
    }

    // Find all active users
    const users = await User.findAll({
        include: { all: true }
    });

    let assignedCount = 0;

    for (const user of users) {
        // Check if user has roles
        if (!user.roles || user.roles.length === 0) {
            // Assign 'normal' role
            await user.$set('roles', [normalRole.id]);
            console.log(`✅ Assigned 'normal' role to user: ${user.email}`);
            assignedCount++;
        } else {
            console.log(`⏭️  User ${user.email} already has role: ${user.roles.map(r => r.value).join(', ')}`);
        }
    }

    if (assignedCount === 0) {
        console.log('ℹ️  No users without roles found');
    } else {
        console.log(`✅ Assigned roles to ${assignedCount} user(s)`);
    }
};
