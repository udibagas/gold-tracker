import Elysia from "elysia";
import auth from "./routes/auth";
import users from "./routes/users";
import categories from "./routes/categories";

export default () =>
  new Elysia()
    .get("/hello", () => ({ message: "Hello world!" }))
    .use(auth)
    .use(users)
    .use(categories);
