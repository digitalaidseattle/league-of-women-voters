import { PreferencesDAO } from "./PreferencesDAO.ts";

export async function getCurrentBiennium(): Promise<string> {
  const biennium = await PreferencesDAO.getInstance().getCurrentBiennium();
  console.log("biennium", biennium);
  return biennium;
}
