function getData(id) {
  return new Promise(function(resolve, reject) {
    var dataAPI1 = "https://www.alphavantage.co/query?";
    var dataAPI2 = "function=" + tSeries;
    var stockSym = id;
    var dataAPI3 = "&symbol=" + stockSym;
    var dataAPI4 = "&interval=" + tInterval;
    var dataAPI5 = "&outputsize=full&apikey=M3JGAXUCWZSS1QMY";
    var priceData = [];
    console.log("Collecting " + stockSym + " Data...");
    $.getJSON(dataAPI1+dataAPI2+dataAPI3+dataAPI4+dataAPI5,{format:"json"}
    ).done(function(data){
      //var data = simData;
      //console.log(stockSym);
      if( data == null || data['Meta Data'] == undefined || data == {} ) {
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

function collectStockData(id) {

  // get the data for this stock
  
  getData(id).then(function (priceData) {
    console.log(priceData[0]);
  });

}
