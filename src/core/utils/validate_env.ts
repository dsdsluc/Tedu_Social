import { cleanEnv, str, port } from "envalid";

const validateEnv = () => {
  cleanEnv(process.env, {
    NODE_ENV: str({ default: "development" }),
    PORT: port({ default: 5000 }),
    MONGODB_URI: str(),
  });
};

export default validateEnv;
