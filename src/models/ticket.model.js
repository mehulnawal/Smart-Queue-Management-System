import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(

    {
        ticketNumber: {
            type: Number,
            required: [true, "Ticket Number is required"],
            default: null
        },

        status: {
            type: String,
            enum: {
                values: ['waiting', 'serving', 'completed', 'skipped'],
                message: `{VALUE} is not correct. Only waiting, serving, completed and skipped values are correct`
            },
            default: 'waiting'
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        queueId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Queue",
            required: [true, "Queue id is required"]
        },
    },

    { timestamps: true }
)

export const Ticket = mongoose.model('Ticket', ticketSchema);