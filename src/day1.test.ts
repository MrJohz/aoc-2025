import { readFile } from "node:fs/promises";
import test, { type TestContext } from "node:test";

const compile = async (options: WebAssembly.Imports) => {
  const wasm = await readFile(new URL("./day1.wasm", import.meta.url));
  return await WebAssembly.instantiate(wasm, options);
};

const readInput = async () => {
  const file = await readFile(new URL("../inputs/day1.txt", import.meta.url));
  const memory = new WebAssembly.Memory({ initial: 1, maximum: 1 });
  const buffer = new Uint8Array(memory.buffer);
  buffer.set(file);
  return [file.length, memory] as const;
};

test("day one", async (t) => {
  await t.test("calculates basic stuff", async (t: TestContext) => {
    const [length, file] = await readInput();
    const { instance } = await compile({ import: { file } });

    console.log(instance.exports.parse_line());
  });
});
