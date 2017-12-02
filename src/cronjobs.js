let cron = require('cron');

exports.configure = (autoHealthySchedule, autoUnhealthySchedule, setHealth) => {
  if (!!autoHealthySchedule) {
    console.log(
      'Auto-healthy state configured using the schedule',
      autoHealthySchedule
    );
    createCronJob(autoHealthySchedule, () => {
      console.log('Auto-healthy triggered');
      setHealth(true);
    });
  } else {
    console.log('Auto-healthy schedule not configured');
  }

  if (!!autoUnhealthySchedule) {
    console.log(
      'Auto-unhealthy state configured using the schedule',
      autoUnhealthySchedule
    );
    createCronJob(autoUnhealthySchedule, () => {
      console.log('Auto-unhealthy triggered');
      setHealth(false);
    });
  } else {
    console.log('Auto-unhealthy schedule not configured');
  }
};

function createCronJob(schedule, onTick) {
  new cron.CronJob({
    cronTime: schedule,
    onTick: onTick,
    start: true
  });
}
