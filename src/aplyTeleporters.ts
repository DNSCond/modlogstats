import { type Devvit, } from '@devvit/public-api';

export function applyTeleportersToDevvitSingleton(devvit: typeof Devvit) {
  devvit.addMenuItem({
    label: 'TeleportTo Modlog Summery',
    description: 'u/modlogstats: a quick way to TeleportTo Modlog Summery',
    location: 'subreddit', forUserType: 'moderator',
    async onPress(_, context) {
      const subredditName = context.subredditName;
      if (subredditName === undefined) return context.ui.showToast('no subredditName name');
      context.ui.navigateTo(`https://old.reddit.com/r/${subredditName}/wiki/modlog-stats/`);
    },
  });

  devvit.addMenuItem({
    label: 'TeleportTo Modmail Summery',
    description: 'u/modlogstats: a quick way to TeleportTo Modmail Summery',
    location: 'subreddit', forUserType: 'moderator',
    async onPress(_, context) {
      const subredditName = context.subredditName;
      if (subredditName === undefined) return context.ui.showToast('no subredditName name');
      context.ui.navigateTo(`https://old.reddit.com/r/${subredditName}/wiki/modmail-stats/`);
    },
  });

  devvit.addMenuItem({
    label: 'TeleportTo debug log',
    description: 'u/modlogstats: a quick way to TeleportTo debug log',
    location: 'subreddit', forUserType: 'moderator',
    async onPress(_, context) {
      const subredditName = context.subredditName;
      if (subredditName === undefined) return context.ui.showToast('no subredditName name');
      context.ui.navigateTo(`https://old.reddit.com/r/${subredditName}/wiki/debuglog-stats/`);
    },
  });
}