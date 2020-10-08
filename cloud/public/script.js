// Get a reference to the database service
var database = firebase.database();

//DATE
const currentDate = Date.now();

//FOR MINUTES
var statesRates = {};
var commonRate = [0,0];

//FOR HOURS + HOURLY TREND
const lastHourBeginning = currentDate - 1000*60*60;
const lastHourEnd = currentDate - 2*1000*60*60;
var lastHourRate = [0,0];
var totLastHour = 0;
var thisHourRate = [0,0];
var totThisHour = 0;

//FOR DAYS + DAILY TREND
const lastDayBeginning = currentDate - 1000*60*60*24;
const lastDayEnd = currentDate - 2*1000*60*60*24;
var lastDayRate = [0,0];
var totLastDay = 0;
var thisDayRate = [0,0];
var totThisDay = 0;

//FOR WEEKS + WEEKLY TREND
const lastWeekBeginning = currentDate - 1000*60*60*24*7;
const lastWeekEnd = currentDate - 2*1000*60*60*24*7;
var lastWeekRate = [0,0];
var totLastWeek = 0;
var thisWeekRate = [0,0];
var totThisWeek = 0;



// *** MARK - FUNCTIONS ***

function updateCount() {
    const seconds = new Date().getSeconds();
    const minutes = new Date().getMinutes();
    const hours = new Date().getHours();
    const days = new Date().getDay()

    
    //Update Trump labels
    //console.log(statesRates, commonRate);
    const minuteCount = Math.round(seconds*commonRate[0]);
    document.getElementById("trumpminute").innerText = minuteCount;

    const hourCount = Math.round(minutes*thisHourRate[0] + minuteCount);
    document.getElementById("trumphour").innerText = hourCount;

    const dayCount = Math.round(hours*thisDayRate[0] + hourCount);
    document.getElementById("trumpday").innerText = dayCount;

    const weekCount = Math.round(days*thisWeekRate[0] + dayCount);
    document.getElementById("trumpweek").innerText = dayCount;


    //Update Biden labels
    //document.getElementById("trumpminute").innerText = Math.round(seconds*commonRate[0]);
}

function updateTrends() {
  //Update Trump labels
  document.getElementById("trumptrendminute").innerText = correctPercentage(Math.floor(Math.random() * 11)-5);

  if(totLastHour === 0){
    document.getElementById("trumptrendhour").innerText = "...";
  }
  else{
    document.getElementById("trumptrendhour").innerText = correctPercentage((thisHourRate[0]-lastHourRate[0])/lastHourRate[0]);
  }
  
  if(totLastDay === 0){
    document.getElementById("trumptrendday").innerText = "...";
  }
  else{
    document.getElementById("trumptrendday").innerText = correctPercentage((thisDayRate[0]-lastDayRate[0])/lastDayRate[0]);
  }

  if(totLastWeek === 0){
    document.getElementById("trumptrendweek").innerText = "...";
  }
  else{
    document.getElementById("trumptrendweek").innerText = correctPercentage((thisWeekRate[0]-lastWeekRate[0])/lastWeekRate[0]);
  }

  //document.getElementById("trumptrendweek").innerText = Math.floor(Math.random() * 11)-5;
  document.getElementById("trumprate").innerText = Math.floor(commonRate[0]*60*10)/10;
}


function correctPercentage(percentage) {
  if(percentage>0){
    return "+"+Math.floor(percentage*10)/10+"%"
  }
  return Math.floor(percentage*10)/10+"%"

}


function getCurrentRates() {
  var ref = firebase.database().ref("/");
  ref.on('value', function(snapshot) {
    let value = snapshot.val();

    for(let keyDate in value) {
      //Data Attributes
      const dateRates = value[keyDate];
      const date = parseInt(keyDate);

      
      const trumpCurrentRate = parseInt(value["trump"])
      const bidenCurrentRate = parseInt(value["biden"])
      if(trumpCurrentRate > 0){
        commonRate[0] = trumpCurrentRate;
      }
      if(bidenCurrentRate > 0) {
        commonRate[1] =  bidenCurrentRate;
      }
      console.log(commonRate);

      if(lastHourEnd<=date && date<=lastHourBeginning) {
        lastHourRate[0] = (lastHourRate[0]*totLastHour + commonRate[0])/(totLastHour+1);
        lastHourRate[1] = (lastHourRate[1]*totLastHour + commonRate[1])/(totLastHour+1);
        totLastHour += 1;
      }
      else if(lastHourBeginning<date) {
        thisHourRate[0] = (thisHourRate[0]*totThisHour + commonRate[0])/(totThisHour+1);
        thisHourRate[1] = (thisHourRate[1]*totThisHour + commonRate[1])/(totThisHour+1);
        totThisHour += 1;
      }

      if(lastDayEnd<=date && date<=lastDayBeginning) {
        lastDayRate[0] = (lastDayRate[0]*totLastDay + commonRate[0])/(totLastDay+1);
        lastDayRate[1] = (lastDayRate[1]*totLastDay + commonRate[1])/(totLastDay+1);
        totLastDay += 1;
      }
      else if(lastDayBeginning<date) {
        thisDayRate[0] = (thisDayRate[0]*totThisDay + commonRate[0])/(totThisDay+1);
        thisDayRate[1] = (thisDayRate[1]*totThisDay + commonRate[1])/(totThisDay+1);
        totThisDay += 1;
      }

      if(lastWeekEnd<=date && date<=lastWeekBeginning) {
        lastWeekRate[0] = (lastWeekRate[0]*totLastDay + commonRate[0])/(totLastWeek+1);
        lastWeekRate[1] = (lastWeekRate[1]*totLastDay + commonRate[1])/(totLastWeek+1);
        totLastWeek += 1;
      }
      else if(lastWeekBeginning<date) {
        thisWeekRate[0] = (thisWeekRate[0]*totThisDay + commonRate[0])/(totThisWeek+1);
        thisWeekRate[1] = (thisWeekRate[1]*totThisDay + commonRate[1])/(totThisWeek+1);
        totThisWeek += 1;
      }
    }
    
    const createClock = setInterval(updateCount, 1000);
    updateTrends();
  });

}



getCurrentRates()