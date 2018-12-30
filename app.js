var port = process.env.PORT || 3000,
    http = require('http'),
    fs = require('fs'),
    //dataCollection = require('./dataCollection'),
    html = fs.readFileSync('index.html'),
    mystocksjs = fs.readFileSync('myStocks.js'),
    simdatajs = fs.readFileSync('simData.js');

var log = function(entry) {
    fs.appendFileSync('/tmp/invest-data.log', new Date().toISOString() + ' - ' + entry + '\n');
};

var server = http.createServer(function (req, res) {
    if (req.method === 'POST') {
        var body = '';

        req.on('data', function(chunk) {
            body += chunk;
        });

        req.on('end', function() {
            if (req.url === '/') {
                log('Received message: ' + body);
            } else if (req.url = '/scheduled') {
                log('Received task ' + req.headers['x-aws-sqsd-taskname'] + ' scheduled at ' + req.headers['x-aws-sqsd-scheduled-at']);
            }

            res.writeHead(200, 'OK', {'Content-Type': 'text/plain'});
            res.end();
        });
    } else {
        if (req.url === '/myStocks.js') {
          res.writeHead(200);
          res.write(mystocksjs);
          res.end();
        }
        else if (req.url === '/simData.js') {
          res.writeHead(200);
          res.write(simdatajs);
          res.end();
        }
        else {
          res.writeHead(200);
          res.write(html);
          res.end();
        }
    }
});

//function periodicTask() {
//    log("Jeff's Periodic Task");
//    dataCollection.setTimeInterval("1d");
//    dataCollection.collectStockData("CSCO");
//}

// Listen on port 3000, IP defaults to 127.0.0.1
server.listen(port);

// add a periodic task for performing backend management functions
//setInterval(periodicTask, 60000);

// Put a friendly message on the terminal
console.log('Server running at http://127.0.0.1:' + port + '/');
