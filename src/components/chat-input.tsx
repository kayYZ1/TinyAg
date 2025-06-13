import { useCallback } from "react";
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
}) => {
	const handleChange = useCallback((value: string) => {
		setInput(value);
	}, [setInput]);

	return (
		<Box borderStyle="single">
			<Box flexGrow={1} paddingX={1}>
				<TextInput
					value={input}
					onChange={handleChange}
					onSubmit={onSubmit}
					placeholder="Are dolphins evil?"
					showCursor={false}
				/>
			</Box>
		</Box>
	);
};

export default ChatInput;
