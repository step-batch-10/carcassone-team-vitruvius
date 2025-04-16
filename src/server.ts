import createHandler from "./app.ts";
import { User } from "./models/models.ts";

const main = () => {
  const sessions = new Map<string, User>();
  const context = { sessions };

  Deno.serve(createHandler(context).fetch);
};

main();
