# Alert-tester Microservice

This repository contains a microservice that exposes one single flag as a [Prometheus](https://prometheus.io/) metric. The state can be changed using the minimalistic UI or automatically via a configurable cron schedule.

With the alert-tester you can easily test the complete chain from Prometheus scraping to [AlertManager](https://prometheus.io/docs/alerting/alertmanager/) to your target channel (like Slack, PagerDuty, VictorOps etc).

## Deployment

A basic deployment for Kubernetes could look like this:

```yml
kind: Deployment
apiVersion: extensions/v1beta1
metadata:
  name: alert-tester
spec:
  replicas: 1
  template:
    metadata:
      labels:
        app: alert-tester
      annotations:
        prometheus.io/path: /metrics
        prometheus.io/scrape: "true"
        prometheus.io/port: "3003"
    spec:
      containers:
        - name: alert-tester-backend
          image: matthiasmuth/alert-tester:v1
          imagePullPolicy: Always
          ports:
          - containerPort: 3003
            protocol: TCP
```

## Defining an alert in Prometheus

Add an alert in your Prometheus configuration based on the scraped metric:

```
ALERT TestAlert
    IF (alert_tester_service_health == 0)
    LABELS {
        service = "alert-tester",
        severity = "warning",
    }
    ANNOTATIONS {
        summary = "Test alert triggered"
    }
```

## Configuration

Moreover, the service allows you to configure a cron schedule (as described in the [npm cron package](https://www.npmjs.com/package/cron)) for automatic alerting and recovery.

At [meisterplan](https://meisterplan.com/), we use this feature to send a notification whenever our on-call schedule in PagerDuty switches to the next employee. For example, if this shift change is every monday at 10 o'clock, the environment variables could be set like this:

```yml
env:
  - name: 'AUTO_UNHEALTHY_SCHEDULE'
    value: '00 00 10 * * 1'
  - name: 'AUTO_HEALTHY_SCHEDULE'
    value: '00 01 10 * * 1'
```