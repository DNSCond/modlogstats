import { type TriggerContext, type JSONObject } from "@devvit/public-api";

export async function scheduleJob(context: TriggerContext, name: string, hourTime: number, minutes: number, data: JSONObject = {}) {
    const jobName = 'jobId-' + name, oldJobId = await context.redis.get(jobName);
    if (oldJobId) {
        await context.redis.del(jobName);
        await context.scheduler.cancelJob(oldJobId);
    }
    const jobId = await context.scheduler.runJob({
        cron: `${minutes} ${hourTime} * * *`,
        name, data,
    });
    await context.redis.set(jobName, jobId);
    return jobId;
}
