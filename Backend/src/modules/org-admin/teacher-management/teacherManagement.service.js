import bcrypt from 'bcryptjs';
import {
    createTeacherAccount,
    getTeachersByOrganization
} from './teacherManagement.repository.js';

export const listTeachers = async ({ organizationId, search, status }) => {
    if (!organizationId) {
        const error = new Error('Organization ID is required');
        error.statusCode = 400;
        throw error;
    }

    return getTeachersByOrganization(
        organizationId,
        typeof search === 'string' ? search.trim() : '',
        status === 'active' || status === 'inactive' ? status : ''
    );
};

export const addTeacher = async ({
    organizationId,
    name,
    email,
    temporaryPassword
}) => {
    const normalizedName = typeof name === 'string' ? name.trim() : '';
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (!normalizedName || !normalizedEmail
        || typeof temporaryPassword !== 'string'
        || temporaryPassword.length < 10) {
        const error = new Error('Name, valid email, and a temporary password of at least 10 characters are required');
        error.statusCode = 400;
        throw error;
    }

    if (normalizedName.length > 255 || normalizedEmail.length > 191
        || Buffer.byteLength(temporaryPassword, 'utf8') > 72) {
        const error = new Error('Some fields exceed their maximum allowed length');
        error.statusCode = 400;
        throw error;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        const error = new Error('Provide a valid email address');
        error.statusCode = 400;
        throw error;
    }

    const passwordHash = await bcrypt.hash(temporaryPassword, 12);
    try {
        return await createTeacherAccount({
            organizationId,
            name: normalizedName,
            email: normalizedEmail,
            passwordHash
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            const conflict = new Error('An account with this email already exists');
            conflict.statusCode = 409;
            throw conflict;
        }
        throw error;
    }
};
