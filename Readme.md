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

custom users include:

- `[Favicond_anonymous]`: for when an author should probably be hidden.
- `[Favicond_object Undefined]`: a user is not available with the data

### Manual Updates and Notifications

- Trigger updates via subreddit menu options: `Update Mod Stats Now` (recent actions), `Update Mod Stats (all time)` (up
  to 90 days), or `Update Mod Mail Stats Now`.
- Receive daily moderator stats via modmail if the `Daily Modmail Notification` setting is enabled.

## Setup

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
- unless its a single argument arrow function, prefer to explicitly annotate types,

## changelog

### 0.5.0

- moved the version numbers before 0.4.10 to the [older versions](https://github.com/DNSCond/modlogstats/blob/main/olderVersions.md) page.
- a new data schema is out. for those diving into the code, v2 is the schema that is being used now,
  `v1.ts` contains the code related to the old schema. for users, the only thing that changed is the descriptiveness of the logs.
- splitted up the stats pages.


### 0.4.12

- the debug Log Is Temporaily Disabled Globally
- in collaboration with [Wiki Publish](https://developers.reddit.com/apps/wikipublish),
  all times are now Time URLs. [visit the Time URL Documentation on Wiki Publish's Github
  Repository](https://github.com/DNSCond/wikipublish/blob/main/WhatAreTimeURLs.md#time-urls)

### 0.4.11

u/modlogstats will now start his menu item's descriptions with his name.

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
