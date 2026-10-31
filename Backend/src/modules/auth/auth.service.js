import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
    findUserByEmail,
    findUserPasswordById,
    updateUserPassword
} from './auth.repository.js';
import dotenv from 'dotenv';

dotenv.config();

export const loginUser = async (email, password) => {
    const user = await findUserByEmail(email);
    // console.log(user)

    if (!user) {
        throw new Error('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
        throw new Error('Invalid email or password');
    }


    const token = jwt.sign({
        userId: user.id,
        role: user.role,
        organizationId: user.organizationId
    }, process.env.JWT_SECRET, {expiresIn: '7d'}
);

    return {
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            organizationId: user.organizationId,
            mustChangePassword: Boolean(Number(user.mustChangePassword))
        }
    };
};

export const changePassword = async (userId, currentPassword, newPassword) => {
    const user = await findUserPasswordById(userId);
    if (!user || !user.must_change_password) {
        const error = new Error('Password change is not required for this account');
        error.statusCode = 400;
        throw error;
    }

    const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password_hash
    );
    if (!isCurrentPasswordValid) {
        const error = new Error('Current password is incorrect');
        error.statusCode = 400;
        throw error;
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await updateUserPassword(userId, passwordHash);
};