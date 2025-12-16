import "dotenv/config";

import App from "./app";
import AuthRoute from "@modules/auth/auth.route";
import { IndexRoute } from "@modules/index";
import PostsRoute from "@modules/posts/posts.route";
import ProfileRoute from "@modules/profile/profile.route";
import UsersRoute from "@modules/users/user.route";
import { ConversationsRoute } from "@modules/conversations";
import { MessagesRoute } from "@modules/messages";
import { validateEnv } from "@core/utils";
import GroupsRoute from "@modules/groups";

validateEnv();

const routes = [
  new IndexRoute(),
  new UsersRoute(),
  new AuthRoute(),
  new ProfileRoute(),
  new PostsRoute(),
  new GroupsRoute(),
  new ConversationsRoute(),
  new MessagesRoute(),
];

const app = new App(routes);

app.listen();
