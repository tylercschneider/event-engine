import { describe, it, expect } from "vitest";
import type { StoredEvent } from "@stats/store";
import { additive, latest, distinct } from "../src/measure";

describe("additive", () => {
  it("sums the extracted value over events", () => {
    const events: StoredEvent[] = [
      { name: "scored", occurredAt: "t1", payload: 3 },
      { name: "scored", occurredAt: "t2", payload: 4 },
    ];
    const points = additive("points", (event) => event.payload as number);
    expect(points.compute(events)).toBe(7);
  });
});

describe("latest", () => {
  it("returns the value of the most recent event", () => {
    const events: StoredEvent[] = [
      { name: "balance", occurredAt: "2026-01-01T00:00:00Z", payload: 100 },
      { name: "balance", occurredAt: "2026-01-03T00:00:00Z", payload: 250 },
      { name: "balance", occurredAt: "2026-01-02T00:00:00Z", payload: 175 },
    ];
    const balance = latest("balance", (event) => event.payload as number);
    expect(balance.compute(events)).toBe(250);
  });

  it("returns 0 when there are no events", () => {
    const balance = latest("balance", (event) => event.payload as number);
    expect(balance.compute([])).toBe(0);
  });
});

describe("distinct", () => {
  it("counts distinct extracted keys", () => {
    const events: StoredEvent[] = [
      { name: "visit", occurredAt: "t1", payload: "u1" },
      { name: "visit", occurredAt: "t2", payload: "u2" },
      { name: "visit", occurredAt: "t3", payload: "u1" },
    ];
    const users = distinct("active_users", (event) => event.payload as string);
    expect(users.compute(events)).toBe(2);
  });
});
