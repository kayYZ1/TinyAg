import OpenAI from "openai";
import chalk from "chalk";
import { createInterface } from "readline";

import Agent from "./agent";
import ReadFileTool from "./tools/read_file";
import ListFilesTool from "./tools/list_files";
import EditFileTool from "./tools/edit_file";

const getUserMessage = () => {
	const rl = createInterface({
		input: process.stdin,
		output: process.stdout,
		terminal: false,
	});

	return new Promise<string>((resolve) => {
		rl.question("", (answer) => {
			rl.close();
			resolve(answer.trim());
		});
	});
};

const main = async () => {
	if (!process.env["OPENROUTER_API_KEY"]) {
		process.stdout.write(
			chalk.red(
				"No API key provided make sure to include one with export OPENROUTER_API_KEY=your_key\n",
			),
		);
		return;
	}

	const client = new OpenAI({
		baseURL: "https://openrouter.ai/api/v1",
		apiKey: process.env["OPENROUTER_API_KEY"],
	});

	const tools = [new ReadFileTool(), new ListFilesTool(), new EditFileTool()];
	const agent = new Agent(client, getUserMessage, tools);

	await agent.Run();
};

main();
