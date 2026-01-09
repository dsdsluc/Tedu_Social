import CreatePostDto from "./dtos/create_post.dto";
import UpdatePostDto from "./dtos/update_post.dto";
import { HttpException } from "@core/exceptions";
import { IComment, ILike, IPost } from "./posts.interface";
import PostModel from "./posts.model";
import { UserSchema } from "@modules/users";
import IPagination from "@core/interfaces/pagination.interface";
import { Types } from "mongoose";
import CreateCommentDto from "./dtos/create_comment.dto";
import usersModel from "@modules/users/users.model";

export default class PostService {
  /**
   * Create new post
   */
  public async createPost(
    userId: string,
    postDto: CreatePostDto
  ): Promise<IPost> {
    const user = await UserSchema.findById(userId).select("-password").exec();

    if (!user) {
      throw new HttpException(404, "User not found");
    }

    const post = await PostModel.create({
      user: user._id,
      text: postDto.text,
      images: postDto.images ?? [],
      name: `${user.first_name} ${user.last_name}`,
      avatar: user.avatar ?? null,
    });

    return post;
  }

  /**
   * Update post (only owner)
   */
  public async updatePost(
    userId: string,
    postId: string,
    postDto: UpdatePostDto
  ): Promise<IPost> {
    const post = await PostModel.findById(postId).exec();

    if (!post) {
      throw new HttpException(404, "Post not found");
    }

    // 🔒 check owner
    if (post.user.toString() !== userId) {
      throw new HttpException(403, "User not authorized");
    }

    if (postDto.text !== undefined) {
      post.text = postDto.text;
    }

    await post.save();
    return post;
  }

  /**
   * Delete post (only owner)
   */
  public async deletePost(userId: string, postId: string): Promise<void> {
    const post = await PostModel.findById(postId).exec();

    if (!post) {
      throw new HttpException(404, "Post not found");
    }

    if (post.user.toString() !== userId) {
      throw new HttpException(403, "User not authorized");
    }

    await post.deleteOne();
  }

  /**
   * Get all posts (newest first)
   */
  public async getAllPosts(): Promise<IPost[]> {
    return PostModel.find().sort({ createdAt: -1 }).exec();
  }

  /**
   * Get post by id
   */
  public async getPostById(postId: string): Promise<IPost> {
    const post = await PostModel.findById(postId).exec();

    if (!post) {
      throw new HttpException(404, "Post not found");
    }

    return post;
  }

  public async getAllPaging(
    keyword: string,
    page = 1
  ): Promise<IPagination<IPost>> {
    const pageSize = Number(process.env.PAGE_SIZE) || 10;
    const currentPage = page > 0 ? page : 1;

    const query: any = {};

    if (keyword && keyword.trim() !== "") {
      query.text = {
        $regex: keyword,
        $options: "i",
      };
    }

    const [items, total] = await Promise.all([
      PostModel.find(query)
        .sort({ createdAt: -1 })
        .skip((currentPage - 1) * pageSize)
        .limit(pageSize)
        .exec(),

      PostModel.countDocuments(query),
    ]);

    return {
      total,
      page: currentPage,
      pageSize,
      items,
    };
  }

  public async likePost(userId: string, postId: string): Promise<ILike[]> {
    const post = await PostModel.findById(postId).exec();
    if (!post) {
      throw new HttpException(404, "Post not found");
    }

    const userObjectId = new Types.ObjectId(userId);

    const isLiked = post.likes.some((like) => like.user.equals(userObjectId));

    if (isLiked) {
      throw new HttpException(400, "Post already liked");
    }

    post.likes.unshift({ user: userObjectId });
    await post.save();

    return post.likes;
  }

  public async unlikePost(userId: string, postId: string): Promise<ILike[]> {
    const post = await PostModel.findById(postId).exec();
    if (!post) {
      throw new HttpException(404, "Post not found");
    }

    const userObjectId = new Types.ObjectId(userId);

    const likeIndex = post.likes.findIndex((like) =>
      like.user.equals(userObjectId)
    );

    if (likeIndex === -1) {
      throw new HttpException(400, "Post has not been liked yet");
    }

    post.likes.splice(likeIndex, 1);
    await post.save();

    return post.likes;
  }

  public async addComment(
    userId: string,
    postId: string,
    data: CreateCommentDto
  ): Promise<IComment[]> {
    const post = await PostModel.findById(postId).exec();
    if (!post) {
      throw new HttpException(404, "Post not found");
    }

    const user = await usersModel
      .findById(userId)
      .select("first_name last_name avatar")
      .exec();

    if (!user) {
      throw new HttpException(404, "User not found");
    }

    post.comments.unshift({
      user: new Types.ObjectId(userId),
      text: data.text,
      name: `${user.first_name} ${user.last_name}`,
      avatar: user.avatar,
      createdAt: new Date(),
    });

    await post.save();
    return post.comments;
  }

  public async removeComment(
    userId: string,
    postId: string,
    commentId: string
  ): Promise<IComment[]> {
    const post = await PostModel.findById(postId).exec();
    if (!post) {
      throw new HttpException(404, "Post not found");
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      throw new HttpException(404, "Comment not found");
    }

    if (!comment.user.equals(new Types.ObjectId(userId))) {
      throw new HttpException(401, "User not authorized");
    }

    comment.deleteOne();
    await post.save();

    return post.comments;
  }

  public async sharePost(userId: string, postId: string): Promise<ILike[]> {
    const post = await PostModel.findById(postId).exec();
    if (!post) {
      throw new HttpException(404, "Post not found");
    }

    const userObjectId = new Types.ObjectId(userId);

    const isShared = post.shares.some((share) =>
      share.user.equals(userObjectId)
    );

    if (isShared) {
      throw new HttpException(400, "Post already shared");
    }

    post.shares.unshift({ user: userObjectId });
    await post.save();

    return post.shares;
  }

  public async removeShare(userId: string, postId: string): Promise<ILike[]> {
    const post = await PostModel.findById(postId).exec();
    if (!post) throw new HttpException(404, "Post not found");

    const userObjectId = new Types.ObjectId(userId);

    const shareIndex = post.shares.findIndex((s) =>
      s.user.equals(userObjectId)
    );
    if (shareIndex === -1) {
      throw new HttpException(400, "Post has not been shared yet");
    }

    post.shares.splice(shareIndex, 1);
    await post.save();

    return post.shares;
  }
}
