// This is the main js file for the extension.
let lastStatus;
let lastTime;

let refreshDelay = 60000;

let statusMessage;
let timeMessage;

// updates the status of chatGPT via the api
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

// initializes stored variables and starts main function
async function init() {
  try {
    console.log("init started");
    refreshDelay = await browser.storage.local.get({ refreshRate: 60000 });
    console.log(refreshDelay);

    // Start the interval to call the main function
    setInterval(main, refreshDelay.refreshRate);
    main(); // Call the main function immediately
  } catch (err) {
    console.log("Error: " + err);
    main();
  }
}

// checks periodically for outages and changes icon accordingly
async function main() {
  let results = await updateStatus();
  lastStatus = results.status;
  lastTime = results.time;
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
  console.log("Main completed. Status is " + lastStatus);
}

browser.runtime.onStartup.addListener(init);
browser.browserAction.onClicked.addListener(init);
init();
