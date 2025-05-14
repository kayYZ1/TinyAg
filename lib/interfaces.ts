export interface ITool {
	name: string;
	description: string;
	parameters: {
		type: string;
		properties: Record<string, unknown>;
		required?: string[];
	};
	execute: (args: Record<string, unknown>) => Promise<string>;
}
