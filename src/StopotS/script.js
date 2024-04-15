const $ = (id) => document.getElementById(id);
const scaleDiv = $('scale');
const maxRound = $('maxRound');
const currentRound = $('currentRound');
const timer = $('timer');
const scoreboard = $('scoreboard');
const users = $('users');
const scrollbar = $('scrollbar');
const chatBar = document.getElementById('chatBar');
const chatSubmit = document.getElementById('submitChat');
const chatList = document.querySelector('.historic');
const chatForm = document.getElementById('chatForm');
const urlParams = new URLSearchParams(window.location.search);

window.addEventListener('resize', resize);
resize();

let config = parameterParser();
applyConfig();
console.log(config);

chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (chatBar.value === '') return;
  sendMessage(chatBar.value, config.self);
  chatBar.value = '';
});

// chatSubmit.addEventListener('click', () => {
//     if (chatBar.value === '') return;
//     sendMessage(chatBar.value, config.self);
// })

function parameterParser() {
  return {
    self: urlParams.get('self'),
    owner: urlParams.get('owner'),
    pfp: urlParams.get('pfp') === null ? null : urlParams.get('pfp'),
    currentRound: Number(urlParams.get('currentround')) || 1,
    maxRounds: Number(urlParams.get('maxrounds')) || 4,
    timeLeft: Number(urlParams.get('timeleft')) || 60,
    maxPlayers: Number(urlParams.get('maxplayers')) || 16,
    players: parseTextToObject(urlParams.get("players") || `Draconis256_:969,D3FAU4T:969,Gardenwafers:969,Frozenf1ame:969,d3mon10__:969,superbrozzzzz_:969`)
  }
}

function resize() {
  let e = Math.max(window.innerWidth, 1010);
  let t = Math.max(window.innerHeight, 600);

  let view = false;
  let bannerLeft = false;

  let r = (e - (view ? 0 : bannerLeft ? 360 : 180)) / 1146;
  838 * r > t && (r = t / 838);
  scaleDiv.style.transform = `scale(${r})`;
}

function parseTextToObject(text) {
  const keyValuePairs = text.split(',');
  const result = {};

  keyValuePairs.forEach(pair => {
    const [key, value] = pair.split(':');
    result[key.trim()] = parseInt(value.trim());
  });

  return result;
};

function applyConfig() {
  maxRound.textContent = '/' + config.maxRounds;
  currentRound.textContent = config.currentRound;

  if (isNaN(config.timeLeft)) timer.style.width = '60%';
  else timer.style.width = config.timeLeft + '%';

  const list = makePlayerList(config.players);
  scoreboard.appendChild(list);
  const lisT = makeSidebarList();
  const remainingEmpty = config.maxPlayers - Object.keys(config.players).length;
  for (let i = 0; i < remainingEmpty; i++) {
    lisT.push(createLiSidebar(null, null, null));
  }
  lisT.forEach(li => users.appendChild(li));
  if (lisT.length > 8) scrollbar.classList.add('over', 'top');
}

function makeSidebarList() {
  return Object.entries(config.players)
    .map(([name, points]) => createLiSidebar(name, points, name === config.self ? config.pfp : null));
}

function makePlayerList(playersJSON) {
  let sortedJSON = sortJSONByPoints(playersJSON);
  const ulElem = document.createElement('ul');
  Object.entries(sortedJSON)
    .forEach(([name, points], index) => {
      const li = createLiScoreboard(index + 1, name, points);
      if (name === self) li.classList.add('you');
      ulElem.appendChild(li);
    });

  return ulElem;
}

function createLiSidebar(name, points, avatar) {
  const liElem = document.createElement("li");

  if (name === null) liElem.classList.add("empty");
  else if (name === config.self) liElem.classList.add("you");
  else if (name === config.owner) liElem.classList.add("owner");

  const avatarDiv = document.createElement("div");
  avatarDiv.classList.add("avatar");

  if (avatar !== null) avatarDiv.style.backgroundImage = "url(" + avatar + ")";
  if (avatar === null && name != null) avatarDiv.classList.add("avt0");

  liElem.appendChild(avatarDiv);
  const infosDiv = document.createElement("div");
  infosDiv.classList.add("infos");
  const nameDiv = document.createElement("div");
  nameDiv.classList.add("nick");

  if (name === null && points === null) nameDiv.textContent = "Empty";
  else nameDiv.textContent = name;

  infosDiv.appendChild(nameDiv);

  if (name && points) {
    const pointsSpan = document.createElement("span");
    pointsSpan.textContent = points + " pts";
    infosDiv.appendChild(pointsSpan);
  }

  liElem.appendChild(infosDiv);
  return liElem;
}

function createLiScoreboard(rank, name, points) {
  const liElem = document.createElement('li');
  const posDiv = document.createElement('div');
  posDiv.classList.add('position');
  const posSpan = document.createElement('span');
  posSpan.textContent = rank;
  posDiv.appendChild(posSpan);
  liElem.appendChild(posDiv);
  const nameDiv = document.createElement('div');
  nameDiv.classList.add('nick');
  nameDiv.textContent = name;
  liElem.appendChild(nameDiv);
  const pointsDiv = document.createElement('div');
  pointsDiv.classList.add('points');
  pointsDiv.textContent = `${points} pts`;
  liElem.appendChild(pointsDiv);
  return liElem;
}

function sortJSONByPoints(data) {
  return Object.fromEntries(
    Object.entries(data)
      .sort((a, b) => b[1] - a[1])
  );
}

function sendMessage(text, username) {
  const li = document.createElement('li');
  li.classList.add('sending', 'sent');
  const name = document.createElement('strong');
  name.textContent = username || config.self;
  li.appendChild(name);
  const message = document.createElement('span');
  message.textContent = text;
  li.appendChild(message);
  chatList.appendChild(li);
}