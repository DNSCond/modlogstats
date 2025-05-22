// Visit developers.reddit.com/docs to learn Devvit!

import { Devvit, JobContext, ModAction } from '@devvit/public-api';
import { Datetime_global } from 'datetime_global/Datetime_global.js';//, DurationToHumanString
import { v4 as uuidv4 } from 'uuid';

// Configure the app to use Reddit API
Devvit.configure({ redditAPI: true, redis: true, });
type ModActionEntry = { moderatorUsername: string, type: string, date: Date } | undefined;

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

async function updateFromQueue(context: JobContext | Devvit.Context) {
    const today_ = new Date, subredditName: string = await context.reddit.getCurrentSubredditName(), redis = context.redis;
    today_.setUTCDate(today_.getUTCDate() - 1);// --warn
    const today = new Datetime_global(today_.setUTCHours(0, 0, 0, 0), 'UTC');
    await updateModStats(subredditName, await (async function (): Promise<ModActionEntry[]> {
        const items = await redis.hGetAll('modlog' + today.format('Y-m-d')),
            promise: ModActionEntry[] = [];
        for (const entry of Object.values(items)) {
            promise.push(JSON.parse(entry as string) as ModActionEntry);
        }
        return promise;
    })(), context, 'mod-stats-' + today.format('H'));
}

Devvit.addMenuItem({
    label: 'Update Mod Stats Now (Queue)',
    location: 'subreddit',
    forUserType: 'moderator', // Only visible to moderators
    async onPress(_event, context) {
        await updateFromQueue(context);
    },
});

// Schedule a daily task to update the wiki
Devvit.addSchedulerJob({
    name: 'daily-mod-stats-update', // @ts-ignore
    schedule: '0 * * * *',
    async onRun(_event, context) {
        //const subreddit = await context.reddit.getSubredditByName(context.subreddit.name);
        await updateFromQueue(context);
    },
});

function datetime_local_toUTCString(datetime_local: Datetime_global): string {
    return datetime_local.format('D, d M Y H:i:s \\U\\T\\C');
}

// Add a menu item to manually trigger the update
Devvit.addMenuItem({
    label: 'Update Mod Stats Now',
    location: 'subreddit',
    forUserType: 'moderator', // Only visible to moderators
    async onPress(_event, context) {
        context.ui.showToast('Updating mod stats...');
        try {
            const subredditName: string = await context.reddit.getCurrentSubredditName(),
                modActions = await context.reddit.getModerationLog({ subredditName, limit: 1000, }).all();
            const page = await updateModStats(subredditName, modActions.map(function (event: ModAction): ModActionEntry {
                const type = event.type ?? 'unknown'; // Type of moderator action
                const moderatorUsername = event?.moderatorName; // Moderator username
                return { type, moderatorUsername, date: new Date(event.createdAt) };
            }), context, 'modlog-stats');
            context.ui.showToast('Mod stats updated successfully!');
            if (page !== undefined) context.ui.navigateTo(`https://www.reddit.com/r/${page.subredditName}/wiki/${page.name}/`);
        } catch (error) {
            console.error('Error updating mod stats:', error);
            context.ui.showToast('Failed to update mod stats. Check logs for details.');
        }
    },
});

async function updateModStats(subredditName: string, ModActionEntries: ModActionEntry[], context: Devvit.Context | JobContext, title: string) {
    const updatedDate = new Date, updatedDatetime_global = new Datetime_global(updatedDate, 'UTC'),
        formatted = datetime_local_toUTCString(updatedDatetime_global);
    try {
        // Get all mod actions from the log

        // Count actions by moderator and action type
        const modCounts: { [moderator: string]: number } = {};
        const actionCounts: { [actionName: string]: number } = {};
        const actionCountsNoAutoModSticky: { [actionName: string]: number } = {};
        const lastModActionTaken: { [moderator: string]: Date } = {};

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
        const sortedMods = Object.entries(modCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([mod, count]) => ({
                name: mod,
                count,
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

        // Generate wiki content
        const wikiContent = generateWikiContent(
            updatedDatetime_global, sortedMods, top10Actions,
            top10ActionsNoAutoModSticky, totalActions,
            // lastModActionTaken, updatedDate,
        );

        // Update the wiki page
        return await context.reddit.updateWikiPage({
            subredditName,
            page: title,
            content: wikiContent,
            reason: `Daily mod stats update (${formatted})`,
        });
    } catch (error) {
        console.error('Error updating mod stats:', error);
    }
}


function generateWikiContent(datetimeLocal: Datetime_global, mods: any, actions: any, actionsNoAutoMod: any,
    totalActions: number/*, lastModActionTaken: { [moderator: string]: Date }, now: Date*/) {
    let content = `# Moderator Activity Statistics\n\n`;
    content += `*Last updated: ${datetime_local_toUTCString(datetimeLocal)}*  \nhttps://developers.reddit.com/apps/modlogstats  `;
    content += `\nTotal Actions counted: ${totalActions}\n\n`;

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

    return content;
}

export default Devvit;
