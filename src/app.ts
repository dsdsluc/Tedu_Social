import { Logger } from "@core/utils";
import { Route } from "@core/interfaces";
import cors from "cors";
import { errorMiddleware } from "@core/middleware";
import express from "express";
import helmet from "helmet";
import hpp from "hpp";
import mongoose from "mongoose";
import morgan from "morgan";

class App {
  public app: express.Application;
  public port: string | number;
  public production: boolean;

  constructor(routes: Route[]) {
    this.app = express();
    this.port = process.env.PORT || 5000;
    this.production = process.env.NODE_ENV === "production";

    this.initializeMiddleware();
    this.initializeRoutes(routes);
    this.initializeErrorHandling();
    this.connectToDatabase();
  }

  public listen() {
    this.app.listen(this.port, () => {
      Logger.info(`Server is listening on port ${this.port}`);
    });
  }

  private initializeRoutes(routes: Route[]) {
    routes.forEach((route) => {
      this.app.use(route.path, route.router);
    });
  }

  private initializeMiddleware() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    if (this.production) {
      this.app.use(hpp());
      this.app.use(helmet());
      this.app.use(morgan("combined"));
      this.app.use(cors({ origin: "your.domain.com", credentials: true }));
    } else {
      this.app.use(morgan("dev"));
      this.app.use(cors({ origin: true, credentials: true }));
    }
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }

  private async connectToDatabase() {
    try {
      const uri = process.env.MONGODB_URI;
      if (!uri) {
        Logger.error("MONGODB_URI is not defined");
        process.exit(1);
      }

      Logger.info("Connecting to MongoDB...");
      await mongoose.connect(uri);
      Logger.info("MongoDB local connected");
    } catch (error) {
      Logger.error("MongoDB local connection error", error);
      process.exit(1);
    }
  }
}

export default App;
