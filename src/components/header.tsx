import { Box, Text } from "ink";

const Header = () => (
	<Box flexDirection="column" padding={1}>
		<Box>
			<Text>
				<Text color="red" bold>
					TinyAg
				</Text>
				<Text> - Chat with your AI agent </Text>
				<Text color="gray">(Ctrl+C to quit, Tab to focus input)</Text>
			</Text>
		</Box>
		<Box marginTop={1} flexDirection="column">
			<Text>
				{`████████╗██╗███╗   ██╗██╗   ██╗ █████╗  ██████╗ 
╚══██╔══╝██║████╗  ██║╚██╗ ██╔╝██╔══██╗██╔════╝ 
   ██║   ██║██╔██╗ ██║ ╚████╔╝ ███████║██║  ███╗
   ██║   ██║██║╚██╗██║  ╚██╔╝  ██╔══██║██║   ██║
   ██║   ██║██║ ╚████║   ██║   ██║  ██║╚██████╔╝
   ╚═╝   ╚═╝╚═╝  ╚═══╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝`}
			</Text>
			<Box paddingLeft={4}>
				<Text strikethrough>(Definitely not Claude code knock off)</Text>
			</Box>
		</Box>
	</Box>
);

export default Header;
