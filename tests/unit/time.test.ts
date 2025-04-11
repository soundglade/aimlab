import { describe, it, expect } from "vitest";
import { timeAgo } from "@/lib/time";

describe("timeAgo", () => {
  it("returns 'a few seconds ago' for now", () => {
    expect(timeAgo(new Date())).toMatch(/second|few seconds/);
  });

  it("returns 'a minute ago' for 1 minute ago", () => {
    const date = new Date(Date.now() - 60 * 1000);
    expect(timeAgo(date)).toMatch(/minute/);
  });

  it("returns 'an hour ago' for 1 hour ago", () => {
    const date = new Date(Date.now() - 60 * 60 * 1000);
    expect(timeAgo(date)).toMatch(/hour/);
  });

  it("returns 'a day ago' for 1 day ago", () => {
    const date = new Date(Date.now() - 24 * 60 * 60 * 1000);
    expect(timeAgo(date)).toMatch(/day/);
  });

  it("handles future dates", () => {
    const date = new Date(Date.now() + 60 * 1000);
    expect(timeAgo(date)).toMatch(/in/);
  });
});
