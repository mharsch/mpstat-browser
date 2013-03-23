## mpstat-browser
This repository contains the express + node.js app described in [this blog entry](http://blog.harschsystems.com/2011/05/03/remote-cpu-monitoring-using-node-kstat/).  This will only work on an Illumos or Solaris system with the kstat package installed.  If the npm-published kstat package won't install, use [this one](https://github.com/mharsch/node-kstat).

## Instructions
* clone this repo
* cd into mpstat-browser/ and run 'npm install'
* start server with 'node app.js'
* browse to hostname:8000/
* set the 'host to monitor' field to the IP of the machine running app.js
* click Start, mpstat output should start to appear
