import { describe, expect, it } from "vitest";
import { keepEmployment } from "./agent-employment";

describe("keepEmployment", () => {
  it("keeps office fields when a model update omits them", () => {
    const previous = {
      name: "Foreman",
      officeId: "news-portal",
      officeName: "news-portal",
      role: "foreman",
      scope: "office",
    };
    const next = { name: "Foreman", model: "gpt-5.6-terra" };

    expect(keepEmployment(next, previous)).toEqual({
      name: "Foreman",
      model: "gpt-5.6-terra",
      officeId: "news-portal",
      officeName: "news-portal",
      role: "foreman",
      scope: "office",
    });
  });

  it("does not invent employment for an agent that had none", () => {
    expect(keepEmployment({ name: "Builder" }, undefined)).toEqual({ name: "Builder" });
  });
});
