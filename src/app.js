let express = require('express');
let app = express();
let bodyParser = require('body-parser');
let path = require('path');
let prometheus = require('prom-client');
let cronjobs = require('./cronjobs');

const PORT = process.env.PORT || 3003;
const AUTO_HEALTHY_SCHEDULE = process.env.AUTO_HEALTHY_SCHEDULE;
const AUTO_UNHEALTHY_SCHEDULE = process.env.AUTO_UNHEALTHY_SCHEDULE;

let serviceHealthy = true;
let healthGauge = new prometheus.Gauge(
  'alert_tester_service_health',
  'global health flag of this test service'
);

app.use(
  bodyParser.urlencoded({
    extended: false
  })
);

app.get('/metrics', function(request, response) {
  let health = serviceHealthy | 0;
  healthGauge.set(health);
  response.end(prometheus.register.metrics());
});

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/switch.html'));
});

app.post('/', function(request, response) {
  serviceHealthy = request.body.healthy == 'true';
  console.log('Health state set to ' + serviceHealthy);
  response.sendStatus(200);
});

app.get('/state', function(request, response) {
  let health = serviceHealthy | 0;
  response.json(health);
});

app.get('/switch.css', function(req, res) {
  res.sendFile(path.join(__dirname + '/switch.css'));
});

app.use(
  '/material',
  express.static(
    path.join(__dirname, '../node_modules/material-components-web/dist/')
  )
);

app.listen(PORT, () => {
  console.log('alert-tester service started on port ' + PORT);
  cronjobs.configure(
    AUTO_HEALTHY_SCHEDULE,
    AUTO_UNHEALTHY_SCHEDULE,
    health => (serviceHealthy = health)
  );
});
