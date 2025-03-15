'use strict';

const BACKSPACE_KEY = 'Backspace';
const ENTER_KEY = 'Enter';
const WORD_LIST = [
  'MJ', 'KC',
  'LEO', 'BEA', 'DAY',
  'LUIS', 'NERO', 'MARK',
  'JOMER', 'ARJAN', 'ELVIS', 'SAPNU', 'FARRE',
  'JAYSON', 'WARREN', 'RUSSEL', 'GALANG', 'ELLYZA', 'LOUISE', 'TYRONE','SHERRY','MIMOSA','ANDREY',
  'LOURENE', 'MILZETH', 'CORDERO', 'ESTACIO','ELLJANE', 'MARYLLE', 'JASMINE', 'CABRERA',
  'ARELLANO', 'GERICKO',
  'ANTHONETTE',
];

//Jan
let WORD_OF_THE_DAY = WORD_LIST[getRandomIndex(WORD_LIST.length)];

// In case we want to make the game difficult or easier
const MAX_NUMBER_OF_ATTEMPTS = 5;

const history = [];
let currentWord = '';

const KEYBOARD_KEYS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];

// Grab the gameboard and the keyboard
const gameBoard = document.querySelector('#board');
const keyboard = document.querySelector('#keyboard');

// Setup event listeners
document.addEventListener('keydown', event => onKeyDown(event.key));
gameBoard.addEventListener('animationend', event => event.target.setAttribute('data-animation', 'idle'));
keyboard.addEventListener('click', onKeyboardButtonClick);

// Get everything setup and the game responding to user actions.
const init = () => {
  console.log('👋 Welcome to Wordle');

  // Generate the gameboard and the keyboard
  generateBoard(gameBoard, WORD_OF_THE_DAY.length, MAX_NUMBER_OF_ATTEMPTS);
  generateBoard(keyboard, 3, 5, KEYBOARD_KEYS, true); 
}

const showMessage = (message) => {
  const toast = document.createElement('li');

  toast.textContent = message;  
  toast.className = 'toast';

  document.querySelector('.toaster ul').prepend(toast);
  
  setTimeout(() => toast.classList.add('fade'), 1000);

  toast.addEventListener('transitionend', (event) => event.target.remove());
}

const restartGame = () => {
  history.length = 0;
  currentWord = '';
  document.querySelector('#board').innerHTML = '';
  document.querySelector('#keyboard').innerHTML = '';
  WORD_OF_THE_DAY = WORD_LIST[getRandomIndex(WORD_LIST.length)]; 
  generateBoard(gameBoard, WORD_OF_THE_DAY.length, MAX_NUMBER_OF_ATTEMPTS); 
  generateBoard(keyboard, 3, 5, KEYBOARD_KEYS, true);
}

const checkGuess = (guess, word) => {
  const guessLetters = guess.split('');
  const wordLetters = word.split('');
  const remainingWordLetters = [];
  const remainingGuessLetters = [];

  // Find the current active row
  const currentRow = document.querySelector(`#board ul[data-row='${history.length}']`);

  // First, let's get all the columns in the current row set up with some base values
  currentRow.querySelectorAll('li').forEach((element, index) => {
    element.setAttribute('data-status', 'none');
    element.setAttribute('data-animation', 'flip');

    // Each letter should start its animation twice as late as the letter before it
    element.style.animationDelay = `${index * 300}ms`;
    element.style.transitionDelay = `${index * 400}ms`;
  }); 

  // Second iteration finds all the valid letters
  // and creates a list of leftover letters
  wordLetters.forEach((letter, index) => {
    if (guessLetters[index] === letter) {
      currentRow.querySelector(`li:nth-child(${index + 1})`)
        .setAttribute('data-status', 'valid');

      document
        .querySelector(`[data-key='${letter}']`)
        .setAttribute('data-status', 'valid');
      
        remainingWordLetters.push(false);
        remainingGuessLetters.push(false);
    } else {
      remainingWordLetters.push(letter);
      remainingGuessLetters.push(guessLetters[index]);
    }
  });

  // Third iteration finds all the misplaced letters
  remainingWordLetters.forEach(letter => {
    // Skip this iteration, since the letter
    // was already found in the previous phase
    if (letter === false) return;

    if (remainingGuessLetters.indexOf(letter) !== -1) {
      const column = currentRow
        .querySelector(`li:nth-child(${remainingGuessLetters.indexOf(letter) + 1})`);

      column.setAttribute('data-status', 'misplaced');
      
      const keyboardKey = document.querySelector(`[data-key='${letter}']`);

      if (keyboardKey.getAttribute('data-status') !== 'valid') {
        keyboardKey.setAttribute('data-status', 'misplaced');
      }
    }
  });

  // Fourth iteration finds all the letters on the keyboard
  // that are absent from the word.
  guessLetters.forEach(letter => {
    const keyboardKey = document.querySelector(`[data-key='${letter}']`);
    
    if (keyboardKey.getAttribute('data-status') === 'empty') {
      keyboardKey.setAttribute('data-status', 'absent');
    }
  });
  
  history.push(currentWord);
  currentWord = '';

  if (guess === word) {
    showMessage('Congratulations! You guessed the correct word!');
    setTimeout(restartGame, 2000);
  } else if (history.length >= MAX_NUMBER_OF_ATTEMPTS) {
    showMessage('You have reached the maximum number of attempts. The game will restart.');
    setTimeout(restartGame, 2000);
  }
}

