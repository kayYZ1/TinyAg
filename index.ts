import OpenAI from "openai";
import { createInterface } from "readline";

import Agent from "./agent";
import ReadFileTool from "./tools/read_file";

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
	const client = new OpenAI({
		baseURL: "https://openrouter.ai/api/v1",
		apiKey: process.env["OPENROUTER_API_KEY"],
	});

	const tools = [new ReadFileTool()];
	const agent = new Agent(client, getUserMessage, tools);

	await agent.Run();
};

main();
