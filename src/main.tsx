// Visit developers.reddit.com/docs to learn Devvit!

import { Devvit, JobContext, ModAction, TriggerContext } from '@devvit/public-api';
import { Datetime_global } from 'datetime_global/Datetime_global.js';//, DurationToHumanString
import { Temporal } from 'temporal-polyfill';
import { v4 as uuidv4 } from 'uuid';

// Configure the app to use Reddit API
Devvit.configure({ redditAPI: true, redis: true, });
type ModActionEntry = { moderatorUsername: string, type: string, date: Date };

Devvit.addSettings([
    {
        type: 'boolean',
        name: 'daily-modmail-enabled',
        label: 'Enable daily modmail notification',
    }, {
        type: 'boolean',
        name: 'breakdown-each-mod',
        label: 'per mod statistics?',
        helpText: 'if enabled will breakdown each mod\'s contributions to the modlog',
    }, {
        type: 'string',
        name: 'Timezone',
        label: 'Timezone?',
        helpText: 'specify an iana timezone, some examples (Europe/Berlin, Asia/Tokyo, America/New_York)',
        onValidate({ value }) {
            try {
                new Datetime_global(Date.now(), value);
            } catch (e) {
                return String(e);
            }
        },
    },
]);

Devvit.addTrigger({
    event: 'ModAction', // Listen for modlog events
    async onEvent(event, { redis }) {
        // Extract relevant data from the event
        const type = event.action ?? 'unknown'; // Type of moderator action
        const moderatorUsername = event?.moderator?.name; // Moderator username
        const date = new Date(event.actionedAt ?? new Date); // Date of action
        if (moderatorUsername === undefined) return;
        const uuid = uuidv4();

        // Create a unique key for this modlog entry (e.g., using the mod action ID)
        const key = `modlog_${uuid}`, hashKey = `modlog:${(new Datetime_global(date)).format('Y-m-d')}`,
            entry: ModActionEntry = { type, moderatorUsername, date };

        await redis.hSet(hashKey, { [key]: JSON.stringify(entry) });
        await redis.expire(hashKey, 172800);
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
    const timezone: string = await context.settings.get('Timezone') ?? 'UTC',
        today_ = new Date, redis = context.redis, tomorrow = new Date(today_),
        subredditName: string = await context.reddit.getCurrentSubredditName(),
        today = new Datetime_global(today_.setUTCDate(today_.getUTCDate() - 1), 'UTC'),
        breakdownEachMod: boolean = await context.settings.get('breakdown-each-mod') ?? false;
    const wikipage = await updateModStats(subredditName, await (async function (): Promise<ModActionEntry[]> {
        const items = await redis.hGetAll('modlog:' + today.format('Y-m-d')),
            promise: ModActionEntry[] = [];
        for (const entry of Object.values(items)) {
            promise.push(JSON.parse(entry as string) as ModActionEntry);
        }
        return promise;
    })(), context, 'modlog-stats', {
        date: new Date(tomorrow), breakdownEachMod, timezone,
        reason: `${$Daily} update at ${datetime_local_toUTCString(tomorrow, 'UTC')}`,
    });

    const enabled = await context.settings.get('daily-modmail-enabled');
    if (enabled) {
        await context.reddit.modMail.createModInboxConversation({
            subject: 'Daily Notification',
            bodyMarkdown: wikipage.content,
            subredditId: context.subredditId,
        });
    }
}

Devvit.addMenuItem({
    label: 'Update Mod Stats Now (debug)',
    location: 'subreddit',
    forUserType: 'moderator',
    async onPress(_event, context) {
        await updateFromQueue(context, 'Forced');
    },
});

function addtoTime(Datetime_global: Datetime_global, hours: number = 0, minutes: number = 0, seconds: number = 0, month: number = 0, day: number = 0, year: number = 0) {
    const dur = new Temporal.Duration(year, month, day, hours, minutes, seconds), zdt = Datetime_global.toTemporalZonedDateTime();
    return new Datetime_global.constructor(zdt.add(dur), Datetime_global.getTimezoneId());
}

Devvit.addMenuItem({
    label: 'Update Mod Stats (all time)',
    location: 'subreddit',
    forUserType: 'moderator',
    async onPress(_event, context) {
        context.ui.showToast('Updating mod stats...');
        const timezone: string = await context.settings.get('Timezone') ?? 'UTC',
            today = (new Datetime_global).toTimezone(timezone), redis = context.redis,
            subredditName: string = await context.reddit.getCurrentSubredditName(),
            breakdownEachMod: boolean = await context.settings.get('breakdown-each-mod') ?? false;

        await updateModStats(subredditName, await (async function (): Promise<ModActionEntry[]> {
            let items, time = (new Datetime_global(today, timezone)), letout = 0;
            const promise: ModActionEntry[] = [];

            while (items = await redis.hGetAll('modlog:' + time.format('Y-m-d'))) {
                time = addtoTime(time, 0, 0, 0, 0, -1);
                for (const entry of Object.values(items)) {
                    promise.push(JSON.parse(entry as string) as ModActionEntry);
                }
                if ((++letout) > 250) break;
            }
            return promise;
        })(), context, 'modlog-stats', {
            date: today.toDate(), breakdownEachMod, timezone,
            reason: `allTime update at ${datetime_local_toUTCString(today, 'UTC')}`,
        });
    },
});

const daily_mod_stats_update = 'daily-mod-stats-update';
// Schedule a daily task to update the wiki
Devvit.addSchedulerJob({
    name: daily_mod_stats_update,
    async onRun(_event, context) {
        await updateFromQueue(context, 'Daily');
    },
});


async function update(context: TriggerContext) {
    const oldJobId = await context.redis.get('jobId'); if (oldJobId) await context.scheduler.cancelJob(oldJobId);
    const jobId = await context.scheduler.runJob({ name: daily_mod_stats_update, cron: '1 0 * * *', data: {}, });
    await context.redis.set('jobId', jobId);
}

Devvit.addTrigger({
    event: 'AppInstall',
    async onEvent(_, context) {
        await update(context);
    },
});

Devvit.addTrigger({
    event: 'AppUpgrade',
    async onEvent(_, context) {
        await update(context);
    },
});

function datetime_local_toUTCString(datetime_local: Datetime_global | Date, timezone: string): string {
    return (new Datetime_global(datetime_local, timezone)).toString();
}

// Add a menu item to manually trigger the update
Devvit.addMenuItem({
    label: 'Update Mod Stats Now',
    location: 'subreddit',
    forUserType: 'moderator', // Only visible to moderators
    async onPress(_event, context) {
        context.ui.showToast('Updating mod stats...');
        const now = new Date(), timezone: string = await context.settings.get('Timezone') ?? 'UTC',
            breakdownEachMod: boolean = await context.settings.get('breakdown-each-mod') ?? false;
        try {
            const subredditName: string = await context.reddit.getCurrentSubredditName(),
                modActions = await context.reddit.getModerationLog({ subredditName, limit: 1000, }).all();
            const page = await updateModStats(subredditName, modActions.map(function (event: ModAction): ModActionEntry {
                const type = event.type ?? 'unknown'; // Type of moderator action
                const moderatorUsername = event?.moderatorName; // Moderator username
                return { type, moderatorUsername, date: new Date(event.createdAt) };
            }), context, 'modlog-stats', {
                date: now, breakdownEachMod, timezone,
                reason: `manual update at ${datetime_local_toUTCString(now, 'UTC')}`,
            });
            context.ui.showToast('Mod stats updated successfully!');
            if (page !== undefined) context.ui.navigateTo(`https://www.reddit.com/r/${page.subredditName}/wiki/${page.name}/`);
        } catch (error) {
            console.error('Error updating mod stats:', error);
            context.ui.showToast('Failed to update mod stats. Check logs for details.');
        }
    },
});

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


async function updateModStats(subredditName: string, ModActionEntries: ModActionEntry[],
    context: Devvit.Context | JobContext, title: string, options: {
        date: Date, reason: string, breakdownEachMod: boolean,
        timezone: string,
    }) {
    const updatedDate = new Date(options.date), reason = options.reason,
        updatedDatetime_global = new Datetime_global(updatedDate, 'UTC');
    // Get all mod actions from the log

    // Count actions by moderator and action type
    const modCounts: { [moderator: string]: number } = {},
        actionCounts: { [actionName: string]: number } = {},
        lastModActionTaken: { [moderator: string]: Date } = {},
        actionCountsNoAutoModSticky: { [actionName: string]: number } = {},
        breakdownEachMod: boolean = options.breakdownEachMod;

    let totalActions = 0;

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
        if (!(actionNameType === 'sticky' && modUsername === 'AutoModerator')) {
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
    const wikiContent = generateWikiContent(
        updatedDatetime_global, sortedMods, top10Actions,
        top10ActionsNoAutoModSticky, totalActions,
        subredditName, {
        breakdownPerMod,
        breakdownEachMod,
        ModActionEntries,
        timezone: options.timezone,
    },
    );

    // Update the wiki page
    return await context.reddit.updateWikiPage({ subredditName, page: title, content: wikiContent, reason, });
}

function sumArray(self: number[]): number {
    function sum(accumulator: number, currentValue: number): number {
        return accumulator + currentValue;
    }
    return self.reduce(sum, 0);
}

function generateWikiContent(datetimeLocal: Datetime_global, mods: any, actions: any,
    actionsNoAutoMod: any, totalActions: number, subredditName: string, options: {
        breakdownPerMod: ModBreakdown[], breakdownEachMod: boolean,
        ModActionEntries: ModActionEntry[], timezone: string,
    }) {
    const timezone = options.timezone;
    let content = `# Moderator Activity Statistics\n\n`;
    content += `*Last updated: ${datetime_local_toUTCString(datetimeLocal, timezone)}*  \n[view your summery here](https://www.reddit.com/r/${subredditName}/wiki/`;
    content += `modlog-stats/)  \n[Generated By Moderator Statistics](https://developers.reddit.com/apps/modlogstats)  \nTotal Actions counted: ${totalActions}\n\n`;

    // Most active moderators
    content += `## Most Active Moderators\n\n`;
    // content += `| Moderator | Actions | Percentage | Most Recent Action |\n`;
    // content += `|:----------|--------:|-----------:|-------------------:|\n`;
    content += `| Moderator | Actions | Percentage |\n`;
    content += `|:----------|--------:|-----------:|\n`;

    mods.forEach(function (mod: any) {
        // const date = new Datetime_global(new Date(lastModActionTaken[mod.name]), 'UTC'), duration = date.until(now);
        // const formattee = DurationToHumanString.ToHistoryString.call(duration, datetimeLocal, 3);
        // content += `| u/${mod.name} | ${mod.count} | ${mod.percentage}% | ${formattee} (${datetime_local_toUTCString(date)}) |\n`;
        content += `| u/${mod.name} | ${mod.count} | ${mod.percentage}% |\n`;
    });

    // Top 10 actions
    content += `\n## Top 10 Most Common Actions\n\n`;
    content += `| Action | Count |\n`;
    content += `|:-------|------:|\n`;

    actions.forEach((action: any) => {
        content += `| ${action.name} | ${action.count} |\n`;
    });

    // Top 10 actions without AutoMod stickies
    content += `\n## Top 10 Actions (excluding AutoModerator stickies)\n\n`;
    content += `| Action | Count |\n`;
    content += `|:-------|------:|\n`;

    actionsNoAutoMod.forEach((action: any) => {
        content += `| ${action.name} | ${action.count} |\n`;
    });
    let breakdownEachMod_content = '';
    if (options.breakdownEachMod) {
        breakdownEachMod_content += `\n## Breakdown Per Mod\n`;
        options.breakdownPerMod.forEach(function (each: ModBreakdown) {
            breakdownEachMod_content += `\n### Breakdown For u/${each.moderatorUsername}\n`;
            breakdownEachMod_content += `\nTotal-Actions: ${sumArray(each.actions.map(a => a.count))}\n\n`;
            breakdownEachMod_content += `| Action | Count |\n`;
            breakdownEachMod_content += `|:-------|------:|\n`;
            each.actions.forEach(function (each_) {
                breakdownEachMod_content += `| ${each_.name} | ${each_.count} |\n`;
            });
        });
    }

    content += `\n${breakdownEachMod_content}`;//content += `\n${indent_codeblock(breakdownEachMod_content)}`;

    // content += `\n## the debug Log\n\n| Action | ModeratorName | Date |\n|:-------|--------------:|-----:|\n`;
    // options.ModActionEntries.forEach(function (each: ModActionEntry) { content +=
    // `| ${each.type} | ${each.moderatorUsername} | ${Datetime_global(each.date, 'UTC')} |\n`;});

    return content;
}

export default Devvit;
