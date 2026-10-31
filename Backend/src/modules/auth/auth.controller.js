import { changePassword, loginUser } from "./auth.service.js";

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const data = await loginUser(email, password);
        res.status(200).json({
            message: "Login successful",
            data
        });
    } catch (error) {
        next(error);
    }
};

export const changeCurrentUserPassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (typeof currentPassword !== "string" || typeof newPassword !== "string") {
            return res.status(400).json({
                message: "Current password and new password are required"
            });
        }

        if (newPassword.length < 10) {
            return res.status(400).json({
                message: "New password must be at least 10 characters"
            });
        }

        if (Buffer.byteLength(newPassword, "utf8") > 72) {
            return res.status(400).json({
                message: "New password must be 72 bytes or fewer"
            });
        }

        if (currentPassword === newPassword) {
            return res.status(400).json({
                message: "New password must be different from the temporary password"
            });
        }

        const token = await changePassword(req.user.id, currentPassword, newPassword);
        res.status(200).json({
            message: "Password changed successfully",
            data: { token }
        });
    } catch (error) {
        next(error);
    }
};
