/**
 *  LegislatorExporter.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */

import { Member } from "./committee";
import { SponsorsDB } from "./database/SponsorsDB";
import { EntityExporter } from "./EntityExporter";

export class LegislatorExporter extends EntityExporter<Member> {

  private static instance: LegislatorExporter;

  public static getInstance(): LegislatorExporter {
    if (!LegislatorExporter.instance) {
      LegislatorExporter.instance = new LegislatorExporter();
    }
    return LegislatorExporter.instance;
  }

  private constructor() {
    super(SponsorsDB.getInstance(),
      "legislators_export",
      "Legislators",
      [
        { key: 'FirstName', header: 'First Name' },
        { key: 'LastName', header: 'Last Name' },
        { key: 'Agency', header: 'Chamber' },
        { key: 'Party', header: 'Party' },
        { key: 'District', header: 'District' },
        { key: 'Email', header: 'Email' },
        { key: 'Phone', header: 'Phone' },
        {
          key: 'LegislativeAssistant',
          header: 'Assistant',
          valueGetter: (member: any) => (member.LegislativeAssistant ?? []).map((a: any) => a.name).join(", ") ?? ""
        }
      ]);
  }

}