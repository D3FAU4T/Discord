const RandomTab = document.getElementById("Random-tab");
const TodayTab = document.getElementById("Today-tab");
const ConnectTab = document.getElementById("Connect-tab");
const guessTable = document.getElementById("guessTable");
const topGuess = document.getElementById("topGuess");
const GiveUpButton = document.getElementById("GiveUpButton");
const GuessBox = document.getElementById("GuessBox");
const UsernameBox = document.getElementById("Username-Holder");
const SendButton = document.getElementById("sendButton");
const connectArea = document.getElementById("connect-area");
const guessBoard = document.getElementById('guessesDiv');
const topGuessBoard = document.getElementById('topGuessDiv');
const guessAlert = document.getElementById('guessAlert');
const hostingId = document.getElementById('HostingId');
const gameIdHolder = document.getElementById('GameId-Holder');
const connectButton = document.getElementById('connectButton');

const gameId = generateUUID();
hostingId.innerText = `Hosting ID: ${gameId}`;

let currentTab = "Random";
let randomInit = true;
let todayInit = true;
let connectInit = true;

let globalConnectionId = gameId;

const socket = new WebSocket("wss://discord-d3fau4tbot.replit.app/");

socket.addEventListener("open", () => {
    socket.send(`{ "Client": [ "D3_connect", { "message": "Requesting to initiate connection", "gameId": "${gameId}" } ] }`);
    setInterval(() => socket.send('2'), 10000);
});

socket.addEventListener('message', (event) => {
    if (event.data == '3') return;
    let message = JSON.parse(event.data);
    if (message.Server[0] === 'D3_guess') {
        guessAlert.style.display = 'none';
        if (message.Server[1].gameType === 'Random') {
            modifyGuessTable(message.Server[1].guessArr, message.Server[1].indexes);
            if (randomInit) {
                guessBoard.hidden = false;
                topGuessBoard.hidden = false;
                randomInit = false;
            }
        }

        else if (message.Server[1].gameType === 'Today') {
            modifyGuessTable(message.Server[1].guessArr, message.Server[1].indexes);
            if (todayInit) {
                guessBoard.hidden = false;
                topGuessBoard.hidden = false;
                todayInit = false;
            }
        }

        else if (message.Server[1].gameType === 'Connect') {
            modifyGuessTable(message.Server[1].guessArr, message.Server[1].indexes);
            if (connectInit) {
                guessBoard.hidden = false;
                topGuessBoard.hidden = false;
                connectInit = false;
            }
        }
    }

    else if (message.Server[0] === 'D3_invalid') {
        guessAlert.innerText = "This word doesn't exist in our database!"
        guessAlert.style.display = 'flex';
    }

    else if (message.Server[0] === 'D3_found') {
        guessAlert.innerText = `GG! You found the answer "${message.Server[1].word}".`
        guessAlert.className = "alert alert-success align-items-center guessTextArea mx-auto mt-3";
        guessAlert.style.display = 'flex';
    }

    else if (message.Server[0] === 'D3_giveup') {
        guessAlert.className = "alert alert-warning align-items-center guessTextArea mx-auto mt-3";
        guessAlert.innerText = `The word was "${message.Server[1].word}".`;
        guessAlert.style.display = 'flex';
    }

    else if (message.Server[0] === 'D3_requestData') {
        if (message.Server[1].guessArr.length == 0 && message.Server[1].indexes.length == 0) {
            guessBoard.hidden = true;
            topGuessBoard.hidden = true;
        } else {
            guessBoard.hidden = false;
            topGuessBoard.hidden = false;
            modifyGuessTable(message.Server[1].guessArr, message.Server[1].indexes);
        }
    }
});

window.addEventListener("beforeunload", () =>
    socket.send(`{ "Client": [ "D3_disconnect", { "message": "Requesting to disconnect", "gameId": "${gameId}" } ] }`)
);

RandomTab.addEventListener("click", () => {
    // Enable
    RandomTab.ariaSelected = true;
    RandomTab.className = "nav-link active rounded-5";
    connectArea.hidden = true;
    currentTab = "Random";
    socket.send(`{ "Client": [ "D3_requestData", { "gameType": "Random", "gameId": "${gameId}" } ] }`);
    if (randomInit === false) modifyGuessTable(tableData.Random.guessArr, tableData.Random.indexes)
    // Disable
    TodayTab.ariaSelected = false;
    TodayTab.className = "nav-link rounded-5";
    ConnectTab.ariaSelected = false;
    ConnectTab.className = "nav-link rounded-5";
});

