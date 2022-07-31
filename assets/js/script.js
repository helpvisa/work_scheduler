//**** query elements on page ****//
var dateHeaderEl = $("#current-day");
var plannerEl = $("#planner");


//**** global variables ****//
var currentDate = moment(); // call moment.js to get the current date in local time
var savedPlans = JSON.parse(localStorage.getItem("plans"));
if (!savedPlans) { // create empty array if no savedata could be loaded
    savedPlans = []
}


//**** main body of code ****//
// update date every second for super accurate timekeeping!
updateHeader(); // set initial date
setInterval(updateHeader, 1000 * 60); // update

// generate hourly timeslots
for (var i = 9; i < 18; i++) { // 9 - 5 workday!
    var currentEntry = createHourEntry(i);
    plannerEl.append(currentEntry);
}

// check for click events on the hourly timeslots (for editing)
$(".plan").on("click", "p", function () {
    var text = $(this)
        .text()
        .trim();

    var textInput = $("<textarea>")
        .addClass("form-control")
        .val(text);

    $(this).replaceWith(textInput)
    textInput.trigger("focus");
});
// save new updated text on click of save button
$(".save").on("click", function () {
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
        .addClass("plan my-auto")
        .text(text);
    
    if (newPlan.text().replace(".", "") === "No plans") { // set to italic if no plans / unchanged to differntiate
        newPlan.addClass("font-italic");
    }

    planEl.replaceWith(newPlan);
});


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
    timeSlotChildEl.addClass("timeslot row m-1");
    timeSlotChildEl.attr("id", "hour-" + rawTime)

    // hour element
    var hour = $("<div>");
    hour.addClass("col-2 col-lg-1 rounded border-left border-top border-bottom border-dark pl-0 hour-padding text-center font-weight-bold bg-light"); // create hour display
    hour.text(time + amPm);

    // main plan content
    var plan = $("<div>");
    plan.addClass("plan col-8 col-lg-10 rounded border border-dark bg-light d-flex");
    var planText = $("<p>");
    planText.addClass("my-auto font-italic");
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

    return timeSlotParentEl;
}

function updateHourEntry() { // update hourly entries (change colours as time passes, etc)
    return;
}