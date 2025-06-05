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
        description:
          "The string to replace (must exist in file, or empty string for new/empty files)",
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
    const filePath = typeof args["path"] === "string" ? args["path"] : "";
    const oldStr = typeof args["oldStr"] === "string" ? args["oldStr"] : "";
    const newStr = typeof args["newStr"] === "string" ? args["newStr"] : "";
    const replaceAll =
      typeof args["replaceAll"] === "boolean" ? args["replaceAll"] : false;
    const maxFileSize =
      typeof args["maxFileSize"] === "number" ? args["maxFileSize"] : 10;

    if (!filePath.trim()) {
      return "Error(edit_file): No file path provided";
    }

    // Allow empty oldStr for new/empty files
    if (newStr === undefined || newStr === null) {
      return "Error(edit_file): newStr must be provided";
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

      let updatedContent: string;
      let occurrences = 0;
      let operationType = "";

      // Case 1: File doesn't exist or is empty, and oldStr is empty
      if ((!fileExists || content.trim() === "") && oldStr === "") {
        updatedContent = newStr;
        operationType = fileExists
          ? "inserted content into empty file"
          : "created file with content";
      }
      // Case 2: File exists with content, oldStr is empty (append)
      else if (fileExists && oldStr === "") {
        updatedContent =
          content + (content.endsWith("\n") ? "" : "\n") + newStr;
        operationType = "appended content";
      }
      // Case 3: Normal replacement
      else {
        if (fileExists && !content.includes(oldStr)) {
          return `Error(edit_file): String '${oldStr.length > 50 ? oldStr.substring(0, 50) + "..." : oldStr}' not found in file ${filePath}`;
        }

        // Count occurrences for user feedback
        if (content) {
          const regex = new RegExp(this.escapeRegExp(oldStr), "g");
          const matches = content.match(regex);
          occurrences = matches ? matches.length : 0;
        }

        if (replaceAll) {
          updatedContent = content.replaceAll(oldStr, newStr);
          operationType = `replaced all ${occurrences} occurrences`;
        } else {
          const index = content.indexOf(oldStr);
          if (index === -1) {
            // This shouldn't happen due to earlier check, but just in case
            updatedContent = content + (content ? "\n" : "") + newStr;
            operationType = "appended content (oldStr not found)";
          } else {
            updatedContent =
              content.substring(0, index) +
              newStr +
              content.substring(index + oldStr.length);
            operationType =
              occurrences > 1
                ? `replaced first occurrence (${occurrences - 1} more found)`
                : "replaced content";
          }
        }
      }

      await Bun.write(filePath, updatedContent);

      let message = `File ${filePath} updated successfully (${operationType})`;

      const previewLength = 100;
      const changePreview =
        newStr.length > previewLength
          ? newStr.substring(0, previewLength) + "..."
          : newStr;
      message += `\nContent: "${changePreview}"`;

      return message;
    } catch (error) {
      return `Error(edit_file): Failed to edit file - ${error instanceof Error ? error.message : String(error)}`;
    }
  }
}

export default EditFileTool;
