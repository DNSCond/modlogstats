# **modlogstats**

Ever wanted to get competitive with your mod buddies? Ever wanted to see a detailed breakdown of your subreddit's moderator log and mail activity? This Devvit app provides a suite of tools to help moderators track their contributions and analyze moderation activity.

### **Features**

This bot updates wiki pages with moderator statistics daily, or you can trigger an update manually using the subreddit context menu.

**Moderator Activity Statistics**

* **Most Active Moderators**: Displays a breakdown of actions taken by each moderator, including their percentage of total actions.  
* **Top 10 Most Common Actions**: Counts the most frequent actions from the moderator log.  
* **Top 10 Actions (excluding AutoModerator stickies)**: Filters out actions caused by AutoModerator to provide a clearer view of human moderation activity.  
* **User Evaluation**: A menu item allows you to check the modlog history for a specific user. The results are sent directly to the modmail inbox.

**Modmail Activity Statistics**

* When enabled in the settings, the app tracks modmail activity and saves it to a wiki page.  
* This feature records incoming messages from users and replies from moderators to provide additional insights not found in the standard modlog.

### **Custom Actions (Favicond\_)**

Entries starting with Favicond\_ are custom events added by this application and are not part of Reddit's official modlog.

These custom actions include:

* Favicond\_Modmail: Tracks modmail events from moderators.  
* Favicond\_Modmail\_Admin: Tracks modmail events from Reddit admins.  
* Favicond\_Modmail\_Incomming\_Initial: Records the first message in a modmail conversation from a non-moderator.  
* Favicond\_Modmail\_Incomming\_Reply: Tracks replies from non-moderators in an ongoing modmail conversation.

