import { render } from "ink";
import OpenAI from "openai";

import Agent from "./agent";
import ReadFileTool from "./tools/read_file";
import ListFilesTool from "./tools/list_files";
import EditFileTool from "./tools/edit_file";

import { App } from "./components/app";

const main = async () => {
	if (!process.env["OPENROUTER_API_KEY"]) {
		console.error("No API key provided. Make sure to include one with export OPENROUTER_API_KEY=your_key");
		return;
	}

	const client = new OpenAI({
		baseURL: "https://openrouter.ai/api/v1",
		apiKey: process.env["OPENROUTER_API_KEY"],
	});

	const tools = [new ReadFileTool(), new ListFilesTool(), new EditFileTool()];
	const agent = new Agent(client, tools);

	render(<App agent={agent} />);
};

main();
