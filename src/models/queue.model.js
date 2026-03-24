import mongoose from "mongoose";

const queueSchema = new mongoose.Schema(
    {
        queueName: {
            type: String,
            required: [true, "Queue name is required"],
            trim: true,
            lowercase: true
        },

        groupId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Group",
            required: [true, "Group name is required"]
        },

        status: {
            type: String,
            enum: {
                values: ['open', 'closed'],
                message: `{VALUE} is not correct. Only open and closed values are correct`
            },
            default: 'open'
        },

        currentServingNumber: {
            type: Number,
            default: 0
        }
    },

    { timestamps: true }
)

export const Queue = mongoose.model("Queue", queueSchema);