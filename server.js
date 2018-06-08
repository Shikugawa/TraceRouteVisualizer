var fetch = require('node-fetch');
var http = require('http');

// request -> {
//   IPAddress: [
//     ...
//   ]
// }
http.createServer((req, res) => {
  const endpoint = "https://geoip.maxmind.com/geoip/v2.1/city/";
  const headers = {
    'Authorization': process.env.GeoipAccessToken,
    'Content-Type': 'application/vnd.maxmind.com-insights+json; charset=UTF-8; version=2.1'
  };

  var request = {
    'IPAddress': []
  }

  var response = {
    'location': []
  }

  req.on('data', chunk => {
    request.IPAddress = JSON.parse(chunk.toString()).IPAddress;
  })

  req.on('end', () => {
    Promise.all(request.IPAddress.map(url =>
        fetch(endpoint + url, { headers: headers }).then(resp => resp.json())
    )).then(json => {
      json.forEach(value => {
        if(value.error){
          return;
        }else{
          response.location.push(
            [value.location.latitude, value.location.longitude]
          )
        }
      })

      console.log(response);
      res.writeHead(200, { 'Content-Type': 'application/json',
                           'Access-Control-Allow-Origin': '*',
                           'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'});
      res.end(JSON.stringify(response));
    })
  })
}).listen(7000, 'localhost');
