// Visit developers.reddit.com/docs to learn Devvit!

import { Devvit, JobContext, ModAction, TriggerContext, WikiPage } from '@devvit/public-api';
import { Datetime_global } from 'datetime_global/Datetime_global.ts';
import { Temporal } from 'temporal-polyfill';
import { ModMail } from "@devvit/protos";
import { v4 as uuidv4 } from 'uuid';

"use strict";

// Configure the app to use Reddit API
Devvit.configure({ redditAPI: true, redis: true, });

Devvit.addSettings([
  {
    type: 'boolean',
    name: 'daily-modmail-enabled',
    label: 'Enable daily modmail notification',
    defaultValue: false,
  },
  {
    type: 'boolean',
    name: 'breakdown-each-mod',
    label: 'per mod statistics?',
    helpText: 'if enabled will breakdown each mod\'s contributions to the modlog',
    defaultValue: true,
  },
  {
    type: 'select',
    name: 'modmailAt',
    label: 'when to send the modmail?',
    helpText: 'times are in utc, the app is in utc. these times are in utc. however you can determine when to send the info.',
    options: [
      { label: '06:01 UTC', value: '6', },
      { label: '12:01 UTC', value: '12', },
      { label: '17:01 UTC', value: '17', },
      { label: '00:01 UTC', value: '0', },
    ],
    defaultValue: ['6'],
  },
  {
    type: 'group',
    label: 'Favicond_',
    helpText: 'customize Favicond_ actions. entries starting with \'Favicond_\' are not found in the modlog and added by the developer.',
    fields: [
      {
        type: 'boolean',
        name: 'countModMail',
        label: 'count ModMail?',
        helpText: 'if enabled will count the ModMail for only moderators',
        defaultValue: true,
      },
      {
        type: 'boolean',
        name: 'countIncommingModmail',
        label: 'count Incomming Modmail from nonmods?',
        helpText: 'if enabled will count the ModMail from non moderators',
        defaultValue: false,
      },
    ],
  },
  {
    type: 'string',
    name: 'Timezone',
    label: 'Timezone?', defaultValue: "UTC",
    helpText: 'specify 1 iana timezone, some examples (Europe/Berlin, Asia/Tokyo, America/New_York)',
    onValidate({ value }) {
      try {
        new Datetime_global(Date.now(), value);
      } catch (e) {
        return String(e);
      }
    },
  },
  {
    type: 'group',
    label: 'modmail-stats',
    helpText: 'settings for modmail-stats. note that \'count ModMail?\' and \'count Incomming Modmail from nonmods?\' must be enabled for it to work',
    fields: [
      {
        type: 'boolean',
        name: 'modmailStats',
        label: 'enabled?',
        helpText: 'if enabled then statistics of the modmail will be shown',
        defaultValue: true,
      },
    ],
  },
  {
    type: 'boolean',
    name: 'debuglog',
    label: 'recreate the log?',
    helpText: 'if enabled then a minilog will be created on the bottom of the report',
  },
]);
const Expire = 86400 * 90;
type incommingModMailEntry = {
  moderatorUsername: string | '[Favicond_anonymous]',
  mailerUsername: string, affectedUsername?: null,
  isAdmin?: boolean, isMod?: boolean,
  type: string, date: Date,
};
type ModActionEntry = { moderatorUsername: string, type: string, date: Date, affectedUsername?: string | null } | incommingModMailEntry;
Devvit.addTrigger({
  event: 'ModAction', // Listen for modlog events
  async onEvent(event, { redis }) {
    // Extract relevant data from the event
    const type = event.action ?? 'unknown'; // Type of moderator action
    const moderatorUsername = event?.moderator?.name; // Moderator username
    const date = new Date(event.actionedAt ?? new Date); // Date of action
    const affectedUsername = event.targetUser?.name || null;

    if (moderatorUsername === undefined) return;
    const uuid = uuidv4(), utc = 'UTC';

    // Create a unique key for this modlog entry (e.g., using the mod action ID)
    const key = `modlog_${uuid}`, hashKey = `modlog:${(new Datetime_global(date, utc)).format('Y-m-d')}`,
      entry: ModActionEntry = { type, moderatorUsername, date, affectedUsername };

    await redis.hSet(hashKey, { [key]: JSON.stringify(entry) });
    await redis.expire(hashKey, Expire);
  },
});

