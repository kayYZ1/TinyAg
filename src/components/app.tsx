import { useState, useTransition, useCallback, useEffect } from "react";
import { Box, Text, useInput, useApp } from "ink";
import Agent from "../agent/agent";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import TextInput from "ink-text-input";

interface AppProps {
  agent: Agent;
}

export const App = ({ agent }: AppProps) => {
  const [conversation, setConversation] = useState<ChatCompletionMessageParam[]>([
    { role: "assistant", content: "Hello! How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isInputFocused, setIsInputFocused] = useState(true);
  const { exit } = useApp();

  // Handle keyboard shortcuts
  useInput((input, key) => {
    if (key.ctrl && input === 'c') {
      exit();
    }
    // Toggle input focus with Tab
    if (key.tab) {
      setIsInputFocused(prev => !prev);
    }
  });

  const handleSubmit = useCallback(async (text: string) => {
    if (!text.trim()) {
      return;
    }

    const newMessage: ChatCompletionMessageParam = {
      role: "user",
      content: text.trim()
    };

    // Add user message immediately
    setConversation((prev) => [...prev, newMessage]);
    setInput("");

    // Use transition for the async operation
    startTransition(() => {
      const runInference = async () => {
        try {
          const response = await agent.runInference(
            [...conversation, newMessage],
            agent.tools
          );

          setConversation((prev) => [...prev, response]);
        } catch (error) {
          const errorMessage: ChatCompletionMessageParam = {
            role: "assistant",
            content: `Error: ${error instanceof Error ? error.message : String(error)}`,
          };
          setConversation((prev) => [...prev, errorMessage]);
        }
      };

      runInference();
    });
  }, [agent, conversation]);

  // Auto-scroll effect could be added here if needed
  useEffect(() => {
    // Force re-render to ensure input stays focused
    if (isInputFocused) {
      setIsInputFocused(true);
    }
  }, [conversation, isInputFocused]);

  const renderMessage = useCallback((msg: ChatCompletionMessageParam, index: number) => {
    const isUser = msg.role === "user";
    const content = typeof msg.content === "string"
      ? msg.content
      : JSON.stringify(msg.content);

    return (
      <Box key={index} marginBottom={1}>
        <Box marginRight={1}>
          <Text color={isUser ? "cyan" : "green"} bold>
            {isUser ? "You:" : "TinyAg:"}
          </Text>
        </Box>
        <Box flexGrow={1}>
          <Text wrap="wrap">{content}</Text>
        </Box>
      </Box>
    );
  }, []);

  return (
    <Box flexDirection="column" padding={1} height="100%">
      {/* Header */}
      <Box marginBottom={1}>
        <Text>
          <Text color="red" bold>TinyAg</Text>
          <Text> - Chat with your AI agent </Text>
          <Text color="gray">(Ctrl+C to quit, Tab to focus input)</Text>
        </Text>
      </Box>

      {/* Chat messages */}
      <Box
        flexDirection="column"
        borderStyle="round"
        padding={1}
        flexGrow={1}
        overflow="hidden"
      >
        {conversation.map(renderMessage)}

        {isPending && (
          <Box marginTop={1}>
            <Text color="yellow">TinyAg is thinking...</Text>
          </Box>
        )}
      </Box>

      {/* Input area */}
      <Box marginTop={1}>
        <Box marginRight={1}>
          <Text color="cyan" bold>You:</Text>
        </Box>
        <Box flexGrow={1}>
          <TextInput
            value={input}
            onChange={setInput}
            onSubmit={handleSubmit}
            placeholder="Type your message and press Enter..."
            showCursor={isInputFocused}
          />
        </Box>
      </Box>
    </Box>
  );
};