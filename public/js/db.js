const { ServerResponse } = require("http");

let db;
const request = indexedDB.open('budget_tracker', 1);

request.onupgradeneeded = function(upgrade) {
    const db = upgrade.target.result;
    db.createObjectStore('pending_transaction', { autoIncrement: true});
};

request.onsuccess = function(success) {
    db = success.target.result;
    if(navigator.onLine) {
        checkDatabase();
    }
};

request.onerror = function(air) {
    console.log(air.target.errorCode);
};

function saveRecord(record) {
    const transaction = db.transaction(["pending_transaction"], "readwrite");
    const store = transaction.objectStore("pending_transaction");
    store.add(record);
}

function checkDatabase() {
    const transaction = db.transaction(["pending_transaction"], "readwrite");
    const store = transaction.objectStore("pending_transaction");
    const getAll = store.getAll();

    getAll.onsuccess = function (allSuccess) {
        if(getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*', 'Content-Type': 'application/json'
                }
            }).then(response => response.json()).then(ServerResponse => {
                if(ServerResponse.message) {
                    throw new Error(serverResponse);
                }
                const transaction = db.transaction(["pending_transaction"], "readwrite");
                const store = transaction.objectStore("pending_transaction");
                store.clear();

                alert("All your saved transactions have been submitted!");
            }).catch(err => {
                console.log(err);
            });
        }
    };
}

function deletePending () {
    const transaction = db.transaction(["pending_transaction"], "readwrite");
    const store = transaction.objectStore("pending_transaction");
    store.clear();
}

window.addEventListener('online', checkDatabase)