# modlogstats

Get competitive with your fellow moderators or dive deep into your subreddit's moderation activity with modlogstats.
This Devvit app provides tools to track and analyze moderator actions and modmail activity, updating wiki pages daily
with detailed statistics or allowing manual updates via subreddit menu options.

## Features

The app tracks moderator and modmail activity, presenting results in wiki pages (`modlog-stats` and `modmail-stats`) and
optional modmail notifications. All features are configurable via settings.

### Moderator Activity Statistics

- **General Statistics**: Summarizes total actions, including comments/posts removed or approved, user bans,
  distinguished posts/comments, stickied items, moderator invites/firings, and Devvit app changes.
- **Most Active Moderators**: Lists each moderator's action count and percentage of total actions, with optional
  detailed per-moderator breakdowns (enable via `Per Mod Statistics` setting).
- **Top 10 Most Common Actions**: Counts the most frequent actions from the moderator log.
- **Top 10 Actions (Excluding AutoModerator Stickies)**: Filters out AutoModerator's sticky actions for a clearer view
  of human moderation.
- **User Evaluation**: Query modlog actions for a specific user via the `Evaluate User modlog` menu item, with results
  sent to the subreddit's modmail inbox.
- **Debug Log**: Appends a detailed log of all actions to the `modlog-stats` wiki page for troubleshooting (enable
  via `debuglog` setting).
- **Navigation**: Quickly access `modlog-stats` and `modmail-stats` wiki pages via `TeleportTo Modlog Summary`
  and `TeleportTo Modmail Summary` menu items.

### Modmail Activity Statistics

- Tracks modmail activity when the `Modmail Stats` setting is enabled, saving results to the `modmail-stats` wiki page
  as a log with columns for mailer, moderator, moderation status (`[A]` for admin, `[M]` for moderator, `[U]` for other
  users), and date.
- Records both incoming messages from users and replies from moderators/admins, providing insights beyond Reddit's
  standard modlog.

### Custom Actions (Favicond_)

Entries prefixed with `Favicond_` are custom events tracked by the app, not part of Reddit's official modlog. The
prefix `[Favicond_anonymous]` represents non-moderator users sending modmail. Custom actions include:

- `Favicond_Modmail`: Moderator-initiated modmail messages.
- `Favicond_Modmail_Reply`: Moderator replies in modmail conversations.
- `Favicond_Modmail_Admin`: Admin-initiated modmail messages.
- `Favicond_Modmail_Admin_Reply`: Admin replies in modmail conversations.
- `Favicond_Modmail_Incoming_Initial`: First modmail message from a non-moderator.
- `Favicond_Modmail_Incoming_Reply`: Non-moderator replies in ongoing modmail conversations.

### Manual Updates and Notifications

- Trigger updates via subreddit menu options: `Update Mod Stats Now` (recent actions), `Update Mod Stats (all time)` (up
  to 90 days), or `Update Mod Mail Stats Now`.
- Receive daily moderator stats via modmail if the `Daily Modmail Notification` setting is enabled.

## Setup for Moderators

