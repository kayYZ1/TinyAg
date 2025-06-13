import { useState, useCallback } from "react";
import { Box, Text } from "ink";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

import Agent from "../agent";
import Header from "./header";
import Message from "./message";
import ChatInput from "./chat-input";
import ToggleSpinner from "./spinner";

export const App = ({ agent }: { agent: Agent }) => {
	const [conversation, setConversation] = useState<
		ChatCompletionMessageParam[]
	>([]);
	const [input, setInput] = useState("");
	const [isPending, setIsPending] = useState(false);

	const handleSubmit = useCallback(
		async (text: string) => {
			if (!text.trim()) {
				return;
			}

			const newMessage: ChatCompletionMessageParam = {
				role: "user",
				content: text.trim(),
			};

			setConversation((prev) => [...prev, newMessage]);
			setInput("");

			try {
				setIsPending(true);
				const response = await agent.runInference(
					[...conversation, newMessage],
					agent.tools,
				);

				setConversation((prev) => [...prev, response]);
			} catch (error) {
				const errorMessage: ChatCompletionMessageParam = {
					role: "assistant",
					content: `Error: ${error instanceof Error ? error.message : String(error)}`,
				};
				setConversation((prev) => [...prev, errorMessage]);
			}
			finally {
				setIsPending(false);
			}

		},
		[agent, conversation],
	);

	return (
		<Box flexDirection="column" height="100%" width="100%">
			<Header />
			{conversation.map((msg, index) => Message(msg, index))}
			{isPending ? (
				<Box gap={1} alignItems="flex-start">
					<ToggleSpinner />
					<Text>
						Thinking of response
					</Text>
				</Box>
			) : (
				<ChatInput input={input} setInput={setInput} onSubmit={handleSubmit} />
			)}
		</Box>
	);
};
