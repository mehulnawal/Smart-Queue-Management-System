import mongoose from "mongoose";
import { Queue } from "../models/queue.model.js";
import { Ticket } from "../models/ticket.model.js";

// Join Queue
export const joinQueue = async (req, res) => {

    const session = await mongoose.startSession();
    await session.startTransaction();

    let queueId;

    try {

        queueId = req.params.queueId;

        if (!queueId || !mongoose.Types.ObjectId.isValid(queueId)) {
            await session.abortTransaction();
            return res.status(400).json(apiError({ message: "Invalid Queue Id" }));
        }

        const queue = await Queue.findById(queueId);

        if (!queue) {
            await session.abortTransaction();
            return res.status(400).json(apiError({ message: "Queue does not exist" }));
        }

        if (queue.status === 'closed') {
            await session.abortTransaction();
            return res.status(400).json(apiError({ message: "Queue is closed. Cannot join now" }));
        }

        const tickets = await Ticket.find({ queueId: queue._id }).sort({ ticketNumber: -1 }).limit(1).session(session);

        let ticketNumber;
        if (tickets.length === 0)
            ticketNumber = 1;
        else
            ticketNumber = tickets[0]?.ticketNumber + 1;

        const newTicket = new Ticket({
            ticketNumber,
            queueId
        })

        await newTicket.save({ session });
        await session.commitTransaction();

        return res.status(201).json({
            success: true,
            message: "Your ticket is generated",
            data: newTicket.ticketNumber
        });

    } catch (error) {
        if (session.inTransaction())
            await session.abortTransaction();

        console.error('JoinQueue Error:', {
            queueId,
            message: error.message,
        });
        return res.status(500).json(apiError({ message: "Something went wrong" }));

    } finally {
        session.endSession();
    }
}

// Call next
export const nextCall = async (req, res) => {

    const session = await mongoose.startSession();
    await session.startTransaction();
    let queueId;

    try {
        queueId = req.params.queueId;

        if (!queueId || !mongoose.Types.ObjectId.isValid(queueId)) {
            await session.abortTransaction();
            return res.status(400).json(apiError({ message: "Invalid Queue Id" }));
        }

        const queue = await Queue.findById(queueId);

        if (!queue) {
            await session.abortTransaction();
            return res.status(400).json(apiError({ message: "Queue does not exist" }));
        }

        if (queue.status === 'closed') {
            await session.abortTransaction();
            return res.status(400).json(apiError({ message: "Queue is closed." }));
        }

        const nextTicket = await Ticket.find({
            status: 'waiting',
            queueId
        }).sort({ ticketNumber: 1 }).limit(1);

        console.log(nextTicket);

        nextTicket[0].status = 'serving';
        await nextTicket.save({ session });

        // previous ticket handling 
        // no-null checks

        queue.currentServingNumber = nextTicket.ticketNumber;
        await queue.save({ session });
        await session.commitTransaction();

        return res.status(200).json({
            success: true,
            message: "Next ticket called",
            data: queue.currentServingNumber
        });


    } catch (error) {
        if (session.inTransaction())
            await session.abortTransaction();

        console.error('NextCall Error:', {
            queueId,
            message: error.message,
        });
        return res.status(500).json(apiError({ message: "Something went wrong" }));

    } finally {
        session.endSession();
    }
}


// 1 2 3 4 5 6 7 8
// callNext - Call - 6