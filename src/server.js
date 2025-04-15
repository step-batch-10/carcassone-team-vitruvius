import createHandler from "./app.js";

const main = () => {
  Deno.serve(createHandler().fetch);
};

main();
