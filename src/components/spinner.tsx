import { useEffect, useState } from "react";
import { Text } from "ink";

const ToggleSpinner = ({ color = "#6b7280", speed = 250 }) => {
	const frames = ["⊶", "⊷"];

	const [currentFrame, setCurrentFrame] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentFrame((prev) => (prev + 1) % frames.length);
		}, speed);

		return () => clearInterval(interval);
	}, [speed]);

	return <Text color={color}>{frames[currentFrame]}</Text>;
};

export default ToggleSpinner;
