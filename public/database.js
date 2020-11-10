let dataBase;
// create a request for budget database
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function(event) {
  const database = event.target.result;
  database.createObjectStore("pending", { autoIncrement: true });
};

// check if app is online
request.onsuccess = function(event) {
  dataBase = event.target.result;
  if (navigator.onLine) {
    checkDatabase();
  }
};

//Error 
request.onerror = function(event) {
  let error = event.target.errorCode;
  console.log("Error " + error);
};

function saveRecord(record) {
    // create a transaction on db
  const transaction = dataBase.transaction(["pending"], "readwrite");
    // accessing pending object store
  const store = transaction.objectStore("pending");
    // adding record to store
  store.add(record);
}

function checkDatabase() {
    // opening transaction on db
  const transaction = dataBase.transaction(["pending"], "readwrite");
    // accessing pending object store
  const store = transaction.objectStore("pending");
    // get records from the store and set to a variable
  const getAll = store.getAll();

  getAll.onsuccess = function() {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
      .then(response => response.json())
      .then(() => {
        // open a transaction on pending db if successful
        const transaction = dataBase.transaction(["pending"], "readwrite");
        // access pending object store
        const store = transaction.objectStore("pending");
        // clear items
        store.clear();
      });
    }
  };
}
// listen for app coming back online
window.addEventListener("online", checkDatabase);