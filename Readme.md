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

### 0.0.2 inital release