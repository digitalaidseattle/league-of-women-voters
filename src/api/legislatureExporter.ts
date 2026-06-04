/**
 *  LegislatorExporter.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */

import { Committee } from "./committee";
import { CommitteesDB } from "./database/CommitteesDB";
import { EntityExporter } from "./EntityExporter";

export class LegislatureExporter extends EntityExporter<Committee> {

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
        {
          key: 'Leadership', header: 'Chair',
          valueGetter: (committee: Committee) => (committee.Leadership ?? [])
            .filter((a: any) => a.role === 'Chair')
            .map((a: any) => a.name)
            .join("; ") ?? ""
        },
        {
          key: 'Leadership', header: 'Vice Chair',
          valueGetter: (committee: Committee) => (committee.Leadership ?? [])
            .filter((a: any) => a.role === 'Vice Chair')
            .map((a: any) => a.name)
            .join("; ") ?? ""
        },
        {
          key: 'Leadership', header: 'Ranking Minority Member',
          valueGetter: (committee: Committee) => (committee.Leadership ?? [])
            .filter((a: any) => a.role === 'Ranking Minority Member')
            .map((a: any) => a.name)
            .join("; ") ?? ""
        }
      ]);
  }

}