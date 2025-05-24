# modlogstats

ever wanted to get competitive with your mod buddies?

ever wanted to see some other insights than https://www.reddit.com/mod/vast_attention/insights ?

ever wanted to see a breakdown of the moderator log?

## what this does

every day this bot updates a wikipage with the moderator statistics.
or you can force an update whenever you feel like by using the subreddit context menu.

stats include "Most Active Moderators" with the actions they took and percentage of actions between all moderators (like u/antboiy took 36.89% of mod actions).

"Top 10 Most Common Actions" to count which are the mosy common actions taken.
and "Top 10 Actions (excluding AutoModerator stickies)" because automoderator's sticky cause a action.

## changelog

###  0.2.3: minor changes (0.2.4: nothing)

- changes it so logs expire 4 days instead of 2

###  0.2.2

- added a list of common timezones at the bottom of this readme.
- defaultValue: "UTC",

###  0.2.1

- added an all time option (250 day in the past at most)
- added a timezone option for those that want the bot to display in their timezone.
  (just search your iana timezone, should be somewhere)
- other internal changes that are not imporant.

###  0.2.0

- added 2 settings
  - 'per mod statistics?': if enabled it will breakdown each mod's actions.
  - 'Enable daily modmail notification': if enabled it will send a modmail with the breakdown.
- other internal changes i cant remember so they probably not imporant

###  0.1.4

- made it so it only uses `wiki/modlog-stats` for updates, beware.
- updated action_reasons

###  0.1.3

- changed so it reports daily
- you now teleport when manually update it
- other internal changes i cant remember so they probably not imporant

###  0.1.1

- changed so it reports hourly, if a hour ever gets repeated then it is lost.
- internally: changed so it saves to redis for longer savings
- other internal changes i cant remember so they probably not imporant

### 0.0.3

- added most recent time and action counter

### 0.0.2

- inital release

## list of popular iana timezones

Source: https://g.co/gemini/share/4c734776d334

if your timezone is not present, search for your iana timezone on a search engine

- UTC (Coordinated Universal Time - the base)
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
