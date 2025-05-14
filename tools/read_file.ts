import type { ITool } from "../lib/interfaces";

class ReadFileTool implements ITool {
	name = "read_file";
	description =
		"Read a file from the current directory. Provide the filename as the input.";
	parameters = {
		type: "object",
		properties: {
			filename: {
				type: "string",
				description: "The name of the file to read",
			},
		},
		required: ["filename"],
	};

	async execute(args: Record<string, unknown>) {
		const filePath =
			typeof args["filename"] === "string" ? args["filename"] : null;

		if (!filePath) {
			return "Error(read_file): No file path provided";
		}

		try {
			const data = await Bun.file(filePath).text();
			return data;
		} catch (error) {
			return `Error reading file: ${error}`;
		}
	}
}

export default ReadFileTool;
