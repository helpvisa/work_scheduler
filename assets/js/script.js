//**** query elements on page ****//
var plannerEl = $("#planner");


//**** global variables ****//
var currentDate = moment(); // call moment.js to get the current date in local time
var onScreenDate = moment();
var dayDisplay = currentDate.get("month") + "-" + currentDate.get("date"); // which day to display
var currentPlans = [] // stores dynamically created plans (can be looped over to modify, save, load into, etc)
var savedPlans;


//**** main body of code ****//
// update date every second for super accurate timekeeping!
updateHeader(); // set initial date
setInterval(updateHeader, 1000 * 10); // update every 10 seconds (make sure minute value is *mostly* in sync, updating less often would lead to desync)

// generate hourly timeslots
for (var i = 9; i < 18; i++) { // 9 - 5 workday!
    var currentEntry = createHourEntry(i);
    plannerEl.append(currentEntry);
}

loadPlans();
updatePlans();

// add datepicker to current day header
$(".jumbotron").on("click", "#current-day", function() {
    // convert to input
    var dateInput = $("<input>")
        .addClass("form-control col-4 col-sm-3 col-md-2 m-auto")
        .attr("id", "current-day")
        .val(currentDate.format("ddd, MMM DD, h:mm a"));

    // replace original element
    $(this).replaceWith(dateInput);
        
    // enable datepicker
    dateInput.datepicker();
    // focus
    dateInput.trigger("focus");
});
// update on close
$(".jumbotron").on("change", "#current-day", function() {
    // get new date
    var date = $(this)
        .val()
        .trim();
    
    var momentDate = moment(date, "MM/DD/YYYY");

    // make sure hour and minute are the same
    momentDate.set("hour", currentDate.get("hour"));
    momentDate.set("minute", currentDate.get("minute"));
    onScreenDate = momentDate;

    // convert to text
    var textDate = momentDate.format("ddd, MMM DD, h:mm a");

    // update day to display
    dayDisplay = momentDate.get("month") + "-" + momentDate.get("date")
    loadPlans();
    updatePlans();

    var newHeaderEl = $("<p>");
    newHeaderEl
        .text(textDate)
        .addClass("lead font-weight-bold")
        .attr("id", "current-day");
    
    $(this).replaceWith(newHeaderEl);
});

// check for click events on the hourly timeslots (for editing)
$(".plan").on("click", "p", function() {
    var text = $(this)
        .text()
        .trim();

    var textInput = $("<textarea>")
        .addClass("form-control")
        .val(text);

    $(this).replaceWith(textInput);
    textInput.trigger("focus");
});
// save new updated text on click of save button
$(".save").on("click", function() {
     // get the parent element's id
    var id = $(this)
        .closest(".timeslot")
        .attr("id")
        .replace("hour-", "");

    // get the plan's current value/text using id
    var planEl = $("#hour-" + id).find("textarea");
    var text = planEl
        .val()
        .trim();

    // recreate plan text element
    var newPlan = $("<p>")
        .addClass("plan my-auto overflow-hidden p-1")
        .text(text);
    
    if (newPlan.text().replace(".", "") === "No plans") { // set to italic if no plans / unchanged to differntiate
        newPlan.addClass("font-italic text-secondary");
    }

    planEl.replaceWith(newPlan);
    savePlan(id, text);
});


//**** functions ****//
// update date header at top of page
function updateHeader() {
    currentDate = moment(); // update moment
    // make sure on screen date matches w chosen date on calendar
    onScreenDate.set("hour", currentDate.get("hour"));
    onScreenDate.set("minute", currentDate.get("minute"));

    $(".jumbotron").find("#current-day").text(onScreenDate.format("ddd, MMM DD, h:mm a"));

    updatePlans(); // update plans here too, since it will be called every ten seconds
}

// create and return date slot for planner date list
function createHourEntry(rawTime) {
    var time = rawTime; // rawTime will be used for id, time will be used for am/pm display
    // uses 24 hour clock for code purposes
    var amPm = "AM";
    // if 1pm or later, set 12-hour clock values
    if (time > 11) {
        amPm = "PM";
    }
    if (time > 12) {
        time -= 12;
    }

    // create timeslot container
    var timeSlotParentEl = $("<section>");
    timeSlotParentEl.addClass("col-12 p-0");
    var timeSlotChildEl = $("<div>");
    timeSlotChildEl.addClass("timeslot row m-1");
    timeSlotChildEl.attr("id", "hour-" + rawTime)

    // hour element
    var hour = $("<div>");
    hour.addClass("col-2 col-lg-1 rounded border-left border-top border-bottom border-dark pl-0 hour text-center font-weight-bold"); // create hour display
    hour.text(time + amPm);

    // main plan content
    var plan = $("<div>");
    plan.addClass("plan col-8 col-lg-10 rounded border border-dark d-flex");
    var planText = $("<p>");
    planText.addClass("my-auto font-italic text-secondary overflow-hidden p-1");
    planText.text("No plans.");
    plan.append(planText);

    // save button
    var save = $("<div>");
    save.addClass("save col-2 col-lg-1 align-middle d-flex align-items-center justify-content-center btn btn-success");
    // save icon
    var saveIcon = $("<span>");
    saveIcon.addClass("oi oi-hard-drive");
    // add icon to save button
    save.append(saveIcon);

    // add these subsections to timeslot container
    timeSlotChildEl.append(hour, plan, save);
    timeSlotParentEl.append(timeSlotChildEl);

    // create entry for script-level plans array
    var planObj = {
        id: rawTime,
        text: "No plans.",
    }
    currentPlans.push(planObj);

    return timeSlotParentEl;
}

 // update hourly plan entries (change colours as time passes, when plans are loaded, etc)
