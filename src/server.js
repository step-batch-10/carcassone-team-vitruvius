import createHandler from "./app.ts";

const main = () => {
  Deno.serve(createHandler().fetch);
};

main();
