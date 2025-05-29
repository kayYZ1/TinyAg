import type { ITool } from "../lib/interfaces";

class EditFileTool implements ITool {
	name = "edit_file";
	description =
		"Make edits to a text file.\n\nReplaces 'old_str' with 'new_str' in the given file. 'old_str' and 'new_str' MUST be different from each other.\n\nBy default, only the first occurrence is replaced. Set 'replace_all' to true to replace all occurrences.\n\nIf the file specified with path doesn't exist, it will be created.";
	parameters = {
		type: "object",
		properties: {
			path: {
				type: "string",
				description: "The name of the file to edit",
			},
			oldStr: {
				type: "string",
				description: "The string to replace (must exist in file)",
			},
			newStr: {
				type: "string",
				description: "The string to replace with",
			},
			replaceAll: {
				type: "boolean",
				description:
					"Whether to replace all occurrences (default: false, only first occurrence)",
				default: false,
			},
			maxFileSize: {
				type: "number",
				description: "Maximum file size in MB to process (default: 10MB)",
				default: 10,
			},
		},
		required: ["path", "oldStr", "newStr"],
	};

	private escapeRegExp(string: string): string {
		return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	}

	private formatFileSize(bytes: number): string {
		const mb = bytes / (1024 * 1024);
		return `${mb.toFixed(2)}MB`;
	}

	async execute(args: Record<string, unknown>): Promise<string> {
		// Type-safe argument extraction
		const filePath = typeof args["path"] === "string" ? args["path"] : "";
		const oldStr = typeof args["oldStr"] === "string" ? args["oldStr"] : "";
		const newStr = typeof args["newStr"] === "string" ? args["newStr"] : "";
		const replaceAll =
			typeof args["replaceAll"] === "boolean" ? args["replaceAll"] : false;
		const maxFileSize =
			typeof args["maxFileSize"] === "number" ? args["maxFileSize"] : 10;

		// Input validation
		if (!filePath.trim()) {
			return "Error(edit_file): No file path provided";
		}

		if (!oldStr || !newStr) {
			return "Error(edit_file): Both oldStr and newStr must be provided and non-empty";
		}

		if (oldStr === newStr) {
			return "Error(edit_file): oldStr and newStr must be different";
		}

		try {
			let content = "";
			let fileExists = false;

			try {
				const file = Bun.file(filePath);
				const fileSize = file.size;

				const maxBytes = maxFileSize * 1024 * 1024;
				if (fileSize > maxBytes) {
					return `Error(edit_file): File size ${this.formatFileSize(fileSize)} exceeds limit of ${maxFileSize}MB`;
				}

				content = await file.text();
				fileExists = true;
			} catch (error) {
				fileExists = false;
				content = "";
			}
			if (fileExists && !content.includes(oldStr)) {
				return `Error(edit_file): String '${oldStr.length > 50 ? oldStr.substring(0, 50) + "..." : oldStr}' not found in file ${filePath}`;
			}

			// Count occurrences for user feedback
			let occurrences = 0;
			if (content) {
				const regex = new RegExp(this.escapeRegExp(oldStr), "g");
				const matches = content.match(regex);
				occurrences = matches ? matches.length : 0;
			}

			let updatedContent: string;
			if (replaceAll) {
				updatedContent = content.replaceAll(oldStr, newStr);
			} else {
				const index = content.indexOf(oldStr);
				if (index === -1) {
					updatedContent = content + (content ? "\n" : "") + newStr;
				} else {
					updatedContent =
						content.substring(0, index) +
						newStr +
						content.substring(index + oldStr.length);
				}
			}

			await Bun.write(filePath, updatedContent);

			let message = `File ${filePath} updated successfully`;

			if (fileExists) {
				if (replaceAll && occurrences > 1) {
					message += ` (replaced ${occurrences} occurrences)`;
				} else if (!replaceAll && occurrences > 1) {
					message += ` (replaced first occurrence, ${occurrences - 1} more found)`;
				}
			} else {
				message += ` (file created)`;
			}

			const previewLength = 100;
			const changePreview =
				newStr.length > previewLength
					? newStr.substring(0, previewLength) + "..."
					: newStr;
			message += `\nReplaced with: "${changePreview}"`;

			return message;
		} catch (error) {
			return `Error(edit_file): Failed to edit file - ${error instanceof Error ? error.message : String(error)}`;
		}
	}
}

export default EditFileTool;
