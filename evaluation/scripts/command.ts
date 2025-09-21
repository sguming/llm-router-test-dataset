import { Client } from "langsmith";
import { createDataset } from "./create_dataset.js";

interface CLIOptions {
  datasetName: string;
  type?: "test" | "loose";
}

const langsmith = new Client();

// Parse command line arguments
function parseArgs(): CLIOptions {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("Usage: create-dataset <datasetName> [--loose]");
    console.error("Example:");
    console.error("  create-dataset my-dataset");
    console.error("  create-dataset my-dataset --loose");
    process.exit(1);
  }

  const datasetName = args[0];
  const type = args.includes("--loose") ? "loose" : "test";

  return { datasetName, type };
}

async function main() {
  try {
    const { datasetName, type } = parseArgs();

    console.log(`Creating dataset: ${datasetName}`);
    if (type) {
      console.log(`Dataset type: ${type}`);
    }

    const dataset = await createDataset({
      client: langsmith,
      datasetName,
      config: { type },
    });

    console.log(`Dataset created successfully: ${dataset.name}`);
    console.log(`Dataset ID: ${dataset.id}`);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main();
