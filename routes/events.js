// http://web2.heimat.de/cb-out/exports/event/standard/export.php?level=M&startDate=2013-09-07&endDate=2013-09-07&cityIds=2384&limit=300


var request = require('request');
var fs = require('fs');

exports.listDay = function(req, res){
  getCbData(req.params.year, req.params.month, req.params.day, function(csv) {
    console.log(csv);
    // csvData = parseCSV(csv);
    // fs.writeFile('events2.json', JSON.stringify(csvData), function() {
    //   res.json(csvData);
    // });
  });
};

parseCSV = function(csvData) {
  csvData = csvData.toString().replace(/"/g, '');
  var lines = csvData.split(/\r\n|\n/);
  var events = [];
  for (var i in lines) {
    var line = lines[i].split(';');
    events[i] = {
      date: parseDate(line[1], line[2]),
      venue: line[3], // TODO: replace with venueID sometime in the future
      title: line[4],
      artists: line[5].split(', '),
      description: line[6],
      tags: line[7].split(','), // TODO: replace with tagids
      img1: line[8],
      img2: line[10]
    };
  }
  return events.slice(1);
};

parseDate = function(day, time) {
  day = day.split('.');
  time = time.split(':');
  return new Date(parseInt(day[2],10), parseInt(day[1],10)-1, parseInt(day[0],10), parseInt(time[0],10), parseInt(time[1],10)).valueOf();
};

function getCbData (year, month, day, cb) {
  function addZero (num) {
    return parseInt(num, 10)<10 ? '0' + num : num;
  }
  day = addZero(day);
  month = addZero(month);

  request.post('https://out.culturebase.org/home.php', {form:{
    username:'chmanie',
    password:'.lampe'
  }}, function(error, response, body) {
    console.log(day + '.' + month + '.' + year);
    request.post('https://out.culturebase.org/download.php', {form:{
      'dl_method': 'csv_event_download',
      'date_from': day + '.' + month + '.' + year,
      'date_to': day + '.' + month + '.' + year,
      'area': 'city',
      'ac_value': '2384',
      'elements[tag]': true,
      'elements[datum]': true,
      'elements[zeit]': true,
      'elements[vort]': true,
      'elements[titel]': true,
      'elements[ensemble]': true,
      'elements[beschreibung]': true,
      'elements[sparte]': true,
      'elements[bild1]': true,
      'elements[bild1_titel]': true,
      'elements[bild2]': true,
      'elements[bild2_titel]': true
    }}, function(error, response, body) {
      cb(body);
    });
  });
}