function onKeyboardButtonClick (event) {
  if (event.target.nodeName === 'LI') {
    onKeyDown(event.target.getAttribute('data-key'));
  }
}

function onKeyDown (key) {
  // Don't allow more than 6 attempts to guess the word
  if (history.length >= MAX_NUMBER_OF_ATTEMPTS) return;

  // Find the current active row
  const currentRow = document.querySelector(`#board ul[data-row='${history.length}']`);

  // Find the next empty column in the current active row
  let targetColumn = currentRow.querySelector('[data-status="empty"]');

  if (key === BACKSPACE_KEY) {
    if (targetColumn === null) {
      // Get the last column of the current active row as we are on the last column
      targetColumn = currentRow.querySelector('li:last-child');
    } else {
      // Find the previous column, otherwise get the first column so we always have a column to operate on
      targetColumn = targetColumn.previousElementSibling ?? targetColumn;
    }

    // Clear the column of its content
    targetColumn.textContent = '';
    // Set the column status to empty
    targetColumn.setAttribute('data-status', 'empty');
    
    // Remove the last letter from the currentWord
    currentWord = currentWord.slice(0, -1);
    
    return;
  }

  if (key === ENTER_KEY) { 
    // Check if the current word length is less than the word of the day length
    if (currentWord.length < WORD_OF_THE_DAY.length) {
      // Show a message indicating that some letters are missing
      showMessage('You\'re missing a few letters, don\'t you think?');
      return;
    }
    // Check if the current word length matches the word of the day length and if the word exists in the word list
    if (currentWord.length === WORD_OF_THE_DAY.length && WORD_LIST.includes(currentWord)) {
      // Check the guess against the word of the day
      checkGuess(currentWord, WORD_OF_THE_DAY);
    }
    else {
      // Set the current row animation to invalid
      currentRow.setAttribute('data-animation', 'invalid');
      // Show a message indicating that the word is not valid
      showMessage('That\'s not even a real word, is it?');
    }
    return;
  }

  // Check if the current word length has reached the word of the day length
  if (currentWord.length >= WORD_OF_THE_DAY.length) return;

  const upperCaseLetter = key.toUpperCase();

  // Add the letter to the next empty column
  // if the provided letter is between A-Z
  if (/^[A-Z]$/.test(upperCaseLetter)) {
    currentWord += upperCaseLetter;

    targetColumn.textContent = upperCaseLetter;
    targetColumn.setAttribute('data-status', 'filled');
    targetColumn.setAttribute('data-animation', 'pop');
  }
}

const generateBoard = (board, guessLength = 5, maxAttempts = 5, keys = [], keyboard = false) => {
  if (keyboard) {
    for (let row = 0; row < keys.length; row++) {
      const elmRow = document.createElement('ul');

      for (let column = 0; column < keys[row].length; column++) {
        const elmColumn = document.createElement('li');
        const key = keys[row].charAt(column);
        elmColumn.textContent = key;
        elmColumn.setAttribute('data-key', key);
        elmColumn.setAttribute('data-status', 'empty');
        elmColumn.setAttribute('data-animation', 'idle');

        elmRow.appendChild(elmColumn);
      }

      board.appendChild(elmRow);
    }

    const enterKey = document.createElement('li');
    enterKey.setAttribute('data-key', ENTER_KEY);
    enterKey.textContent = ENTER_KEY;
    board.lastChild.prepend(enterKey);

    const backspaceKey = document.createElement('li');
    backspaceKey.setAttribute('data-key', BACKSPACE_KEY);
    backspaceKey.textContent = BACKSPACE_KEY;
    board.lastChild.append(backspaceKey);
  } else {
    for (let row = 0; row < maxAttempts; row++) {
      const elmRow = document.createElement('ul');
      elmRow.setAttribute('data-row', row);

      for (let column = 0; column < guessLength; column++) {
        const elmColumn = document.createElement('li');
        elmColumn.setAttribute('data-status', 'empty');
        elmColumn.setAttribute('data-animation', 'idle');
        elmRow.appendChild(elmColumn);
      }

      board.appendChild(elmRow);
    }
  }
}

// Call the initialization function when the DOM is loaded to get
// everything setup and the game responding to user actions.
document.addEventListener('DOMContentLoaded', init);

// Based on the max length of the Array. Return a random items index
// within the Array's length.
function getRandomIndex (maxLength) {
  return Math.floor(Math.random() * Math.floor(maxLength));
}
