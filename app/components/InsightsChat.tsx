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
        "Hello! I can help you analyse your research data and develop strategic insights. What would you like to know?",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [currentAssistantMessage, setCurrentAssistantMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);
  const completeMessageRef = useRef("");

  const scrollToBottom = () => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (!isInitialMount.current) {
      scrollToBottom();
    }
    isInitialMount.current = false;
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    setIsLoading(true);
    const userMessage = inputValue.trim();
    setInputValue("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

    try {
      // Get file IDs from localStorage
      const storedFiles = localStorage.getItem("discovr_uploaded_files");
      const fileIds = storedFiles
        ? JSON.parse(storedFiles).map((file: { fileId: string }) => file.fileId)
        : [];

      const response = await fetch("/api/insights-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          threadId,
          fileIds,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      // Handle streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      setCurrentAssistantMessage("");
      completeMessageRef.current = ""; // Reset the complete message

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === "text") {
                const newText = data.text;
                completeMessageRef.current += newText; // Update the complete message
                setCurrentAssistantMessage(completeMessageRef.current); // Update the display
                if (data.threadId) {
                  setThreadId(data.threadId);
                }
              } else if (data.type === "error") {
                console.error("Error from server:", data.error);
                throw new Error(data.error);
              }
            } catch (e) {
              console.error("Error parsing SSE data:", e);
            }
          }
        }
      }

      // Add the complete assistant message to the messages array using the ref
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: completeMessageRef.current },
      ]);
      setCurrentAssistantMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
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

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        content:
          "Hello! I can help you analyse your research data and develop strategic insights. What would you like to know?",
      },
    ]);
    setThreadId(null);
    setCurrentAssistantMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

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
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            ) : (
              message.content
            )}
          </div>
        ))}
        {currentAssistantMessage && (
          <div className={`${styles.message} ${styles.assistantMessage}`}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {currentAssistantMessage}
            </ReactMarkdown>
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
          onClick={sendMessage}
          disabled={isLoading || !inputValue.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
}
