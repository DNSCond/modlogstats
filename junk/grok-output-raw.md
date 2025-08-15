# modlogstats

Get competitive with your fellow moderators or dive deep into your subreddit’s moderation activity with modlogstats.
This Devvit app provides tools to track and analyze moderator actions and modmail activity, updating wiki pages daily
with detailed statistics or allowing manual updates via subreddit menu options.

## Features

The app tracks moderator and modmail activity, presenting results in wiki pages (`modlog-stats` and `modmail-stats`) and
optional modmail notifications. All features are configurable via settings.

### Moderator Activity Statistics

- **General Statistics**: Summarizes total actions, including comments/posts removed or approved, user bans,
  distinguished posts/comments, stickied items, moderator invites/firings, and Devvit app changes.
- **Most Active Moderators**: Lists each moderator’s action count and percentage of total actions, with optional
  detailed per-moderator breakdowns (enable via `Per Mod Statistics` setting).
- **Top 10 Most Common Actions**: Counts the most frequent actions from the moderator log.
- **Top 10 Actions (Excluding AutoModerator Stickies)**: Filters out AutoModerator’s sticky actions for a clearer view
  of human moderation.
- **User Evaluation**: Query modlog actions for a specific user via the `Evaluate User modlog` menu item, with results
  sent to the subreddit’s modmail inbox.
- **Debug Log**: Appends a detailed log of all actions to the `modlog-stats` wiki page for troubleshooting (enable
  via `debuglog` setting).
- **Navigation**: Quickly access `modlog-stats` and `modmail-stats` wiki pages via `TeleportTo Modlog Summary`
  and `TeleportTo Modmail Summary` menu items.

### Modmail Activity Statistics

- Tracks modmail activity when the `Modmail Stats` setting is enabled, saving results to the `modmail-stats` wiki page
  as a log with columns for mailer, moderator, moderation status (`[A]` for admin, `[M]` for moderator, `[U]` for other
  users), and date.
- Records both incoming messages from users and replies from moderators/admins, providing insights beyond Reddit’s
  standard modlog.

### Custom Actions (Favicond_)

Entries prefixed with `Favicond_` are custom events tracked by the app, not part of Reddit’s official modlog. The
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
2. Add the app to your subreddit via moderation settings.
3. Configure settings in the Devvit app interface:
    - **Timezone**: Set an IANA timezone (e.g., `America/New_York`) to display dates in your
      subreddit's local time (default: `UTC`).
    - **Daily Modmail Notification**: Enable to receive daily moderator stats via modmail.
    - **Per Mod Statistics**: Enable for detailed per-moderator action breakdowns in `modlog-stats`.
    - **Modmail Stats**: Enable to track modmail activity in `modmail-stats`.
    - **Count Incoming Modmail from Non-Mods**: Enable to include non-moderator modmail in stats (default: off).
    - **Debug Log**: Enable to append a detailed action log to `modlog-stats` for troubleshooting.
4. Access results in the `modlog-stats` and `modmail-stats` wiki pages or via subreddit menu options.

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

