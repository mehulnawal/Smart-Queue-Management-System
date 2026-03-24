import cloudinary from "../config/cloudinary.config.js";
import { generateTokens } from "../middlewares/generateTokens.middleware.js";
import { User } from "../models/user.model.js";
import { apiError } from "../utils/apiError.utils.js"
import { apiResponse } from "../utils/apiResponse.utils.js";
import fs from 'fs';
import bcrypt from 'bcrypt';
import mongoose from "mongoose";
import jwt from 'jsonwebtoken';
import Group from "../models/group.model.js";

// Register user
export const userRegister = async (req, res) => {

    const session = await mongoose.startSession();
    session.startTransaction();

    try {

        const { userName, userEmail, password } = req.body;

        console.log(typeof userName)
        console.log(userEmail)
        console.log(password)

        if (!userName || !userEmail || !password) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json(apiError({ message: "All fields are required" }));
        }

        // user already exist
        const emailRegex = /^[a-zA-Z0-9-_+]+@[a-zA-Z0-9-+]+\.[a-zA-Z]{2,}$/;
        const nameRegex = /^[a-zA-Z0-9 ]+$/;

        if (!emailRegex.test(userEmail)) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json(apiError({ message: "Invalid email" }));
        }

        const userExist = await User.findOne({ email: userEmail }).session(session);

        if (userExist) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json(apiError({ message: "User already taken" }));
        }

        // data validation
        const passwordRegex = /^[\d]{6}$/;

        if (!nameRegex.test(userName)) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json(apiError({ message: "Invalid name" }));
        }

        if (!passwordRegex.test(password)) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json(apiError({ message: "Invalid password" }));
        }

        // saving userImage in cloudinary
        let profileImage = ''
        if (req.file && req.file.path) {

            const imageUrl = await cloudinary.uploader.upload(req.file.path);

            profileImage = imageUrl.secure_url;
            fs.unlinkSync(req.file.path);
        }
        else {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json(apiError({ message: "Profile image is required" }));
        }

        // saving user in db
        const newUser = new User({
            email: userEmail,
            name: userName,
            password,
            profileImage: profileImage
        })
        await newUser.save({ session });
        await session.commitTransaction();
        session.endSession();

        // generate tokens
        const { accessToken, refreshToken } = await generateTokens(newUser._id);

        const options = {
            httpOnly: true,
            secure: false
        }

        res.cookie("accessToken", accessToken, options);
        res.cookie("refreshToken", refreshToken, options);

        return res.status(200).json(apiResponse({
            message: "New user created", data: newUser
        }))

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.log(`Error in creating a new user - `, error.message);
        return res.status(500).json(apiError());
    }
}

// Login
export const userLogin = async (req, res) => {
    try {

        const { userEmail, password } = req.body;

        if (!userEmail || !password)
            return res.status(400).json(apiError({ status: 400, message: "All fields are required" }));

        // user don't exist
        const emailRegex = /^[a-zA-Z0-9-_+]+@[a-zA-Z0-9-+]+\.[a-zA-Z]{2,}$/;

        if (!emailRegex.test(userEmail))
            return res.status(400).json(apiError({ status: 400, message: "Invalid credentials" }));

        const userExist = await User.findOne({ email: userEmail, status: 'unblock' }).select("+password")

        if (!userExist) {
            return res.status(400).json(apiError({ status: 400, message: "User don't exist" }));
        }

        // data validation
        const passwordRegex = /^[\d]{6}$/;

        if (!passwordRegex.test(password)) {
            return res.status(400).json(apiError({ status: 400, message: "Invalid credentials" }));
        }

        // checking if password is correct 
        const isPasswordCorrect = await bcrypt.compare(password, userExist.password);

        if (!isPasswordCorrect)
            return res.status(400).json(apiError({ status: 400, message: "Invalid credentials" }));

        // generate tokens
        const { accessToken, refreshToken } = await generateTokens(userExist._id);

        const options = {
            httpOnly: true,
            secure: false
        }

        res.cookie("accessToken", accessToken, options);
        res.cookie("refreshToken", refreshToken, options);

        return res.status(200).json(apiResponse({
            message: "User logged in", data: userExist
        }))

    } catch (error) {
        console.log(`Error in logging a user - `, error.message);
        return res.status(500).json(apiError({}));
    }
}

// Logout
export const logOut = async (req, res) => {
    try {

        const { userId } = req.params;

        if (!userId || !mongoose.Types.ObjectId.isValid(userId))
            return res.status(400).json(apiError({ message: "Invalid user id" }));

        const user = await User.findById(userId);

        if (!user)
            return res.status(400).json(apiError({ message: "User not found" }));

        user.refreshTokenKey = null;
        await user.save();

        const cookieOptions = {
            httpOnly: true,
            secure: false,
        };

        res.clearCookie("accessToken", cookieOptions);
        res.clearCookie("refreshToken", cookieOptions);

        return res.status(200).json(apiResponse({ message: "Logout successful", data: user }));

    } catch (error) {
        console.log(`Error in logout a user- `, error.message);
        return res.status(500).json(apiError({ message: "Something went wrong" }));
    }
}

