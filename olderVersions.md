# older versions

the versions before the current minor version are moved here

### 0.4.9: attempt at fix failed.

### 0.4.6: fixed hope and dreams in differences; 0.4.7: updated readme

- thats pretty much it

#### 0.4.8: we lost our x.

- internally: changed tsx to ts.

### 0.4.4: `olderVersions.md`

- the versions before the current minor version are moved to `olderVersions.md` on github.
- internal use only, check back next update.
- [olderVersions.md](https://github.com/DNSCond/modlogstats/blob/main/olderVersions.md)

#### 0.4.5: 'Update Mod Stats and difference'

- added 'Update Mod Stats and difference'
- will be gone next update.

### 0.4.3: clean account queue

- removed 'clean account queue' left overs from a dev version

### 0.4.2: updateDifference

- solved the bug where updates didnt happen

### 0.4.1: new Datetime_global(today_.setUTCDate(today_.getUTCDate() - 1), 'UTC')

- resolves ["if your modlogstats appears empty, please do not update yet "](https://www.reddit.com/user/antboiy/comments/1mqihz8/)

### 0.4.0: difference

- updated to devvit 0.12.0
- added the `difference` value
- other internal changes that are probably not important for users.

# 0.3.x

### 0.3.16: debug its own (0.3.17: updated reamde)

- the debuglog is no longer a setting.
- summon it with its dedicated menu action

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

## 0.2.x

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

## 0.1.x

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
