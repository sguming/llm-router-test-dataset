import { parseArgs as parseNodeArgs } from "node:util";
import { Client } from "langsmith";
import { createDataset } from "./create_dataset.js";

interface CLIOptions {
  datasetName: string;
  fileName?: string;
  type: "test" | "loose";
}

const langsmith = new Client();

const HELP_MESSAGE = `
📖 Usage:    create-dataset <datasetName> [--fileName <fileName>] [--type <type>]
             create-dataset <datasetName> [-f <fileName>] [--type <type>]
📝 Examples: create-dataset my-dataset
             create-dataset my-dataset --fileName faq --type loose
             create-dataset my-dataset -f faq --type test
🔍 Options:  --fileName, -f  Prefix of the test data file (e.g., 'faq' for faq_test.json)
             --type, -t      Dataset type: 'test' or 'loose' (defaults to 'test')
             --help, -h      Show this help message
📋 Description: Create a dataset in LangSmith with intent classification examples.
                If no fileName is provided, all files matching the type will be processed.
`;

// Parse command line arguments
function parseArgs(): CLIOptions {
  try {
    const args = process.argv.slice(2);

    // Handle help flag - special case
    if (args.includes("--help") || args.includes("-h")) {
      console.log(HELP_MESSAGE);
      process.exit(0);
    }

    const { values, positionals } = parseNodeArgs({
      args: process.argv.slice(2),
      options: {
        fileName: {
          type: "string",
          short: "f", // full name is --fileName and short name is -f
          description:
            "Prefix of the test data file (e.g., 'faq' for faq_test.json)",
        },
        type: {
          type: "string",
          short: "t", // full name is --type and short name is -t
          description: "Dataset type: 'test' or 'loose' (defaults to 'test')",
        },
      },
      allowPositionals: true,
      strict: true,
    });

    // Validate required datasetName
    if (positionals.length === 0) {
      console.error("❌ Error: datasetName is required");
      process.exit(1);
    }

    const datasetName = positionals[0];

    // Validate and set type (default to "test")
    let type: "test" | "loose" = "test";
    if (values.type) {
      const typeValue = values.type.toLowerCase();
      type = validateType(typeValue);
    }

    return {
      datasetName,
      fileName: values.fileName,
      type,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unknown option")) {
      console.error("❌ Error: Unknown option provided");
      console.error(HELP_MESSAGE);
      process.exit(1);
    }
    throw error;
  }
}

async function main() {
  try {
    const { datasetName, fileName, type } = parseArgs();

    console.log(`🚀 Starting dataset creation...`);
    console.log(`📊 Dataset Name: ${datasetName}`);
    console.log(`🔧 Dataset Type: ${type}`);

    if (fileName) {
      console.log(`📁 File Prefix: ${fileName}`);
      console.log(
        `📄 Expected file: ${fileName}_test${
          type === "loose" ? "_loose" : ""
        }.json`
      );
    } else {
      console.log(`📁 Processing Mode: All files (${type} type)`);
    }

    const dataset = await createDataset({
      client: langsmith,
      datasetName,
      fileName,
      config: { type },
    });

    console.log(`✅ Dataset created successfully!`);
    console.log(`📊 Dataset Name: ${dataset.name}`);
    console.log(`🆔 Dataset ID: ${dataset.id}`);
  } catch (error) {
    console.error("❌ Error:", error instanceof Error ? error.message : error);
    console.error("💡 Please check your input parameters and try again.");
    process.exit(1);
  }
}

main();

function validateType(type: string): "test" | "loose" {
  if (type === "test" || type === "loose") {
    return type;
  }
  console.error(`❌ Error: Invalid type '${type}'. Default to 'test'`);
  return "test";
}
