import { ExampleCreate } from "langsmith/schemas";
import { readFile, readdir } from "fs/promises";
import { z } from "zod";

type FormatTestDataParams = {
  dataset_id: string;
  type: "test" | "loose";
  fileName?: string;
  limit?: number; // per-file limit, upload only the first N examples of each file when provided
};

const testDataSchema = z.object({
  id: z.string().describe("The unique identifier for the example."),
  input: z.string().describe("The user query."),
  intent: z.string().describe("The expected intent of the user query."),
});

const TEST_DATA_DIR = "test_data";

export async function formatTestData(
  args: FormatTestDataParams
): Promise<ExampleCreate[]> {
  const { dataset_id, type, fileName, limit } = args;

  try {
    const testDataFiles = await readdir(TEST_DATA_DIR, { withFileTypes: true });
    const fileNames = testDataFiles.map((file) => file.name);

    const nameIdentifier = type === "test" ? "_test.json" : "_test_loose.json";

    const testData = [];

    let filesToProcess: string[];

    if (fileName) {
      // If specific fileName is provided, only process that file
      const expectedFileName = `${fileName}${nameIdentifier}`;
      if (!fileNames.includes(expectedFileName)) {
        throw new Error(
          `File '${expectedFileName}' not found in ${TEST_DATA_DIR} directory. Available files: ${fileNames.join(
            ", "
          )}`
        );
      }
      filesToProcess = [expectedFileName];
      console.log(`🎯 Processing specific file: ${expectedFileName}`);
    } else {
      // Process all files matching the type identifier
      filesToProcess = fileNames.filter((fileName) =>
        fileName.endsWith(nameIdentifier)
      );
      console.log(
        `📁 Processing all ${type} files: ${filesToProcess.join(", ")}`
      );
    }

    // Read and process the files
    for (const fileName of filesToProcess) {
      console.log(`📖 Reading file: ${fileName}`);
      const dataJSON = await readFile(`${TEST_DATA_DIR}/${fileName}`, "utf-8");
      const data = JSON.parse(dataJSON);

      if (!data?.length) {
        throw new Error(
          `No valid data found in ${fileName}. Expected non-empty array.`
        );
      }

      const useLimit = Number.isFinite(limit) && (limit as number) > 0 ? (limit as number) : undefined;
      const sliced = useLimit ? data.slice(0, useLimit) : data;
      console.log(
        `✅ Found ${data.length} examples in ${fileName}${sliced.length !== data.length ? ` → taking first ${sliced.length}` : ""}`
      );
      testData.push(...sliced);
    }

    // 2. validate the test data
    console.log(`🔍 Validating ${testData.length} examples...`);
    const validatedTestData = testDataSchema.array().parse(testData);

    // 3. format the test data to ExampleCreate[]
    console.log(
      `📋 Formatting ${validatedTestData.length} examples for dataset upload...`
    );
    const formattedTestData = validatedTestData.map<ExampleCreate>((data) => ({
      inputs: { input: data.input },
      outputs: { intent: data.intent },
      dataset_id,
      metadata: {
        // for filtering
        intent: data.intent,
        example_id: data.id,
      },
    }));

    console.log(
      `🎉 Successfully processed ${formattedTestData.length} examples`
    );
    return formattedTestData;
  } catch (error) {
    console.error("Error reading test data:", error);
    throw error;
  }
}
