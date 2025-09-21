import "dotenv/config";
import type { Client, Dataset } from "langsmith";
import { ExampleCreate } from "langsmith/schemas";
import { formatTestData } from "./data_formatter.js";

type CreateDatasetParams = {
  client: Client;
  datasetName: string;
  testDataFileName?: string;
  config?: {
    type?: "test" | "loose";
  };
};

export async function createDataset(
  args: CreateDatasetParams
): Promise<Dataset> {
  const { client, datasetName, config, testDataFileName } = args;

  try {
    const isDatasetExists = await client.hasDataset({ datasetName });
    const dataset = isDatasetExists
      ? await client.readDataset({ datasetName })
      : await client.createDataset(datasetName);

    const examples: ExampleCreate[] = await formatTestData({
      dataset_id: dataset.id,
      type: config?.type ?? "test",
      testDataFileName,
    });

    await client.createExamples(examples);

    return dataset;
  } catch (error) {
    console.error("Error creating dataset:", error);
    throw error;
  }
}
