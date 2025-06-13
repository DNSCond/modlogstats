// Visit developers.reddit.com/docs to learn Devvit!

import { Devvit, JobContext, ModAction, TriggerContext, WikiPage } from '@devvit/public-api';
// import { Datetime_global } from 'datetime_global/Datetime_global.js';
import { Temporal } from 'temporal-polyfill';
import { constructorInput, Datetime_global } from 'datetime_global/Datetime_global.ts';
import { v4 as uuidv4 } from 'uuid';

// Configure the app to use Reddit API
Devvit.configure({ redditAPI: true, redis: true, });

Devvit.addSettings([
    {
        type: 'boolean',
        name: 'daily-modmail-enabled',
        label: 'Enable daily modmail notification',
    },
    {
        type: 'boolean',
        name: 'breakdown-each-mod',
        label: 'per mod statistics?',
        helpText: 'if enabled will breakdown each mod\'s contributions to the modlog',
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
        type: 'boolean',
        name: 'debuglog',
        label: 'recreate the log?',
        helpText: 'if enabled then a minilog will be created on the bottom of the report',
    },
]);
const Expire = 86400 * 25;

type ModActionEntry = { moderatorUsername: string, type: string, date: Date, affectedUsername?: string };
Devvit.addTrigger({
    event: 'ModAction', // Listen for modlog events
    async onEvent(event, { redis }) {
        // Extract relevant data from the event
        const type = event.action ?? 'unknown'; // Type of moderator action
        const moderatorUsername = event?.moderator?.name; // Moderator username
        const date = new Date(event.actionedAt ?? new Date); // Date of action
        const affectedUsername = event.targetUser?.name;
        if (moderatorUsername === undefined) return;
        const uuid = uuidv4(), utc = 'UTC';

        // Create a unique key for this modlog entry (e.g., using the mod action ID)
        const key = `modlog_${uuid}`, hashKey = `modlog:${(new Datetime_global(date, utc)).format('Y-m-d')}`,
            entry: ModActionEntry = { type, moderatorUsername, date, affectedUsername };

        await redis.hSet(hashKey, { [key]: JSON.stringify(entry) });
        await redis.expire(hashKey, Expire);
    },
});
// async function userIsMod(username: string, context: TriggerContext): Promise<boolean> {
//     //https://github.com/fsvreddit/modmail-userinfo/blob/main/src/utility.ts
//     const subredditName = await context.reddit.getCurrentSubredditName();
//     const modList = await context.reddit.getModerators({ subredditName, username, }).all();
//     return modList.length > 0;
// }
Devvit.addTrigger({
    event: 'ModMail',
    async onEvent(event, context) {
        //const isMe = !event.messageAuthor || event.messageAuthor.name === context.appName;
        const conversationResponse = await context.reddit.modMail.getConversation({
            conversationId: event.conversationId,
        });
        if (!conversationResponse.conversation) {
            return;
        }
        if (!(await context.settings.get('countModMail'))) {
            return;
        }
        const messages = Object.values(conversationResponse.conversation.messages), LastMessage = messages.at(-1), convoLength = messages.length;
        // const conversationIsArchived = conversationResponse.conversation.state === ModMailConversationState.Archived;
        // console.log(jsonEncodeIndent({ messagesInConversation, conversationResponse, isMe }, 4));
        if (LastMessage === undefined) return;

        const uuid = uuidv4(), key = `modlog_${uuid}`,
            redis = context.redis, date = new Date(event.createdAt ?? new Date),
            hashKey = `modlog:${(new Datetime_global(date, 'UTC')).format('Y-m-d')}`;
        // nullish values compare to false. why not like this?
        if (Boolean(LastMessage.author?.isMod) && LastMessage.author?.name) {
            const moderatorUsername = LastMessage.author.name,
                type = 'Favicond_Modmail' + (convoLength > 1 ? '_Reply' : ''),
                entry: ModActionEntry = { type, moderatorUsername, date };
            await redis.hSet(hashKey, { [key]: JSON.stringify(entry) });
            await redis.expire(hashKey, Expire);
        } else if (await context.settings.get('countIncommingModmail')) {
            const moderatorUsername = '[Favicond_anonymous]',
                type = 'Favicond_Modmail_Incomming_' + (convoLength > 1 ? 'Reply' : 'Initial'),
                entry: ModActionEntry = { type, moderatorUsername, date };

            await redis.hSet(hashKey, { [key]: JSON.stringify(entry) });
            await redis.expire(hashKey, Expire);
        }
    },
});

