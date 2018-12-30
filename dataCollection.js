const request = require('request');

var tSeries = "TIME_SERIES_INTRADAY";
var tInterval = "1min";
var endDateValue = new Date();
//var currStockSym = "1"; //S&P 500 Index
//var prevInterval = "1d";
//var stockSymbolList = [];

//tSeries = "TIME_SERIES_INTRADAY";
//tInterval = "1min";
//endDateValue.setTime(startDateValue.getTime());
//endDateValue.setHours(1);

function getData(id) {
  return new Promise(function(resolve, reject) {
    var tmpAPI1 = "https://www.alphavantage.co/query?";
    var tmpAPI2 = "function=" + tSeries;
    var stockSym = id;
    var tmpAPI3 = "&symbol=" + stockSym;
    var tmpAPI4 = "&interval=" + tInterval;
    var tmpAPI5 = "&outputsize=full&apikey=M3JGAXUCWZSS1QMY";
    var dataAPI = tmpAPI1+tmpAPI2+tmpAPI3+tmpAPI4+tmpAPI5;
    var priceData = [];
    console.log("Collecting " + stockSym + " Data...");
    //$.getJSON(dataAPI1+dataAPI2+dataAPI3+dataAPI4+dataAPI5,{format:"json"}
    //).done(function(data){
    request(dataAPI, {json:true}, (err, res, body) => {
      //var data = simData;
      var data = body;
      //console.log(stockSym);
      if( err || data == null || data['Meta Data'] == undefined || data == {} ) {
        console.log("GET " + stockSym + " data failed");
      }
      else {
        //console.log(data['Meta Data']['2. Symbol']);
        console.log(stockSym + " Collection Complete");
        var pData = data['Time Series (' + tInterval + ')'];
        var currDateValue = "";
        var openPrice = {};
        var currentData = false;
        var prevCloseFound = false;
        Object.keys(pData).forEach(function(k) {
          //console.log(k + " " + k.split("-")[0]);
          var tdate =  k.split("-");
          var year = tdate[0];
          var month = parseInt(tdate[1]) - 1;
          var day = tdate[2].slice(0,2);
          tdate = k.split(" ");
          var hour = 0;
          var minute = 0;
          currentData = false;
          if(tdate[1] != undefined) {
            hour = tdate[1].slice(0,2);
            minute = tdate[1].slice(3,5);
          }
          currDateValue = new Date(year,month,day,hour,minute,0,0);
          if(currDateValue >= endDateValue){
            // if we found data within our time range
            currentData = true;
            // the data is stored from end of time period to beginning
            // but we want this reversed so use unshift instead of push
            priceData.unshift({x: 0, y: pData[k]['4. close']});
            // keep overwriting the openPrice until we get to the last datapoint
            // at which point it will be the actual openPrice for this dataset
            openPrice = {x:0,  y: pData[k]['1. open']};
          }
          // the first price data point outside of our date range is the 
          // previous days close, so grab it
          else if(currentData == false && prevCloseFound == false) {
            
            prevCloseFound = true;
            
            // first add the last collected open price which is the
            // open price for the day
            priceData.unshift(openPrice);
            // then add the closing price from the previous day
            priceData.unshift({x:0, y: pData[k]['4. close']});
          }
        });
        // because we filled the data from the end to the beginning we need to go back
        // and populate the 'x' value with an incrementing value from
        // beginning to end
        for(var ii=0; ii<priceData.length; ii++){
          priceData[ii].x = ii;
        }
      }
      resolve(priceData);
    });
  });
}

var dataCollection = {
  //TIME_SERIES_INTRADAY (tInterval = 1min | 5min | 15min | 30min | 60min)
  //TIME_SERIES_DAILY (tInterval = Daily)
  setTimeInterval: function (interval) {
    var DAYS_TO_MS = 24 * 60 * 60 * 1000;
    var startDateValue = new Date();
    var currDay = startDateValue.getDay();

    // set the time to make sure we fall on M-F
    // if Sun then subtract 2 days (in milliseconds)
    // if Sat then subtract 1 day
    var DayOffsetLookup = [2 * DAYS_TO_MS, 0, 0, 0, 0, 0, 1 * DAYS_TO_MS];
    startDateValue.setTime(startDateValue.getTime() - DayOffsetLookup[currDay]);

    // modify tSeries and tInterval to ensure we get the proper amount of
    // data to fill the requested time interval
    switch (interval) {
      case "1d":
        tSeries = "TIME_SERIES_INTRADAY";
        tInterval = "1min";
        endDateValue.setTime(startDateValue.getTime());
        endDateValue.setHours(1);
        break;
      case "5d":
        tSeries = "TIME_SERIES_INTRADAY";
        tInterval = "15min";
        endDateValue.setTime(startDateValue.getTime() - 5 * DAYS_TO_MS);
        break;
      case "3m":
        tSeries = "TIME_SERIES_INTRADAY";
        tInterval = "60min";
        endDateValue.setTime(startDateValue.getTime());
        endDateValue.setMonth(endDateValue.getMonth() - 3);
        break;
      case "6m":
        tSeries = "TIME_SERIES_INTRADAY";
        tInterval = "60min";
        endDateValue.setTime(startDateValue.getTime());
        endDateValue.setMonth(endDateValue.getMonth() - 6);
        break;
      case "1y":
        tSeries = "TIME_SERIES_DAILY";
        tInterval = "Daily";
        endDateValue.setTime(startDateValue.getTime());
        endDateValue.setFullYear(startDateValue.getFullYear() - 1);
        break;
      default:
        console.log("Unknown Interval:" + interval);
        tSeries = "TIME_SERIES_INTRADAY";
        tInterval = "1min";
        endDateValue.setTime(startDateValue.getTime());
        break;
    }
  },

  collectStockData: function (id) {

    // get the data for this stock
    getData(id).then(function (priceData) {
    console.log("Len:" + priceData.length + "[0]" + priceData[0].x + " " + priceData[0].y);
    });

  }
}

module.exports = dataCollection
