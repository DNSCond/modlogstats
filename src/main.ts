// Visit developers.reddit.com/docs to learn Devvit!
import { Devvit,type TriggerContext,  } from '@devvit/public-api';
import { Datetime_global } from 'datetime_global/Datetime_global.ts';
import { v4 as uuidv4 } from 'uuid';
import { Expire, scheduleJob } from './helpers.ts';
import {
  type ModActionEntry2,
  type incommingModMailEntry2,
  type CustomModActionTypes,
} from './types.ts';
import { daily_mail_stats_update, daily_mod_stats_update, applyTodevvitSingleton } from './v1.ts';
import { applyTeleportersToDevvitSingleton } from './aplyTeleporters.ts';

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
  // {type: 'boolean',name: 'debuglog',label: 'recreate the log?',
  // helpText: 'if enabled then a minilog will be created on the bottom of the report'},
]);

applyTodevvitSingleton(Devvit);
applyTeleportersToDevvitSingleton(Devvit);

Devvit.addTrigger({
  event: 'ModAction', // Listen for modlog events
  async onEvent(event, { redis }) {
    // Extract relevant data from the event
    const type = (event.action ?? null) as ModActionEntry2["type"]; // Type of moderator action
    const moderatorUsername = event?.moderator?.name; // Moderator username
    const date = new Date(event.actionedAt ?? new Date); // Date of action
    const affectedUsername = event.targetUser?.name || null;

    if (moderatorUsername === undefined) return;
    const uuid = uuidv4(), utc = 'UTC';

    // Create a unique key for this modlog entry (e.g., using the mod action ID)
    const hashKey = `modlog:${(new Datetime_global(date, utc)).format('Y-m-d')}`,
      key = `modlog_${uuid}`, entry: ModActionEntry2 = {
        type, moderatorUsername,
        date, affectedUsername,
        actionEntryType: 'modlog2',
      };

    await redis.hSet(hashKey, { [key]: JSON.stringify(entry) });
    await redis.expire(hashKey, Expire);
  },
});

Devvit.addTrigger({
  event: 'ModMail',
  async onEvent(event, context: TriggerContext) {
    const conversationResponse = await context.reddit.modMail.getConversation({
      conversationId: event.conversationId,
    }), date = new Date(event.createdAt ?? new Date);
    if (!conversationResponse.conversation) return;
    if (!(await context.settings.get('countModMail')))
      return;
    if (!event.messageAuthor) return;
    // https://github.com/fsvreddit/automodmail/blob/ef5000946bc0b2d15a15772bb488f0f72e251d8f/src/autoresponder.ts#L97
    // https://discord.com/channels/1050224141732687912/1050227353311248404/1390110420349620305
    const messagesInConversation = Object.values(conversationResponse.conversation.messages);
    const firstMessage = messagesInConversation[0];
    if (!firstMessage.id) return;
    const isFirstMessage = event.messageId.includes(firstMessage.id);
    const currentMessage = messagesInConversation.find(message => message.id && event.messageId.includes(message.id));
    if (!currentMessage) return;
    let moderatorUsername = '[Favicond_anonymous]';
    const isMod = Boolean(currentMessage.author?.isMod),
      isAdmin = Boolean(currentMessage.author?.isAdmin);
    const uuid = uuidv4(), key = `modlog_${uuid}`, redis = context.redis,
      hashKey = `modlog:${(new Datetime_global(date, 'UTC')).format('Y-m-d')}`;

    let affectedUsername: string | null = null;
    switch (event.conversationType) {
      case 'sr_sr':
        affectedUsername = event.conversationSubreddit?.name as string;
        if (affectedUsername) affectedUsername = 'r/' + affectedUsername;
        else throw new TypeError('mailerUsername is undefined');
        break;
      case 'sr_user':
        affectedUsername = conversationResponse.conversation.participant?.name || null;
        //specialStatus ? event.messageAuthor.name : '[Favicond_anonymous]'
        break;

      case 'sr_internal':
        affectedUsername = `r/${context.subredditName ?? await context.reddit.getCurrentSubredditName()}`;
        break;
    }

    const isReply = !isFirstMessage!;
    const type = (isMod ? `Favicond_Modmail${isReply ? '_Reply' : ''}`
      : isAdmin ? `Favicond_Modmail_Admin${isReply ? '_Reply' : ''}` :
        `Favicond_Modmail_Incomming_${isReply ? 'Reply' : 'Initial'}`
    ) as CustomModActionTypes, mailerUsername: string = event.messageAuthor.name;

    if (isMod || isAdmin) moderatorUsername = mailerUsername;
    const entry: incommingModMailEntry2 = {
      moderatorUsername, mailerUsername,
      isAdmin, isMod, isReply, type,
      affectedUsername, date,
      mailActionType: 'mail',
      actionEntryType: 'modmailV2',
      toWho: event.conversationType,
    };
    await redis.hSet(hashKey, { [key]: JSON.stringify(entry) });
    await redis.expire(hashKey, Expire);
  },
}
);

const onUserDelete = 'onUserDelete';

async function update(context: TriggerContext) {
  const hourTime = '0';
  await scheduleJob(context, daily_mod_stats_update, +hourTime, 1);
  await scheduleJob(context, daily_mail_stats_update, +hourTime, 5);
  await scheduleJob(context, onUserDelete, +hourTime, 15);
  {
    const oldJobId = await context.redis.get('jobId');
    if (oldJobId) await context.scheduler.cancelJob(oldJobId);
    await context.redis.del('jobId');
  }
}

Devvit.addTrigger({ event: 'AppInstall', async onEvent(_, context) { await update(context); }, });
Devvit.addTrigger({ event: 'AppUpgrade', async onEvent(_, context) { await update(context); }, });


export default Devvit;
