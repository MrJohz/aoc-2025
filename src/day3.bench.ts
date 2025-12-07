import { readFile } from "node:fs/promises";
import { Bench } from "tinybench";

const compile = async (file: WebAssembly.Memory) => {
  const wasm = await readFile(new URL("./day3.wasm", import.meta.url));
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
  const file = await readFile(new URL("../inputs/day3.txt", import.meta.url));
  return createMemory(file);
};

const readInputString = async () => {
  return await readFile(
    new URL("../inputs/day3.txt", import.meta.url),
    "utf-8"
  );
};

const [length, memory] = await readInput();
const module = await compile(memory);
const exports = module.instance.exports as {
  part1: (length: number) => number;
  part2: (length: number) => bigint;
  partn: (length: number, n: number) => bigint;
};

const textInput = await readInputString();

function part1js() {
  let sum = 0;
  textInput.split("\n").map((each) => {
    let largest = each.charCodeAt(0);
    let second = each.charCodeAt(1);
    let idx = 2;

    for (; idx < each.length; idx++) {
      const prev = each.charCodeAt(idx - 1);
      const curr = each.charCodeAt(idx);
      if (prev > largest) {
        largest = prev;
        second = curr;
      } else if (curr > second) {
        second = curr;
      }
    }

    sum += (largest - 48) * 10 + (second - 48);
  });
  return sum;
}

const part1 = new Bench({
  name: "Day Three — Part 1",
  time: 15_000,
  warmup: true,
  warmupIterations: 5_000,
});

part1.add("JavaScript", () => {
  return part1js();
});

part1.add("WASM (locals)", () => {
  return exports.part1(length);
});

part1.add("WASM (memory)", () => {
  return exports.partn(length, 2);
});

await part1.run();
console.log(part1.name);
console.table(part1.table());

const part2 = new Bench({
  name: "Day Three — Part 2",
  time: 15_000,
  warmup: true,
  warmupIterations: 5_000,
});

part2.add("WASM (memory hardcoded)", () => {
  return exports.part2(length);
});

part2.add("WASM (memory dynamic)", () => {
  return exports.partn(length, 12);
});

await part2.run();
console.log(part2.name);
console.table(part2.table());
