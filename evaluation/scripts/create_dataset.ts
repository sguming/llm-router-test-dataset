import { Client, Dataset } from "langsmith";
import { ExampleCreate } from "langsmith/schemas";
import { formatTestData } from "./data_formatter.js";

type CreateDatasetParams = {
  client: Client;
  datasetName: string;
  config?: {
    type?: "test" | "loose";
  };
};

const langsmith = new Client();

export async function createDataset(
  args: CreateDatasetParams
): Promise<Dataset> {
  const { client, datasetName, config } = args;

  try {
    const isDatasetExists = await client.hasDataset({ datasetName });
    const dataset = isDatasetExists
      ? await client.readDataset({ datasetName })
      : await client.createDataset(datasetName);

    const examples: ExampleCreate[] = await formatTestData(
      dataset.id,
      config?.type ?? "test"
    );

    await client.createExamples(examples);

    return dataset;
  } catch (error) {
    console.error("Error creating dataset:", error);
    throw error;
  }
}

// const dataset = await createDataset({
//   client: langsmith,
//   datasetName: "intent_classification_dataset_loose",
//   config: {
//     type: "loose",
//   },
// });
// console.log(dataset);
