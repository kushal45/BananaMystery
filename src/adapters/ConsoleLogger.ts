import { Logger } from '../application/ports';

export enum LogLevel {
  INFO,
  DEBUG
}

export class ConsoleLogger implements Logger {
  constructor(private readonly level: LogLevel) {}

  info(message: string): void {
    console.log(`[INFO] ${message}`);
  }

  warn(message: string): void {
    console.warn(`[WARN] ${message}`);
  }

  error(message: string): void {
    console.error(`[ERROR] ${message}`);
  }

  debug(message: string): void {
    if (this.level === LogLevel.DEBUG) {
      console.debug(`[DEBUG] ${message}`);
    }
  }
}
