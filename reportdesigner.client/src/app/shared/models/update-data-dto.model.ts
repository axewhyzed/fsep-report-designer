// update-data-dto.model.ts

import { ReportFormatting } from './report-formatting.model';
import { Report } from './report.model';

export interface UpdateDataDto {
  reportFormatting: ReportFormatting;
  report?: Report;
}
