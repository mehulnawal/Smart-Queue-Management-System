import { User } from "../models/user.model.js";
import { apiError } from "../utils/apiError.utils.js";

export const roleBasedAuth = (...role) => {

    return async (req, res, next) => {

        try {

            const user = await User.findById(req.user._id);

            console.log(user);

            if (!user) {
                return res.status(400).json(apiError({ message: "User not found" }));
            }

            if (!role.includes(user.role))
                return res.status(400).json(apiError({ message: "Access Denied" }));

            req.user = user;
            next();

        } catch (error) {
            console.log("Error in role based auth:", error.message);
            return res.status(500).json(apiError({ message: "Something went wrong" }));
        }

    }
}