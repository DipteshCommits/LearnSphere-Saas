import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {findUserByEmail} from './auth.repository.js';
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
        user
    };
};