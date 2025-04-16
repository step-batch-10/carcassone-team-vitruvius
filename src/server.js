import createHandler from "./app.js";

const main = () => {
  const users = new Map();
  const context = { users };

  Deno.serve(createHandler(context).fetch);
};

main();
