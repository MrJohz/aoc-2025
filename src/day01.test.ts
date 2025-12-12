import { readFile } from "node:fs/promises";
import test, { type TestContext } from "node:test";

type Exports = {
  handle_row: (start: number, rotation: number) => [number, number];
  eq_zero: (n: number) => number;
  pass_thru_zero: (start: number, end: number) => number;
  parse_line: () => number;
  part1: (length: number) => number;
  part2: (length: number) => number;
};

const compile = async (options: WebAssembly.Imports) => {
  const wasm = await readFile(new URL("./day01.wasm", import.meta.url));
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
  const file = await readFile(new URL("../inputs/day01.txt", import.meta.url));
  return createMemory(file);
};

test("day one", async (t) => {
  t.test("can read a single row with direction", async (t: TestContext) => {
    for (const [input, output] of [
      ["L34", -34],
      ["R111", 111],
      ["L1", -1],
    ] as const) {
      t.test(`${input} -> ${output}`, async (t: TestContext) => {
        const [, file] = createMemory(Buffer.from(input + "\n"));
        const { instance } = await compile({ import: { file } });
        const exports = instance.exports as Exports;
        t.assert.equal(output, exports.parse_line());
      });
    }
  });

  t.test("handles a turn of the wheel", async (t: TestContext) => {
    for (const [start, rotation, end, turns] of [
      [0, 5, 5, 0],
      [0, 99, 99, 0],
      [1, 99, 0, 1],
      [5, 1000, 5, 10],

      // cases from sample input
      [50, -68, 82, 1],
      [82, -30, 52, 0],
      [52, 48, 0, 1],
      [0, -5, 95, 0],
      [95, 60, 55, 1],
      [55, -55, 0, 1],
      [0, -1, 99, 0],
      [-1, -99, 0, 1],
      [0, 14, 14, 0],
      [14, -82, 32, 1],
    ] as const) {
      t.test(
        `${start} + ${rotation} -> ${end}/${turns}`,
        async (t: TestContext) => {
          const [, file] = createMemory(Buffer.from(""));
          const { instance } = await compile({ import: { file } });
          const exports = instance.exports as Exports;
          t.assert.deepEqual([end, turns], exports.handle_row(start, rotation));
        }
      );
    }
  });

  t.test("handles sample input for part 1", async (t: TestContext) => {
    const [length, file] = createMemory(
      Buffer.from(
        `
L68
L30
R48
L5
R60
L55
L1
L99
R14
L82
`.trim() + "\n"
      )
    );

    const { instance } = await compile({ import: { file } });
    const exports = instance.exports as Exports;

    t.assert.equal(exports.part1(length), 3);
  });

  t.test("handles sample input for part 2", async (t: TestContext) => {
    const [length, file] = createMemory(
      Buffer.from(
        `
L68
L30
R48
L5
R60
L55
L1
L99
R14
L82
`.trim() + "\n"
      )
    );

    const { instance } = await compile({ import: { file } });
    const exports = instance.exports as Exports;

    t.assert.equal(exports.part2(length), 6);
  });

  t.test("finds the correct solution to part 1", async (t: TestContext) => {
    const [length, file] = await readInput();
    const { instance } = await compile({ import: { file } });
    const exports = instance.exports as Exports;

    t.assert.equal(exports.part1(length), 1097);
  });

  t.test("finds the correct solution to part 2", async (t: TestContext) => {
    const [length, file] = await readInput();
    const { instance } = await compile({ import: { file } });
    const exports = instance.exports as Exports;

    t.assert.equal(exports.part2(length), 7101);
  });
});
