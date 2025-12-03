import { readFile } from "node:fs/promises";
import test, { type TestContext } from "node:test";

type Exports = {
  eq_zero: (n: number) => number;
  pass_thru_zero: (diff: number, end: number) => number;
  parse_line: () => number;
  part1: (length: number) => number;
  part2: (length: number) => number;
};

const compile = async (options: WebAssembly.Imports) => {
  const wasm = await readFile(new URL("./day1.wasm", import.meta.url));
  return await WebAssembly.instantiate(wasm, options);
};

const createMemory = (text: Buffer) => {
  const memory = new WebAssembly.Memory({ initial: 1, maximum: 1 });
  const buffer = new Uint8Array(memory.buffer);
  buffer.set(text);
  return [text.length, memory] as const;
};

const readInput = async () => {
  const file = await readFile(new URL("../inputs/day1.txt", import.meta.url));
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

  t.test("can detect when the dial is at zero", async (t: TestContext) => {
    for (const [input, output] of [
      [-1, 0],
      [0, 1],
      [1, 0],
      [99, 0],
      [100, 1],
      [101, 0],
      [-99, 0],
      [-100, 1],
      [-101, 0],
    ] as const) {
      t.test(`${input} -> ${output}`, async (t: TestContext) => {
        const [, file] = createMemory(Buffer.from(""));
        const { instance } = await compile({ import: { file } });
        const exports = instance.exports as Exports;
        t.assert.equal(output, exports.eq_zero(input));
      });
    }
  });

  t.test(
    "can detect when the dial has passed through zero",
    async (t: TestContext) => {
      for (const [start, diff, output] of [
        [1, 1, 0],
        [99, 1, 1],
        [99, 2, 1],
        [99, -1, 0],
        [0, 1, 0],
        [101, -2, 1],
        [1, 1000, 10],
        [1, -1000, 10],
        [99, 101, 2],
        [99, 100, 1],
      ] as const) {
        t.test(`${start} + ${diff} -> ${output}`, async (t: TestContext) => {
          const [, file] = createMemory(Buffer.from(""));
          const { instance } = await compile({ import: { file } });
          const exports = instance.exports as Exports;
          t.assert.equal(exports.pass_thru_zero(diff, start + diff), output);
        });
      }
    }
  );

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

    t.assert.equal(exports.part2(length), 5);
  });

  t.test("finds the correct solution to part 1", async (t: TestContext) => {
    const [length, file] = await readInput();
    const { instance } = await compile({ import: { file } });
    const exports = instance.exports as Exports;

    t.assert.equal(exports.part1(length), 1097);
  });

  t.test(
    "finds the correct solution to part 2",
    { skip: true },
    async (t: TestContext) => {
      const [length, file] = await readInput();
      const { instance } = await compile({ import: { file } });
      const exports = instance.exports as Exports;

      t.assert.equal(exports.part2(length), 0);
    }
  );
});
