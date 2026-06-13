import { afterEach, describe, expect, it, vi } from "vitest";
import { smoothScrollToHash } from "./scroll";

describe("smoothScrollToHash", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  it("uses instant scroll steps while running its own easing animation", () => {
    document.body.innerHTML = '<section id="connect"></section>';
    const target = document.getElementById("connect") as HTMLElement;

    vi.spyOn(target, "getBoundingClientRect").mockReturnValue({
      bottom: 620,
      height: 120,
      left: 0,
      right: 0,
      top: 500,
      width: 0,
      x: 0,
      y: 500,
      toJSON: () => ({})
    } as DOMRect);
    vi.spyOn(performance, "now").mockReturnValue(0);
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      callback(720);
      return 1;
    });

    smoothScrollToHash("#connect", false);

    expect(window.scrollTo).toHaveBeenCalledWith({
      behavior: "instant",
      top: 482
    });
  });
});