Devvit.addTrigger({
  event: 'ModMail',
  async onEvent(event: ModMail, context: TriggerContext) {
    // const isMe=!event.messageAuthor||event.messageAuthor.name===context.appName;
    const conversationResponse = await context.reddit.modMail.getConversation({
      conversationId: event.conversationId,
    }), date = new Date(event.createdAt ?? new Date);
    if (!conversationResponse.conversation) return;
    if (!(await context.settings.get('countModMail')))
      return; if (!event.messageAuthor) return;
    // https://github.com/fsvreddit/automodmail/blob/ef5000946bc0b2d15a15772bb488f0f72e251d8f/src/autoresponder.ts#L97
    // https://discord.com/channels/1050224141732687912/1050227353311248404/1390110420349620305
    const messagesInConversation = Object.values(conversationResponse.conversation.messages);
    const firstMessage = messagesInConversation[0]; if (!firstMessage.id) return;
    const isFirstMessage = event.messageId.includes(firstMessage.id);
    const currentMessage = messagesInConversation.find(message => message.id && event.messageId.includes(message.id));
    if (!currentMessage) return; let moderatorUsername = '[Favicond_anonymous]';
    const isAdmin = Boolean(Object(currentMessage.author).isAdmin);
    const isMod = Boolean(Object(currentMessage.author).isMod); //
    const uuid = uuidv4(), key = `modlog_${uuid}`, redis = context.redis,
      hashKey = `modlog:${(new Datetime_global(date, 'UTC')).format('Y-m-d')}`;
    const specialStatus: boolean = (isMod || isAdmin);
    const mailerUsername = event.conversationType === 'sr_sr' ?
      (event.conversationSubreddit?.name?.replace(/^/, ''), 'r/') :
      (specialStatus ? event.messageAuthor.name : '[Favicond_anonymous]'),
      type = (function (): string {
        if (isMod) return ('Favicond_Modmail' + (isFirstMessage ? '_Reply' : ''));
        else if (isAdmin) return 'Favicond_Modmail_Admin' + (isFirstMessage ? '_Reply' : '');
        else return 'Favicond_Modmail_Incomming_' + (isFirstMessage ? 'Reply' : 'Initial');
      })(); if (isMod || isAdmin) moderatorUsername = event.messageAuthor.name;
    const entry: incommingModMailEntry = { moderatorUsername, mailerUsername, date, type, isAdmin, isMod };
    const honor: boolean = (await context.settings.get('countIncommingModmail')) ? true : specialStatus;
    if (honor) {
      await redis.hSet(hashKey, { [key]: JSON.stringify(entry) });
      await redis.expire(hashKey, Expire);
    }
  },
});

// Devvit.addTrigger({
//   event: 'ModMail',
//   async onEvent(event: ModMail, context: TriggerContext) {
//     //const isMe = !event.messageAuthor || event.messageAuthor.name === context.appName;
//     const conversationResponse = await context.reddit.modMail.getConversation({
//       conversationId: event.conversationId,
//     }), date = new Date(event.createdAt ?? new Date);
//     if (!conversationResponse.conversation) return;
//     if (!(await context.settings.get('countModMail'))) {
//       return;
//     } if (!event.messageAuthor) return;
//     // if (event.messageAuthor.name === context.appName) return;
//     // https://github.com/fsvreddit/automodmail/blob/ef5000946bc0b2d15a15772bb488f0f72e251d8f/src/autoresponder.ts#L97
//     // https://discord.com/channels/1050224141732687912/1050227353311248404/1390110420349620305
//     const //otherEndUser = conversationResponse.conversation.participant?.name, isModDiscussion = !otherEndUser,
//       messagesInConversation = Object.values(conversationResponse.conversation.messages);
//     const firstMessage = messagesInConversation[0]; if (!firstMessage.id) return;
//     const isFirstMessage = event.messageId.includes(firstMessage.id);
//     const currentMessage = messagesInConversation.find(message => message.id && event.messageId.includes(message.id));
//     if (!currentMessage) return; let moderatorUsername = '[Favicond_anonymous]';
//     const isAdmin = Boolean(Object(currentMessage.author).isAdmin);
//     const isMod = Boolean(Object(currentMessage.author).isMod); //
//     const uuid = uuidv4(), key = `modlog_${uuid}`, redis = context.redis,
//       hashKey = `modlog:${(new Datetime_global(date, 'UTC')).format('Y-m-d')}`;
//     const mailerUsername = event.messageAuthor.name, type = (function (): string {
//       if (isMod) return ('Favicond_Modmail' + (isFirstMessage ? '_Reply' : ''));
//       else if (isAdmin) return 'Favicond_Modmail_Admin' + (isFirstMessage ? '_Reply' : '');
//       else return 'Favicond_Modmail_Incomming_' + (isFirstMessage ? 'Reply' : 'Initial');
//     })(); if (isMod || isAdmin) moderatorUsername = mailerUsername;// console.log(jsonEncode(event, 2))
//     const entry: incommingModMailEntry = { moderatorUsername, mailerUsername, date, type, isAdmin, isMod };
//     const honor: boolean = (await context.settings.get('countIncommingModmail')) ? true : (isMod || isAdmin);
//     if (honor) {
//       await redis.hSet(hashKey, { [key]: JSON.stringify(entry) });
//       await redis.expire(hashKey, Expire);
//     }
//   },
// });

async function updateFromQueue(context: JobContext | Devvit.Context, $Daily: string) {
  const timezone: string = await context.settings.get('Timezone') ?? 'UTC', utc = 'UTC',
    today_ = new Date, redis = context.redis, tomorrow = new Date(today_),
    subredditName: string = await context.reddit.getCurrentSubredditName(),
    today = new Datetime_global(today_.setUTCDate(today_.getUTCDate() - 1), 'UTC'),
    breakdownEachMod: boolean = await context.settings.get('breakdown-each-mod') ?? false,
    debuglog: boolean = await context.settings.get('debuglog') ?? false;
  const wikipage = await updateModStats(subredditName, await (async function (): Promise<ModActionEntry[]> {
    const items = await redis.hGetAll('modlog:' + today.format('Y-m-d')),
      promise: ModActionEntry[] = [];
    for (const entry of Object.values(items)) {
      const parsed = JSON.parse(entry as string);
      parsed['date'] = new Date(parsed['date']);
      promise.push(parsed as ModActionEntry);
    }
    return promise;
  })(), context, 'modlog-stats', {
    date: new Date(tomorrow), breakdownEachMod, debuglog, timezone,
    reason: `${$Daily} update at ${datetime_local_toUTCString(tomorrow, 'UTC')}`,
  });

  const enabled = await context.settings.get('daily-modmail-enabled');
  if (enabled && $Daily === 'Daily') {
    const bodyMarkdown = wikipage.contents.content +
      wikipage.contents.breakdownEachMod_content,
      subredditId = context.subredditId;
    await context.reddit.modMail.createModNotification({
      subject: 'Daily Moderator Activity Statistics',
      bodyMarkdown, subredditId,
    });
  }
}

