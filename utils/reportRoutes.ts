export const REPORTS_PATH = '/meldpunt';

export const getReportsPath = (): string => REPORTS_PATH;

export const getReportDetailPath = (publicId: string): string => `${REPORTS_PATH}/${publicId}`;
