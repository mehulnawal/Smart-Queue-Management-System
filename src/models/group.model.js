import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(

    {
        groupName: {
            type: String,
            required: [true, "Group name is required"],
            unique: [true, "Group name should be unique"],
            trim: true
        },

        adminId: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: true
        }
    },

    { timestamps: true }
)

const Group = mongoose.model("Group", groupSchema);
export default Group