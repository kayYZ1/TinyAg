import type { ITool } from "../lib/interfaces";
import { join } from "path";
import { readdir, stat } from "fs/promises";

class ListFilesTool implements ITool {
	name = "list_files";
	description =
		"List files and directories at a given path. If no path is provided, lists files in the current directory.";
	parameters = {
		type: "object",
		properties: {
			path: {
				type: "string",
				description: "The path to list files and directories from",
			},
		},
		required: ["path"],
	};

	async execute(args: Record<string, unknown>) {
		const dirPath = typeof args["path"] === "string" ? args["path"] : ".";

		try {
			const files = await readdir(dirPath);

			const fileList = await Promise.all(
				files.map(async (filename: string) => {
					const fullPath = join(dirPath, filename);
					let type = "unknown";
					try {
						const fileStat = await stat(fullPath);
						type = fileStat.isDirectory() ? "directory" : "file";
					} catch (error) {
						console.error("Error getting file info:", error);
					}
					return {
						name: filename,
						type,
						path: fullPath,
					};
				}),
			);
			//Always return a string
			return JSON.stringify(fileList, null, 2);
		} catch (error) {
			return `Error listing files: ${error}`;
		}
	}
}

export default ListFilesTool;
