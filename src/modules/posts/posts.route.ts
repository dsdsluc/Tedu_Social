import CreatePostDto from "./dtos/create_post.dto";
import UpdatePostDto from "./dtos/update_post.dto";
import PostsController from "./posts.controller";
import { Route } from "@core/interfaces";
import { Router } from "express";
import { authMiddleware } from "@core/middleware";
import validationMiddleware from "@core/middleware/validation.middleware";
import CreateCommentDto from "./dtos/create_comment.dto";
import { uploadMultipleImages } from "@core/middleware/upload.middleware";
import UploadService from "@core/services/upload.service";

export default class PostsRoute implements Route {
  public path = "/api/v1/posts";
  public router = Router();

  private postsController = new PostsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // POST /api/v1/posts
    this.router.post(
      "/",
      authMiddleware,
      uploadMultipleImages,
      validationMiddleware(CreatePostDto),
      this.postsController.createPost
    );

    // PUT /api/v1/posts/:postId
    this.router.put(
      "/:postId",
      authMiddleware,
      validationMiddleware(UpdatePostDto),
      this.postsController.updatePost
    );

    // DELETE /api/v1/posts/:postId
    this.router.delete(
      "/:postId",
      authMiddleware,
      this.postsController.deletePost
    );

    // =========================
    // GET POSTS
    // =========================

    // GET /api/v1/posts (pagination + search)
    // ?page=1&keyword=node
    this.router.get("/", authMiddleware, this.postsController.getAllPaging);

    // GET /api/v1/posts
    this.router.get("/", authMiddleware, this.postsController.getAllPosts);

    // GET /api/v1/posts/:postId
    this.router.get(
      "/:postId",
      authMiddleware,
      this.postsController.getPostById
    );

    // =========================
    // LIKE / UNLIKE
    // =========================

    // PUT /api/v1/posts/:postId/like
    this.router.put(
      "/:postId/like",
      authMiddleware,
      this.postsController.likePost
    );

    // PUT /api/v1/posts/:postId/unlike
    this.router.put(
      "/:postId/unlike",
      authMiddleware,
      this.postsController.unlikePost
    );

    // POST /api/v1/posts/:postId/comments
    this.router.post(
      "/:postId/comments",
      authMiddleware,
      validationMiddleware(CreateCommentDto),
      this.postsController.addComment
    );

    // DELETE /api/v1/posts/:postId/comments/:commentId
    this.router.delete(
      "/:postId/comments/:commentId",
      authMiddleware,
      this.postsController.removeComment
    );

    // =========================
    // SHARE / UNSHARE
    // =========================

    // PUT /api/v1/posts/:postId/share
    this.router.put(
      "/:postId/share",
      authMiddleware,
      this.postsController.sharePost
    );

    // PUT /api/v1/posts/:postId/unshare
    this.router.put(
      "/:postId/unshare",
      authMiddleware,
      this.postsController.removeShare
    );
  }
}
