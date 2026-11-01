import assert from "node:assert/strict";
import test from "node:test";
import { reviews } from "../src/data/reviews.ts";
import { shuffle } from "../src/lib/shuffle.ts";

function seededRandom(seed) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

test("reviews data has six unique entries with name and text", () => {
  assert.equal(reviews.length, 6);
  assert.equal(new Set(reviews.map((review) => review.id)).size, 6);

  for (const review of reviews) {
    assert.ok(review.name.trim().length > 0);
    assert.ok(review.text.trim().length > 0);
  }
});

test("shuffle returns every review exactly once, without mutating the source", () => {
  const snapshot = reviews.map((review) => review.id);

  for (let seed = 1; seed <= 200; seed += 1) {
    const result = shuffle(reviews, seededRandom(seed));

    assert.equal(result.length, reviews.length);
    assert.deepEqual(result.map((review) => review.id).sort(), [...snapshot].sort());
  }

  assert.deepEqual(reviews.map((review) => review.id), snapshot);
});

test("shuffle produces different orders across runs", () => {
  const orders = new Set();

  for (let seed = 1; seed <= 50; seed += 1) {
    orders.add(shuffle(reviews, seededRandom(seed)).map((review) => review.id).join(","));
  }

  assert.ok(orders.size > 10);
});

test("shuffle handles empty and single-item lists", () => {
  assert.deepEqual(shuffle([]), []);
  assert.deepEqual(shuffle([1]), [1]);
});
