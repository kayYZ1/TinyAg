import { Box, Text } from "ink";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

const Message = (msg: ChatCompletionMessageParam, index: number) => {
	const isUser = msg.role === "user";
	const content =
		typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content);
	const shouldWrap = content.length > 70;

	return (
		<Box key={index} flexDirection={shouldWrap ? "column" : "row"}>
			<Box>
				<Text color={isUser ? "cyan" : "green"} bold>
					{isUser ? "You:" : "TinyAg:"}
				</Text>
			</Box>
			<Box paddingLeft={shouldWrap ? 0 : 1}>
				<Text wrap="wrap">{content}</Text>
			</Box>
		</Box>
	);
};

export default Message;
