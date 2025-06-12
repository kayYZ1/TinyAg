import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources.mjs";

import type { ITool } from "../lib/interfaces";

interface IAgent {
	client: OpenAI;
	tools: ITool[];
}

class Agent implements IAgent {
	client: OpenAI;
	tools: ITool[];

	constructor(
		client: OpenAI,
		tools: ITool[],
	) {
		this.client = client;
		this.tools = tools;
	}

	async runInference(
		conversation: ChatCompletionMessageParam[],
		tools: ITool[],
	): Promise<OpenAI.Chat.Completions.ChatCompletionMessage> {
		try {
			const completion = await this.client.chat.completions.create({
				model: "deepseek/deepseek-chat-v3-0324:free",
				messages: conversation,
				tools: tools.map((tool) => ({
					type: "function",
					function: {
						name: tool.name,
						description: tool.description,
						parameters: tool.parameters,
					},
				})),
				tool_choice: "auto",
			});

			if (!completion || !completion.choices || !completion.choices[0]) {
				return {
					role: "assistant",
					refusal: "Api error",
					content: "Sorry, I encountered an error processing your request.\n",
				};
			}

			const message = completion.choices[0].message;

			if (message.tool_calls && message.tool_calls.length > 0) {
				const toolCalls = message.tool_calls;
				const toolPromises = toolCalls.map(async (toolCall) => {
					const tool = tools.find((t) => t.name === toolCall.function.name);
					if (tool) {
						try {
							const args = JSON.parse(toolCall.function.arguments);
							const result = await tool.execute(args);

							return {
								role: "tool" as const,
								content: result,
								tool_call_id: toolCall.id,
							};
						} catch (error) {
							return {
								role: "tool" as const,
								content: `Error executing tool: ${error instanceof Error ? error.message : String(error)}`,
								tool_call_id: toolCall.id,
							};
						}
					}
					return null;
				});

				// Wait for all tool executions to complete
				const toolResponses = (await Promise.all(toolPromises)).filter(
					Boolean,
				) as ChatCompletionMessageParam[];

				conversation.push(message);
				toolResponses.forEach((response) => {
					if (response) {
						conversation.push(response);
					}
				});

				return await this.runInference(conversation, tools);
			}
			return message;
		} catch (error) {
			console.error("API call error:", error);
			return {
				role: "assistant",
				refusal: "Api error",
				content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : String(error)}\n`,
			};
		}
	}
}

export default Agent; 