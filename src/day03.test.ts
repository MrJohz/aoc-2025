import { readFile } from "node:fs/promises";
import test, { type TestContext } from "node:test";

type Exports = {
  findlargest2: () => number;
  findlargest12: (arr: number) => number;
  part1: (length: number) => number;
  part2: (length: number) => number;
};

const compile = async (file: WebAssembly.Memory) => {
  const wasm = await readFile(new URL("./day03.wasm", import.meta.url));
  let mod = await WebAssembly.instantiate(wasm, {
    import: { file },
    console: { log: console.log },
    utils: {
      logstr: (offset: number, length: number) => {
        const bytes = new Uint8Array(file.buffer, offset, length);
        const string = new TextDecoder("utf8").decode(bytes);
        console.log(string); // implementation not shown - could call console.log()
      },
    },
  });
  return mod;
};

const createMemory = (text: Buffer) => {
  const memory = new WebAssembly.Memory({ initial: 1, maximum: 1 });
  const buffer = new Uint8Array(memory.buffer);
  buffer.set(text);
  return [text.length, memory] as const;
};

const readInput = async () => {
  const file = await readFile(new URL("../inputs/day03.txt", import.meta.url));
  return createMemory(file);
};

test("day three", (t: TestContext) => {
  t.test("findlargest2", (t: TestContext) => {
    for (const [input, output] of [
      ["11111111111", 11],
      ["21111111", 21],
      ["88889", 89],
      ["888890", 90],
      ["987654321111111", 98],
      ["811111111111119", 89],
      ["234234234234278", 78],
      ["818181911112111", 92],
    ] as const) {
      t.test(`${input} -> ${output}`, async (t: TestContext) => {
        const [, file] = createMemory(Buffer.from(input + "\n"));
        const { instance } = await compile(file);
        const exports = instance.exports as Exports;
        t.assert.equal(exports.findlargest2(), output);
      });
    }
  });

  t.test("findlargest12", (t: TestContext) => {
    for (const [input, output] of [
      ["111111111111", 111111111111n],
      ["211111111111", 211111111111n],
      ["1211111111111", 211111111111n],
      ["11211111111111", 211111111111n],
      ["111211111111111", 211111111111n],
      ["987654321111111", 987654321111n],
      ["811111111111119", 811111111119n],
      ["234234234234278", 434234234278n],
      ["818181911112111", 888911112111n],
    ] as const) {
      t.test(`${input} -> ${output}`, async (t: TestContext) => {
        const [, file] = createMemory(Buffer.from(input + "\n"));
        const { instance } = await compile(file);
        const exports = instance.exports as Exports;
        t.assert.equal(exports.findlargest12(30), output);
      });
    }
  });

  t.test("finds the correct solution to part 1", async (t: TestContext) => {
    const [length, file] = await readInput();
    const { instance } = await compile(file);
    const exports = instance.exports as Exports;

    t.assert.equal(exports.part1(length), 17430);
  });

  t.test("finds the correct solution to part 2", async (t: TestContext) => {
    const [length, file] = await readInput();
    const { instance } = await compile(file);
    const exports = instance.exports as Exports;

    t.assert.equal(exports.part2(length), 171975854269367n);
  });
});
