import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { apiError } from "../utils/apiError.utils.js";

export const authentication = async (req, res, next) => {
    try {
        const { accessToken } = req.cookies;

        if (!accessToken) {
            return res.status(401).json(apiError({ message: "Unauthorized" }));
        }

        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET_KEY);

        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json(apiError({ message: "User not found" }));
        }

        // checking for block user
        if (user.status === 'block') {
            return res.status(403).json({
                message: "Your account is blocked. Please contact support."
            });
        }

        req.user = user;

        next();

    } catch (error) {

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json(apiError({
                message: "JWT Expired",
                isExpired: true
            }));
        }

        console.log("Auth error:", error.message);
        return res.status(500).json(apiError({ message: "Something went wrong" }));
    }
};