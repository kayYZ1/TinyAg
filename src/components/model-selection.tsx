import { useState } from "react";
import { Box, Text, useInput } from "ink";
import type Agent from "../agent";

const MODELS = [
	{
		label: "DeepSeek: DeepSeek V3 0324 (free) - Default",
		value: "deepseek/deepseek-chat-v3-0324:free",
	},
	{
		label: "Mistral: Devstral Small (free)",
		value: "mistralai/devstral-small:free",
	},
	{
		label: "Meta: Llama 4 Maverick (free)",
		value: "meta-llama/llama-4-maverick:free",
	},
];

const ModelSelection = ({
	onClose,
	agent,
}: {
	onClose: () => void;
	agent: Agent;
}) => {
	const [selectedIndex, setSelectedIndex] = useState(0);

	useInput((_, key) => {
		if (key.leftArrow) {
			setSelectedIndex((prev) => (prev === 0 ? MODELS.length - 1 : prev - 1));
		} else if (key.rightArrow) {
			setSelectedIndex((prev) => (prev === MODELS.length - 1 ? 0 : prev + 1));
		} else if (key.return) {
			agent.setModel(MODELS[selectedIndex].value);
			onClose();
		} else if (key.downArrow) {
			onClose();
		}
	});

	return (
		<Box borderStyle="single" flexDirection="column" padding={1}>
			<Text>Use "←" and "→" to select model. Enter to confirm</Text>
			<Text>"↓" to close</Text>
			<Box marginTop={1}>
				{MODELS.map((model, index) => (
					<Box key={model.label} marginX={1}>
						<Text color={index === selectedIndex ? "blue" : "white"}>
							{index === selectedIndex ? `> ${model.label}` : model.label}
						</Text>
					</Box>
				))}
			</Box>
		</Box>
	);
};

export default ModelSelection;