TodayTab.addEventListener("click", () => {
    // Enable
    TodayTab.ariaSelected = true;
    TodayTab.className = "nav-link active rounded-5";
    connectArea.hidden = true;
    currentTab = "Today";
    socket.send(`{ "Client": [ "D3_requestData", { "gameType": "Today", "gameId": "${gameId}" } ] }`);
    // Disable
    RandomTab.ariaSelected = false;
    RandomTab.className = "nav-link rounded-5";
    ConnectTab.ariaSelected = false;
    ConnectTab.className = "nav-link rounded-5";
    if (todayInit === false) modifyGuessTable(tableData.Today.guessArr, tableData.Today.indexes);
});

ConnectTab.addEventListener("click", () => {
    // Enable
    ConnectTab.ariaSelected = true;
    ConnectTab.className = "nav-link rounded-5 active";
    connectArea.hidden = false;
    currentTab = "Connect";
    socket.send(`{ "Client": [ "D3_requestData", { "gameType": "Connect", "gameId": "${globalConnectionId}" } ] }`);
    // Disable
    RandomTab.ariaSelected = false;
    RandomTab.className = "nav-link rounded-5";
    TodayTab.ariaSelected = false;
    TodayTab.className = "nav-link rounded-5";
});

connectButton.addEventListener("click", () => {
    let id = gameIdHolder.value;
    globalConnectionId = id;
    socket.send(`{ "Client": [ "D3_requestData", { "gameType": "Connect", "gameId": "${id}" } ] }`);
});

GiveUpButton.addEventListener("click", () =>
    socket.send(`{ "Client": [ "D3_giveup", { "gameId": "${gameId}", "gameType": "${currentTab === 'Random' ? "Random" : currentTab === 'Today' ? "Today" : "Connect"}" } ] }`)
);

SendButton.addEventListener("click", (event) => guess(currentTab));
GuessBox.addEventListener("keypress", (event) => {
    if (event.key === "Enter") guess(currentTab);
});

function modifyGuessTable(guessArray, indexes) {    
    const tbody = document.createElement('tbody');
    let CurrentGuess = guessArray.find(elem => elem.word === indexes[indexes.length - 1]);
    const thread = document.createElement('thread');
    thread.appendChild(makeRow(CurrentGuess, indexes));
    topGuess.innerHTML = thread.outerHTML;
    guessArray.forEach(guess => 
        tbody.appendChild(makeRow(guess, indexes))
    );
    guessTable.innerHTML = makeHeaderThread().outerHTML + tbody.outerHTML;
}

function makeHeaderThread() {
    const makeTh = (txt) => {
        const th = document.createElement('th');
        th.scope = 'col';
        th.textContent = txt;
        return th;
    }

    const thread = document.createElement('thread');
    const tr = document.createElement('tr');
    tr.appendChild(makeTh('#'));
    tr.appendChild(makeTh('Guess'));
    tr.appendChild(makeTh('Similarity'));
    tr.appendChild(makeTh('Getting Close?'));
    thread.appendChild(tr);
    return thread;
}

function makeRow(currentGuess, indexes) {
    const tr = document.createElement('tr');
    const th = document.createElement('th');
    th.scope = 'row';
    th.textContent = indexes.indexOf(currentGuess.word) + 1;
    tr.appendChild(th);
    const td1 = document.createElement('td');
    td1.textContent = currentGuess.word;
    tr.appendChild(td1);
    const td2 = document.createElement('td');
    td2.textContent = currentGuess.similarity;
    tr.appendChild(td2);
    const td3 = document.createElement('td');
    td3.textContent = `${currentGuess.gettingClose} (${currentGuess.guesser})`;
    tr.appendChild(td3);
    return tr;
}

function generateUUID() {
    let uuid = '';
    const uuidFormat = 'dxxxx777-d3xxx4x-axchx-chax-frxx';
    const chars = '0123456789abcdefghijklmnopqrstuvwxyz';

    for (let i = 0; i < uuidFormat.length; i++) {
        const char = uuidFormat[i];

        if (char === 'x') uuid += chars[Math.floor(Math.random() * chars.length)];
        else if (char === 'y') uuid += chars[(Math.floor(Math.random() * 4) + 8)];
        else uuid += char;
    }

    return uuid;
}

function guess(currentTab) {
    if (currentTab === "Random")
        socket.send(`{ "Client": [ "D3_guess", { "gameType": "Random", "gameId": "${gameId}", "guess": "${GuessBox.value}", "guesser": "Anonymous" } ] }`);

    else if (currentTab === "Today")
        socket.send(`{ "Client": [ "D3_guess", { "gameType": "Today", "gameId": "${gameId}", "guess": "${GuessBox.value}", "guesser": "Anonymous" } ] }`);

    else if (currentTab === 'Connect')
        socket.send(`{ "Client": [ "D3_guess", { "gameType": "Connect", "gameId": "${globalConnectionId}", "guess": "${GuessBox.value}", "guesser": "${UsernameBox.value || "Anonymous"}" } ] }`);

    GuessBox.value = '';
}