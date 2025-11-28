import { exec } from 'child_process';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as os from 'os';

const cliPath = path.resolve(__dirname, '../../dist/src/index.js');

function runCli(args: string[]): Promise<{ stdout: string; stderr: string; code: number }> {
  return new Promise((resolve) => {
    exec(`node ${cliPath} ${args.join(' ')}`, (error, stdout, stderr) => {
      resolve({
        stdout,
        stderr,
        code: error ? error.code || 1 : 0,
      });
    });
  });
}

describe('CLI Integration', () => {
  let tempDir: string;
  let deliveryPath: string;
  let usagePath: string;
  let inventoryPath: string;

  beforeAll(async () => {
    // Ensure build exists
    // In a real CI, we'd run build here, but we assume it's built for now or run it manually.
  });

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'banana-test-'));
    deliveryPath = path.join(tempDir, 'delivery.txt');
    usagePath = path.join(tempDir, 'usage.csv');
    inventoryPath = path.join(tempDir, 'inventory.json');
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it('should generate a correct report for valid input', async () => {
    await fs.writeFile(deliveryPath, 'banana=10\napple=5');
    await fs.writeFile(usagePath, 'food,quantity\nbanana,2');
    await fs.writeFile(inventoryPath, JSON.stringify([
      { item: 'banana', quantity: 8 },
      { item: 'apple', quantity: 5 }
    ]));

    const { stdout, code } = await runCli([
      '-d', deliveryPath,
      '-u', usagePath,
      '-i', inventoryPath
    ]);

    expect(code).toBe(0);
    expect(stdout).toContain('Zoo Food Audit Report');
    expect(stdout).toContain('banana: OK');
    expect(stdout).toContain('apple: OK');
    expect(stdout).toContain('Summary: 0 discrepancy found');
  });

  it('should report discrepancies', async () => {
    await fs.writeFile(deliveryPath, 'banana=10');
    await fs.writeFile(usagePath, 'food,quantity\nbanana,2');
    await fs.writeFile(inventoryPath, JSON.stringify([
      { item: 'banana', quantity: 5 } // Expected 8
    ]));

    const { stdout, code } = await runCli([
      '-d', deliveryPath,
      '-u', usagePath,
      '-i', inventoryPath
    ]);

    expect(code).toBe(0);
    expect(stdout).toContain('banana: DISCREPANCY -3 (expected: 8, actual: 5)');
    expect(stdout).toContain('Summary: 1 discrepancy found');
  });

  it('should fail gracefully if files are missing', async () => {
    const { stderr, code } = await runCli([
      '-d', 'nonexistent.txt',
      '-u', usagePath,
      '-i', inventoryPath
    ]);

    expect(code).toBe(1);
    expect(stderr).toContain('Error:');
  });

  it('should fail if arguments are missing', async () => {
    const { stdout, code } = await runCli([]);

    expect(code).toBe(1);
    expect(stdout).toContain('Usage: banana-mystery');
  });

  it('should fail gracefully with invalid inventory JSON', async () => {
    await fs.writeFile(deliveryPath, 'banana=10');
    await fs.writeFile(usagePath, 'food,quantity\nbanana,2');
    await fs.writeFile(inventoryPath, '{ "this is": "not valid json"'); // Missing closing brace

    const { stderr, code } = await runCli([
      '-d', deliveryPath,
      '-u', usagePath,
      '-i', inventoryPath
    ]);

    expect(code).toBe(1);
    expect(stderr).toContain('Failed to parse inventory file');
  });

  it('should handle empty files without crashing', async () => {
    await fs.writeFile(deliveryPath, '');
    await fs.writeFile(usagePath, '');
    await fs.writeFile(inventoryPath, '[]');

    const { stdout, code } = await runCli([
      '-d', deliveryPath,
      '-u', usagePath,
      '-i', inventoryPath
    ]);

    expect(code).toBe(0);
    expect(stdout).toContain('Summary: 0 discrepancy found');
  });

  it('should report UNKNOWN for items with invalid delivery values', async () => {
    await fs.writeFile(deliveryPath, 'lettuce='); // Invalid/Empty value
    await fs.writeFile(usagePath, '');
    await fs.writeFile(inventoryPath, JSON.stringify([
      { item: 'lettuce', quantity: 0 }
    ]));

    const { stdout, code } = await runCli([
      '-d', deliveryPath,
      '-u', usagePath,
      '-i', inventoryPath
    ]);

    expect(code).toBe(0);
    expect(stdout).toContain('lettuce: UNKNOWN (missing data)');
  });
});
