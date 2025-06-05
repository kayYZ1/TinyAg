import chalk from "chalk";
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources.mjs";

import type { ITool } from "./lib/interfaces";

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

  async Run() {
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

      process.stdout.write(chalk.green("TinyAg: ") + response.content + "\n");
      conversation.push({ role: "assistant", content: response.content });
    }
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
        console.log(completion);
        return {
          role: "assistant",
          refusal: "Api error",
          content: "Sorry, I encountered an error processing your request.\n",
        };
      }

      const message = completion.choices[0].message;

      if (message.tool_calls && message.tool_calls.length > 0) {
        console.log(
          chalk.yellow("Tool calls detected:"),
          message.tool_calls.length,
        );
        const toolCalls = message.tool_calls;
        const toolPromises = toolCalls.map(async (toolCall) => {
          console.log(
            chalk.yellow(`Processing tool call: ${toolCall.function.name}`),
          );
          const tool = tools.find((t) => t.name === toolCall.function.name);
          if (tool) {
            try {
              const args = JSON.parse(toolCall.function.arguments);
              console.log(
                chalk.yellow(`Executing tool ${tool.name} with args:`),
                args,
              );

              const result = await tool.execute(args);
              console.log(
                chalk.yellow(`Tool ${tool.name} result:\n`),
                result.substring(0, 100) + (result.length > 100 ? "..." : ""),
              );

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
        console.log(chalk.yellow(`Got ${toolResponses.length} tool responses`));
        console.log(chalk.blue("Adding assistant message to conversation"));
        console.log("Model message: ", message.content);

        conversation.push(message);
        toolResponses.forEach((response) => {
          if (response) {
            // Using type assertion to access tool_call_id
            const toolResponse = response as { tool_call_id?: string };
            if (toolResponse.tool_call_id) {
              console.log(
                chalk.blue(
                  `Adding tool response for tool_call_id: ${toolResponse.tool_call_id}`,
                ),
              );
            }
            conversation.push(response);
          }
        });

        console.log(
          chalk.magenta(
            "Making recursive call to runInference with updated conversation",
          ),
        );
        console.log(
          chalk.magenta(`Conversation now has ${conversation.length} messages`),
        );

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
