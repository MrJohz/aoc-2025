import { readFile } from "node:fs/promises";
import test, { describe, type TestContext } from "node:test";

type Exports = {
  part1: (length: number) => number;
  part2: (length: number) => number;
  readaddress: () => number;
};

const compile = async (options: WebAssembly.Imports) => {
  const wasm = await readFile(new URL("./day11.wasm", import.meta.url));
  return await WebAssembly.instantiate(wasm, {
    ...options,
    console: { log: console.log },
  });
};

const createMemory = (text: Buffer) => {
  const memory = new WebAssembly.Memory({ initial: 1, maximum: 1 });
  const buffer = new Uint8Array(memory.buffer);
  buffer.set(text);
  return [text.length, memory] as const;
};

const readInput = async () => {
  const file = await readFile(new URL("../inputs/day11.txt", import.meta.url));
  return createMemory(file);
};

test.describe("day eleven", () => {
  describe("reads an address", () => {
    for (const [input, output] of [
      ["aaa", 0],
      ["aab", 1],
      ["zzz", 17575],
    ] as const) {
      test(`reads ${input} as ${output}`, async (t: TestContext) => {
        const [, file] = createMemory(Buffer.from(input));
        const { instance } = await compile({ import: { file } });
        const exports = instance.exports as Exports;

        t.assert.equal(exports.readaddress(), output);
      });
    }
  });

  test.skip("finds the correct solution to part 1", async (t: TestContext) => {
    const [length, file] = await readInput();
    const { instance } = await compile({ import: { file } });
    const exports = instance.exports as Exports;

    t.assert.equal(exports.part1(length), 1097);
  });

  test.skip("finds the correct solution to part 2", async (t: TestContext) => {
    const [length, file] = await readInput();
    const { instance } = await compile({ import: { file } });
    const exports = instance.exports as Exports;

    t.assert.equal(exports.part2(length), 7101);
  });
});
