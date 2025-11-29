import { FileInventoryProvider } from '../../src/adapters/FileInventoryProvider';
import * as fs from 'fs/promises';

jest.mock('fs/promises');

describe('FileInventoryProvider', () => {
  const mockFs = fs as jest.Mocked<typeof fs>;
  const filePath = 'dummy.json';
  let provider: FileInventoryProvider;
  const mockLogger = {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn()
  };

  beforeEach(() => {
    provider = new FileInventoryProvider(filePath, mockLogger);
    jest.clearAllMocks();
  });

  it('should parse valid JSON correctly', async () => {
    const data = [
      { item: 'banana', quantity: 18 },
      { item: 'fish', quantity: 5 }
    ];
    mockFs.readFile.mockResolvedValue(JSON.stringify(data));
    
    const result = await provider.getInventory();
    
    expect(result).toEqual(data);
  });

  it('should throw error for invalid JSON', async () => {
    mockFs.readFile.mockResolvedValue('{ invalid json }');
    
    await expect(provider.getInventory()).rejects.toThrow('Failed to parse inventory file');
  });

  it('should throw error if JSON is not an array', async () => {
    mockFs.readFile.mockResolvedValue('{"item": "banana", "quantity": 18}');
    
    await expect(provider.getInventory()).rejects.toThrow('Invalid inventory format: expected array');
  });
});
