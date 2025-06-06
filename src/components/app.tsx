import { useState } from "react";
import { Box, Text, Newline } from "ink";
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
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (text: string) => {
    if (!text.trim()) {
      return;
    }

    const newMessage: ChatCompletionMessageParam = { role: "user", content: text };
    setConversation((prev) => [...prev, newMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await agent.runInference([...conversation, newMessage], agent.tools);
      setConversation((prev) => [...prev, response]);
    } catch (error) {
      setConversation((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${error instanceof Error ? error.message : String(error)}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box flexDirection="column" padding={1}>
      <Text>
        <Text color="red">TinyAg</Text>
        <Text> - Chat with your AI agent (ctrl+c to quit)</Text>
      </Text>
      <Newline />

      <Box flexDirection="column" borderStyle="round" padding={1}>
        {conversation.map((msg: ChatCompletionMessageParam, index) => (
          <Box key={index}>
            <Text color={msg.role === "user" ? "cyan" : "green"}>
              {msg.role === "user" ? "You: " : "TinyAg: "}
            </Text>
            <Text>{typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content)}</Text>
          </Box>
        ))}
        {loading && <Text>TinyAg is thinking...</Text>}
      </Box>

      <Newline />
      <Box>
        <Text color="cyan">You: </Text>
        <TextInput
          value={input}
          onChange={setInput}
          onSubmit={handleSubmit}
          placeholder="Type your message..."
        />
      </Box>
    </Box>
  );
}; 