Send feedback via modmail
to [u/antboiy](https://www.reddit.com/message/compose/?to=antboiy&subject=modlogstats+feedback).

## Changelog

### 0.3.9

- Overhauled README with clearer structure and feature descriptions.
- Confirmed daily job scheduling at 00:00 UTC.

### 0.3.8

- Added user-specific minilog for evaluating mod actions via `Evaluate User modlog`.
- Confirmed daily job scheduling at 00:00 UTC.

### 0.3.6 (0.3.7: none)

- Updated modmail stats logic.

### 0.3.5

- Unknown.

### 0.3.4

- Fixed bugs
  where `Favicond_Modmail`, `Favicond_Modmail_Reply`, `Favicond_Modmail_Incoming_Reply`, `Favicond_Modmail_Incoming_Initial`, `Favicond_Modmail_Admin`,
  and `Favicond_Modmail_Admin_Reply` were inverted.
- Fixed newline bugs in wiki output.

### 0.3.3

- Modmail stats now display as a log with mailer, moderator, status, and date.
- Added navigation to `modlog-stats` for `Update Mod Stats (all time)`.
- Improved modmail event handling.

### 0.3.2

- Added a time option.
- Changed the default from 00:00[UTC] to 06:00[UTC].
- Added TeleportTo menu options.

### 0.3.1

- Fixed bug where it directed to modlog-stats instead of modmail-stats.

### 0.3.0

- Added a General Statistics section.
- Latest-Action-At: <Fri Jun 27 2025 00:00:00 UTC+0000 (UTC)>
- Moderators removed n comments and n posts. Moderators approved n comments and n posts.
- That is a total of n comments actioned on and n posts.
- nn.nn% of the comments actioned on were removed. nn.nn% for posts.
- Moderators banned n users, distinguished n posts or comments, stickied n of them.
- and n Moderators accepted an invite and n were Fired, and devvit apps changed n times.

### 0.2.20

- Added `modmail-stats` as a wikipage.
- Moderator Mail Activity Statistics.
- It shows mailer, count, percentage, moderationStatus.
- moderationStatus is one of [A] = reddit identified this as Admin; [M] = reddit identified this as Mod of this
  subreddit; [U] = any other user.
- Added some settings, specifically modmail-stats, enabled?.

### 0.2.19

- See 0.2.20.

### 0.2.18

- Fixed disrespect to setting.

### 0.2.17

- The modmail system has been rewritten.
- Favicond_Modmail_Admin is now used for accounts that Reddit identifies as Admin.
- A modmail Statistics section is in the making.

### 0.2.16

- Modmails should now be notifications.

### 0.2.15

- Fixed bug where Most-Recent-Action displayed <0 seconds>.

### 0.2.14

- Fixed bug where the mod list is empty.

### 0.2.13

- Logs expire at 90 days.
- Added proper feedback.

### 0.2.12

- Evaluate user now compares case insensitive.
- "generate debug log" was added.

### 0.2.11

- Fixed header bug.

### 0.2.10

- After installing this update, mod actions with an affectedUser can now be queried per user.
- When querying a user, the result will be sent as modmail.
- This information will not be available in the regular reports.

### 0.2.9

- Updated and added Favicond_Modmail_Incoming_Reply and Favicond_Modmail_Incoming_Initial.
- Some changes to the "all time" button.
- Modmail from users should be registered as Favicond_Modmail_Incoming_Initial and replies as
  Favicond_Modmail_Incoming_Reply under the name [Favicond_anonymous] (the brackets indicate that this is not a Reddit
  username).
- Other internal changes that are probably not important for users.
- Added 'count Incoming Modmail from nonmods?' in the settings with the default to off.

### 0.2.8

- Most-Recent-Action: <0 seconds> gets added when 'per mod statistics?' is enabled for each mod.
- The debuglog is now also in relative time.
- Other internal changes that are not important for users.

### 0.2.7

- The debug log does no longer get sent as a modmail.
- Changed Favicond_ModMail to Favicond_Modmail.

### 0.2.6

- Updated readme.

### 0.2.5

- Changed so logs expire 25 days instead of 4.
- Modmails are now counted, only if a moderator sends a modmail.
- Favicond_ actions are actions worth considering, like Modmail. Favicond_ModMail is for initiators and
  Favicond_ModMail_Reply is for replies.
- There is now more control over the output.
- Other internal changes that are probably not important.

### 0.2.3 (0.2.4: nothing)

- Changed so logs expire 4 days instead of 2.

### 0.2.2

- Added a list of common timezones at the bottom of this readme.
- defaultValue: "UTC".

### 0.2.1

- Added an all time option (250 days in the past at most).
- Added a timezone option for those that want the bot to display in their timezone (just search your IANA timezone).
- Other internal changes that are not important.

### 0.2.0

- Added 2 settings:
    - 'per mod statistics?': if enabled it will breakdown each mod's actions.
    - 'Enable daily modmail notification': if enabled it will send a modmail with the breakdown.
- Other internal changes I can't remember so they probably not important.

### 0.1.4

- Made it so it only uses wiki/modlog-stats for updates, beware.
- Updated action_reasons.

### 0.1.3

- Changed so it reports daily.
- You now teleport when manually update it.
- Other internal changes I can't remember so they probably not important.

### 0.1.1

- Changed so it reports hourly; if an hour ever gets repeated then it is lost.
- Internally: changed so it saves to Redis for longer savings.
- Other internal changes I can't remember so they probably not important.

### 0.0.3

- Added most recent time and action counter.

### 0.0.2

- Initial release.

## Supported Timezones

Set the `Timezone` setting to an IANA timezone (e.g., `America/New_York`) to display dates in your local time.
Search for your timezone if not listed below:

- UTC (Coordinated Universal Time)
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
- Pacific/Tahiti (TAHT - French Polynesia)
- Atlantic/Reykjavik (GMT - Iceland)
- Indian/Mauritius (MUT - Mauritius)
