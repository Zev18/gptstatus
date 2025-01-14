document.getElementById("saveButton").addEventListener("click", (e) => {
  const refreshRate = document.getElementById("refreshRate").value * 60000;
  browser.storage.sync.set({ refreshRate: refreshRate });
  console.log(refreshRate);
  browser.runtime
    .sendMessage({
      update: true,
    })
    .then(console.log("success", (error) => console.log(`Error: ${error}`)));
  e.preventDefault();
});

function restoreOptions() {
  let storedRate = browser.storage.sync.get("refreshRate");
  storedRate.then((res) => {
    document.getElementById("refreshRate").value = res.refreshRate / 60000 || 1;
  });
}

document.addEventListener("DOMContentLoaded", restoreOptions);
