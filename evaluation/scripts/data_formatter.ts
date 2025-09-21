import { ExampleCreate } from "langsmith/schemas";
import { readFile, readdir } from "fs/promises";
import { z } from "zod";

type FormatTestDataParams = {
  dataset_id: string;
  type: "test" | "loose";
  testDataFileName?: string;
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
  const { dataset_id, type, testDataFileName } = args;

  try {
    const testDataFiles = await readdir(TEST_DATA_DIR, { withFileTypes: true });
    const fileNames = testDataFiles.map((file) => file.name);

    const nameIdentifier = type === "test" ? "_test.json" : "_test_loose.json";

    const testData = [];

    // 1. read the all files with the name identifier
    const identifierFileNames = fileNames.filter((fileName) =>
      fileName.endsWith(nameIdentifier)
    );
    for (const fileName of identifierFileNames) {
      const dataJSON = await readFile(`${TEST_DATA_DIR}/${fileName}`, "utf-8");
      const data = JSON.parse(dataJSON);

      if (!data?.length) {
        throw new Error(`No valid data found in ${fileName}`);
      }

      testData.push(...data);
    }

    // 2. validate the test data
    const validatedTestData = testDataSchema.array().parse(testData);

    // 3. format the test data to ExampleCreate[]
    const formattedTestData = validatedTestData.map<ExampleCreate>((data) => ({
      inputs: { input: data.input },
      outputs: { intent: data.intent },
      dataset_id,
      metadata: {
        // for filtering
        intent: data.intent,
      },
    }));

    return formattedTestData;
  } catch (error) {
    console.error("Error reading test data:", error);
    throw error;
  }
}