function normalize_newlines(string: string) {
    return String(string).replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

function indent_codeblock(string: string) {
    return '    ' + normalize_newlines(string).replace(/\n/g, '\n    ');
}

function jsonEncode(jsonicItem: any, indent: boolean | number = false, replacer?: (this: any, key: string, value: any) => any): string {
    if (indent === false) return JSON.stringify(jsonicItem, replacer);
    else return JSON.stringify(jsonicItem, replacer, indent === true ? 4 : +indent);
}

function jsonEncodeIndent(jsonicItem: any, indent: boolean | number = true, replacer?: (this: any, key: string, value: any) => any): string {
    if (indent === false) return indent_codeblock(JSON.stringify(jsonicItem, replacer));
    else return indent_codeblock(JSON.stringify(jsonicItem, replacer, indent === true ? 4 : +indent));
}

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
        await context.reddit.modMail.createModInboxConversation({
            subject: 'Daily Moderator Activity Statistics',
            bodyMarkdown: wikipage.contents.content,
            subredditId: context.subredditId,
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
    label: 'Update Mod Stats Now (debug)',
    location: 'subreddit',
    forUserType: 'moderator',
    async onPress(_event, context) {
        try {
            await updateFromQueue(context, 'Forced');
        } catch (e) {
            context.ui.showToast(String(e));
        }
    },
});

Devvit.addMenuItem({
    label: 'Update Mod Stats (all time)',
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
    },
});

const usernameForm = Devvit.createForm(
    {
        fields: [
            {
                type: 'string',
                name: 'username',
                label: 'Enter a username',
                helpText: 'the user you want to evaluate. (without u/)'
            },
        ],
        title: 'Username Form',
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
        })(), username: string | undefined = event.values.username?.replace?.(/^u\//, '') ?? '[undefined]';
        if (/^[a-zA-Z0-9\-_]+$/.test(username)) {
            const usernameFunction = function (string: string, linked: boolean = false): string {
                return /^[a-zA-Z0-9\-_]+$/.test(string) ? (linked ? `[u/${string}](https://www.reddit.com/u/${string}/)` : ('u/' + string)) : string;
            }, actionCounts: { [actionName: string]: number } = {};
            let bodyMarkdown = `Evaluated u/${username}  \n`, index = 0;
            bodyMarkdown += `Queried-By: <${usernameFunction(currentUsername, true)}>  \n${waterMark}  \n`;
            //bodyMarkdown += '| actionName | byModerator | date |\n';
            //bodyMarkdown += '|:-----------|------------:|-----:|\n';
            for (let modActionEntry of promise) {
                if (typeof modActionEntry.affectedUsername === 'string') {
                    if (modActionEntry.affectedUsername === username) {
                        // const u = usernameFunction(modActionEntry.moderatorUsername), d = new Datetime_global(modActionEntry.date, timezone);
                        //bodyMarkdown += `| ${modActionEntry.type} | ${u} | ${d} |\n`;
                        index++;
                        if (actionCounts[modActionEntry.type] === undefined) { actionCounts[modActionEntry.type] = 0; }
                        actionCounts[modActionEntry.type]++;
                    }
                }
            }
            bodyMarkdown += `Total-counted: ${index}  \nQueried-At: ${(new Datetime_global).toTimezone(timezone)}\n\n`;
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
    label: 'Evaluate User',
    location: 'subreddit',
    forUserType: 'moderator',
    async onPress(_event, context) {
        context.ui.showForm(usernameForm);
    }
});

const daily_mod_stats_update = 'daily-mod-stats-update';
async function update(context: TriggerContext) {
    const oldJobId = await context.redis.get('jobId'); if (oldJobId) await context.scheduler.cancelJob(oldJobId);
    const jobId = await context.scheduler.runJob({ name: daily_mod_stats_update, cron: '1 0 * * *', data: {}, });
    await context.redis.set('jobId', jobId);
}

