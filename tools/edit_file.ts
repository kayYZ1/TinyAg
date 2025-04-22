import type { ITool } from "../interfaces";

class EditFileTool implements ITool {
  name = "edit_file";
  description =
    "Make edits to a text file.\n\nReplaces 'old_str' with 'new_str' in the given file. 'old_str' and 'new_str' MUST be different from each other.\n\nIf the file specified with path doesn't exist, it will be created.";
  parameters = {
    type: "object",
    properties: {
      path: {
        type: "string",
        description: "The name of the file to edit",
      },
      oldStr: {
        type: "string",
        description: "The string to replace",
      },
      newStr: {
        type: "string",
        description: "The string to replace with",
      },
    },
    required: ["path", "oldStr", "newStr"],
  };

  execute = async (args: Record<string, unknown>) => {
    const filePath = typeof args["path"] === "string" ? args["path"] : "";
    const oldStr = typeof args["oldStr"] === "string" ? args["oldStr"] : "";
    const newStr = typeof args["newStr"] === "string" ? args["newStr"] : "";

    if (!filePath) {
      return "Error(edit_file): No file path provided";
    }
    if (!oldStr || !newStr) {
      return "Error(edit_file): oldStr and newStr must be provided";
    }
    if (oldStr === newStr) {
      return "Error(edit_file): oldStr and newStr must be different";
    }

    try {
      let content = "";
      try {
        content = await Bun.file(filePath).text();
        console.log(content)
      } catch (error) {
        console.error("No file found: ", error);
      }
      const updatedContent = content.replaceAll(oldStr, newStr);
      console.log(updatedContent)
      await Bun.write(filePath, updatedContent);

      return `File ${filePath} updated successfully`;
    } catch (error) {
      return `Error editing file: ${error}`;
    }
  };
}

export default EditFileTool;