import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import MovesStack from "../../src/models/game/moves-stack.ts";

describe("push", () => {
  it("should add and return length of new stack", () => {
    const movesStack = new MovesStack();

    const newMove = { row: 0, col: 0 };

    assertEquals(movesStack.push(newMove), 1);
  });
});

describe("peek", () => {
  it("should return null if stack is empty", () => {
    const movesStack = new MovesStack();

    assertEquals(movesStack.peek(), null);
  });

  it("should return peek of stack if stack is not empty", () => {
    const movesStack = new MovesStack();
    const newMove = { row: 0, col: 0 };
    movesStack.push(newMove);

    assertEquals(movesStack.peek(), newMove);
  });
});
