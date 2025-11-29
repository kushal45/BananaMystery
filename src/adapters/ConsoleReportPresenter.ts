import { ReportPresenter } from '../application/ReportPresenter';
import { Logger } from '../application/ports';
import { ReconciliationResult, AuditStatus } from '../domain/types';

export class ConsoleReportPresenter implements ReportPresenter {
  constructor(private readonly logger: Logger) {}

  present(result: ReconciliationResult): void {
    this.logger.debug('Presenting discrepancy report to console');
    this.logger.info('Zoo Food Audit Report');
    this.logger.info('=====================');
    this.logger.info('');

    const sortedRecords = [...result.records].sort((a, b) => a.item.localeCompare(b.item));

    for (const record of sortedRecords) {
      let statusLine = `${record.item}: ${record.status}`;
      
      if (record.status === AuditStatus.DISCREPANCY) {
        statusLine += ` ${record.difference} (expected: ${record.expected}, actual: ${record.actual})`;
      } else if (record.status === AuditStatus.UNKNOWN) {
        statusLine += ` (missing data)`;
      }

      this.logger.info(statusLine);
    }

    this.logger.info('');
    this.logger.info(`Summary: ${result.summary}`);
    this.logger.debug('Report presentation complete');
  }
}
