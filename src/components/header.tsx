import { Box, Text } from "ink";

const Header = () => (
	<Box flexDirection="column" padding={2}>
		<Box flexDirection="column" alignItems="center">
			<Text>
				<Text color="red" bold>
					TinyAg
				</Text>
				<Text> - Chat with your AI agent </Text>
				<Text color="gray">(Ctrl+C to quit)</Text>
			</Text>
			<Box marginTop={1}>
				<Text color="magenta">
					Press "↑" to select model. (Before conversation starts)
				</Text>
			</Box>
		</Box>
		<Box marginTop={1} flexDirection="column" alignItems="center">
			<Text>
				{`████████╗██╗███╗   ██╗██╗   ██╗ █████╗  ██████╗ 
╚══██╔══╝██║████╗  ██║╚██╗ ██╔╝██╔══██╗██╔════╝ 
   ██║   ██║██╔██╗ ██║ ╚████╔╝ ███████║██║  ███╗
   ██║   ██║██║╚██╗██║  ╚██╔╝  ██╔══██║██║   ██║
   ██║   ██║██║ ╚████║   ██║   ██║  ██║╚██████╔╝
   ╚═╝   ╚═╝╚═╝  ╚═══╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝`}
			</Text>
			<Box marginTop={1}>
				<Text color="gray" italic>(Definitely not Claude code knock off)</Text>
			</Box>
		</Box>
	</Box>
);

export default Header;
