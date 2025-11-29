import { InventoryRecord } from '../domain/types';

export interface InventoryProvider {
  getInventory(): Promise<InventoryRecord[]>;
}

export interface DeliveryProvider {
  getDelivery(): Promise<InventoryRecord[]>;
}

export interface UsageProvider {
  getUsage(): Promise<InventoryRecord[]>;
}

export interface Logger {
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
  debug(message: string): void;
}
