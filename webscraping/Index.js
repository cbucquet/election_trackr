// PUPPETEER LIBRARY
const puppeteer = require('puppeteer');

//FIREBASE LIBRARY
const firebase = require("firebase/app");
// Add the Firebase products that you want to use
require("firebase/database");

//INITIALIZE FIREBASE
var firebaseConfig = {
    apiKey: "AIzaSyADHciJTFOF_UHtJbRrd-u6E1QnGC-uvnU",
    authDomain: "election-trackr.firebaseapp.com",
    databaseURL: "https://election-trackr.firebaseio.com",
    projectId: "election-trackr",
    storageBucket: "election-trackr.appspot.com",
    messagingSenderId: "562031440970",
    appId: "1:562031440970:web:5dd7ea20b03a4ed75222b3",
    measurementId: "G-BZN7LWDT90"
};
firebase.initializeApp(firebaseConfig);
var database = firebase.database();

// URL FOR WEB SCRAPING (REPLACE BBBBBB AND OTHERS BY REQUEST OPTIONS)
const url = "https://twitter.com/search?q=(BBBBBB)%20OR%20(%23BBBBBB2020%20OR%20%23BBBBBB)&src=typed_query&f=live"

// USER AGENT FOR CHROMIUM
const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 Safari/537.36";

//GET DATE
var date = Date.now();

//DICTIONARY OF ALL RATES
var rates = {};

//FUNCTION: DOES THE WEB SCRAPING
async function getData(lastName) {
    try {
        const browser = await browserPromise;
        const context = await browser.createIncognitoBrowserContext();
        let page = await context.newPage();
        await page.setUserAgent(userAgent);
        await page.setViewport({
            width: 800,
            height: 6000,
        });
        await page.setDefaultNavigationTimeout(120000);
        const realURL = url.replace(/BBBBBB/g, lastName);
        console.log(realURL);

        await page.goto(realURL);
        await page.waitFor(10000); 
        await page.mouse.move(
            200,
            200
        );
        await page.waitFor(1000);
        let results = [];

        const numberTweets = 10;
        let j = 0;
        let safe = true
        while(results.length<numberTweets) {
            const scrollValue = 100*j
            await page.evaluate('window.scrollTo(0,'+String(scrollValue)+')');
            await page.waitFor(300);
            const currenResults2 = await page.$$eval("article", tweets => {
                return tweets.map(tweet => {
                    const properties = {};
                    if(tweet.querySelector("span") !== null){
                        if(tweet.querySelector("span").querySelector("span") !== null && tweet.querySelector("time") !== null) {
                            properties.name = tweet.querySelector("span").querySelector("span").innerText;
                            properties.date = tweet.querySelector("time").getAttribute("datetime");
                        }
                    }
                    return properties;
                });
            })
            for(const tweet of currenResults2) {
                if(!isIncluded(results,tweet)){ // && results.length<numberTweets) {
                    results.push(tweet)
                }
            }
            j+=1
            if(results.length===0){
                if(safe){
                    safe = false
                }
                else{
                    throw new Error("0");
                    //console.log("error", lastName, state);
                    //break;
                }

            }
            console.log(results.length);
        }

        console.log("*** DONE! ***");
        const first = new Date(results[0].date)
        const last = new Date(results[results.length-1].date)
        const diff = (first.getTime()-last.getTime())/1000
        console.log("Total time interval:", diff, "seconds")
        console.log(lastName, "rate:", (results.length/diff)*60*60, "tweet/hour");

        rates[lastName] = results.length/diff
        context.close();
        processAll();

    }
    catch(err) {
        console.log(err);
        context.close();
        processAll();
    }

}

// FUNCTION: CHECK IF TWEET HAS ALREADY BEEN COUNTED IN ARRAY
// RETURN TRUE OR FALSE
function isIncluded(arr, val){
    for(const a of arr) {
        if(a.name === val.name && a.date === val.date) {
            return true
        }
    }
    return false
}

//FUNCTION: UPDATES THE VALUES IN THE DATABASE
function updateDatabase(){
    firebase.database().ref(date).set(rates)
    .then((truc) => {
        //process.exit(1);
        i = 0
        date = Date.now();
        processAll();
    });
}


//FUNCTION: LAUNCHES THE WEBSCRAPING
var i = 0;
function processAll() {
    if(i>6) {
        return;
    }
    setTimeout(function() {
        if(i===2){
            updateDatabase();
        }
        else {
            if(i%2==0){
                rates = {"trump": 0, "biden": 0}
                getData("trump")
            }
            else{
                getData("biden");
            }
            i++;
        }
    }, 20000);
}



//LAUNCH BROWSER INSTANCE
const browserPromise = puppeteer.launch({
    headless: false,
    executablePath: "/usr/bin/chromium-browser",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
});

//SCHEDULE THE WEBSCRAPING (EVERY 10 MINUTES)
var cron = require('node-cron');

cron.schedule('0,10,20,30,40,50 * * * *', () => {
    console.log("Starting new process!");
    processAll();
});

//processAll();




