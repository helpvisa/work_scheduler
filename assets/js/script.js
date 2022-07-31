//**** query elements on page ****//
var dateHeaderEl = $("#current-day");
var plannerEl = $("#planner");


//**** local variables ****//
var currentDate = moment(); // call moment.js to get the current date in local time


//**** main body of code ****//
// update date every second for super accurate timekeeping!
updateHeader(); // set initial date
setInterval(updateHeader, 1000 * 60); // update

// generate hourly timeslots
for (var i = 9; i < 18; i++) { // 9 - 5 workday!
    var currentEntry = createHourEntry(i);
    plannerEl.append(currentEntry);
}

//**** functions ****//
// update date header at top of page
function updateHeader() {
    currentDate = moment(); // update moment
    var day = currentDate.format("ddd, h:mm a");

    dateHeaderEl.text(day);
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
    timeSlotChildEl.addClass("row m-1");

    // hour element
    var hour = $("<div>");
    hour.addClass("col-2 col-lg-1 rounded border-left border-top border-bottom border-dark p-auto hour-padding text-center font-weight-bold bg-light"); // create hour display
    hour.text(time + amPm);

    // main plan content
    var plan = $("<div>");
    plan.addClass("col-8 col-lg-10 rounded border border-dark bg-light");

    // save button
    var save = $("<div>");
    save.addClass("col-2 col-lg-1 align-middle d-flex align-items-center justify-content-center btn btn-success cursor-");
    save.attr("id", "hour-" + rawTime)
    // save icon
    var saveIcon = $("<span>");
    saveIcon.addClass("oi oi-hard-drive");
    // add icon to save button
    save.append(saveIcon);

    // add these subsections to timeslot container
    timeSlotChildEl.append(hour, plan, save);
    timeSlotParentEl.append(timeSlotChildEl);

    return timeSlotParentEl;
}

function updateHourEntry() { // update hourly entries (change colours as time passes, etc)
    return;
}