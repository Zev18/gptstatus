// This is the main js file for the extension.
var last_status;
var last_time;

var status_message;
var time_message;

async function updateStatus() {
  try {
    const response = await fetch(
      "https://status.openai.com/api/v2/summary.json"
    );
    const data = await response.json();
    const { status, updated_at: time } = data.components[1];
    return { status, time };
  } catch (err) {
    console.log("Error: " + err);
    return { status: undefined, time: undefined };
  }
}

async function init() {
  console.log("init started");
  let results = await updateStatus();
  last_status = results.status;
  last_time = results.time;
  console.log(results);
  if (last_status == "partial_outage") {
    status_message = "ChatGPT is partially down.";
    browser.browserAction.setIcon({ path: "icons/yellow_icon.png" });
  } else if (last_status == "major_outage") {
    status_message = "ChatGPT is experiencing a major outage.";
    browser.browserAction.setIcon({ path: "icons/red_icon.png" });
  } else if (last_status == "operational") {
    status_message = "ChatGPT is fully operational.";
    browser.browserAction.setIcon({ path: "icons/green_icon.png" });
  }
}

browser.runtime.onStartup.addListener(init);
browser.browserAction.onClicked.addListener(init);