Devvit.addSchedulerJob({ name: daily_mod_stats_update, async onRun(_event, context) { await updateFromQueue(context, 'Daily'); }, });
Devvit.addTrigger({ event: 'AppInstall', async onEvent(_, context) { await update(context); }, });
Devvit.addTrigger({ event: 'AppUpgrade', async onEvent(_, context) { await update(context); }, });

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
    return sortedMods.map((mod) => unsortedBreakdowns[mod])
        .filter((x): x is ModBreakdown => x !== undefined);
}

const waterMark = '[Generated By Moderator Statistics](https://developers.reddit.com/apps/modlogstats)';
async function updateModStats(subredditName: string, ModActionEntries: ModActionEntry[],
    context: Devvit.Context | JobContext, title: string, options: {
        date: Date, reason: string, breakdownEachMod: boolean,
        timezone: string, debuglog: boolean,
    }): Promise<{ wikipage: WikiPage, contents: { content: string, breakdownEachMod_content: string, content_debuglog: string } }> {
    const updatedDate = new Date(options.date), reason = options.reason,
        updatedDatetime_global = new Datetime_global(updatedDate, 'UTC'),
        timezone = options.timezone;
    // Get all mod actions from the log

    // Count actions by moderator and action type
    const modCounts: { [moderator: string]: number } = {},
        actionCounts: { [actionName: string]: number } = {},
        lastModActionTaken: { [moderator: string]: Date } = {},
        actionCountsNoAutoModSticky: { [actionName: string]: number } = {},
        breakdownEachMod: boolean = options.breakdownEachMod;

    let totalActions = 0, automoderator_stickies = 0;
    if (ModActionEntries.length === 0) {
        const page: string = title;
        let content = `# Moderator Activity Statistics\n\n*Last updated: ${datetime_local_toUTCString(updatedDatetime_global, timezone)}*`;
        content += `  \n[view your summery here](https://www.reddit.com/r/${subredditName}/wiki/modlog-stats/)  \n`;
        content += `${waterMark}  \nTotal Actions counted: 0`;
        const contents = { content, breakdownEachMod_content: '', content_debuglog: '' };
        return { wikipage: await context.reddit.updateWikiPage({ subredditName, page, content, reason, }), contents };
    }

    for (const action of ModActionEntries) {
        if (action === undefined) continue;
        const when = action.date, modUsername = action.moderatorUsername, actionNameType = action.type;
        totalActions++;

        // Count by moderator
        if (!modCounts[modUsername]) {
            modCounts[modUsername] = 0;
        }
        modCounts[modUsername]++;

        // Count by action type
        if (!actionCounts[actionNameType]) {
            actionCounts[actionNameType] = 0;
        }
        actionCounts[actionNameType]++;

        // Count actions excluding AutoMod stickies
        if (actionNameType === 'sticky' && modUsername === 'AutoModerator') {
            automoderator_stickies += 1;
        } else {
            if (!actionCountsNoAutoModSticky[actionNameType]) {
                actionCountsNoAutoModSticky[actionNameType] = 0;
            }
            actionCountsNoAutoModSticky[actionNameType]++;
        }
        const existingEntry = lastModActionTaken[modUsername] ?? 0;

        lastModActionTaken[modUsername] = +existingEntry < +when ? when : new Date(existingEntry);
    }

    // Sort moderators by action count
    const sortedMods: { name: string, count: number, percentage: string }[] = Object.entries(modCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([mod, count]) => ({
            name: mod, count,
            percentage: ((count / totalActions) * 100).toFixed(2)
        }));

    // Get top 10 actions
    const top10Actions = Object.entries(actionCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([action, count]) => ({
            name: action,
            count,
        }));

    // Get top 10 actions without AutoMod stickies
    const top10ActionsNoAutoModSticky = Object.entries(actionCountsNoAutoModSticky)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([action, count]) => ({
            name: action,
            count,
        }));

    const breakdownPerMod = getSortedModBreakdown(ModActionEntries, sortedMods.map(s => s.name));

    // Generate wiki content
    const debuglog = options.debuglog, {
        content,
        content_debuglog,
        breakdownEachMod_content,
        // crossSiteLog,
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
    });

    let wikicontent = content + breakdownEachMod_content + content_debuglog;

    // if (debuglog) {
    //     const b64 = btoa(crossSiteLog);
    //     wikicontent = wikicontent.replace(/https:\/\/ant\.ractoc\.com\/modlogstats\/#referer/, `https://ant.ractoc.com/modlogstats/?subredditName=${subredditName}#${b64}`);
    // }

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

