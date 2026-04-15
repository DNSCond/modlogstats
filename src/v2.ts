import { Datetime_global } from "datetime_global/Datetime_global.ts";
import { waterMark } from "./helpers.ts";
import { ModActionEntry } from "./types.ts";

// export function createText(actions: (ModActionEntry)[], formattingOptions: {
//   date: Date, timezone: string, subredditName: string,
// }) {
//   const { subredditName, timezone, date } = formattingOptions;
//   let content = `# Moderator Activity Statistics\n\n*Last updated: ${Datetime_global(date, timezone)}*`;
//   content += `  \n${waterMark(subredditName)}  \nTotal Actions counted: ${actions.length}\n\nReminder, `;
//   content += `entries starting with 'Favicond\\_' are not found in the modlog and added by the developer.`;
// }
