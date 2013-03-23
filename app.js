var express = require('express');
var kstat = require('kstat');

var app = express();

app.use(express.static(__dirname + '/static'));

app.get('/kstats/:module/:instance/:name', function(req, res){

        var filter = {};

        filter["module"] = req.params.module;

        if (req.params.instance ==! '*')
                filter["instance"] = parseInt(req.params.instance, 10);

        //handle multiple semicolon-separated values for stat 'name'
        var stats = req.params.name.split(';');

        var results = {};

        var reader = {};

        for (var i=0; i < stats.length; i++) {
                var stat = stats[i];

                filter["name"] = stat;

                reader[stat] = new kstat.Reader(filter);

                results[stat] = reader[stat].read();
        }

        // Set response header to enable cross-site requests
        res.header('Access-Control-Allow-Origin', '*');

        res.send(results);

});

// Only listen on $ node app.js

if (!module.parent) {
  var server = app.listen(8000);
  console.log("kstat server listening on port %d", server.address().port);
}
