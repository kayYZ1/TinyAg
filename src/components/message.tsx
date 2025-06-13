import { Box, Text } from "ink";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

const Message = (msg: ChatCompletionMessageParam, index: number) => {
	const isUser = msg.role === "user";
	const content =
		typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content);

	return (
		<Box key={index}>
			<Box>
				<Text color={isUser ? "cyan" : "green"} bold>
					{isUser ? "You:" : "TinyAg:"}
				</Text>
			</Box>
			<Box flexGrow={1} paddingX={1}>
				<Text wrap="wrap">{content}</Text>
			</Box>
		</Box>
	);
};

export default Message;