function addtoTime(Datetime_global: Datetime_global, hours: number = 0, minutes: number = 0, seconds: number = 0, month: number = 0, day: number = 0, year: number = 0) {
  const dur = new Temporal.Duration(year, month, day, hours, minutes, seconds), zdt = Datetime_global.toTemporalZonedDateTime();
  return new Datetime_global.constructor(zdt.add(dur), Datetime_global.getTimezoneId());
}

// Add a menu item to manually trigger the update
Devvit.addMenuItem({
  label: 'Update Mod Stats Now',
  description: 'only check the log, Favicond_ wont be considered',
  location: 'subreddit',
  forUserType: 'moderator', // Only visible to moderators
  async onPress(_event, context) {
    context.ui.showToast('Updating mod stats...');
    const now = new Date(), timezone: string = await context.settings.get('Timezone') ?? 'UTC',
      breakdownEachMod: boolean = await context.settings.get('breakdown-each-mod') ?? false,
      debuglog: boolean = await context.settings.get('debuglog') ?? false;
    try {
      const subredditName: string = await context.reddit.getCurrentSubredditName(),
        modActions = await context.reddit.getModerationLog({ subredditName, limit: 1000, }).all();
      const page = await updateModStats(subredditName, modActions.map(function (event: ModAction): ModActionEntry {
        const type = event.type ?? 'unknown'; // Type of moderator action
        const moderatorUsername = event?.moderatorName; // Moderator username
        return { type, moderatorUsername, date: new Date(event.createdAt) };
      }), context, 'modlog-stats', {
        date: now, breakdownEachMod, timezone, debuglog,
        reason: `manual update at ${datetime_local_toUTCString(now, 'UTC')}`,
      }); const wikipage = page.wikipage;
      context.ui.showToast('Mod stats updated successfully!');
      if (wikipage !== undefined) context.ui.navigateTo(`https://www.reddit.com/r/${wikipage.subredditName}/wiki/${wikipage.name}/`);
    } catch (error) {
      console.error('Error updating mod stats:', error);
      context.ui.showToast('Failed to update mod stats. Check logs for details.');
    }
  },
});

Devvit.addMenuItem({
  label: 'Update Mod Stats Now (immediately)',
  description: 'do whatever is timed NOW',
  location: 'subreddit',
  forUserType: 'moderator',
  async onPress(_event, context) {
    try {
      await updateFromQueue(context, 'Forced');
      context.ui.showToast('Mod stats updated successfully!');
    } catch (e) {
      context.ui.showToast(String(e));
    }
  },
});

// Devvit.addMenuItem({
//   label: 'generate debug log',
//   description: 'not useful',
//   location: 'subreddit',
//   forUserType: 'moderator',
//   async onPress(_event, context) {
//     const utc = 'UTC', today = (new Datetime_global).toTimezone(utc),
//       reason = 'generated the debug log', subredditName = context.subredditName;
//     const timezone: string = await context.settings.get('Timezone') ?? utc;
//     if (subredditName) {
//       let content = (new Datetime_global(Date.now(), timezone)).toString() + '\n\n';
//       let items, time = (new Datetime_global(today, utc)), letout = 0;
//       const promise: ModActionEntry[] = [], redis = context.redis;
//       time = addtoTime(time, 0, 0, 0, 0, +1);
//       while (items = await redis.hGetAll('modlog:' + time.format('Y-m-d'))) {
//         time = addtoTime(time, 0, 0, 0, 0, -1);
//         for (const entry of Object.values(items)) {
//           const parsed = JSON.parse(entry as string);
//           parsed['date'] = new Date(parsed['date']);
//           promise.push(parsed as ModActionEntry);
//         }
//         if ((++letout) > 90) break;
//       }
//       content += jsonEncodeIndent(promise, 2);
//       await context.reddit.updateWikiPage({
//         content, subredditName, page: 'modlog-stats', reason,
//       });
// context.ui.showToast('log successfully dumped!');}},});

Devvit.addMenuItem({
  label: 'Update Mod Stats (all time)',
  description: 'the stats from up to 90 days ago',
  location: 'subreddit',
  forUserType: 'moderator',
  async onPress(_event, context) {
    const utc = 'UTC';
    const timezone: string = await context.settings.get('Timezone') ?? 'UTC',
      today = (new Datetime_global).toTimezone(utc), redis = context.redis,
      subredditName: string = await context.reddit.getCurrentSubredditName(),
      breakdownEachMod: boolean = await context.settings.get('breakdown-each-mod') ?? false,
      debuglog: boolean = await context.settings.get('debuglog') ?? false;

    await updateModStats(subredditName, await (async function (): Promise<ModActionEntry[]> {
      let items, time = (new Datetime_global(today, utc)), letout = 0;
      const promise: ModActionEntry[] = [];
      time = addtoTime(time, 0, 0, 0, 0, +1);
      while (items = await redis.hGetAll('modlog:' + time.format('Y-m-d'))) {
        time = addtoTime(time, 0, 0, 0, 0, -1);
        for (const entry of Object.values(items)) {
          const parsed = JSON.parse(entry as string);
          parsed['date'] = new Date(parsed['date']);
          promise.push(parsed as ModActionEntry);
        }
        if ((++letout) > 90) break;
      }
      return promise;
    })(), context, 'modlog-stats', {
      date: today.toDate(), breakdownEachMod, timezone, debuglog,
      reason: `allTime update at ${datetime_local_toUTCString(today, 'UTC')}`,
    });
    context.ui.showToast('Mod stats updated successfully!');
    context.ui.navigateTo(`https://www.reddit.com/r/${subredditName}/wiki/modlog-stats/`);
  },
});

