import { describe, it, expect } from "vitest";
import { Notifications } from "../src/notifications";

describe("Notifications", () => {
  it("calls a listener registered for a channel", () => {
    const notifications = new Notifications<{ ping: number }>();
    const seen: number[] = [];
    notifications.on("ping", (value) => {
      seen.push(value);
    });
    notifications.emit("ping", 42);
    expect(seen).toEqual([42]);
  });

  it("does not call listeners of other channels", () => {
    const notifications = new Notifications<{ ping: number; pong: number }>();
    const seen: number[] = [];
    notifications.on("pong", (value) => {
      seen.push(value);
    });
    notifications.emit("ping", 42);
    expect(seen).toEqual([]);
  });
});
