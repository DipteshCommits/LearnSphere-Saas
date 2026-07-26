import { loginUser } from "./auth.service.js";

export const login = async (req,res , next) =>{
    try{
        const { email, password } = req.body;

        if(!email || !password){
            return res.status(400).json({
                message:"Email and password are required"
            });
        }
        
        const data = await loginUser(email, password);

        res.status(200).json({
            message:"Login successful",
            data
        });
    } catch (error) {
        next(error);
    }
}