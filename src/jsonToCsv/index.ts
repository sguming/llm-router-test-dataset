import { readFile } from "fs/promises";
import path from "path";
import { encoding_for_model } from "tiktoken";
import { z } from "zod";

const schema = z.object({
  id: z.string(),
  input: z.string(),
  intent: z.string(),
});

const enc = encoding_for_model("gpt-4o-mini");

const FILE_NAME = "coupon_development.json";

const FILE_PATH = path.join(import.meta.dirname, FILE_NAME);

const jsonData = await readFile(FILE_PATH, "utf-8");

const tokens = enc.encode(jsonData);

console.log("json format: ", tokens.length); // 1552 using json format

const parsedData = JSON.parse(jsonData);

const validatedData = schema.array().parse(parsedData);

const formattedData = validatedData
  .map((item) => `|${item.id}|${item.input}|${item.intent}|`)
  .join("\n");

const headers = schema.keyof().options;

const headerLine = `|${headers.join("|")}|`;
const dividerLine = "| :--- ".repeat(headers.length) + " |";
const formattedDataWithHeader = `${headerLine}\n${dividerLine}\n${formattedData}`;

const formattedTokens = enc.encode(formattedDataWithHeader);
console.log(formattedDataWithHeader);

console.log("csv format: ", formattedTokens.length); // 1117 using csv format

enc.free();
