import Elysia from "elysia";
import auth from "./routes/auth";

export default () =>
  new Elysia().get("/hello", () => ({ message: "Hello world!" })).use(auth);
