import { Box } from "ink";
import TextInput from "ink-text-input";

const ChatInput = ({
	input,
	setInput,
	onSubmit,
}: {
	input: string;
	setInput: (value: string) => void;
	onSubmit: (value: string) => void;
}) => (
	<Box borderStyle="single">
		<Box flexGrow={1} paddingX={1}>
			<TextInput
				value={input}
				onChange={setInput}
				onSubmit={onSubmit}
				placeholder="Are dolphins evil?"
				showCursor={true}
			/>
		</Box>
	</Box>
);

export default ChatInput;