const usernameForm = Devvit.createForm(
  {
    fields: [
      {
        type: 'string',
        name: 'username',
        label: 'Enter a username',
        helpText: 'the user you want to evaluate. (without u/)',
        required: true,
      },
    ],
    title: 'Evaluate User',
    acceptLabel: 'Submit',
  },
  async function (event, context) {
    const currentUsername = await context.reddit.getCurrentUsername(),
      timezone: string = await context.settings.get('Timezone') ?? 'UTC',
      today = (new Datetime_global).toTimezone(timezone), redis = context.redis;
    if (currentUsername === undefined) return;
    const promise: ModActionEntry[] = await (async function (): Promise<ModActionEntry[]> {
      const promise: ModActionEntry[] = [], utc = 'UTC';
      let items, time = (new Datetime_global(today, utc)), letout = 0;
      //time = addtoTime(time, 0, 0, 0, 0, +1);
      while (items = await redis.hGetAll('modlog:' + time.format('Y-m-d'))) {
        time = addtoTime(time, 0, 0, 0, 0, -1);
        for (const entry of Object.values(items)) {
          const parsed = JSON.parse(entry as string);
          parsed['date'] = new Date(parsed['date']);
          promise.push(parsed as ModActionEntry);
        }
        if ((++letout) > 90) break;
      }
      return promise;
    })(), username: string = event.values.username.trim().replace(/^u\//, '') ?? '[undefined]';
    if (/^[a-zA-Z0-9\-_]+$/.test(username)) {
      const usernameFunction = usernameFormat, actionCounts: { [actionName: string]: number } = {};
      let { subredditName } = context, bodyMarkdown = `Evaluated u/${username}  \n`, index = 0;
      bodyMarkdown += `Queried-By: <${usernameFunction(currentUsername, true)}>  \n${waterMark(subredditName)}  \n`;
      bodyMarkdown += `Total-counted: ${index}  \nQueried-At: ${(new Datetime_global).toTimezone(timezone)}\n\n`;

      for (let modActionEntry of promise) {
        if (typeof modActionEntry.affectedUsername === 'string') {
          if (modActionEntry.affectedUsername.toLocaleLowerCase() === username.toLocaleLowerCase()) {
            index++;
            if (actionCounts[modActionEntry.type] === undefined) { actionCounts[modActionEntry.type] = 0; }
            actionCounts[modActionEntry.type]++;
          }
        }
      }

      // bodyMarkdown += `\n\n${quoteMarkdown(markdown_escape())}\n\n`;

      bodyMarkdown += '| actionName | count |\n';
      bodyMarkdown += '|:-----------|------:|\n';
      Object.entries(actionCounts).sort(function (a: [string, number], b: [string, number]): number {
        return b[1] - a[1];
      }).forEach(function (entry: [string, number]) {
        bodyMarkdown += `| ${entry[0]} | ${entry[1]} |\n`;
      });

      await context.reddit.modMail.createModInboxConversation({
        subject: `modlog Evaluation For u/${username}`, bodyMarkdown,
        subredditId: context.subredditId, // This should be the subreddit where the form was submitted
      });
      context.ui.showToast({ text: `Done, check the modmail` });
    } else if (username === '[undefined]') {
      context.ui.showToast({ text: `there was no username given` });
    } else {
      context.ui.showToast({ text: `that username is syntactically invalid` });
    }
  }
);

Devvit.addMenuItem({
  label: 'Evaluate User modlog',
  description: 'check the mod for a particular user',
  location: 'subreddit',
  forUserType: 'moderator',
  async onPress(_event, context) {
    context.ui.showForm(usernameForm);
  }
});

Devvit.addMenuItem({
  label: 'Update Mod Mail Stats Now',
  description: 'the modmail stats',
  location: 'subreddit',
  forUserType: 'moderator',
  async onPress(_event, context) {
    const subredditName = context.subredditName;
    if (subredditName === undefined) return;
    if (!(await context.settings.get('modmailStats'))) {
      context.ui.showToast('this part is disabled');
      return;
    }
    try {
      const wikipage = await updateMailStats(context, 'Forced');
      if (wikipage) {
        context.ui.navigateTo(`https://www.reddit.com/r/${subredditName}/wiki/modmail-stats/`);
      }
      context.ui.showToast('Mod stats updated successfully!');
    } catch (e) {
      context.ui.showToast(String(e));
    }
  },
});

// const timezoneForm = Devvit.createForm(
//   data => ({
//     fields: [
//       {
//         name: 'time',
//         label: 'pick a Time',
//         type: 'paragraph',
//         defaultValue: data.time,
//         required: true,
//       }, {
//         name: 'timezone',
//         label: 'pick a Timezone',
//         type: 'string',
//         defaultValue: data.timezone,
//         required: true,
//         // @ts-ignore
//         onValidate({ value }) {
//           try {
//             new Datetime_global(Date.now(), value);
//           } catch (e) {
//             return String(e);
//           }
//         },
//       },
//     ],
//     title: 'Timezone Form',
//     acceptLabel: 'Submit',
//   }),
//   async function (event, context) {
//     const timezone = event.values.timezone,
//       date = new Date(+(parseDate(event.values.time, { timezone }) ?? NaN));
//     context.ui.showToast(Datetime_global(date));
//   }
// );

// Devvit.addMenuItem({
//   label: 'get Time',
//   description: 'get a time in utc',
//   location: 'subreddit',
//   async onPress(_, context) {
//     const subredditName = context.subredditName, time = Datetime_global();
//     if (subredditName === undefined) return context.ui.showToast('no subredditName name');
//     const timezone = await context.settings.get('Timezone') ?? 'UTC'; // Retrieve the setting
//     context.ui.showForm(timezoneForm, { timezone, time }); // Pass as default value
//   },
// });

function waterMark(subredditName?: string) {
  if (subredditName === undefined)
    return '[Generated By Moderator Statistics](https://developers.reddit.com/apps/modlogstats)';
  return `[View The Modlog Summery Here](https://www.reddit.com/r/${subredditName}/wiki/modlog-stats/)`
    + ` [and The Modmail Summery Here](https://www.reddit.com/r/${subredditName}/wiki/modmail-stats/)`
    + '  \n[Generated By Moderator Statistics](https://developers.reddit.com/apps/modlogstats)';
}

Devvit.addMenuItem({
  label: 'TeleportTo Modlog Summery',
  description: 'a quick way to TeleportTo Modlog Summery',
  location: 'subreddit', forUserType: 'moderator',
  async onPress(_, context) {
    const subredditName = context.subredditName;
    if (subredditName === undefined) return context.ui.showToast('no subredditName name');
    context.ui.navigateTo(`https://www.reddit.com/r/${subredditName}/wiki/modlog-stats/`);
  },
});

Devvit.addMenuItem({
  label: 'TeleportTo Modmail Summery',
  description: 'a quick way to TeleportTo Modmail Summery',
  location: 'subreddit', forUserType: 'moderator',
  async onPress(_, context) {
    const subredditName = context.subredditName;
    if (subredditName === undefined) return context.ui.showToast('no subredditName name');
    context.ui.navigateTo(`https://www.reddit.com/r/${subredditName}/wiki/modmail-stats/`);
  },
});

type sortedMailers = { name: string, count: number, percentage: string };
async function updateMailStats(context: JobContext, forced: 'Daily' | 'Forced') {
  const subredditName = context.subredditName;
  if (subredditName === undefined) return;
  const timezone: string = await context.settings.get('Timezone') ?? 'UTC',
    today = (new Datetime_global).toTimezone(timezone), { redis } = context;
  const promise: incommingModMailEntry[] = await (async function (): Promise<incommingModMailEntry[]> {
    const promise: incommingModMailEntry[] = [], utc = 'UTC';
    let items, time = (new Datetime_global(today, utc)), letout = 0;
    //time = addtoTime(time, 0, 0, 0, 0, +1);
    while (items = await redis.hGetAll('modlog:' + time.format('Y-m-d'))) {
      time = addtoTime(time, 0, 0, 0, 0, -1);
      for (const entry of Object.values(items)) {
        const parsed = JSON.parse(entry as string);
        parsed['date'] = new Date(parsed['date']);
        if (parsed.mailerUsername === undefined) continue;
        promise.push(parsed as incommingModMailEntry);
      }
      if ((++letout) > 90) break;
    }
    return promise;
  })(); let totalActions = 0;
  const mostMailer = new CounterMap<string>, adminMod = new Map<string, { isAdmin: boolean, isMod: boolean }>();
  for (const element of promise) {
    mostMailer.increment(element.mailerUsername);
    totalActions++;
    let { isAdmin, isMod } = Object(adminMod.get(element.mailerUsername));
    isAdmin = Boolean(element.isAdmin) || isAdmin;
    isMod = Boolean(element.isMod) || isMod;
    adminMod.set(element.mailerUsername, { isAdmin, isMod });
  }
  const sortedMailers: sortedMailers[] = [...mostMailer.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({
      name, count, percentage: percentageForamt(count, totalActions),
    }));
  let content = `# Moderator Mail Activity Statistics\n\n*Last updated: ${datetime_local_toUTCString(today, timezone)}*  \n`;
  content += `${waterMark(subredditName)}  \nTotal modmails counted: ${totalActions}\n\n\`[A]\` = reddit identified this as Admin`;
  content += `; \`[M]\` = reddit identified this as Mod; \`[U]\` = any other user; \`[S]\` = a subreddit;\n\n`;
  // content += `| mailer | count | percentage | moderationStatus |\n`;
  // content += `|:-------|------:|-----------:|-----------------:|\n`;
  // sortedMailers.forEach(function (sortedMailer: sortedMailers) {
  //   let { isAdmin, isMod } = Object(adminMod.get(sortedMailer.name));
  //   const moderationStatus = (isAdmin ? '[A]' : (isMod ? '[M]' : '[U]'));//.replace(/\[/, '\\[').replace(/]/, '\\]');
  //content += `| ${usernameFormat(sortedMailer.name)} | ${sortedMailer.count} | ${sortedMailer.percentage} | \`${moderationStatus}\` |\n`;});
  const page = 'modmail-stats', reason = `${forced} update of the modmail-stats (${today})`;
  
  content += 'note: this area is work in progress, have a log for now.';

  content += '\n\n| mailer | moderator username | moderationStatus | Date |\n|:-------|-------------------:|-----------------:|-----:|\n' + promise.map(
    m => `| ${m.mailerUsername} | ${m.moderatorUsername} | ${(m.isAdmin ? '[A]' : (m.isMod ? '[M]' : '[U]'))} | ${m.date.toUTCString()} |`).join('\n');
  return await context.reddit.updateWikiPage({ content, subredditName, page, reason });
}

const daily_mod_stats_update = 'daily-mod-stats-update';
const daily_mail_stats_update = 'daily-mail-stats-update';
async function update(context: TriggerContext) {
  const hourTime = (await context.settings.get('modmailAt')) ?? '6';
  {
    const oldJobId = await context.redis.get('jobId'); if (oldJobId) await context.scheduler.cancelJob(oldJobId);
    const jobId = await context.scheduler.runJob({ name: daily_mod_stats_update, cron: `1 ${hourTime} * * *`, data: {}, });
    await context.redis.set('jobId', jobId);
  }; {
    const oldJobId = await context.redis.get(`jobId-${daily_mail_stats_update}`); if (oldJobId) await context.scheduler.cancelJob(oldJobId);
    const jobId = await context.scheduler.runJob({ name: daily_mail_stats_update, cron: `5 ${hourTime} * * *`, data: {}, });
    await context.redis.set(`jobId-${daily_mail_stats_update}`, jobId);
  };
}

Devvit.addSchedulerJob({ name: daily_mod_stats_update, async onRun(_event, context) { await updateFromQueue(context, 'Daily'); }, });
Devvit.addTrigger({ event: 'AppInstall', async onEvent(_, context) { await update(context); }, });
Devvit.addTrigger({ event: 'AppUpgrade', async onEvent(_, context) { await update(context); }, });
Devvit.addSchedulerJob({
  name: daily_mail_stats_update, async onRun(_event, context) {
    if (await context.settings.get('modmailStats')) {
      await updateMailStats(context, 'Daily');
    }
  },
});

function datetime_local_toUTCString(datetime_local: Datetime_global | Date, timezone: string): string {
  return (new Datetime_global(datetime_local, timezone)).toString();
}

type ModBreakdown = {
  moderatorUsername: string;
  actions: { name: string; count: number }[];
};

function getSortedModBreakdown(
  entries: ModActionEntry[],
  sortedMods: string[]
): ModBreakdown[] {
  const breakdownMap: Record<string, Record<string, number>> = {};

  for (const entry of entries) {
    if (!entry) continue;
    const { moderatorUsername, type } = entry;
    if (!breakdownMap[moderatorUsername]) {
      breakdownMap[moderatorUsername] = {};
    }
    breakdownMap[moderatorUsername][type] = (breakdownMap[moderatorUsername][type] || 0) + 1;
  }

  const unsortedBreakdowns: Record<string, ModBreakdown> = Object.fromEntries(
    Object.entries(breakdownMap).map(([moderatorUsername, actions]) => [
      moderatorUsername,
      {
        moderatorUsername,
        actions: Object.entries(actions)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count), // most to least frequent per mod
      },
    ])
  );

  // Sort mods by the given list
  return sortedMods.map(mod => unsortedBreakdowns[mod])
    .filter((x): x is ModBreakdown => x !== undefined);
}

