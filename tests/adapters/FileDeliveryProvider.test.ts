import { FileDeliveryProvider } from '../../src/adapters/FileDeliveryProvider';
import * as fs from 'fs/promises';

jest.mock('fs/promises');

describe('FileDeliveryProvider', () => {
  const mockFs = fs as jest.Mocked<typeof fs>;
  const filePath = 'dummy.txt';
  let provider: FileDeliveryProvider;

  beforeEach(() => {
    provider = new FileDeliveryProvider(filePath);
    jest.clearAllMocks();
  });

  it('should parse valid properties correctly', async () => {
    mockFs.readFile.mockResolvedValue('banana=50\nfish=100');
    
    const result = await provider.getDelivery();
    
    expect(result).toEqual([
      { item: 'banana', quantity: 50 },
      { item: 'fish', quantity: 100 }
    ]);
  });

  it('should handle quoted values', async () => {
    mockFs.readFile.mockResolvedValue('carrots="20"');
    
    const result = await provider.getDelivery();
    
    expect(result).toEqual([
      { item: 'carrots', quantity: 20 }
    ]);
  });

  it('should handle empty values as NaN', async () => {
    mockFs.readFile.mockResolvedValue('lettuce=');
    
    const result = await provider.getDelivery();
    
    expect(result).toEqual([
      { item: 'lettuce', quantity: NaN }
    ]);
  });

  it('should handle whitespace around keys and values', async () => {
    mockFs.readFile.mockResolvedValue('  banana  =  50  ');
    
    const result = await provider.getDelivery();
    
    expect(result).toEqual([
      { item: 'banana', quantity: 50 }
    ]);
  });

  it('should ignore empty lines', async () => {
    mockFs.readFile.mockResolvedValue('banana=50\n\n\nfish=100');
    
    const result = await provider.getDelivery();
    
    expect(result).toHaveLength(2);
  });

  it('should handle non-numeric values as NaN', async () => {
    mockFs.readFile.mockResolvedValue('banana=fifty');
    
    const result = await provider.getDelivery();
    
    expect(result).toEqual([
      { item: 'banana', quantity: NaN }
    ]);
  });
});
