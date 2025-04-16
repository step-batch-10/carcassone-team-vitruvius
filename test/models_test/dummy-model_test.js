import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { add } from "../../src/models/dummy-model.js";

describe("demo test", () => {
  it("testing", () => {
    assertEquals(add(1, 2), 3);
  });
});