class CounterMap<K> extends Map<K, number> {
  increment(key: K, by: number = 1): this {
    return this.set(key, (this.get(key) ?? 0) + (+by));
  }
}

class ArrayMap<K, V> extends Map<K, V[]> {
  pushTo(key: K, value: V): this {
    const array: V[] = this.get(key) ?? new Array;
    array.push(value);
    return this;
  }

  lengthOf(key: K): number {
    return (this.get(key) ?? new Array).length;
  }

  mapArray(key: K, func: (each: any, index: number, unknownArray: V[]) => V[]): any[] {
    return (this.get(key) ?? new Array).map(func, this);
  }

  reduceAll(func: (accumulator: any, currentValue: any, currentIndex: number, array: unknown[]) => any, initialValue: any): Map<K, V> {
    // accumulator, currentValue, currentIndex, array), initialValue
    const map = new Map<K, V>();
    for (const [key, value] of this) {
      map.set(key, value.reduce(func, initialValue));
    } return map;
  }

  /*mapAll(func: (each: any, index: number, unknownArray: V[]) => V): Map<K, V[]>
  {const map = new Map<K, V[]>; for (const [key, value] of this)
  {map.set(key, value.map(func)); } return map; }*/
}

function mapToJson(map: Map<string | symbol, any>) {
  const obj: { [key: string]: any } = {};

  for (const [key, value] of map) {
    // Include only string keys and explicitly exclude '__proto__'
    if (typeof key === 'string' && key !== '__proto__') {
      obj[key] = value;
    }
  }

  return obj;
}

