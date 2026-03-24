import mongoose from "mongoose";
import { apiError } from "../utils/apiError.utils.js";
import Group from "../models/group.model.js";
import { User } from "../models/user.model.js";

// Get all groups
export const getAllGroup = async (req, res) => {
    try {

        const groups = await Group.find({
            adminId: req.user._id
        })

        return res.status(200).json({
            success: true,
            message: "All groups fetched successfully",
            data: groups
        });

    } catch (error) {

        console.log(`Cannot get all groups - ${error.message}`);
        return res.status(500).json(apiError({ message: "Something went wrong" }));
    }
}

// Create a new group
export const createGroup = async (req, res) => {

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { groupName } = req.body;

        if (!groupName) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json(apiError({ message: "Group name is required" }));
        }

        const nameRegex = /^[a-zA-Z0-9 ]+$/;

        if (!nameRegex.test(groupName)) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json(apiError({ message: "Invalid Group name" }));
        }

        const newGroup = new Group({
            groupName,
            adminId: req.user._id,
        })
        await newGroup.save({ session });

        const user = await User.findById(req.user._id).session(session);

        if (!user) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json(apiError({ message: "User not found" }));
        }

        user.groupId = newGroup._id;
        user.userRole = 'admin';
        user.adminId = req.user._id;
        await user.save({ validateBeforeSave: false, session });

        await session.commitTransaction();
        session.endSession();

        return res.status(201).json({
            success: true,
            message: "Group created successfully",
            data: newGroup
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.log(`Cannot create new group - ${error.message}`);
        return res.status(500).json(apiError({ message: "Something went wrong" }));
    }
}

// Delete a group
export const deleteGroup = async (req, res) => {

    const session = await mongoose.startSession();
    session.startTransaction()

    let groupId;

    try {

        groupId = req.params.groupId;

        if (!groupId || !mongoose.Types.ObjectId.isValid(groupId)) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json(apiError({ message: "Invalid group id" }));
        }

        const deleteGroup = await Group.findOneAndDelete(
            { _id: groupId, adminId: req.user._id },
            { session }
        );

        if (!deleteGroup) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json(apiError({ message: "Group not found or you don't have permission to delete it." }));
        }

        const user = await User.findById(deleteGroup.adminId).session(session);

        if (user) {
            user.groupId = null;
            user.userRole = 'user';
            await user.save({ session });
        }

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
            success: true,
            message: "Group deleted successfully",
            data: deleteGroup
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        console.error('deleteGroup Error:', {
            queueId,
            message: error.message,
        });
        return res.status(500).json(apiError({ message: "Something went wrong" }));
    }
}

// Update a group
export const updateGroup = async (req, res) => {

    const session = await mongoose.startSession();
    await session.startTransaction();
    let groupId;

    try {

        groupId = req.params.groupId;
        const { groupName } = req.body;

        if (!groupId || !mongoose.Types.ObjectId.isValid(groupId)) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json(apiError({ message: "Invalid group id" }));
        }

        const groupRegex = /^[a-zA-Z0-9 ]+$/;

        if (!groupName || !groupRegex.test(groupName)) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json(apiError({ message: "Invalid group name" }));
        }

        const group = await Group.findOne({
            _id: groupId,
            adminId: req.user._id,
        })

        if (!group) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json(apiError({ message: "Group not found" }));
        }

        group.groupName = groupName;
        await group.save({ session });

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
            success: true,
            message: "Group updated successfully",
            data: group
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        console.error('updateGroup Error:', {
            queueId,
            message: error.message,
        });
        return res.status(500).json(apiError({ message: "Something went wrong" }));
    }
}