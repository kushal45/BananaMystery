import { FileUsageProvider } from '../../src/adapters/FileUsageProvider';
import * as fs from 'fs/promises';

jest.mock('fs/promises');

describe('FileUsageProvider', () => {
  const mockFs = fs as jest.Mocked<typeof fs>;
  const filePath = 'dummy.csv';
  let provider: FileUsageProvider;

  beforeEach(() => {
    provider = new FileUsageProvider(filePath);
    jest.clearAllMocks();
  });

  it('should parse valid CSV correctly', async () => {
    mockFs.readFile.mockResolvedValue('food,quantity\nbanana,8\nfish,25');
    
    const result = await provider.getUsage();
    
    expect(result).toEqual([
      { item: 'banana', quantity: 8 },
      { item: 'fish', quantity: 25 }
    ]);
  });

  it('should skip header line', async () => {
    mockFs.readFile.mockResolvedValue('food,quantity\nbanana,8');
    
    const result = await provider.getUsage();
    
    expect(result).toHaveLength(1);
    expect(result[0].item).toBe('banana');
  });

  it('should handle whitespace', async () => {
    mockFs.readFile.mockResolvedValue('food,quantity\n banana , 8 ');
    
    const result = await provider.getUsage();
    
    expect(result).toEqual([
      { item: 'banana', quantity: 8 } // Note: My implementation currently trims item but parseInt handles space for number
    ]);
  });

  it('should ignore empty lines', async () => {
    mockFs.readFile.mockResolvedValue('food,quantity\nbanana,8\n\nfish,25');
    
    const result = await provider.getUsage();
    
    expect(result).toHaveLength(2);
  });

  it('should ignore lines with invalid numbers', async () => {
    mockFs.readFile.mockResolvedValue('food,quantity\nbanana,eight');
    
    const result = await provider.getUsage();
    
    expect(result).toHaveLength(0);
  });
});
