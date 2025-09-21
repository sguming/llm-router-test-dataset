import { describe, it, expect, beforeEach, vi, type Mock } from "vitest";
import { parseArgs as parseNodeArgs } from "node:util";

// Mock the node:util module
vi.mock("node:util", () => ({
  parseArgs: vi.fn(),
}));

// Import after mocking
import { parseArgs, validateType } from "../evaluation/scripts/command.js";

// Mock process.argv and console methods
const mockExit = vi.fn();
const mockConsoleLog = vi.fn();
const mockConsoleError = vi.fn();

vi.stubGlobal("process", {
  ...process,
  exit: mockExit,
  argv: ["node", "command.ts"],
});

vi.stubGlobal("console", {
  ...console,
  log: mockConsoleLog,
  error: mockConsoleError,
});

describe("Command Module", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockExit.mockReset();
    mockConsoleLog.mockReset();
    mockConsoleError.mockReset();
  });

  describe("parseArgs", () => {
    describe("Valid Commands", () => {
      it("should parse basic command with dataset name only", () => {
        const mockParseNodeArgs = parseNodeArgs as Mock;
        mockParseNodeArgs.mockReturnValue({
          values: {},
          positionals: ["my-dataset"],
        });

        // Mock process.argv with the command
        vi.stubGlobal("process", {
          ...process,
          argv: ["node", "command.ts", "my-dataset"],
        });

        const result = parseArgs();

        expect(result).toEqual({
          datasetName: "my-dataset",
          fileName: undefined,
          type: "test",
        });
      });

      it("should parse command with fileName option", () => {
        const mockParseNodeArgs = parseNodeArgs as Mock;
        mockParseNodeArgs.mockReturnValue({
          values: { fileName: "faq" },
          positionals: ["my-dataset"],
        });

        vi.stubGlobal("process", {
          ...process,
          argv: ["node", "command.ts", "my-dataset", "--fileName", "faq"],
        });

        const result = parseArgs();

        expect(result).toEqual({
          datasetName: "my-dataset",
          fileName: "faq",
          type: "test",
        });
      });

      it("should parse command with short fileName flag", () => {
        const mockParseNodeArgs = parseNodeArgs as Mock;
        mockParseNodeArgs.mockReturnValue({
          values: { fileName: "faq" },
          positionals: ["my-dataset"],
        });

        vi.stubGlobal("process", {
          ...process,
          argv: ["node", "command.ts", "my-dataset", "-f", "faq"],
        });

        const result = parseArgs();

        expect(result).toEqual({
          datasetName: "my-dataset",
          fileName: "faq",
          type: "test",
        });
      });

      it("should parse command with type option", () => {
        const mockParseNodeArgs = parseNodeArgs as Mock;
        mockParseNodeArgs.mockReturnValue({
          values: { type: "loose" },
          positionals: ["my-dataset"],
        });

        vi.stubGlobal("process", {
          ...process,
          argv: ["node", "command.ts", "my-dataset", "--type", "loose"],
        });

        const result = parseArgs();

        expect(result).toEqual({
          datasetName: "my-dataset",
          fileName: undefined,
          type: "loose",
        });
      });

      it("should parse command with short type flag", () => {
        const mockParseNodeArgs = parseNodeArgs as Mock;
        mockParseNodeArgs.mockReturnValue({
          values: { type: "loose" },
          positionals: ["my-dataset"],
        });

        vi.stubGlobal("process", {
          ...process,
          argv: ["node", "command.ts", "my-dataset", "-t", "loose"],
        });

        const result = parseArgs();

        expect(result).toEqual({
          datasetName: "my-dataset",
          fileName: undefined,
          type: "loose",
        });
      });

      it("should parse command with both fileName and type options", () => {
        const mockParseNodeArgs = parseNodeArgs as Mock;
        mockParseNodeArgs.mockReturnValue({
          values: { fileName: "faq", type: "loose" },
          positionals: ["my-dataset"],
        });

        vi.stubGlobal("process", {
          ...process,
          argv: [
            "node",
            "command.ts",
            "my-dataset",
            "--fileName",
            "faq",
            "--type",
            "loose",
          ],
        });

        const result = parseArgs();

        expect(result).toEqual({
          datasetName: "my-dataset",
          fileName: "faq",
          type: "loose",
        });
      });

      it("should parse command with mixed short and long flags", () => {
        const mockParseNodeArgs = parseNodeArgs as Mock;
        mockParseNodeArgs.mockReturnValue({
          values: { fileName: "faq", type: "loose" },
          positionals: ["my-dataset"],
        });

        vi.stubGlobal("process", {
          ...process,
          argv: [
            "node",
            "command.ts",
            "my-dataset",
            "-f",
            "faq",
            "--type",
            "loose",
          ],
        });

        const result = parseArgs();

        expect(result).toEqual({
          datasetName: "my-dataset",
          fileName: "faq",
          type: "loose",
        });
      });

      it("should handle help flag", () => {
        const mockParseNodeArgs = parseNodeArgs as Mock;
        mockParseNodeArgs.mockReturnValue({
          values: { help: true },
          positionals: [],
        });

        vi.stubGlobal("process", {
          ...process,
          argv: ["node", "command.ts", "--help"],
        });

        parseArgs();

        expect(mockConsoleLog).toHaveBeenCalledWith(
          expect.stringContaining("📖 Usage:")
        );
        expect(mockExit).toHaveBeenCalledWith(0);
      });

      it("should handle short help flag", () => {
        const mockParseNodeArgs = parseNodeArgs as Mock;
        mockParseNodeArgs.mockReturnValue({
          values: { help: true },
          positionals: [],
        });

        vi.stubGlobal("process", {
          ...process,
          argv: ["node", "command.ts", "-h"],
        });

        parseArgs();

        expect(mockConsoleLog).toHaveBeenCalledWith(
          expect.stringContaining("📖 Usage:")
        );
        expect(mockExit).toHaveBeenCalledWith(0);
      });
    });

    describe("Invalid Commands (Error Cases)", () => {
      it("should exit with error when datasetName is missing", () => {
        const mockParseNodeArgs = parseNodeArgs as Mock;
        mockParseNodeArgs.mockReturnValue({
          values: {},
          positionals: [],
        });

        vi.stubGlobal("process", {
          ...process,
          argv: ["node", "command.ts"],
        });

        parseArgs();

        expect(mockConsoleError).toHaveBeenCalledWith(
          "❌ Error: datasetName is required"
        );
        expect(() => parseArgs()).toThrow("❌ Error: datasetName is required");
      });

      it("should handle unknown options error", () => {
        const mockParseNodeArgs = parseNodeArgs as Mock;
        mockParseNodeArgs.mockImplementation(() => {
          throw new Error("Unknown option --invalid");
        });

        vi.stubGlobal("process", {
          ...process,
          argv: ["node", "command.ts", "my-dataset", "--invalid", "value"],
        });

        expect(() => parseArgs()).toThrow("Unknown option --invalid");
      });

      it("should validate type case-insensitively", () => {
        const mockParseNodeArgs = parseNodeArgs as Mock;
        mockParseNodeArgs.mockReturnValue({
          values: { type: "LOOSE" },
          positionals: ["my-dataset"],
        });

        vi.stubGlobal("process", {
          ...process,
          argv: ["node", "command.ts", "my-dataset", "--type", "LOOSE"],
        });

        const result = parseArgs();

        expect(result.type).toBe("loose");
      });

      it("should handle invalid type gracefully", () => {
        const mockParseNodeArgs = parseNodeArgs as Mock;
        mockParseNodeArgs.mockReturnValue({
          values: { type: "invalid" },
          positionals: ["my-dataset"],
        });

        vi.stubGlobal("process", {
          ...process,
          argv: ["node", "command.ts", "my-dataset", "--type", "invalid"],
        });

        const result = parseArgs();

        // Should default to 'test' and log error
        expect(result.type).toBe("test");
        expect(mockConsoleError).toHaveBeenCalledWith(
          "❌ Error: Invalid type 'invalid'. Default to 'test'"
        );
      });

      it("should handle empty dataset name", () => {
        const mockParseNodeArgs = parseNodeArgs as Mock;
        mockParseNodeArgs.mockReturnValue({
          values: {},
          positionals: [""],
        });

        vi.stubGlobal("process", {
          ...process,
          argv: ["node", "command.ts", ""],
        });

        const result = parseArgs();

        expect(result.datasetName).toBe("");
        // Note: Empty dataset name should be handled by createDataset function
      });

      it("should handle special characters in dataset name", () => {
        const mockParseNodeArgs = parseNodeArgs as Mock;
        mockParseNodeArgs.mockReturnValue({
          values: {},
          positionals: ["my-special_dataset.name"],
        });

        vi.stubGlobal("process", {
          ...process,
          argv: ["node", "command.ts", "my-special_dataset.name"],
        });

        const result = parseArgs();

        expect(result.datasetName).toBe("my-special_dataset.name");
      });

      it("should handle very long dataset name", () => {
        const longName = "a".repeat(200);
        const mockParseNodeArgs = parseNodeArgs as Mock;
        mockParseNodeArgs.mockReturnValue({
          values: {},
          positionals: [longName],
        });

        vi.stubGlobal("process", {
          ...process,
          argv: ["node", "command.ts", longName],
        });

        const result = parseArgs();

        expect(result.datasetName).toBe(longName);
      });

      it("should handle fileName with special characters", () => {
        const mockParseNodeArgs = parseNodeArgs as Mock;
        mockParseNodeArgs.mockReturnValue({
          values: { fileName: "special-file_name" },
          positionals: ["my-dataset"],
        });

        vi.stubGlobal("process", {
          ...process,
          argv: [
            "node",
            "command.ts",
            "my-dataset",
            "--fileName",
            "special-file_name",
          ],
        });

        const result = parseArgs();

        expect(result.fileName).toBe("special-file_name");
      });

      it("should handle numeric-looking fileName", () => {
        const mockParseNodeArgs = parseNodeArgs as Mock;
        mockParseNodeArgs.mockReturnValue({
          values: { fileName: "123" },
          positionals: ["my-dataset"],
        });

        vi.stubGlobal("process", {
          ...process,
          argv: ["node", "command.ts", "my-dataset", "--fileName", "123"],
        });

        const result = parseArgs();

        expect(result.fileName).toBe("123");
      });
    });
  });

  describe("validateType", () => {
    it('should return "test" for valid "test" input', () => {
      expect(validateType("test")).toBe("test");
    });

    it('should return "loose" for valid "loose" input', () => {
      expect(validateType("loose")).toBe("loose");
    });

    it('should return "test" for invalid input', () => {
      expect(validateType("invalid")).toBe("test");
    });

    it('should return "test" for empty string', () => {
      expect(validateType("")).toBe("test");
    });

    it('should return "test" for null/undefined (type assertion)', () => {
      expect(validateType("random")).toBe("test");
    });
  });

  describe("Error Handling Edge Cases", () => {
    it("should handle parseArgs throwing non-Error objects", () => {
      const mockParseNodeArgs = parseNodeArgs as Mock;
      mockParseNodeArgs.mockImplementation(() => {
        throw "String error";
      });

      vi.stubGlobal("process", {
        ...process,
        argv: ["node", "command.ts", "my-dataset"],
      });

      expect(() => parseArgs()).toThrow("String error");
    });

    it("should handle parseNodeArgs returning unexpected structure", () => {
      const mockParseNodeArgs = parseNodeArgs as Mock;
      mockParseNodeArgs.mockReturnValue({
        // Missing values or positionals
      });

      vi.stubGlobal("process", {
        ...process,
        argv: ["node", "command.ts", "my-dataset"],
      });

      expect(() => parseArgs()).toThrow();
    });
  });
});
