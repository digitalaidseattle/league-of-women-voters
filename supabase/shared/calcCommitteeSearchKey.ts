/**
*  calcCommitteeSearchKey.ts
*
*  @copyright 2026 Digital Aid Seattle
*
*/

import { Committee } from "./types.ts";

export function calcCommitteeSearchKey(commitee: Committee): string {
    return [
        commitee.Name,
        commitee.LongName,
        commitee.Agency,
        commitee.Acronym
    ]
        .filter(term => !!term)
        .join(" ")
        .toLowerCase();
}