// Reset refresh token
export const resetTokens = async (req, res) => {
    try {

        const { refreshToken: refreshTokenFromCookie } = req.cookies;

        if (!refreshTokenFromCookie)
            return res.status(400).json(apiError({ message: "Invalid refresh token" }));

        const decode = await jwt.verify(refreshTokenFromCookie, process.env.REFRESH_TOKEN_SECRET_KEY);

        if (!decode)
            return res.status(400).json(apiError({ message: "Invalid refresh token" }));

        const user = await User.findById(decode.id);

        if (!user)
            return res.status(400).json(apiError({ message: "User not found" }));

        const { accessToken, refreshToken } = await generateTokens(user._id);

        const cookieOptions = {
            httpOnly: true,
            secure: false
        };

        res.cookie("accessToken", accessToken, cookieOptions);
        res.cookie("refreshToken", refreshToken, cookieOptions);

        return res.status(200).json(apiResponse({ message: "Tokens reset" }));

    } catch (error) {
        console.log(`Error in resetting refresh token - `, error.message);
        return res.status(500).json(apiError({ message: "Something wen wrong" }));
    }
}

// Delete the user - it should also delete all the groups created by that user
export const deleteUser = async (req, res) => {

    const session = await mongoose.startSession();
    await session.startTransaction();

    try {

        const { userId } = req.params;

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            await session.abortTransaction();
            return res.status(400).json(apiError({ message: "UserId is not valid" }));
        }

        const user = await User.findOne({
            _id: userId,
            status: 'unblock'
        });

        if (!user) {
            await session.abortTransaction();
            return res.status(400).json(apiError({ message: "UserId not found" }));
        }

        await Group.deleteMany(
            { userId: user._id },
            { session }
        );

        const deletedUser = await User.findByIdAndDelete(user._id, { session });

        if (!deletedUser) {
            await session.abortTransaction();
            return res.status(404).json(apiError({ message: "User not found" }));
        }

        await session.commitTransaction();

        const cookieOptions = {
            httpOnly: true,
            secure: false,
        };

        res.clearCookie("accessToken", cookieOptions);
        res.clearCookie("refreshToken", cookieOptions);

        return res.status(200).json(apiResponse({ message: "User deleted successfully", data: user }));

    } catch (error) {
        await session.abortTransaction();
        console.log(`Error in deleting the user - `, error.message);
        return res.status(500).json(apiError({ message: "Something went wrong" }));

    } finally {
        session.endSession();
    }
}

// update the user
export const updateUser = async (req, res) => {

    let newImageUrl = '';
    if (req.file && req.file.path) {
        const imageURL = await cloudinary.uploader.upload(req.file.path);
        newImageUrl = imageURL.secure_url;


        fs.unlinkSync(req.file.path);
    }
    else {
        await session.abortTransaction();
        return res.status(400).json(apiError({ message: "Profile image is required" }));
    }

    const session = await mongoose.startSession();
    await session.startTransaction();

    try {

        const { userId } = req.params;
        const { email, name } = req.body;

        if (userId !== req.user._id.toString()) {
            await session.abortTransaction();
            return res.status(403).json(apiError({ message: "Unauthorized" }));
        }

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            await session.abortTransaction();
            return res.status(400).json(apiError({ message: "InValid UserId" }));
        }

        const user = await User.findOne({
            _id: userId,
            status: 'unblock'
        });

        if (!user) {
            await session.abortTransaction();
            return res.status(400).json(apiError({ message: "User not found" }));
        }

        const emailRegex = /^[a-zA-Z0-9-_+]+@[a-zA-Z0-9-+]+\.[a-zA-Z]{2,}$/;
        const nameRegex = /^[a-zA-Z0-9 ]+$/;

        if (email) {
            if (!emailRegex.test(email)) {
                await session.abortTransaction();
                return res.status(400).json(apiError({ message: "InValid email" }));
            }

            user.email = email;
        }

        if (name) {
            if (!nameRegex.test(name)) {
                await session.abortTransaction();
                return res.status(400).json(apiError({ message: "InValid name" }));
            }

            user.name = name;
        }

        if (newImageUrl) {
            user.profileImage = newImageUrl;
        }

        await user.save({ session });
        await session.commitTransaction();

        return res.status(200).json(apiResponse({
            message: "User updated successfully",
            data: user
        }));

    } catch (error) {
        await session.abortTransaction();
        console.log(`Error in updating the user - `, error.message);
        return res.status(500).json(apiError({ message: "Something went wrong" }));

    } finally {
        session.endSession();
    }
}

// Super Admin

// Get all users
export const getAllUsers = async (req, res) => {

    try {

        const users = await User.find({
            userRole: { $in: ['user', 'admin'] }
        })

        return res.status(200).json(apiResponse({ message: "All users successful", data: users }));

    } catch (error) {
        console.log(`Error get all users- `, error.message);
        return res.status(500).json(apiError({ message: "Something went wrong" }));
    }
}

// If a user is blocked then all his groups will also be blocked
export const toggleUserStatus = async (req, res) => {

    const session = await mongoose.startSession();
    await session.startTransaction();

    try {

        const { userId } = req.params;

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            await session.abortTransaction();
            return res.status(400).json(apiError({ message: "UserId is not valid" }));
        }

        const user = await User.findById(userId).session(session);

        if (!user) {
            await session.abortTransaction();
            return res.status(400).json(apiError({ message: "User not found" }));
        }

        user.status = user.status == 'block' ? 'unblock' : 'block';
        await user.save({ validateBeforeSave: false, session });
        await session.commitTransaction();

        return res.status(200).json(apiResponse({ message: "User is blocked", data: user }));

    } catch (error) {
        await session.abortTransaction();
        console.log(`Error blocking a user- `, error.message);
        return res.status(500).json(apiError({ message: "Something went wrong" }));

    } finally {
        session.endSession();
    }
}