/**
 *  EntityExporter.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { Entity, QueryModel } from "@digitalaidseattle/core";
import { ExportColumn, SpreadsheetService } from "./spreadsheetService";
import { DAO } from "./DAO";

export type EntityExportColumn<T> = ExportColumn<T> & {
  valueGetter?: (item: T) => any;
};

export abstract class EntityExporter<T extends Entity> {

  dao: DAO<T>;
  fileName: string;
  sheetName: string
  columns: EntityExportColumn<T>[] = [];

  constructor(dao: DAO<T>, fileName: string, sheetName: string, columns: EntityExportColumn<T>[]) {
    this.dao = dao;
    this.fileName = fileName;
    this.sheetName = sheetName;
    this.columns = columns;
  }

  async fetchEntities(queryModel: QueryModel): Promise<T[]> {
    const pageSize = 1000;
    let doRun = true;
    let entities: T[] = [];
    for (let page = 0; doRun; page++) {
      const pagedQueryModel = { ...queryModel, pageSize: pageSize, page: page };
      const pageInfo = await this.dao.find(pagedQueryModel);
      entities = entities.concat(pageInfo.rows);
      doRun = pageInfo.rows.length === pageSize;
    };
    console.log(`Fetched ${entities.length} entities for export.`);
    return entities;
  }

  mapEntity(entity: T, columns: EntityExportColumn<T>[]): Record<string, any> {
    let mapped = {};
    for (const column of columns) {
      mapped = {
        ...mapped,
        [column.header]: column.valueGetter ? column.valueGetter(entity) : entity[column.key as keyof typeof entity]
      }
    }
    return mapped as Record<string, any>;
  }

  getUploadOptions(columns: EntityExportColumn<T>[]): any {
    return ({
      fileName: this.fileName,
      sheetName: this.sheetName,
      columns: columns
    })
  }

  // visibleHeaders: the table's visible column headers; only those columns are exported
  async exportData(queryModel: QueryModel, visibleHeaders: string[]): Promise<void> {
    const columns = this.columns.filter(column => visibleHeaders.includes(column.header));
    let allBills = await this.fetchEntities(queryModel);
    const exportData: Record<string, any>[] = allBills.map(bill => this.mapEntity(bill, columns) as Record<string, any>);

    SpreadsheetService.getInstance()
      .downloadXlsx(exportData, this.getUploadOptions(columns));
  }

}