[Send feedback about this](https://www.reddit.com/message/compose/?to=antboiy&subject=modlogstats+feedbnack)

### **Contributing**

modlogstats is open to issues and pull requests.

([Devvit app page](https://developers.reddit.com/apps/modlogstats)) ([Github Repo](https://github.com/DNSCond/modlogstats))

You can open an issue or [open a pull request](https://docs.github.com/en/get-started/exploring-projects-on-github/contributing-to-a-project) on GitHub.

### **Pull Request Guidelines**

* Keep your pull requests (PRs) small.  
* Use keyword functions instead of arrow functions, unless they are simple, one-operation functions (e.g., m \=\> m.toLowerString()).  
* Do not install new dependencies unless absolutely necessary.  
* Other internal changes are probably not important.

### **Changelog**

**0.3.9: Updated Readme**

* A big overhaul of changes above the changelog.

**0.3.8: Minilog for specific users**

* Added a minilog for specific users.  
* Went to hour 0 instead of hour 1 UTC.

**0.3.6: Modmail logic update (0.3.7: none)**

* Some modmail stats logic updates.

**0.3.5: Unknown**

* Unknown.

**0.3.4: *Re0ly***

* Fixed the bugs where Favicond\_Modmail Favicond\_Modmail\_reply, Favicond\_Modmail\_Incomming\_Reply Favicond\_Modmail\_Incomming\_Initial, Favicond\_Modmail\_Admin Favicond\_Modmail\_Admin\_Reply were inverted.

**0.3.4: \\n\\n**

* Fixed some newline bugs.

**0.3.3: ModmailStats upgrade**

* The modmail stats will now display a log instead of a summary.  
* Teleport added to 'Update Mod Stats (all time)'.  
* **Better working for modmail events**.

**0.3.2: Timer Timee**

* Added a time option.  
* Changed the default from 00:00\[UTC\] to 06:00\[UTC\].  
* Added TeleportTo menu options.

**0.3.1: Fixed bug**

* Bug where it directed to modlog-stats instead modmail-stats.

**0.3.0: Added a General Statistics section**

* Latest-Action-At: \<Fri Jun 27 2025 00:00:00 UTC+0000 (UTC)\>.  
* Moderators removed n comments and n posts. Moderators approved n comments and n posts.  
* That is a total of n comments actioned on and n posts.  
* nn.nn% of the comments actioned on were removed. nn.nn% for posts.  
* Moderators banned n users. distinguished n posts or comments. stickied n of them.  
* and n Moderators accepted an invite and n were Fired. and devvit apps changed n times.

**0.2.20: Added modmail Statistics (part 2\)**

* Added modmail-stats as a wikipage.

* # **Moderator Mail Activity Statistics.**

* It shows mailer, count, percentage, moderationStatus.  
* moderationStatus is one of \[A\] \= reddit identified this as Admin; \[M\] \= reddit identified this as Mod of this subreddit; \[U\] \= any other user.  
* Added some settings, specifically modmail-stats, enabled?.

**0.2.19: Added modmail Statistics**

* See 0.2.20.

**0.2.18: Fixed disrespect to setting**

* Fixed disrespect to setting.

**0.2.17: Favicond\_Modmail\_Admin**

* The modmail system has been rewritten.  
* Favicond\_Modmail\_Admin is now used for accounts that Reddit identifies as Admin.  
* A modmail Statistics section is in the making.

**0.2.16: createModNotification**

* Modmails should now be notifications.

**0.2.15: Fixed bug where Most-Recent-Action: displayed \<0 seconds\>**

* Fixed bug where Most-Recent-Action: displayed \<0 seconds\>.

**0.2.14: Fixed bug where the mod list is empty**

* Fixed bug where the mod list is empty.

**0.2.13: Added proper feedback**

* Logs expire at 90 days.  
* Added proper feedback.

**0.2.12: Fixed bug**

* Evaluate user now compares case insensitive.  
* "generate debug log" was added.

**0.2.11: Fixed header bug**

* Fixed header bug.

**0.2.10: Evaluate.User**

* After installing this update, mod actions with an affectedUser can now be queried per user.  
* When querying a user the result will be sent as modmail.  
* This information will not be available in the regular reports.

**0.2.9: Favicond\_Modmail\_Incomming\_Reply**

* Updated and added Favicond\_Modmail\_Incomming\_Reply and Favicond\_Modmail\_Incomming\_Initial.  
* Some changes to the "all time" button.  
* Modmail from users should be registered as Favicond\_Modmail\_Incomming\_Initial and replies as Favicond\_Modmail\_Incomming\_Reply under the name \[Favicond\_anonymous\] (the brackets indicate that this is not a Reddit username).  
* Other internal changes that are probably not important for users.  
* Added 'count Incomming Modmail from nonmods?' in the settings with the default to off.

**0.2.8: inline-Datetime\_global**

* Most-Recent-Action: \<0 seconds\> gets added when 'per mod statistics?' is enabled for each mod.  
* The debuglog is now also in relative time.  
* Other internal changes that are not important for users.

**0.2.7: stoplog**

* The debug log does no longer get sent as a modmail.  
* Changed Favicond\_ModMail to Favicond\_Modmail.

**0.2.6: updated readme**

* Updated readme.

**0.2.5: Favicond\_**

* Changes it so logs expire 25 days instead of 4\.  
* Modmails are now counted, only if a moderator sends a modmail.  
* Favicond\_ actions are actions worth considering, like Modmail. Favicond\_ModMail is for initiators and Favicond\_ModMail\_Reply is for replies.  
* There is now more control over the output.  
* Other internal changes that are probably not important.

**0.2.3: minor changes (0.2.4: nothing)**

* Changes it so logs expire 4 days instead of 2\.

**0.2.2**

* Added a list of common timezones at the bottom of this readme.  
* defaultValue: "UTC".

**0.2.1**

* Added an all time option (250 days in the past at most).  
* Added a timezone option for those that want the bot to display in their timezone (just search your IANA timezone).  
* Other internal changes that are not important.

**0.2.0**

* Added 2 settings:  
  * 'per mod statistics?': if enabled it will breakdown each mod's actions.  
  * 'Enable daily modmail notification': if enabled it will send a modmail with the breakdown.  
* Other internal changes I can't remember so they probably not important.

**0.1.4**

* Made it so it only uses wiki/modlog-stats for updates, beware.  
* Updated action\_reasons.

**0.1.3**

* Changed so it reports daily.  
* You now teleport when manually update it.  
* Other internal changes I can't remember so they probably not important.

**0.1.1**

* Changed so it reports hourly; if an hour ever gets repeated then it is lost.  
* Internally: changed so it saves to Redis for longer savings.  
* Other internal changes I can't remember so they probably not important.

**0.0.3**

* Added most recent time and action counter.

**0.0.2**

* Initial release.

### **List of Popular IANA Timezones**

Source: [https://g.co/gemini/share/4c734776d334](https://g.co/gemini/share/4c734776d334)

If your timezone is not present, search for your IANA timezone on a search engine.

* UTC (Coordinated Universal Time \- the base)  
* Europe/Amsterdam (CET/CEST \- Netherlands)  
* Europe/London (GMT/BST \- UK)  
* Europe/Paris (CET/CEST \- France)  
* Europe/Berlin (CET/CEST \- Germany)  
* Europe/Rome (CET/CEST \- Italy)  
* Europe/Madrid (CET/CEST \- Spain)  
* Europe/Warsaw (CET/CEST \- Poland)  
* Europe/Moscow (MSK \- Russia)  
* Europe/Istanbul (TRT \- Turkey)  
* Europe/Athens (EET/EEST \- Greece)  
* Africa/Cairo (EET/EEST \- Egypt)  
* Africa/Johannesburg (SAST \- South Africa)  
* Africa/Lagos (WAT \- Nigeria)  
* Africa/Nairobi (EAT \- Kenya)  
* America/New\_York (EST/EDT \- US East Coast)  
* America/Chicago (CST/CDT \- US Central)  
* America/Denver (MST/MDT \- US Mountain)  
* America/Los\_Angeles (PST/PDT \- US Pacific)  
* America/Anchorage (AKST/AKDT \- Alaska, USA)  
* America/Honolulu (HST \- Hawaii, USA)  
* America/Mexico\_City (CST/CDT \- Mexico)  
* America/Toronto (EST/EDT \- Canada)  
* America/Vancouver (PST/PDT \- Canada)  
* America/Sao\_Paulo (BRT \- Brazil)  
* America/Buenos\_Aires (ART \- Argentina)  
* America/Santiago (CLT/CLST \- Chile)  
* America/Bogota (COT \- Colombia)  
* America/Lima (PET \- Peru)  
* Asia/Dubai (GST \- UAE)  
* Asia/Kolkata (IST \- India)  
* Asia/Bangkok (ICT \- Thailand)  
* Asia/Jakarta (WIB \- Indonesia)  
* Asia/Shanghai (CST \- China)  
* Asia/Tokyo (JST \- Japan)  
* Asia/Seoul (KST \- South Korea)  
* Asia/Singapore (SGT \- Singapore)  
* Asia/Kuala\_Lumpur (MYT \- Malaysia)  
* Asia/Hong\_Kong (HKT \- Hong Kong)  
* Asia/Jerusalem (IST/IDT \- Israel)  
* Asia/Riyadh (AST \- Saudi Arabia)  
* Australia/Sydney (AEST/AEDT \- Australia East)  
* Australia/Melbourne (AEST/AEDT \- Australia South-East)  
* Australia/Perth (AWST \- Australia West)  
* Australia/Darwin (ACST \- Australia North)  
* Pacific/Auckland (NZDT/NZST \- New Zealand)  
* Pacific/Fiji (FJT/FJST \- Fiji)  
* Pacific/Tahiti (TAHT \- French Polynesia)  
* Atlantic/Reykjavik (GMT \- Iceland)  
* Indian/Mauritius (MUT \- Mauritius)