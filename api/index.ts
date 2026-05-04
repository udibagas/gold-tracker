import Elysia from "elysia";
import auth from "./routes/auth";
import users from "./routes/users";
import categories from "./routes/categories";
import { purchases } from "./routes/purchases";
import { cleanings } from "./routes/cleanings";
import { repairs } from "./routes/repairs";
import { meltings } from "./routes/meltings";
import { reports } from "./routes/reports";

export default () =>
  new Elysia()
    .get("/hello", () => ({ message: "Hello world!" }))
    .use(auth)
    .use(users)
    .use(categories)
    .use(purchases)
    .use(cleanings)
    .use(repairs)
    .use(meltings)
    .use(reports);
