import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  PrismaClient,
  Difficulty,
} from "../lib/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

type SeedTest = {
  input: string;
  expectedOutput: string;
  isSample?: boolean;
};

type SeedProblem = {
  slug: string;
  title: string;
  difficulty: Difficulty;
  tags: string[];
  description: string;
  timeLimitMs?: number;
  starterCode: Record<string, string>;
  tests: SeedTest[];
};

// stdin/stdout model: the user's program reads from stdin and prints stdout.
const problems: SeedProblem[] = [
  {
    slug: "ikki-son-yigindisi",
    title: "Ikki son yig'indisi",
    difficulty: Difficulty.EASY,
    tags: ["matematika", "boshlang'ich"],
    description: `Ikkita butun son **a** va **b** beriladi. Ularning yig'indisini chiqaring.

### Kirish (input)
Bitta qatorda bo'sh joy bilan ajratilgan ikkita butun son: \`a b\`.

### Chiqish (output)
Bitta son — \`a + b\`.

### Misol
\`\`\`
Kirish:  2 3
Chiqish: 5
\`\`\``,
    starterCode: {
      python: `a, b = map(int, input().split())\n# TODO: yig'indini chiqaring\n`,
      javascript: `const [a, b] = require('fs').readFileSync(0, 'utf8').trim().split(/\\s+/).map(Number);\n// TODO: yig'indini chiqaring\n`,
      cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    long long a, b;\n    cin >> a >> b;\n    // TODO: yig'indini chiqaring\n    return 0;\n}\n`,
    },
    tests: [
      { input: "2 3", expectedOutput: "5", isSample: true },
      { input: "10 20", expectedOutput: "30", isSample: true },
      { input: "-5 7", expectedOutput: "2" },
      { input: "0 0", expectedOutput: "0" },
      { input: "1000000 2000000", expectedOutput: "3000000" },
    ],
  },
  {
    slug: "satrni-teskari-yozish",
    title: "Satrni teskari yozish",
    difficulty: Difficulty.EASY,
    tags: ["satrlar", "boshlang'ich"],
    description: `Bitta satr beriladi. Uni **teskari** tartibda chiqaring.

### Kirish
Bitta qatorda satr (bo'sh joysiz).

### Chiqish
Teskari aylantirilgan satr.

### Misol
\`\`\`
Kirish:  hello
Chiqish: olleh
\`\`\``,
    starterCode: {
      python: `s = input().strip()\n# TODO: teskari satrni chiqaring\n`,
      javascript: `const s = require('fs').readFileSync(0, 'utf8').trim();\n// TODO: teskari satrni chiqaring\n`,
      cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    string s;\n    cin >> s;\n    // TODO: teskari satrni chiqaring\n    return 0;\n}\n`,
    },
    tests: [
      { input: "hello", expectedOutput: "olleh", isSample: true },
      { input: "uzcode", expectedOutput: "edoczu", isSample: true },
      { input: "a", expectedOutput: "a" },
      { input: "12345", expectedOutput: "54321" },
      { input: "racecar", expectedOutput: "racecar" },
    ],
  },
  {
    slug: "massivdagi-eng-katta-son",
    title: "Massivdagi eng katta son",
    difficulty: Difficulty.EASY,
    tags: ["massivlar", "boshlang'ich"],
    description: `Sonlar massivi beriladi. Eng katta elementni toping.

### Kirish
Birinchi qatorda **n** (elementlar soni). Ikkinchi qatorda **n** ta butun son.

### Chiqish
Eng katta son.

### Misol
\`\`\`
Kirish:
5
3 1 4 1 5
Chiqish: 5
\`\`\``,
    starterCode: {
      python: `import sys\ndata = sys.stdin.read().split()\nn = int(data[0])\nnums = list(map(int, data[1:1+n]))\n# TODO: eng katta sonni chiqaring\n`,
      javascript: `const data = require('fs').readFileSync(0, 'utf8').trim().split(/\\s+/).map(Number);\nconst n = data[0];\nconst nums = data.slice(1, 1 + n);\n// TODO: eng katta sonni chiqaring\n`,
      cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    vector<long long> nums(n);\n    for (auto &x : nums) cin >> x;\n    // TODO: eng katta sonni chiqaring\n    return 0;\n}\n`,
    },
    tests: [
      { input: "5\n3 1 4 1 5", expectedOutput: "5", isSample: true },
      { input: "3\n-1 -2 -3", expectedOutput: "-1", isSample: true },
      { input: "1\n42", expectedOutput: "42" },
      { input: "4\n7 7 7 7", expectedOutput: "7" },
      { input: "6\n100 50 200 150 300 250", expectedOutput: "300" },
    ],
  },
  {
    slug: "fizzbuzz",
    title: "FizzBuzz",
    difficulty: Difficulty.EASY,
    tags: ["sikllar", "shartlar"],
    description: `**n** beriladi. 1 dan n gacha bo'lgan har bir son uchun yangi qatorda quyidagini chiqaring:
- 3 va 5 ga bo'linsa — \`FizzBuzz\`
- faqat 3 ga bo'linsa — \`Fizz\`
- faqat 5 ga bo'linsa — \`Buzz\`
- aks holda — sonning o'zi

### Misol
\`\`\`
Kirish:  5
Chiqish:
1
2
Fizz
4
Buzz
\`\`\``,
    starterCode: {
      python: `n = int(input())\nfor i in range(1, n + 1):\n    # TODO: FizzBuzz mantig'i\n    pass\n`,
      javascript: `const n = Number(require('fs').readFileSync(0, 'utf8').trim());\nconst out = [];\nfor (let i = 1; i <= n; i++) {\n  // TODO: FizzBuzz mantig'i; out.push(...)\n}\nconsole.log(out.join('\\n'));\n`,
      cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    for (int i = 1; i <= n; i++) {\n        // TODO: FizzBuzz mantig'i\n    }\n    return 0;\n}\n`,
    },
    tests: [
      { input: "5", expectedOutput: "1\n2\nFizz\n4\nBuzz", isSample: true },
      {
        input: "15",
        expectedOutput:
          "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz",
      },
      { input: "3", expectedOutput: "1\n2\nFizz" },
      { input: "1", expectedOutput: "1" },
    ],
  },
  {
    slug: "ikkilik-sanoq-sistemasi",
    title: "Ikkilik sanoq sistemasiga o'tkazish",
    difficulty: Difficulty.MEDIUM,
    tags: ["matematika", "sanoq-sistemalari"],
    description: `Manfiy bo'lmagan butun son **n** beriladi. Uni ikkilik (binary) sanoq sistemasida chiqaring (boshida ortiqcha nollarsiz). \`n = 0\` bo'lsa \`0\` chiqaring.

### Misol
\`\`\`
Kirish:  10
Chiqish: 1010
\`\`\``,
    starterCode: {
      python: `n = int(input())\n# TODO: ikkilik ko'rinishini chiqaring (0 -> "0")\n`,
      javascript: `const n = Number(require('fs').readFileSync(0, 'utf8').trim());\n// TODO: ikkilik ko'rinishini chiqaring (0 -> "0")\n`,
      cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    long long n;\n    cin >> n;\n    // TODO: ikkilik ko'rinishini chiqaring (0 -> "0")\n    return 0;\n}\n`,
    },
    tests: [
      { input: "10", expectedOutput: "1010", isSample: true },
      { input: "0", expectedOutput: "0", isSample: true },
      { input: "1", expectedOutput: "1" },
      { input: "255", expectedOutput: "11111111" },
      { input: "1024", expectedOutput: "10000000000" },
    ],
  },
  {
    slug: "eng-uzun-osuvchi-ketma-ketlik",
    title: "Eng uzun o'suvchi ketma-ketlik",
    difficulty: Difficulty.HARD,
    tags: ["dinamik-dasturlash", "massivlar"],
    timeLimitMs: 3000,
    description: `Sonlar massivi beriladi. Eng uzun **qat'iy o'suvchi** qism ketma-ketlik (LIS) uzunligini toping. Qism ketma-ketlik uzluksiz bo'lishi shart emas.

### Kirish
Birinchi qatorda **n**. Ikkinchi qatorda **n** ta butun son.

### Chiqish
Eng uzun o'suvchi qism ketma-ketlik uzunligi.

### Misol
\`\`\`
Kirish:
6
10 9 2 5 3 7
Chiqish: 3
\`\`\`
Izoh: \`2 3 7\` — uzunligi 3.`,
    starterCode: {
      python: `import sys\ndata = sys.stdin.read().split()\nn = int(data[0])\nnums = list(map(int, data[1:1+n]))\n# TODO: LIS uzunligini toping (O(n log n) tavsiya etiladi)\n`,
      javascript: `const data = require('fs').readFileSync(0, 'utf8').trim().split(/\\s+/).map(Number);\nconst n = data[0];\nconst nums = data.slice(1, 1 + n);\n// TODO: LIS uzunligini toping\n`,
      cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    vector<int> nums(n);\n    for (auto &x : nums) cin >> x;\n    // TODO: LIS uzunligini toping\n    return 0;\n}\n`,
    },
    tests: [
      { input: "6\n10 9 2 5 3 7", expectedOutput: "3", isSample: true },
      { input: "1\n5", expectedOutput: "1", isSample: true },
      { input: "5\n1 2 3 4 5", expectedOutput: "5" },
      { input: "5\n5 4 3 2 1", expectedOutput: "1" },
      { input: "8\n0 1 0 3 2 3 5 4", expectedOutput: "5" },
    ],
  },
];

async function main() {
  console.log("🌱 Seeding...");

  for (let i = 0; i < problems.length; i++) {
    const p = problems[i];

    const problem = await prisma.problem.upsert({
      where: { slug: p.slug },
      update: {
        title: p.title,
        description: p.description,
        difficulty: p.difficulty,
        tags: p.tags,
        starterCode: p.starterCode,
        timeLimitMs: p.timeLimitMs ?? 2000,
        orderIndex: i,
      },
      create: {
        slug: p.slug,
        title: p.title,
        description: p.description,
        difficulty: p.difficulty,
        tags: p.tags,
        starterCode: p.starterCode,
        timeLimitMs: p.timeLimitMs ?? 2000,
        orderIndex: i,
      },
    });

    // Replace test cases so re-seeding stays in sync.
    await prisma.testCase.deleteMany({ where: { problemId: problem.id } });
    await prisma.testCase.createMany({
      data: p.tests.map((t, idx) => ({
        problemId: problem.id,
        input: t.input,
        expectedOutput: t.expectedOutput,
        isSample: t.isSample ?? false,
        orderIndex: idx,
      })),
    });

    console.log(`  ✓ ${p.title} (${p.tests.length} ta test)`);
  }

  const count = await prisma.problem.count();
  console.log(`✅ Tayyor. Jami masalalar: ${count}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
