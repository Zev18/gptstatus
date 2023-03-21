// This is the main js file for the extension.
var lastStatus;
var lastTime;

const refreshDelay = 60000;

var statusMessage;
var timeMessage;

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
  lastStatus = results.status;
  lastTime = results.time;
  console.log(results);
  if (lastStatus == "partial_outage") {
    statusMessage = "ChatGPT is partially down.";
    browser.browserAction.setIcon({ path: "icons/yellow_icon.png" });
  } else if (lastStatus == "major_outage") {
    statusMessage = "ChatGPT is experiencing a major outage.";
    browser.browserAction.setIcon({ path: "icons/red_icon.png" });
  } else if (lastStatus == "operational") {
    statusMessage = "ChatGPT is fully operational.";
    browser.browserAction.setIcon({ path: "icons/green_icon.png" });
  }

  setInterval(init, refreshDelay);
}

browser.runtime.onStartup.addListener(init);
browser.browserAction.onClicked.addListener(init);
