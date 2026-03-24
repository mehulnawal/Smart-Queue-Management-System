import mongoose from "mongoose";
import { apiError } from "../utils/apiError.utils.js";
import Group from "../models/group.model.js";
import { Queue } from "../models/queue.model.js";

export const createQueue = async (req, res) => {

    const session = await mongoose.startSession();
    await session.startTransaction();

    try {

        const { groupId } = req.params;
        const { queueName } = req.body;

        if (!queueName) {
            await session.abortTransaction();
            return res.status(400).json(apiError({ message: "Queue name is required" }));
        }

        if (!groupId || !mongoose.Types.ObjectId.isValid(groupId)) {
            await session.abortTransaction();
            return res.status(400).json(apiError({ message: "Invalid group id" }));
        }

        const group = await Group.findOne({
            _id: groupId,
            userId: req.user._id
        }).session(session);

        if (!group) {
            await session.abortTransaction();
            return res.status(404).json(apiError({
                message: "Group not found or you don't have permission to add a queue here"
            }));
        }

        const newQueue = new Queue({
            queueName,
            groupId
        });

        await newQueue.save({ session });

        await session.commitTransaction();

        return res.status(200).json({
            success: true,
            message: "Queue created successfully",
            data: newQueue
        });

    } catch (error) {

        if (session.inTransaction())
            await session.abortTransaction();

        console.log(`Cannot create a queue - ${error.message}`);
        return res.status(500).json(apiError({ message: "Something went wrong" }));

    } finally {
        session.endSession();
    }
}

// Start queue
export const startQueue = async (req, res) => {

    const session = await mongoose.startSession();
    await session.startTransaction();

    let queueId;

    try {

        queueId = req.params.queueId;

        if (!queueId || !mongoose.Types.ObjectId.isValid(queueId)) {
            await session.abortTransaction();
            return res.status(400).json(apiError({ message: "Invalid Queue Id" }));
        }

        const queue = await Queue.findById(queueId).session(session);

        if (!queue) {
            await session.abortTransaction();
            return res.status(400).json(apiError({ message: "Queue does not exist" }));
        }

        if (queue.status == 'open') {
            await session.abortTransaction();
            return res.status(400).json(apiError({ message: "Queue is already open" }));
        }

        queue.status = 'open';
        await queue.save({ session });
        await session.commitTransaction();

        return res.status(200).json({
            success: true,
            message: "Queue is open",
            data: queue
        });

    } catch (error) {
        if (session.inTransaction())
            await session.abortTransaction();

        console.error('StartQueue Error:', {
            queueId,
            message: error.message,
        });
        return res.status(500).json(apiError({ message: "Something went wrong" }));

    } finally {
        session.endSession();
    }
}

// Close queue
export const closeQueue = async (req, res) => {

    const session = await mongoose.startSession();
    await session.startTransaction();

    let queueId;

    try {

        queueId = req.params.queueId;

        if (!queueId || !mongoose.Types.ObjectId.isValid(queueId)) {
            await session.abortTransaction();
            return res.status(400).json(apiError({ message: "Invalid Queue Id" }));
        }

        const queue = await Queue.findById(queueId).session(session);

        if (!queue) {
            await session.abortTransaction();
            return res.status(400).json(apiError({ message: "Queue does not exist" }));
        }

        if (queue.status == 'closed') {
            return res.status(400).json(apiError({ message: "Queue is already closed" }));
        }

        queue.status = 'closed';
        await queue.save({ session });
        await session.commitTransaction();

        return res.status(200).json({
            success: true,
            message: "Queue is closed",
            data: queue
        });

    } catch (error) {
        if (session.inTransaction())
            await session.abortTransaction();

        console.error('CloseQueue Error:', {
            queueId,
            message: error.message,
        });

        return res.status(500).json(apiError({ message: "Something went wrong" }));

    } finally {
        session.endSession();
    }
}