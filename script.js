const ANSWER_LENGTH = 5;
const MAX_GUESSES = 6;
const letters = document.querySelectorAll(".letter");
const spinnerDiv = document.querySelector(".status");

async function init() {
  let currentRow = 0;
  let currentGuess = "";
  let done = false;
  let isLoading = true;

  const WORD_URL = "https://words.dev-apis.com/word-of-the-day?random=1";
  const promise = await fetch(WORD_URL);
  const processedResponse = await promise.json();
  const word = processedResponse.word.toUpperCase();
  const wordParts = word.split("");

  isLoading = false;
  showLoader(isLoading);

  // TEST: This seems correct.
  function addLetter(letter) {
    if (currentGuess.length < ANSWER_LENGTH) {
      // Add the new letter to the end of the current guess.
      currentGuess += letter;
    } else {
      // Replace the current last letter with the new letter.
      currentGuess =
        currentGuess.substring(0, currentGuess.length - 1) + letter;
    }
    letters[ANSWER_LENGTH * currentRow + currentGuess.length - 1].innerText =
      letter;
  }

  async function makeGuess() {
    // TEST: This seems correct.
    if (currentGuess.length !== ANSWER_LENGTH) {
      // Do nothing.
      return;
    }

    isLoading = true;
    showLoader(isLoading);

    const res = await fetch("https://words.dev-apis.com/validate-word", {
      method: "POST",
      body: JSON.stringify({ word: currentGuess }),
    });
    const resObj = await res.json();
    const validWord = resObj.validWord; // means the same thing as const { validWord } = resObj;

    isLoading = false;
    showLoader(isLoading);

    if (!validWord) {
      markInvalidWord();
      return;
    }

    const guessParts = currentGuess.split("");
    const map = makeMap(wordParts);

    for (let i = 0; i < ANSWER_LENGTH; i++) {
      if (guessParts[i] === wordParts[i]) {
        // Mark as correct.
        letters[ANSWER_LENGTH * currentRow + i].classList.add("correct");
        map[guessParts[i]]--;
      }
    }

    for (let i = 0; i < ANSWER_LENGTH; i++) {
      if (guessParts[i] === wordParts[i]) {
        // do nothing, we already did it.
      } else if (wordParts.includes(guessParts[i]) && map[guessParts[i]] > 0) {
        letters[ANSWER_LENGTH * currentRow + i].classList.add("almost");
        map[guessParts[i]]--;
      } else {
        letters[ANSWER_LENGTH * currentRow + i].classList.add("wrong");
      }
    }

    currentRow++;

    if (currentGuess === word) {
      // WIN
      alert("YOU WIN!");
      document.querySelector(".brand").classList.add("winner");
      done = true;
      return;
    } else if (currentRow === MAX_GUESSES) {
      alert(`GAME OVER. The word was ${word}`);
      done = true;
    }

    currentGuess = "";
  }

  // TEST: This seems correct.
  function backSpace() {
    currentGuess = currentGuess.substring(0, currentGuess.length - 1);
    letters[ANSWER_LENGTH * currentRow + currentGuess.length].innerText = "";
  }

  // TEST: This seems correct.
  function markInvalidWord() {
    // alert("not a valid word");

    for (let i = 0; i < ANSWER_LENGTH; i++) {
      letters[currentRow * ANSWER_LENGTH + i].classList.remove("invalid");

      setTimeout(function () {
        letters[currentRow * ANSWER_LENGTH + i].classList.add("invalid");
      }, 10);
    }
  }

  document.addEventListener("keydown", function handleKeyPress(event) {
    if (done || isLoading) {
      // DO NOTHING
      return;
    }

    const action = event.key;
    if (action === "Enter") {
      makeGuess();
    } else if (action === "Backspace") {
      backSpace();
    } else if (isLetter(action)) {
      addLetter(action.toUpperCase());
    } else {
      // Do nothing.
    }
  });
}

function isLetter(value) {
  return /^[a-zA-Z]$/.test(value);
}

function showLoader(isLoading) {
  spinnerDiv.classList.toggle("show", isLoading);
}

function makeMap(array) {
  const obj = {};
  for (let i = 0; i < array.length; i++) {
    const letter = array[i];
    if (obj[letter]) {
      obj[letter]++;
    } else {
      obj[letter] = 1;
    }
  }

  return obj;
}

init();