function mapMapValues<K, V>(map: Map<K, V>, func: (each: V, key: K, unknownArray: Map<K, V>) => V) {
  const result = new Map<K, V>();
  for (const [key, value] of map.entries()) {
    result.set(key, func(value, key, map));
  }
  return result;
}

function percentageForamt(Le: number, Ri: number): string {
  [Le, Ri] = [+Le, +Ri];
  const percentage = (Le / Ri) * 100;
  if (!Number.isFinite(percentage) || Number.isNaN(percentage))
    return '0.00%'; return `${percentage.toFixed(2)}%`;
}

async function updateModStats(subredditName: string, ModActionEntries: ModActionEntry[],
  context: Devvit.Context | JobContext, title: string, options: {
    date: Date, reason: string, breakdownEachMod: boolean,
    timezone: string, debuglog: boolean,
  }): Promise<{ wikipage: WikiPage, contents: { content: string, breakdownEachMod_content: string, content_debuglog: string } }> {
  const updatedDate = new Date(options.date), reason = options.reason, updatedDatetime_global = new Datetime_global(updatedDate, 'UTC'),
    timezone = options.timezone;

  // Count actions by moderator and action type
  const modCounts: CounterMap<string> = new CounterMap,
    actionCounts: CounterMap<string> = new CounterMap,
    actionCountsNoAutoModSticky: CounterMap<string> = new CounterMap,
    breakdownEachMod: boolean = options.breakdownEachMod,
    lastModActionTaken: Map<string, Date> = new Map;

  let totalActions = 0, automoderator_stickies = 0;
  if (ModActionEntries.length === 0) {
    const page: string = title;
    let content = `# Moderator Activity Statistics\n\n*Last updated: ${datetime_local_toUTCString(updatedDatetime_global, timezone)}*`;
    content += `  \n${waterMark(subredditName)}  \nTotal Actions counted: 0`;
    const contents = { content, breakdownEachMod_content: '', content_debuglog: '' };
    return { wikipage: await context.reddit.updateWikiPage({ subredditName, page, content, reason, }), contents };
  }

  let distinguish: number = 0, sticky: number = 0;
  let approvePost: number = 0, removePost: number = 0,
    approveComment: number = 0, removeComment: number = 0,
    acceptmoderatorinvite: number = 0, banUser: number = 0,
    dev_platform_app_changed: number = 0, removemoderator: number = 0;
  const lastActionTaken: Date = ModActionEntries.map(m => m.date).sort((le: Date, ri: Date) => Number(ri) - Number(le))[0] ?? new Date;
  for (const action of ModActionEntries) {
    const when = action.date, modUsername = action.moderatorUsername, actionNameType = action.type;
    totalActions++;

    // Count by moderator
    modCounts.increment(modUsername, 1);

    // Count by action type
    actionCounts.increment(actionNameType, 1);

    // Count actions excluding AutoMod stickies
    if (actionNameType === 'sticky' && modUsername === 'AutoModerator') {
      automoderator_stickies += 1;
    } else {
      actionCountsNoAutoModSticky.increment(actionNameType, 1);
    }

    switch (actionNameType) {
      case 'sticky': sticky++; break;
      case 'banuser': banUser++; break;
      case 'removelink': removePost++; break;
      case 'distinguish': distinguish++; break;
      case 'approvelink': approvePost++; break;
      case 'removecomment': removeComment++; break;
      case 'approvecomment': approveComment++; break;
      case 'removemoderator': removemoderator++; break;
      case 'acceptmoderatorinvite': acceptmoderatorinvite++; break;
      case 'dev_platform_app_changed': dev_platform_app_changed++; break;
      default:
    }

    const existingActionDate = lastModActionTaken.get(action.moderatorUsername);

    if (!existingActionDate || when > existingActionDate) {
      lastModActionTaken.set(action.moderatorUsername, action.date);
    }
  }

  // Sort moderators by action count
  const sortedMods: { name: string, count: number, percentage: string }[] = [...modCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({
      name, count,
      percentage: percentageForamt(count, totalActions),
    }));
  // {for(const mod of sortedMods){context.redis.set(``);}}

  // Get top 10 actions
  const top10Actions = [...actionCounts]
    .sort((a, b) => b[1] - a[1]).slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  // Get top 10 actions without AutoMod stickies
  const top10ActionsNoAutoModSticky = [...actionCountsNoAutoModSticky]
    .sort((a, b) => b[1] - a[1]).slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  const breakdownPerMod = getSortedModBreakdown(ModActionEntries, sortedMods.map(s => s.name));

  // Generate wiki content
  const debuglog = options.debuglog, {
    content,
    content_debuglog,
    breakdownEachMod_content,
    crossSiteLog,
  } = generateWikiContent(
    updatedDatetime_global, sortedMods, top10Actions,
    top10ActionsNoAutoModSticky, totalActions,
    subredditName, {
    breakdownPerMod,
    breakdownEachMod,
    ModActionEntries,
    timezone, debuglog,
    automoderator_stickies,
    lastModActionTaken,
    lastActionTaken,
    distinguish, sticky,
    approvePost, removePost,
    approveComment, removeComment,
    acceptmoderatorinvite, banUser,
    dev_platform_app_changed,
    removemoderator,
  });

  let wikicontent = content + breakdownEachMod_content + content_debuglog;

  // if(debuglog){const b64=btoa(crossSiteLog);wikicontent=
  // wikicontent.replace(/https:\/\/ant\.ractoc\.com\/modlogstats\/#referer/,
  // `https://ant.ractoc.com/modlogstats/?subredditName=${subredditName}#${b64}`);}

  // Update the wiki page
  const wikipage = await context.reddit.updateWikiPage({
    content: wikicontent, subredditName, page: title, reason,
  });
  return { wikipage, contents: { content, content_debuglog, breakdownEachMod_content } };
}

