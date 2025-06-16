import { useState, useCallback } from "react";
import { Box, Text, useInput } from "ink";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import type Agent from "../agent";

import Header from "./header";
import Message from "./message";
import ChatInput from "./chat-input";
import ToggleSpinner from "./spinner";
import ModelSelection from "./model-selection";

export const App = ({ agent }: { agent: Agent }) => {
	const [conversation, setConversation] = useState<
		ChatCompletionMessageParam[]
	>([]);
	const [input, setInput] = useState("");
	const [isPending, setIsPending] = useState(false);
	const [isModelSelectionOpen, setIsModelSelectionOpen] = useState(false);

	useInput((_, key) => {
		if (key.upArrow) {
			setIsModelSelectionOpen(true);
		}
	});

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
			} finally {
				setIsPending(false);
			}
		},
		[agent, conversation],
	);

	return (
		<Box flexDirection="column" padding={1}>
			<Header />
			<Box alignItems="center">
				<Text color="magentaBright">Model - {agent.model}</Text>
			</Box>
			{conversation.length === 0 && isModelSelectionOpen && (
				<ModelSelection
					agent={agent}
					onClose={() => setIsModelSelectionOpen(false)}
				/>
			)}
			<Box flexDirection="column">
				{conversation.map((msg, index) => Message(msg, index))}
			</Box>
			{isPending ? (
				<Box gap={1} alignItems="center">
					<ToggleSpinner />
					<Text>Crunching the numbers...</Text>
				</Box>
			) : (
				<ChatInput input={input} setInput={setInput} onSubmit={handleSubmit} />
			)}
		</Box>
	);
};
