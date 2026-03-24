import { User } from "../models/user.model.js"

export const generateTokens = async (userId) => {

    // find user
    const user = await User.findById(userId);

    if (!user)
        throw new Error("User does not exist", false);

    // generating tokens
    const accessToken = await user.accessToken();
    const refreshToken = await user.refreshToken();

    // saving refresh token in user 
    user.refreshTokenKey = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
}