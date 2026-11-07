/**
 *  LegislatorExporter.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */

import { QueryModel } from "@digitalaidseattle/core";
import { CommitteesDB } from "./database/CommitteesDB";
import { EntityExporter } from "./EntityExporter";
import { LegislatureService } from "./legislatureService";

export class LegislatureExporter extends EntityExporter<any> {

  private static instance: LegislatureExporter;

  public static getInstance(): LegislatureExporter {
    if (!LegislatureExporter.instance) {
      LegislatureExporter.instance = new LegislatureExporter();
    }
    return LegislatureExporter.instance;
  }

  private constructor() {
    super(CommitteesDB.getInstance(),
      "committees_export",
      "Committees",
      [
        { key: 'Name', header: 'Name' },
        { key: 'Chair', header: 'Chair' },
        { key: 'ViceChair', header: 'Vice Chair' },
        { key: 'MinorityChair', header: 'Minority Chair' },
        { key: 'AsstMinorityChair', header: 'Asst Minority Chair' },
        { key: 'MemberCount', header: 'Members' }
      ]);
  }

  async fetchEntities(queryModel: QueryModel): Promise<any[]> {
    console.log(queryModel);
    const service = LegislatureService.getInstance();
    let entities = await this.dao.getAll();
    let flattened = entities.map(com => service.transformCommittee(com));
    if (queryModel.filterModel) {
      queryModel.filterModel.items.forEach(filterItem => {
        flattened = flattened.filter((com: any) => {
          const testString = com[filterItem.field].toString().toLowerCase();
          const valueString = filterItem.value.toLowerCase();
          if (filterItem.operator === 'contains') {
            return testString.includes(valueString)
          }
          if (filterItem.operator === '=') {
            return testString === valueString
          }
          return true
        });
      });
    }

    if (queryModel.sortField) {
      const field = queryModel.sortField;
      const direction = queryModel.sortDirection === 'asc' ? 1 : -1;
      // Numbers (e.g. MemberCount) compare numerically; everything else as text
      flattened = flattened.sort((a: any, b: any) =>
        direction * (typeof a[field] === 'number' && typeof b[field] === 'number'
          ? a[field] - b[field]
          : String(a[field] ?? '').localeCompare(String(b[field] ?? ''))));
    }

    console.log(queryModel, flattened);
    return flattened;
  }
}