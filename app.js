let reviewData = JSON.parse(localStorage.getItem("reviews")) || {};

let verses = [];
let index = 0;
let audio;

// Charger les données
fetch("data/quran.json")
  .then(res => res.json())
  .then(data => {
    verses = data;
    loadVerse();
  });

function loadVerse() {
  index = getVerseForToday();
  const v = verses[index];

  document.getElementById("arabic").innerText = v.arabic;
  document.getElementById("translation").innerText = v.translation;
  document.getElementById("tafsir").innerText = v.tafsir;

  audio = new Audio(v.audio);
}

function getVerseForToday() {
  const today = new Date().toISOString().split("T")[0];

  for (let key in reviewData) {
    if (reviewData[key].next <= today) {
      return verses.findIndex(v => v.key === key);
    }
  }
  return index;
}

function scheduleNext(key) {
  const steps = [1, 3, 7];
  const item = reviewData[key];

  if (item.step < steps.length) {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + steps[item.step]);
    item.next = nextDate.toISOString().split("T")[0];
    item.step++;
  }

  localStorage.setItem("reviews", JSON.stringify(reviewData));
}

function repeat(times) {
  let count = 0;
  audio.currentTime = 0;

  audio.onended = () => {
    count++;
    if (count < times) {
      audio.play();
    }
  };

  audio.play();
}

document.getElementById("play").onclick = () => {
  audio.currentTime = 0;
  audio.play();
};

document.getElementById("stop").onclick = () => {
  audio.pause();
  audio.currentTime = 0;
};

document.getElementById("repeat3").onclick = () => repeat(3);
document.getElementById("repeat5").onclick = () => repeat(5);
document.getElementById("memorized").onclick = () => {
  const key = verses[index].key;
  const today = new Date().toISOString().split("T")[0];

  reviewData[key] = {
    learned: today,
    next: today,
    step: 0
  };

  localStorage.setItem("reviews", JSON.stringify(reviewData));

  index++;
  if (index >= verses.length) index = verses.length - 1;
  loadVerse();
};
fetch("data/journal_questions.json")
  .then(res => res.json())
  .then(questions => {
    const today = new Date();
    const dayIndex = today.getDate() % questions.length;
    document.getElementById("question").innerText = questions[dayIndex];
  });
fetch("data/names_of_allah.json")
  .then(res => res.json())
  .then(names => {
    const today = new Date();
    const index = today.getDate() % names.length;
    const n = names[index];

    document.getElementById("allah-name-ar").innerText = n.arabic;
    document.getElementById("allah-name-la").innerText = n.latin;
    document.getElementById("allah-name-mean").innerText = n.meaning;
    document.getElementById("allah-name-reflect").innerText = n.reflection;
  });
fetch("data/journal_questions.json")
  .then(res => res.json())
  .then(data => {
    const months = Object.keys(data);

    const start = new Date("2024-07-07"); // début approximatif d'une année lunaire
    const today = new Date();
    const diffDays = Math.floor((today - start) / (1000 * 60 * 60 * 24));
    const lunarDay = diffDays % 354;

    let count = 0;

    for (let month of months) {
      const questions = data[month].questions;
      if (lunarDay < count + questions.length) {
        document.getElementById("question").innerText =
          `(${month}) ${questions[lunarDay - count]}`;
        break;
      }
      count += questions.length;
    }
  });
let dhikrList = [];
let currentDhikr = null;
let dhikrCount = 0;

// Charger les dhikr
fetch("data/dhikr.json")
  .then(res => res.json())
  .then(data => {
    dhikrList = data;
    loadDhikr();
  });

function loadDhikr() {
  const today = new Date();
  const index = today.getDate() % dhikrList.length;
  currentDhikr = dhikrList[index];

  dhikrCount = Number(localStorage.getItem("dhikrCount")) || 0;

  document.getElementById("dhikr-ar").innerText = currentDhikr.arabic;
  document.getElementById("dhikr-la").innerText = currentDhikr.latin;
  document.getElementById("dhikr-mean").innerText = currentDhikr.meaning;
  document.getElementById("dhikr-target").innerText = currentDhikr.recommended;
  document.getElementById("dhikr-count").innerText = dhikrCount;
}

// Bouton dhikr
document.getElementById("dhikr-btn").onclick = () => {
  dhikrCount++;
  localStorage.setItem("dhikrCount", dhikrCount);
  document.getElementById("dhikr-count").innerText = dhikrCount;

  if (dhikrCount === currentDhikr.recommended) {
    alert("🌿 Qu’Allah accepte ton dhikr");
  }
};

// Réinitialiser
document.getElementById("dhikr-reset").onclick = () => {
  dhikrCount = 0;
  localStorage.setItem("dhikrCount", 0);
  document.getElementById("dhikr-count").innerText = 0;
};
