import { NextFunction, Request, Response } from "express";
import PostService from "./posts.service";
import CreatePostDto from "./dtos/create_post.dto";
import UpdatePostDto from "./dtos/update_post.dto";
import { IPost } from "./posts.interface";
import CreateCommentDto from "./dtos/create_comment.dto";

export default class PostController {
  private postService = new PostService();

  /**
   * POST /api/v1/posts
   * Create new post
   */
  public createPost = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const data: CreatePostDto = req.body;

      const post: IPost = await this.postService.createPost(userId, data);

      res.status(201).json(post);
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/v1/posts/:postId
   * Update post (owner only)
   */
  public updatePost = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { postId } = req.params;
      const data: UpdatePostDto = req.body;

      const post: IPost = await this.postService.updatePost(
        userId,
        postId,
        data
      );

      res.status(200).json(post);
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/v1/posts/:postId
   * Delete post (owner only)
   */
  public deletePost = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { postId } = req.params;

      await this.postService.deletePost(userId, postId);

      res.status(200).json({ message: "Post removed" });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/posts
   * Get all posts
   */
  public getAllPosts = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const posts: IPost[] = await this.postService.getAllPosts();
      res.status(200).json(posts);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/posts/:postId
   * Get post by id
   */
  public getPostById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { postId } = req.params;

      const post: IPost = await this.postService.getPostById(postId);
      res.status(200).json(post);
    } catch (error) {
      next(error);
    }
  };

  public getAllPaging = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const page = Number(req.query.page) || 1;
      const keyword =
        typeof req.query.keyword === "string" ? req.query.keyword : "";

      const paginationResult = await this.postService.getAllPaging(
        keyword,
        page
      );

      res.status(200).json(paginationResult);
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/v1/posts/:postId/like
   * Like a post
   */
  public likePost = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { postId } = req.params;

      const likes = await this.postService.likePost(userId, postId);

      res.status(200).json({
        likes,
        likesCount: likes.length,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/v1/posts/:postId/unlike
   * Unlike a post
   */
  public unlikePost = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { postId } = req.params;

      const likes = await this.postService.unlikePost(userId, postId);

      res.status(200).json({
        likes,
        likesCount: likes.length,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/posts/:postId/comments
   * Add comment to post
   */
  public addComment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { postId } = req.params;
      const data: CreateCommentDto = req.body;

      const comments = await this.postService.addComment(userId, postId, data);

      res.status(201).json({
        comments,
        commentsCount: comments.length,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/v1/posts/:postId/comments/:commentId
   * Remove comment (owner only)
   */
  public removeComment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { postId, commentId } = req.params;

      const comments = await this.postService.removeComment(
        userId,
        postId,
        commentId
      );

      res.status(200).json({
        comments,
        commentsCount: comments.length,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/v1/posts/:postId/share
   * Share post
   */
  public sharePost = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { postId } = req.params;

      const shares = await this.postService.sharePost(userId, postId);

      res.status(200).json({
        shares,
        sharesCount: shares.length,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/v1/posts/:postId/unshare
   * Remove share
   */
  public removeShare = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { postId } = req.params;

      const shares = await this.postService.removeShare(userId, postId);

      res.status(200).json({
        shares,
        sharesCount: shares.length,
      });
    } catch (error) {
      next(error);
    }
  };
}
