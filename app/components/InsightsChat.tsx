"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import styles from "@/styles/insights.module.css";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function InsightsChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I can help you analyze your research data and develop strategic insights. What would you like to know?",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);
  const chatMessagesRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (chatMessagesRef.current) {
      const { scrollHeight, clientHeight } = chatMessagesRef.current;
      chatMessagesRef.current.scrollTop = scrollHeight - clientHeight;
    }
  };

  useEffect(() => {
    if (!isInitialMount.current && messages.length > 1) {
      scrollToBottom();
    } else {
      isInitialMount.current = false;
    }
  }, [messages]);

  const sendMessage = async () => {
    const userMessage = inputValue.trim();
    if (!userMessage || isLoading) return;

    setIsLoading(true);
    setInputValue("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

    try {
      // Get file IDs and context data from localStorage
      const storedFiles = localStorage.getItem("discovr_uploaded_files");
      const fileIds = storedFiles
        ? JSON.parse(storedFiles).map((file: { fileId: string }) => file.fileId)
        : [];

      // Include the strategy, metrics and data in the message for context
      const strategy = localStorage.getItem("discovr_strategy") || "";
      const metrics = JSON.parse(
        localStorage.getItem("discovr_metrics") || "[]"
      );
      const data = localStorage.getItem("discovr_data") || "";

      // Construct contextual prompt if there's any saved data
      let contextualPrompt = userMessage;
      if (strategy || metrics.length > 0 || data) {
        contextualPrompt =
          `Here's some context about our project:\n\n` +
          (strategy ? `Strategy: ${strategy}\n\n` : "") +
          (metrics.length > 0 ? `Metrics: ${metrics.join(", ")}\n\n` : "") +
          (data ? `Research Data: ${data}\n\n` : "") +
          `User Question: ${userMessage}`;
      }

      const response = await fetch("/api/insights-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: contextualPrompt,
          threadId,
          fileIds,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      // Add empty assistant message that we'll update
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      let accumulatedMessage = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(5));
              if (data.error) throw new Error(data.error);
              if (data.text) {
                accumulatedMessage += data.text;
                setMessages((prev) => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage.role === "assistant") {
                    lastMessage.content = accumulatedMessage;
                  }
                  return newMessages;
                });
                if (data.threadId) {
                  setThreadId(data.threadId);
                }
              }
            } catch (e) {
              console.error("Error parsing SSE data:", e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error in sendMessage:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, there was an error processing your request. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        content:
          "Hello! I can help you analyze your research data and develop strategic insights. What would you like to know?",
      },
    ]);
    setThreadId(null);
  };

  // Thinking animation component
  const ThinkingAnimation = () => (
    <div className={styles.loadingIndicator}>
      <div className={styles.dot}></div>
      <div className={styles.dot}></div>
      <div className={styles.dot}></div>
    </div>
  );

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatMessages} ref={chatMessagesRef}>
        {messages.map((message, index) => (
          <div
            key={index}
            className={`${styles.message} ${
              message.role === "user"
                ? styles.userMessage
                : styles.assistantMessage
            }`}
          >
            {message.role === "assistant" ? (
              <>
                {message.content ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.content}
                  </ReactMarkdown>
                ) : (
                  isLoading &&
                  index === messages.length - 1 && <ThinkingAnimation />
                )}
              </>
            ) : (
              message.content
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className={styles.chatInputContainer}>
        <textarea
          className={styles.chatInput}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type your message..."
          rows={1}
          disabled={isLoading}
        />
        <button
          className={styles.clearButton}
          onClick={clearChat}
          disabled={isLoading}
        >
          Clear
        </button>
        <button
          className={styles.sendButton}
          onClick={sendMessage}
          disabled={isLoading || !inputValue.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
} 