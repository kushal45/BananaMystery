#!/usr/bin/env node
import { Command } from 'commander';
import * as path from 'path';
import { FileDeliveryProvider } from './adapters/FileDeliveryProvider';
import { FileUsageProvider } from './adapters/FileUsageProvider';
import { FileInventoryProvider } from './adapters/FileInventoryProvider';
import { ConsoleReportPresenter } from './adapters/ConsoleReportPresenter';
import { Reconciler } from './domain/Reconciler';
import { GenerateDiscrepancyReport } from './application/GenerateDiscrepancyReport';

import { ConsoleLogger, LogLevel } from './adapters/ConsoleLogger';

const program = new Command();

program
  .name('banana-mystery')
  .description('Reconcile zoo food inventory')
  .version('1.0.0')
  .requiredOption('-d, --delivery <path>', 'Path to delivery file')
  .requiredOption('-u, --usage <path>', 'Path to usage file')
  .requiredOption('-i, --inventory <path>', 'Path to inventory file')
  .option('-v, --verbose', 'Output verbose debugging info')
  .action(async (options) => {
    try {
      const logLevel = options.verbose ? LogLevel.DEBUG : LogLevel.INFO;
      const logger = new ConsoleLogger(logLevel);

      const deliveryPath = path.resolve(process.cwd(), options.delivery);
      const usagePath = path.resolve(process.cwd(), options.usage);
      const inventoryPath = path.resolve(process.cwd(), options.inventory);

      const deliveryProvider = new FileDeliveryProvider(deliveryPath, logger);
      const usageProvider = new FileUsageProvider(usagePath, logger);
      const inventoryProvider = new FileInventoryProvider(inventoryPath, logger);
      
      const presenter = new ConsoleReportPresenter(logger);
      const reconciler = new Reconciler();
      
      const useCase = new GenerateDiscrepancyReport(
        deliveryProvider,
        usageProvider,
        inventoryProvider,
        reconciler,
        presenter,
        logger
      );

      await useCase.execute();
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

if (process.argv.length < 3) {
  program.outputHelp();
  process.exit(1);
}

program.parse(process.argv);