const untilOptions = { largestUnit: 'years', smallestUnit: 'minutes' }, toHistoryString = function (past: constructorInput, now: Datetime_global, timezone: string): string {
    const zdt = (new Datetime_global(past, timezone)), durr = zdt.until(now, untilOptions);
    return `${durr.toHumanString(3)} ago (${zdt})`;
};

function generateWikiContent(datetimeLocal: Datetime_global, mods: any, actions: any,
    actionsNoAutoMod: any, totalActions: number, subredditName: string, options: {
        breakdownPerMod: ModBreakdown[], breakdownEachMod: boolean,
        ModActionEntries: ModActionEntry[], timezone: string,
        debuglog: boolean, automoderator_stickies: number,
        lastModActionTaken: { [moderator: string]: Date },
    }) {
    const timezone = options.timezone, username = function (string: string, linked: boolean = false): string {
        return /^[a-zA-Z0-9\-_]+$/.test(string) ? (linked ? `[u/${string}](https://www.reddit.com/u/${string}/)` : ('u/' + string)) : string;
    }, now = datetimeLocal;
    let content = `# Moderator Activity Statistics\n\n*Last updated: ${datetime_local_toUTCString(datetimeLocal, timezone)}*  \n`;
    content += `[view your summery here](https://www.reddit.com/r/${subredditName}/wiki/modlog-stats/)  \n${waterMark}  \n`;
    content += `Total Actions counted: ${totalActions}\n\n`;

    // Reminder, Favicond_
    content += `Reminder, entries starting with 'Favicond\\_' are not found in the modlog and added by the developer.`;

    // Most active moderators
    content += `## Most Active Moderators\n\n`;
    content += `| Moderator | Actions | Percentage |\n`;
    content += `|:----------|--------:|-----------:|\n`;

    mods.forEach(function (mod: any) {
        content += `| ${username(mod.name)} | ${mod.count} | ${mod.percentage}% |\n`;
    });

    // Top 10 actions
    content += `\n## Top 10 Most Common Actions\n\n`;
    content += `| Action | Count |\n|:-------|------:|\n`;

    actions.forEach((action: any) => {
        content += `| ${action.name} | ${action.count} |\n`;
    });

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
            breakdownEachMod_content += `\nMost-Recent-Action: <${toHistoryString(options.lastModActionTaken[each.moderatorUsername], now, timezone)}>  \n`;
            breakdownEachMod_content += `Total-Actions: ${sumArray(each.actions.map(a => a.count))}\n\n`;
            breakdownEachMod_content += `| Action | Count |\n`;
            breakdownEachMod_content += `|:-------|------:|\n`;
            each.actions.forEach(function (each_) {
                breakdownEachMod_content += `| ${each_.name} | ${each_.count} |\n`;
            });
        });
    }

    content += `\n## stats\n`;
    const Latest = options.ModActionEntries.at(0)!, Oldest = options.ModActionEntries.at(-1)!;
    content += `\nLatest-Action: ${Latest.type} <${username(Latest.moderatorUsername, true)}>`;
    content += ` (${toHistoryString(Latest.date, now, timezone)})  \nOldest-Action: ${Oldest.type}\n`;
    content += ` <${username(Oldest.moderatorUsername, true)}> (${toHistoryString(Oldest.date, now, timezone)})`;
    let content_debuglog = '', crossSiteLog: string[] = [];
    if (options.debuglog) {
        content_debuglog += `\n## the debug Log\n\n| Action | ModeratorName | Date |\n|:-------|--------------:|-----:|\n`;
        options.ModActionEntries.forEach(function (each: ModActionEntry) {// ago (${Datetime_global(each.date, timezone)})
            content_debuglog += `| ${each.type} | ${username(each.moderatorUsername)} | ${toHistoryString(each.date, now, timezone)} |\n`;
            crossSiteLog.push(`${each.type};${each.moderatorUsername};${each.date.toISOString()}`);
        });
    }
    return { content, breakdownEachMod_content, content_debuglog, crossSiteLog: crossSiteLog.join() };
}

export default Devvit;
