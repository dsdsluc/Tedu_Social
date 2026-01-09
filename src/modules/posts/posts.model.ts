import mongoose, { Model } from "mongoose";
import { IPost } from "./posts.interface";

const PostSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    images: {
      type: [String],
      default: [],
    },

    text: {
      type: String,
      required: true,
    },
    name: String,
    avatar: String,

    likes: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },
      },
    ],

    shares: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },
      },
    ],

    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },
        text: {
          type: String,
          required: true,
        },
        name: String,
        avatar: String,
      },
    ],
  },
  { timestamps: true }
);

const PostModel: Model<IPost> = mongoose.model<IPost>("post", PostSchema);

export default PostModel;
