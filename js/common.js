// This is the main js file for the extension.
let lastStatus;
let lastTime;

let refreshDelay = 60000;

let statusMessage;
let timeMessage;

let mainLoop;

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
    refreshDelay = await browser.storage.sync.get({ refreshRate: 60000 });
    console.log(refreshDelay);

    // Start the interval to call the main function
    console.log(
      `will refresh every ${refreshDelay.refreshRate / 60000} seconds`
    );
    mainLoop = setInterval(main, refreshDelay.refreshRate);
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
    browser.browserAction.setIcon({ path: "icons/128/warning.png" });
  } else if (lastStatus == "major_outage") {
    statusMessage = "ChatGPT is experiencing a major outage.";
    browser.browserAction.setIcon({ path: "icons/128/error.png" });
  } else if (lastStatus == "operational") {
    statusMessage = "ChatGPT is fully operational.";
    browser.browserAction.setIcon({ path: "icons/128/operational.png" });
  }
  console.log("Main completed. Status is " + lastStatus);
}

// stops the setInterval(), updates refresh rate, and starts it up again.
function updateRate() {
  console.log("updating refresh rate");
  clearInterval(mainLoop);
  init();
}

// if a chatGPT tab is open, switch to that. Otherwise, open a new chatGPT tab.
function openChatGPT() {
  browser.tabs.query({ currentWindow: true }, (tabs) => {
    let gptOpen = false;
    tabs.forEach((tab) => {
      if (tab.url.includes("chat.openai.com")) {
        browser.tabs.update(tab.id, { active: true });
        gptOpen = true;
      }
    });

    if (!gptOpen) {
      browser.tabs.create({ url: "https://chat.openai.com" });
    }
  });
}

browser.runtime.onStartup.addListener(init);
browser.browserAction.onClicked.addListener(openChatGPT);
browser.runtime.onMessage.addListener(updateRate);
init();