1. Install the app from the [Devvit app page](https://developers.reddit.com/apps/modlogstats).
2. Configure settings in the settings:
    - **Timezone**: Set an IANA timezone (e.g., `America/New_York`) to display dates in your
      subreddit's local time (default: `UTC`).
    - **Daily Modmail Notification**: Enable to receive daily moderator stats via modmail.
    - **Per Mod Statistics**: Enable for detailed per-moderator action breakdowns in `modlog-stats`.
    - **Modmail Stats**: Enable to track modmail activity in `modmail-stats`.
    - **Count Incoming Modmail from Non-Mods**: Enable to include non-moderator modmail in stats (default: off).
    - **Debug Log**: Enable to append a detailed action log to `modlog-stats` for troubleshooting.
3. Access results in the `modlog-stats` and `modmail-stats` wiki pages or via subreddit menu options.

## Contributing

modlogstats is open to issues and pull requests at the [Devvit app page](https://developers.reddit.com/apps/modlogstats)
or [GitHub repository](https://github.com/DNSCond/modlogstats). Open an issue
or [submit a pull request](https://docs.github.com/en/get-started/exploring-projects-on-github/contributing-to-a-project)
on GitHub.

### Pull Request Guidelines

- Keep pull requests small.
- Use keyword functions (e.g., `function()`) instead of arrow functions,
  unless for simple operations (e.g., `m => m.toLowerCase()`).
- Avoid adding new dependencies unless necessary.
- Ensure changes align with existing code style and functionality.

## Feedback

Send feedback via modmail to
[u/antboiy](https://www.reddit.com/message/compose/?to=antboiy&subject=modlogstats+feedback).

## changelog

### 0.3.14: \n 0.3.15: same

- the 'Evaluate User modlog' should now display correctly

### 0.3.13: .sort()

- the debuglog should now sort in decending order of dates

### 0.3.12: debugg

- reintroduced the debuglog
- the debuglog should fetch all log entries in memory and log them on the `debuglog-stats` wikipage

### 0.3.11: updated RaedMe (again)

- i cant think of anything new to add
- some patch level changes that shouldnt affect the experience

### 0.3.10: switched ReEdMe (again)

switched the two 'readme's description of update `0.3.9: updated ReedMe` with each other

### 0.3.9: updated ReedMe

- Overhauled README with clearer structure and feature descriptions.
- Confirmed daily job scheduling at 00:00 UTC.
- thanks to grok for rewriting the above. note that other versions of the readme are
  available on github

### 0.3.8: minilog for specifci users.

- added a minilog for specific users.
- went to hour 0 instead of hour 1 utc.

### 0.3.6: modmail logic update. (0.3.7: none)

- some modmailstats logic updates

### 0.3.4: \_Re0ly\_

- fixed the bugs where `Favicond_Modmail` `Favicond_Modmail_reply`,
  `Favicond_Modmail_Incomming_Reply` `Favicond_Modmail_Incomming_Initial`,
  `Favicond_Modmail_Admin` `Favicond_Modmail_Admin_Reply`
  were inverted.

### 0.3.4: \n\n

- fixed some newline bugs
- note: this entry appears twice. not sure why, but i cant fix it without proof of history

### 0.3.3: ModmailStats upgrade

- the modmail stats will now display a log instead of a summery.
- Teleport aldded to '`Update Mod Stats (all time)`'.
- **better working for modmail events.**

### 0.3.2: Timer Timee

- added a time option.
- changed the default from 00:00[UTC] to 06:00[UTC].
- added TeleportTo menu options.

### 0.3.1: fixed bug

bug where it directed to modlog-stats instead modmail-stats

### 0.3.0: added a General Statistics section.

Latest-Action-At: <`Fri Jun 27 2025 00:00:00 UTC+0000 (UTC)`>  
Moderators removed `n` comments and `n` posts.Moderators approved `n` comments and `n` posts.  
That is a total of `n` comments actioned on and `n` posts.  
`nn.nn%` of the comments actioned on were removed. `nn.nn%` for posts
Moderators banned `n` users. distinguished `n` posts or comments. stickied `n` of them.
and `n` Moderators accepted an invite and `n` were Fired. and devvit apps changed `n` times.

### 0.2.20: added modmail Statistics (part 2)

- added `modmail-stats` as a wikipage.
- \# Moderator Mail Activity Statistics
- it showns  mailer, count, percentage, moderationStatus.
- moderationStatus is oneOf `[A]` = reddit identified this as Admin; `[M]` = reddit identified this as Mod of this subreddit; `[U]` = any other user;
- added some settings, specifically `modmail-stats`, `enabled?`.

### 0.2.19: added modmail Statistics

- see 0.2.20

### 0.2.18: fixed disrespect to setting

- fixed disrespect to setting

### 0.2.17: Favicond_Modmail_Admin

- the modmail system has been rewritten.
- Favicond_Modmail_Admin is now used for accounts that reddit identifies as Admin
- a modmail Statistics section is in the making

### 0.2.16: createModNotification

- modmails should now be notifications

### 0.2.15: fixed bug where Most-Recent-Action: displayed <0 seconds>

- fixed bug where Most-Recent-Action: displayed <0 seconds>

### 0.2.14: fixed bug where the mod list is empty

- fixed bug where the mod list is empty.

### 0.2.13: added proper feedback

- logs expure at 90 days;
- added proper feedback.

### 0.2.12: fixed bug

- Evaulatae user now compares case insensitive.
- "generate debug log" was added.

### 0.2.11: fixed header bug

- fixed header bug.

### 0.2.10: Evaluate.User

- after installing this update, mod actions with an affectedUser can now be queried per user.
- when querying a user the result will be send as modmail.
- this information will not be available in the regular reports.

### 0.2.9: Favicond_Modmail_Incomming_Reply

- updated and added
    - `Favicond_Modmail_Incomming_Reply` and `Favicond_Modmail_Incomming_Initial`
- some changes to the "all time" button
- modmail from users should be registered as `Favicond_Modmail_Incomming_Initial` and replies as `Favicond_Modmail_Incomming_Reply`
  under the name `[Favicond_anonymous]` (the brackets indicate that this is not a reddit username)
- other internal changes that are probably not important for users.
- added 'count Incomming Modmail from nonmods?' in the settings with the default to off.

### 0.2.8: inline-Datetime_global

- Most-Recent-Action: <0 seconds> gets added when 'per mod statistics?' is enabled for each mod.
- the debuglog is now also in relative time.
- other internal changes that are not important for users.

### 0.2.7: stoplog

- the debug log does no longer get send as a modmail
- changed `Favicond_ModMail` to `Favicond_Modmail`

### 0.2.6: upadated readme

- upadated readme.

### 0.2.5: Favicond\_

- changes it so logs expire 25 days instead of 4
- Modmails are now counted. only if a moderator sends a modmail that is.
- Favicond\_ actions are actions woroth considering. like Modmail. Favicond\_ModMail is for initiators and Favicond\_ModMail\_Reply is for replies.
- there now is more control over the output.
- other internal changes that are probably not imporant.

### 0.2.3: minor changes (0.2.4: nothing)

- changes it so logs expire 4 days instead of 2.

### 0.2.2

- added a list of common timezones at the bottom of this readme.
- defaultValue: "UTC",

### 0.2.1

- added an all time option (250 day in the past at most)
- added a timezone option for those that want the bot to display in their timezone.
  (just search your iana timezone, should be somewhere)
- other internal changes that are not imporant.

### 0.2.0

- added 2 settings
    - 'per mod statistics?': if enabled it will breakdown each mod's actions.
    - 'Enable daily modmail notification': if enabled it will send a modmail with the breakdown.
- other internal changes i cant remember so they probably not imporant.

### 0.1.4

- made it so it only uses `wiki/modlog-stats` for updates, beware.
- updated action_reasons.

### 0.1.3

- changed so it reports daily.
- you now teleport when manually update it.
- other internal changes i cant remember so they probably not imporant.

### 0.1.1

- changed so it reports hourly, if a hour ever gets repeated then it is lost.
- internally: changed so it saves to redis for longer savings.
- other internal changes i cant remember so they probably not imporant.

### 0.0.3

- added most recent time and action counter.

### 0.0.2

- inital release.

## list of popular iana timezones

Source: https://g.co/gemini/share/4c734776d334

if your timezone is not present, search for your iana timezone on a search engine

- UTC (Coordinated Universal Time - the base)
- Europe/Amsterdam (CET/CEST - Netherlands)
- Europe/London (GMT/BST - UK)
- Europe/Paris (CET/CEST - France)
- Europe/Berlin (CET/CEST - Germany)
- Europe/Rome (CET/CEST - Italy)
- Europe/Madrid (CET/CEST - Spain)
- Europe/Warsaw (CET/CEST - Poland)
- Europe/Moscow (MSK - Russia)
- Europe/Istanbul (TRT - Turkey)
- Europe/Athens (EET/EEST - Greece)
- Africa/Cairo (EET/EEST - Egypt)
- Africa/Johannesburg (SAST - South Africa)
- Africa/Lagos (WAT - Nigeria)
- Africa/Nairobi (EAT - Kenya)
- America/New_York (EST/EDT - US East Coast)
- America/Chicago (CST/CDT - US Central)
- America/Denver (MST/MDT - US Mountain)
- America/Los_Angeles (PST/PDT - US Pacific)
- America/Anchorage (AKST/AKDT - Alaska, USA)
- America/Honolulu (HST - Hawaii, USA)
- America/Mexico_City (CST/CDT - Mexico)
- America/Toronto (EST/EDT - Canada)
- America/Vancouver (PST/PDT - Canada)
- America/Sao_Paulo (BRT - Brazil)
- America/Buenos_Aires (ART - Argentina)
- America/Santiago (CLT/CLST - Chile)
- America/Bogota (COT - Colombia)
- America/Lima (PET - Peru)
- Asia/Dubai (GST - UAE)
- Asia/Kolkata (IST - India)
- Asia/Bangkok (ICT - Thailand)
- Asia/Jakarta (WIB - Indonesia)
- Asia/Shanghai (CST - China)
- Asia/Tokyo (JST - Japan)
- Asia/Seoul (KST - South Korea)
- Asia/Singapore (SGT - Singapore)
- Asia/Kuala_Lumpur (MYT - Malaysia)
- Asia/Hong_Kong (HKT - Hong Kong)
- Asia/Jerusalem (IST/IDT - Israel)
- Asia/Riyadh (AST - Saudi Arabia)
- Australia/Sydney (AEST/AEDT - Australia East)
- Australia/Melbourne (AEST/AEDT - Australia South-East)
- Australia/Perth (AWST - Australia West)
- Australia/Darwin (ACST - Australia North)
- Pacific/Auckland (NZDT/NZST - New Zealand)
- Pacific/Fiji (FJT/FJST - Fiji)
- Pacific/Honolulu (HST - This is a repeat, let's swap for a different one)
- Pacific/Tahiti (TAHT - French Polynesia)
- Atlantic/Reykjavik (GMT - Iceland)
- Indian/Mauritius (MUT - Mauritius)
