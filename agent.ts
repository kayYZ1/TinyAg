import chalk from "chalk";
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources.mjs";

import type { ITool } from "./interfaces";

interface IAgent {
	client: OpenAI;
	getUserMessage: () => Promise<string>;
	tools: ITool[];
}

class Agent implements IAgent {
	client: OpenAI;
	getUserMessage: () => Promise<string>;
	tools: ITool[];

	constructor(
		client: OpenAI,
		getUserMessage: () => Promise<string>,
		tools: ITool[],
	) {
		this.client = client;
		this.getUserMessage = getUserMessage;
		this.tools = tools;
	}

	Run = async () => {
		const conversation: ChatCompletionMessageParam[] = [];
		process.stdout.write(chalk.red("Chat with TinyAg (ctrl+c to quit)\n"));

		while (true) {
			process.stdout.write(chalk.cyan("You: "));
			const userMessage = await this.getUserMessage();

			if (!userMessage) {
				continue;
			}

			conversation.push({ role: "user", content: userMessage });
			const response = await this.runInference(conversation, this.tools);

			process.stdout.write(chalk.green("TinyAg: ") + response.content);
			conversation.push({ role: "assistant", content: response.content });
		}
	};

	runInference = async (
		conversation: ChatCompletionMessageParam[],
		tools: ITool[],
	): Promise<OpenAI.Chat.Completions.ChatCompletionMessage> => {
		try {
			const completion = await this.client.chat.completions.create({
				model: "google/gemini-2.0-flash-exp:free",
				messages: conversation,
				tools: tools.map((tool) => ({
					type: "function",
					function: {
						name: tool.name,
						description: tool.description,
						parameters: tool.parameters,
					},
				})),
			});

			if (!completion || !completion.choices || !completion.choices[0]) {
				return {
					role: "assistant",
					refusal: "API call error",
					content: "Sorry, I encountered an error processing your request.\n",
				};
			}

			const message = completion.choices[0].message;
			if (message.tool_calls && message.tool_calls.length > 0) {
				for (const toolCall of message.tool_calls) {
					const tool = tools.find((t) => t.name === toolCall.function.name);
					if (tool) {
						const args = JSON.parse(toolCall.function.arguments);
						const result = await tool.execute(args);
						conversation.push({
							role: "tool",
							content: JSON.stringify({ result }),
							tool_call_id: toolCall.id,
						});
					}
				}

				return await this.runInference(conversation, tools);
			}
			return message;
		} catch (error) {
			return {
				role: "assistant",
				refusal: "API call error",
				content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : String(error)}\n`,
			};
		}
	};
}

export default Agent;
