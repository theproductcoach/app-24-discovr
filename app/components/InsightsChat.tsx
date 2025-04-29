"use client";

import { useState, useRef, useEffect } from "react";
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
        "Hi! I've loaded your strategy and data. What would you like help with today?",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [currentAssistantMessage, setCurrentAssistantMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        content:
          "Hi! I've loaded your strategy and data. What would you like help with today?",
      },
    ]);
    setThreadId(null);
    setCurrentAssistantMessage("");
  };

  const sendMessage = async (userInput: string) => {
    if (!userInput.trim()) return;

    // Add user message to chat
    const userMessage: Message = { role: "user", content: userInput.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setCurrentAssistantMessage("");

    try {
      const response = await fetch("/api/insights-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userInput.trim(),
          threadId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from assistant");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      const decoder = new TextDecoder();
      let currentThreadId = threadId;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = JSON.parse(line.slice(6));

            if (data.type === "text") {
              setCurrentAssistantMessage((prev) => prev + data.text);
              if (!currentThreadId) {
                currentThreadId = data.threadId;
                setThreadId(data.threadId);
              }
            } else if (data.type === "error") {
              throw new Error(data.error);
            }
          }
        }
      }

      // Add the complete message to the chat history
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: currentAssistantMessage },
      ]);
      setCurrentAssistantMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = () => {
    sendMessage(inputValue);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatMessages}>
        {messages.map((message, index) => (
          <div
            key={index}
            className={`${styles.message} ${
              message.role === "user"
                ? styles.userMessage
                : styles.assistantMessage
            }`}
          >
            {message.content}
          </div>
        ))}
        {currentAssistantMessage && (
          <div className={`${styles.message} ${styles.assistantMessage}`}>
            {currentAssistantMessage}
          </div>
        )}
        {isLoading && !currentAssistantMessage && (
          <div className={`${styles.message} ${styles.assistantMessage}`}>
            Thinking...
          </div>
        )}
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
          onClick={handleSendMessage}
          disabled={isLoading || !inputValue.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
}
