import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MessageBubble } from "../chat/MessageBubble";
import type { Message } from "@/lib/types";

function makeMessage(overrides: Partial<Message> = {}): Message {
  return {
    id: "msg-1",
    conversationId: "conv-1",
    role: "user",
    content: "Hello world",
    metadata: null,
    createdAt: "2026-04-08T12:00:00Z",
    ...overrides,
  };
}

describe("MessageBubble", () => {
  it("renders user message content", () => {
    render(<MessageBubble message={makeMessage()} />);
    expect(screen.getByText("Hello world")).toBeInTheDocument();
  });

  it("renders assistant message content", () => {
    render(
      <MessageBubble
        message={makeMessage({ role: "assistant", content: "Hi there" })}
      />
    );
    expect(screen.getByText("Hi there")).toBeInTheDocument();
  });

  it("applies right alignment for user messages", () => {
    const { container } = render(<MessageBubble message={makeMessage()} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain("justify-end");
  });

  it("applies left alignment for assistant messages", () => {
    const { container } = render(
      <MessageBubble message={makeMessage({ role: "assistant" })} />
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain("justify-start");
  });

  it("renders timestamp", () => {
    render(<MessageBubble message={makeMessage()} />);
    // Timestamp should be present (format varies by locale)
    const timeEl = screen.getByText(/\d{1,2}:\d{2}/);
    expect(timeEl).toBeInTheDocument();
  });

  it("renders bold markdown", () => {
    render(
      <MessageBubble message={makeMessage({ content: "This is **bold** text" })} />
    );
    expect(screen.getByText("bold").tagName).toBe("STRONG");
  });
});
