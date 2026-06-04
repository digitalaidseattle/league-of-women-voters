/**
 *  spreadsheetService.ts
 *
 *  @copyright 20256Digital Aid Seattle
 *
 */

import * as XLSX from 'xlsx';

export type ExportColumn<T> = {
    key: keyof T;
    header: string;
    valueGetter?: (item: T) => any;
};

export class SpreadsheetService {

    private static instance: SpreadsheetService;

    public static getInstance(): SpreadsheetService {
        if (!SpreadsheetService.instance) {
            SpreadsheetService.instance = new SpreadsheetService();
        }
        return SpreadsheetService.instance;
    }


    private constructor() {
    }

    downloadXlsx<T extends Record<string, any>>(
        data: T[],
        options: {
            fileName: string;
            sheetName?: string;
            columns?: ExportColumn<T>[];
        }
    ): void {

        const {
            fileName,
            sheetName = 'Sheet1',
            columns
        } = options;

        console.log(data);
        let exportData: any[] = data;
        // Re-map data if custom columns provided
        if (columns && columns.length > 0) {
            exportData = data.map(row => {
                const mapped: Record<string, any> = {};
                columns.forEach(col => {
                    mapped[col.header] = row[col.header];
                });
                return mapped;
            });
        }
        console.log(data);

        // Create worksheet
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        // Create workbook
        const workbook = XLSX.utils.book_new();
        // Append worksheet
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        // Trigger browser download
        XLSX.writeFile(workbook, `${fileName}.xlsx`);
    }

}