function sumArray(self: number[]): number {
  const sum = function (accumulator: number, currentValue: number): number {
    return accumulator + currentValue;
  }; return self.reduce(sum, 0);
}

function usernameFormat(string: string, linked: boolean = false): string {
  return /^[a-zA-Z0-9\-_]+$/.test(string) ? (linked ? `[u/${string}](https://www.reddit.com/u/${string}/)` : ('u/' + string)) : string;
}

function generateWikiContent(datetimeLocal: Datetime_global,
  mods: { name: string; count: any; percentage: any; }[], actions: { name: any; count: any; }[],
  actionsNoAutoMod: any, totalActions: number, subredditName: string, options: {
    breakdownPerMod: ModBreakdown[], breakdownEachMod: boolean,
    ModActionEntries: ModActionEntry[], timezone: string,
    debuglog: boolean, automoderator_stickies: number,
    lastModActionTaken: Map<string, Date>,
    lastActionTaken: Date, banUser: number,
    approvePost: number, removePost: number,
    approveComment: number, removeComment: number,
    distinguish: number, sticky: number,
    dev_platform_app_changed: number,
    acceptmoderatorinvite: number,
    removemoderator: number,
  }): { content: string; breakdownEachMod_content: string; content_debuglog: string; crossSiteLog: string; } {
  const timezone = options.timezone, username = usernameFormat;
  let content = `# Moderator Activity Statistics\n\n*Last updated: ${datetime_local_toUTCString(datetimeLocal, timezone)}*`;
  content += `  \n${waterMark(subredditName)}  \nTotal Actions counted: ${totalActions}\n\n`;

  // Reminder, Favicond_
  content += `Reminder, entries starting with 'Favicond\\_' are not found in the modlog and added by the developer.`;

  // General Stats
  content += `\n## General Statistics\n`;
  content += `\nLatest-Action-At: <\`${datetime_local_toUTCString(options.lastActionTaken, timezone)}\`>  `;
  content += `\nModerators removed \`${options.removeComment}\` comments and \`${options.removePost}\` posts. `;
  content += `Moderators approved \`${options.approveComment}\` comments and \`${options.approvePost}\` posts.`;
  content += `  \nThat is a total of \`${options.removeComment + options.approveComment}\` comments actioned on`;
  content += ` and \`${options.approvePost + options.removePost}\` posts.  \n\`${percentageForamt(options.removeComment,
    options.removeComment + options.approveComment)}\` of the comments actioned on were removed. \`${percentageForamt(
      options.removePost, options.approvePost + options.removePost)}\` for posts\n\nModerators banned \`${options.banUser}`;
  content += `\` users. distinguished \`${options.distinguish}\` posts or comments. stickied \`${options.sticky}\` of them.`;
  content += ` \`${options.acceptmoderatorinvite}\` Moderators accepted an invite and \`${options.removemoderator}\` were`;
  content += ` Fired. and devvit apps changed \`${options.dev_platform_app_changed}\` times.`;

  // Most active moderators
  content += `\n\n## Most Active Moderators\n\n`;
  content += `| Moderator | Actions | Percentage |\n`;
  content += `|:----------|--------:|-----------:|\n`;

  // mods.forEach(function (mod: any) { content += `| ${username(mod.name)} | \`${mod.count}\` | \`${mod.percentage}\` |\n`;});
  content += mods.map(mod => `| ${username(mod.name)} | \`${mod.count}\` | \`${mod.percentage}\` |\n`).join('');

  // Top 10 actions
  content += `\n## Top 10 Most Common Actions\n\n`;
  content += `| Action | Count |\n|:-------|------:|\n`;

  content += actions.map(action => `| ${action.name} | \`${action.count}\` |\n`).join('');

  // Top 10 actions without AutoMod stickies
  content += `\n## Top 10 Actions (excluding AutoModerator stickies)\n\nAutomoderator`;
  content += `-stickies accounted for ${options.automoderator_stickies} actions\n\n`;
  content += `| Action | Count |\n|:-------|------:|\n`;

  actionsNoAutoMod.forEach((action: any) => {
    content += `| ${action.name} | ${action.count} |\n`;
  });
  let breakdownEachMod_content = '';
  if (options.breakdownEachMod) {
    breakdownEachMod_content += `\n## Breakdown Per Mod\n`;
    options.breakdownPerMod.forEach(function (each: ModBreakdown) {
      breakdownEachMod_content += `\n### Breakdown For ${username(each.moderatorUsername)}\n`;
      breakdownEachMod_content += `\nMost-Recent-Action: <${Datetime_global(options.lastModActionTaken.get(each.moderatorUsername)!, timezone)}>  \n`;
      breakdownEachMod_content += `Total-Actions: ${sumArray(each.actions.map(a => a.count))}\n\n`;
      breakdownEachMod_content += `| Action | Count |\n`;
      breakdownEachMod_content += `|:-------|------:|\n`;
      each.actions.forEach(function (each_) {
        breakdownEachMod_content += `| ${each_.name} | ${each_.count} |\n`;
      });
    });
  }

  let content_debuglog = '', crossSiteLog: [string, string, string][] | string = [];
  if (options.debuglog) {
    content_debuglog += `\n## the debug Log\n\n| Action | ModeratorName | Date |\n|:-------|--------------:|-----:|\n`;
    options.ModActionEntries.forEach(function (each: ModActionEntry) {// ago (${Datetime_global(each.date, timezone)})
      content_debuglog += `| ${each.type} | ${username(each.moderatorUsername)} | ${Datetime_global(each.date, timezone)} |\n`;
      (crossSiteLog as [string, string, string][]).push([each.type, each.moderatorUsername, each.date.toISOString()]);
    });
  }
  crossSiteLog = crossSiteLog.join(';');
  return { content, breakdownEachMod_content, content_debuglog, crossSiteLog };
}

export default Devvit;
