import { JobContext, TriggerContext } from '@devvit/public-api';

export async function addUserIdToQueue(userId: string, context: JobContext | TriggerContext): Promise<number> {
  return await context.redis.zAdd('deletionQueue', { member: userId, score: Date.now(), });
}

export function doDeletionQueue(howToDeleteUserData: (userId: string, context: JobContext) => Promise<boolean>) {
  return async function (_: unknown, context: JobContext) {
    const items = await context.redis.zRange('deletionQueue', 0, Date.now(), { by: "score" });
    const promises = [];
    for (const { member } of items) {
      promises.push((async function (userId: string) {
        let success;
        try {
          success = !!await howToDeleteUserData(userId, context);
        } catch (error) {
          console.error(error);
          success = false;
        }
        if (success) await context.redis.zRem('deletionQueue', [userId]);
        return success;
      })(member));
    }
    await Promise.allSettled(promises);
    // countBooleans(().map(promise => promise.status === 'fulfilled' && promise?.value === true));
  };
}

export function countBooleans(array: any[]): { true: number, false: number } {
  array = Array.from(array, b => Boolean(b));
  const result = { true: 0, false: 0 };
  for (let e of array) {
    if (e) result.true += 1;
    else result.false += 1;
  } return result;
}
