// How to use Javascript/jQuery to add data to a Page

// A few things to note:
// - If a concept doesn't make sense, spend a few minutes googling it (maybe syntax, anonymous functions, json, anything). Please post the question on slack before giving up!!
// - HTML organizes chunks of the website
// 	We can format the content by placing items into different tag containers (div, i, span; these are fairly arbitrary once formatted so you can technically just use only divs)
// - CSS stylizes tag containers. 
// 	While each tag has it's own styling, we can use CSS to change divs, format the content within it, etc.
// - Javascript creates functionality to our page.
// 	JS and jQuery (used mostly for ease) will be used to grab the data, format the data into HTML tags, and append HTML onto the page




// 1. Grabbing the data

// We first need to know where our files are located. flc_mobile/www contains all our necessary files (from now on the nested location or "/").

// /events.html contains our html content
// /js/events.js contains our js
// /css/events.css contains our css
// /testEvents.json contains our json data that we'll be grabbing next

// To grab the data, we open our js file and add the following code

// creates an empty variable called eventsData where we can store everthing. we define this as empty beforehand so we can access it outside of the getJSON scope later
var eventsData;

// $. indicates we're accessing the jQuery library (so we don't have to do a bunch of nasty javascript)
// getJSON is a built in anonymous function with parameters that allow us to grab json content and read it
// it starts out reading right from our nested location for whatever reason (events.js/../) so we just indicate "testEvents.json" as our first argument
// ,function(data) is the javascript syntax for an anonymous function and getJSON automatically passes the json data with whatever the data argument is
// { eventsData = data; } is the syntax that allows us to define our previously established variable with the json object (dictionaries within an array within a dictionary or something like that)
$.getJSON("testEvents.json", function(data) {
	eventsData = data;
}

// this is the print of javascript and we're printing eventsData object which is also our getJSON data argument passed earlier
console.log(eventsData);




// 2. Reading the output
// We need to run this code in your browser of choice. We can do that by going to the events HTML page and hovering over the upper right corner to open the browser. Once it's open, see how to view the console (google it because it's different for every browser). You should be able to see the printed object and open it and look at the contents inside. See how everything is organized and how you might be able to read the content which we'll discuss next.

// To read the content, we have to access indices of arrays or keys of dictionaries. A quick recap on arrays and dictionaries in case they don't teach it: arrays are lists of values that can be accessed by an ordered number starting from zero

	// ex. to access the third element of 
		var myList = ["cat", "dog", "hat"] 
	// we print the "position or index" (starting from 0, 1, and our position 2) of the "third value" (starting from cat, dog, and our value hat)
		console.log(myList[2])

// Dictionaries are similar but imagine the "position or index" being a title that we can choose

	var myList = {
		animal: "cat",
		otherAnimal: "dog",
		clothing: "hat"
	}
	// to access hat, we would do console.log(myList["clothing"]) or myList.clothing (preferably the first). We are accessing it via the key instead of the index
	// clothing: "hat" is a key: "value" (key-value) pair

// **Going back to the other stuff, to modify our output of events, we want to access it similarly.
// - We start out with our base object which is current being accessed with console.log(eventsData) (from now on referenced as just eventsData)
// - If we look at the browser console that we opened earlier, we'll see that within that is a testEvents array. Since our main object is a dictionary (we can tell because it has curly brackets in the json file), we need to access the testEvents array within it by using eventsData['testEvents']
// - We should see an array being printed with 12 objects inside of it. We can access these objects (dictionaries) by using square brackets because the parent eventsData['testEvents'] is an array. We access this by doing eventsData['testEvents'][0] where 0 can be 0-11, or any of the 12 indices of the array
// - Once we access a particular object within testEvents, we can grab the final item we need: the text of one of the values. Let's grab the "name" key of the dictionary. This can be done the same way we did test events: eventsData['testEvents'][0]['name']. This will print the name that we were looking for in your browser.




// 3. Creating the objects in HTML
// While we can make a for loop to access all the data, let's first think about making a for loop to create all the HTML objects. I've made a demo object using HTML and CSS that should already be in events.html between lines 32 to 50. Our container that will hold all the event objects has an id (a unique identifer that use to associate CSS to an HTML tag or the way we can grab HTML in javascript). The id is on line 30 and is called "schedule-container". Our actual object that we'll be "mapping" our data to and replicating it over and over is called "event-object".

// Look inside "event-object" and you will see four sections of text: the title, date, campus, and location (don't worry about time right now). Think about the abstract steps you would take to get your data onto the HTML. The way I did it was:
// - wait until the json code is done grabbing the json data and writing it to eventsData
// - make a for loop that loops once for each of the 12 indices of 'testEvents' array
// - grab the data within each index and store it in a separate temporary variable (tempTitle, tempDate, etc)
// - somehow recreate all the div and id stuff from the html into our javascript loop and put the string stored in tempTitle, tempDate, etc. within their respective divs
// - push this newly created section of HTML into our schedule-container

// You could google the answers to all these questions, but to make it easy here's the syntax for doing all of this:

// our initial code we made earlier
$.getJSON("testEvents.json", function(data) {
    eventsData = data;

// waits until getJSON is done. this is a condition we can find in getJSON documentation (along with many others)
}).done(function () {

// this is a jQuery .each loop built-in function which lets us plug in the testEvents array and pass index and value (arbitary argument names) as the index and value
    $(eventsData['testEvents']).each(function(index, value) {

// this piece is grabbing the title of the specific index we're on and storing it as the variable eventTitle. This is grabbing 'name' key within the value argument on the previous line
		var eventTitle = value['name'];

// this gets the #schedule-container id (all ids start with #, all classes start with .) and lets us append HTML code to it. This is all built in jquery hence the $
// the " + eventTitle + " says that we're stopping the string ("<div class='event-object'>") and we're now looking at javascript. + allows us to concatenate index in that position as a dynamic piece of the string. 
// The eventTitle piece is a string title that will be plaed into the HTML object
        $("#schedule-container").append("<div class='event-object'>" + eventTitle + "</div>")
    });
});

// if we run this code, we'll see that our page is actually generating the event-object with the eventTitle inside of it.
// This looks ugly because the rest of the formatting isn't there. I will let you go on to get the rest of the event-object divs and spans and plug in the data the same way we did eventTitle.
// If you have questions, please feel free to ask on Slack. 

// here's all the code we added within events.js up until the end
var eventsData;

$.getJSON("testEvents.json", function(data) {
    eventsData = data;
}).done(function () {
    $(eventsData['testEvents']).each(function(index, value) {
        var eventTitle = value['name'];
        $("#schedule-container").append("<div class='event-object'>" + eventTitle + "</div>");
    });
});


