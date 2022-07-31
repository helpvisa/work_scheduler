//**** query elements on page ****//
var dateHeaderEl = $("#current-day");
var plannerEl = $("#planner");


//**** global variables ****//
var currentDate = moment(); // call moment.js to get the current date in local time
var currentPlans = [] // stores dynamically created plans (can be looped over to modify, save, load into, etc)
var savedPlans = JSON.parse(localStorage.getItem("plans"));


//**** main body of code ****//
// update date every second for super accurate timekeeping!
updateHeader(); // set initial date
setInterval(updateHeader, 1000 * 10); // update every 10 seconds (make sure minute value is *mostly* in sync, updating less often would lead to desync)

// generate hourly timeslots
for (var i = 9; i < 18; i++) { // 9 - 5 workday!
    var currentEntry = createHourEntry(i);
    plannerEl.append(currentEntry);
}
// create empty array if no savedata could be loaded
if (!savedPlans) {
    savedPlans = []
}
// otherwise load plans
else {
    loadPlans();
    updatePlans();
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

    // loop over current plans and alter colour
    for (var i = 0; i < currentPlans.length; i++) {
        // id is also the hour corresponding to each plan!
        var planHour = currentPlans[i].id;
        // get corresponding page element
        var pEl = $("#hour-" + planHour);

        // set colour
        if (currentHour < planHour) {
            pEl.addClass("future");
        }
        else if (currentHour === planHour) {
            pEl.addClass("present");
        }
        else {
            pEl.addClass("past");
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

    // update plans list in localStorage
    localStorage.setItem("plans", JSON.stringify(currentPlans));
}

// load saved plan data into locally stored plan data
function loadPlans() {
    for (var i = 0; i < currentPlans.length; i++) { // iterate through list and pull id
        var id = currentPlans[i].id;
        // loop through loaded plan table and find match
        // slower nested loop, but using id is not reliant on the two being in the same order, and load is only performed once
        for (var l = 0; l < savedPlans.length; l++) {
            if (savedPlans[l].id === id) { // match found
                currentPlans[i].text = savedPlans[i].text; // set text
                var pEl = $("#hour-" + id).find("p");
                pEl.text(currentPlans[i].text); // set element text
                if (pEl.text().replace(".", "") != "No plans") {
                    pEl.removeClass("font-italic text-secondary");
                }
            }
        }
    }
}