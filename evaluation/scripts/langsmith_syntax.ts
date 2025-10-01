import "dotenv/config";
import { langsmith } from "../client.js";
// create a dataset
const labeledTexts = [
  ["Shut up, idiot", "Toxic"],
  ["You're a wonderful person", "Not toxic"],
];

const [inputs, outputs] = labeledTexts.reduce<
  [Array<{ input: string }>, Array<{ outputs: string }>]
>(
  ([inputs, outputs], item) => [
    [...inputs, { input: item[0] }],
    [...outputs, { outputs: item[1] }],
  ],
  [[], []]
);

const datasetName = "Toxic Queries";
const isDatasetExists = await langsmith.hasDataset({ datasetName });

const toxicDataset = isDatasetExists
  ? await langsmith.readDataset({ datasetName })
  : await langsmith.createDataset(datasetName);

// accepts ExampleCreate[]. Each ExampleCreate is a single example.
// must provide at least one dataset_id.
// inputs and outputs are KVMap, basically anything
await langsmith.createExamples([
  {
    inputs: inputs[0],
    outputs: outputs[0],
    dataset_id: toxicDataset.id,
  },
  {
    inputs: inputs[1],
    outputs: outputs[1],
  },
]);

// old way
// await langsmith.createExamples({ inputs, outputs, datasetId: toxicDataset.id });