function updatePlans() {
    // get current hour time
    var currentHour = parseInt(moment().format("H")); // convert to int for easy comparisons
    var actualCurrentDay = currentDate.get("month") + "-" + currentDate.get("date");
    // split dates into two parts (month / day) to get past / future
    var displayDateArray = dayDisplay.split("-");
    var currentDateArray = actualCurrentDay.split("-");
    for (var i = 0; i < 2; i++) { // convert to int
        displayDateArray[i] = parseInt(displayDateArray[i]);
        currentDateArray[i] = parseInt(currentDateArray[i]);
    }

    // loop over current plans and alter colour
    for (var i = 0; i < currentPlans.length; i++) {
        // id is also the hour corresponding to each plan!
        var planHour = currentPlans[i].id;
        // get corresponding page element
        var pEl = $("#hour-" + planHour);

        // set colour
        if (actualCurrentDay === dayDisplay) {
            if (currentHour < planHour) {
                pEl.removeClass("past present");
                pEl.addClass("future");
            }
            else if (currentHour === planHour) {
                pEl.removeClass("past future");
                pEl.addClass("present");
            }
            else {
                pEl.removeClass("present future");
                pEl.addClass("past");
            }
        }
        else {
            if (displayDateArray[0] === currentDateArray[0]) { // same month; find day
                if (displayDateArray[1] < currentDateArray[1]) { // in past
                    pEl.removeClass("present future");
                    pEl.addClass("past");
                }
                else { // future (would not get this far if it was present day)
                    pEl.removeClass("past present");
                    pEl.addClass("future");
                }
            }
            else if (displayDateArray[0] < currentDateArray[0]) { // past month
                pEl.removeClass("present future");
                pEl.addClass("past");
            }
            else { // future month
                pEl.removeClass("past present");
                pEl.addClass("future");
            }
        }
    }
}

// save hourly entries (called whenever a plan is updated)
function savePlan(id, text) {
    // loop through current plans and match id
    for (var i = 0; i < currentPlans.length; i++) {
        if (currentPlans[i].id === parseInt(id)) { // match found
            currentPlans[i].text = text;
        }
    }

    if (savedPlans.length === 0) { // if no days are stored, create an index for the current day
        var dayObj = {
            day: dayDisplay,
            plans: []
        }
        savedPlans.push(dayObj)
        savedPlans[savedPlans.length - 1].plans = [].concat(currentPlans);
    }
    else {
        var foundDay = false;
        for (var i = 0; i < savedPlans.length; i++) { // is this day already indexed? let's find it
            if (savedPlans[i].day === dayDisplay) { // it is!
                savedPlans[i].plans = [].concat(currentPlans); // create copy of current plans to store in this slot
                foundDay = true;
                break; // exit the loop
            }
        }
        if (!foundDay) {
            // for loop completed without breaking, hence this day was not found, so let's store it
            var dayObj = {
                day: dayDisplay,
                plans: []
            }
            savedPlans.push(dayObj); // create index
            savedPlans[savedPlans.length - 1].plans = [].concat(currentPlans); // tack plans on the end
        }
    }

    // update plans list in localStorage
    localStorage.setItem("plans", JSON.stringify(savedPlans));
}

// load saved plan data into locally stored plan data
function loadPlans() {
    savedPlans = JSON.parse(localStorage.getItem("plans"));
    if (!savedPlans) {
        savedPlans = []
    }

    var loadedPlans = null; // temp variable to store which plans are being loaded
    for (var i = 0; i < savedPlans.length; i++) { // loop through the indices of the saved plans
        if (savedPlans[i].day === dayDisplay) { // we found the right day
            loadedPlans = [].concat(savedPlans[i].plans); // let's load it
        }
    }

    if (!loadedPlans) { // no index found for today; let's back out of the function
        for (var i = 0; i < currentPlans.length; i++) {
            currentPlans[i].text = "No plans.";
            var pEl = $("#hour-" + currentPlans[i].id).find("p");
            pEl.text(currentPlans[i].text); // set element text
            pEl.addClass("font-italic text-secondary");
        }
        return;
    }

    for (var i = 0; i < currentPlans.length; i++) { // iterate through list and pull id
        var id = currentPlans[i].id;
        // loop through loaded plan table and find match
        // slower nested loop, but using id is not reliant on the two being in the same order
        for (var l = 0; l < loadedPlans.length; l++) {
            if (loadedPlans[l].id === id) { // match found
                currentPlans[i].text = loadedPlans[i].text; // set text
                var pEl = $("#hour-" + id).find("p");
                pEl.text(currentPlans[i].text); // set element text
                if (pEl.text().replace(".", "") != "No plans") {
                    pEl.removeClass("font-italic text-secondary");
                }
                else {
                    pEl.addClass("font-italic text-secondary");
                }
            }
        }
    }
}