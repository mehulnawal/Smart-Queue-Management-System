import mongoose from "mongoose";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema(

    {
        email: {
            type: String,
            required: [true, "Email Id is required"],
            unique: [true, "Email Id should be unique"],
            trim: true,
            lowercase: true
        },

        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            lowercase: true
        },

        password: {
            type: String,
            required: [true, "Password is required"],
            select: false
        },

        profileImage: {
            type: String,
            required: [true, "Image is required"],
        },

        refreshTokenKey: {
            type: String,
            default: null
        },

        resetPasswordOTP: {
            type: Number,
            default: 0
        },

        resetPasswordExpiryTime: {
            type: Date,
            default: null
        },

        userRole: {
            type: String,
            enum: {
                values: ["user", "superAdmin"],
                message: `{VALUE} Invalid option. Only user and super admin are allowed`
            },
            default: 'user',
            lowercase: true,
            trim: true,
        },

        status: {
            type: String,
            enum: {
                values: ["block", "unblock"],
                message: `{VALUE} is not correct. Only block and unblock are valid`
            },
            default: 'unblock',
            trim: true,
            lowercase: true
        }
    },

    { timestamps: true }
)

// access token generating function
userSchema.methods.accessToken = async function () {
    return jwt.sign(
        {
            id: this._id,
            role: this.userRole,
            email: this.email,
        },
        process.env.ACCESS_TOKEN_SECRET_KEY,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY_TIME }
    )
}

// refresh token generating function
userSchema.methods.refreshToken = async function () {
    return jwt.sign(
        {
            id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET_KEY,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY_TIME }
    )
}

userSchema.pre('save', async function () {

    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 10);
})

export const User = mongoose.model("User", userSchema);