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
        { key: 'Name', header: 'Committee Name' },
        { key: 'Agency', header: 'Chamber' },
        { key: 'Phone', header: 'Phone' },
        { key: 'Chair', header: 'Chair' },
        { key: 'ViceChair', header: 'Vice Chair' },
        { key: 'MinorityChair', header: 'Ranking Minority Member' },
        { key: 'AsstMinorityChair', header: 'Asst Ranking Minority Member' }
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
      flattened = flattened.sort((a: any, b: any) => (queryModel.sortDirection === 'asc')
        ? a[queryModel.sortField].localeCompare(b[queryModel.sortField])
        : b[queryModel.sortField].localeCompare(a[queryModel.sortField]))
    }

    console.log(queryModel, flattened);
    return flattened;
  }
}