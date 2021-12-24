import cron from 'node-cron';

class Cron {
    task: cron.ScheduledTask;

    constructor() {
        // this.cron = cron;
    }

    start() {
        this.task = cron.schedule('* * * * *', () => {
            console.log('running a task every minute');
        });
    }
}