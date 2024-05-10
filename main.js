// Events

const qn = document.querySelector('.question-number');
const q = document.querySelector('.question');
const a = document.querySelector('#attempt');
const s = document.querySelector('.score');
const hr = document.querySelector('.hour')
const min = document.querySelector('.minute')
const sec = document.querySelector('.second')

// variables for quiz function
const target = 10;
let score = 0;
let wrong = 0;
let attempt;
let questionNumber = 1;
let prompts = [];
let lastQuestion = '';
let answered = false;
let timeout = null;
let startTime;
let elapsedTime = 0;

// variables for results breakdown
let QNum = [];
let Q = [];
let userA = [];
let trueA = [];
let isTrue = [];

// variables for timer
let second = 0;
let minute = 0;
let hour = 0;
let elapsed;

// constants for E-series values
const seriesValues = {
  'e3': [10, 22, 47], // 40% tolerance
  'e6': [10, 15, 22, 33, 47, 68], // 20% tolerance
  'e12': [10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82], // 10% tolerance
  'e24': [10, 11, 12, 13, 15, 16, 18, 20, 22, 24, 27, 30, 
          33, 36, 39, 43, 47, 51, 56, 62, 68, 75, 82, 91], // 5% tolerance
  'e48': [100, 105, 110, 115, 121, 127, 133, 140, 147, 154, 
          162, 169, 178, 187, 196, 205, 215, 226, 237, 249, 
          261, 274, 287, 301, 316, 332, 348, 365, 383, 402, 
          422, 442, 464, 487, 511, 536, 562, 590, 619, 649, 
          681, 715, 750, 787, 825, 866, 909, 953] // 2% tolerance
};
const multExps = [9, 8, 7, 6, -2, 5, 4, -1, 3, 2, 1, 0];

// set up band objects to be customized by updateResistor()
const body = document.getElementById("body");
const band1 = document.getElementById("band_1");
const tol = document.getElementById("band_tol");
const metal_reflex1 = document.getElementById("metal_reflex1");
const metal_reflex2 = document.getElementById("metal_reflex2");
const metal_shadow = document.getElementById("metal_shadow");

const band2_4 = document.getElementById("4band_2");
const mult_4 = document.getElementById("4band_mult");
const mult_r_4 = document.getElementById("4band_mult_reflex");
const mult_s_4 = document.getElementById("4band_mult_shadow");

const band2_5 = document.getElementById("5band_2");
const band3_5 = document.getElementById("5band_3");
const mult_5 = document.getElementById("5band_mult");
const mult_r_5 = document.getElementById("5band_mult_reflex");
const mult_s_5 = document.getElementById("5band_mult_shadow");

// Parse URL parameters to get the selected series
const urlParams = new URLSearchParams(window.location.search);
const series = urlParams.get('series');

// FUNCTIONS

// generate random resistance from chosen series
function genResistance() {
  let randomIndex = Math.floor(Math.random() * seriesValues[series].length);
  let randomMult = multExps[Math.floor((Math.random() ** (1 / 1.75)) * (multExps.length))];
  let sigFigs = seriesValues[series][randomIndex];
  let answer;
  answer = sigFigs * Math.pow(10, randomMult);
  return [sigFigs, randomMult];
}

function updateResistor([sigFigs, randomMult]){
    // define color codes for each band
    const colorMap = {
      '0': '#000000', // Black
      '1': '#8A3D06', // Brown
      '2': '#C40808', // Red
      '3': '#FF4D00', // Orange
      '4': '#FFD500', // Yellow
      '5': '#00A33D', // Green
      '6': '#005EB6', // Blue
      '7': '#8210D2', // Violet
      '8': '#8C8C8C', // Grey
      '9': '#FFFFFF', // White
      '-1': '#AD9F4E', // Gold
      '-2': '#C0C0C0', // Silver
    };

    const tolColors = {
      '0.05%': '#8C8C8C', // Grey
      '0.1%': '#8210D2', // Violet
      '0.25%': '#005EB6', // Blue
      '0.5%': '#00A33D', // Green
      '1%': '#8A3D06', // Brown
      '2%': '#C40808', // Red
      '3%': '#FF4D00', // Orange
      '4%': '#FFD500', // Yellow
      '5%': '#AD9F4E', // Gold
      '10%': '#C0C0C0', // Silver
      '20%': 'rgba(0, 0, 0, 0)', // no band
      '40%': 'rgba(0, 0, 0, 0)', // no band
    };

    const tolMap = {
      'e3': '40%',
      'e6': '20%', 
      'e12': '10%',
      'e24': '5%',
      'e48': '2%',
    };
    let tolerance = tolMap[series];
    
    // split the value into separate digits (e.g., 100 -> [1, 0, 0])
    let digits = sigFigs.toString().split('').map(Number);

    // apply colors to bands based on their digits and set unused bands to transparent
    tol.setAttribute('fill', tolColors[tolerance]);
    metal_reflex1.setAttribute('fill', tolColors[tolerance]);
    metal_reflex1.setAttribute('opacity', 0.75);
    if ( tolerance == '5%' || tolerance == '10%' ) { 
      metal_reflex1.setAttribute('filter', 'brightness(100%) saturate(1000%) contrast(200%)');
      metal_reflex2.setAttribute('opacity', 0.5);
      metal_shadow.setAttribute('opacity', 0.4);
    } else {
      metal_reflex1.setAttribute('filter', 'brightness(100%) saturate(100%) contrast(100%)');
      metal_reflex2.setAttribute('opacity', 0);
      metal_shadow.setAttribute('opacity', 0);
    }
    band1.setAttribute('fill', colorMap[digits[0]]); // this one is always visible

    if ( digits.length == 2 ) {
      body.setAttribute('fill', '#D9B477');
      band2_4.setAttribute('fill', colorMap[digits[1]]);
      mult_4.setAttribute('fill', colorMap[randomMult]);
      mult_r_4.setAttribute('fill', colorMap[randomMult]);

      band2_4.setAttribute('opacity', 1);
      mult_4.setAttribute('opacity', 1);
      mult_r_4.setAttribute('opacity', 0.75);

      if ( randomMult == -1) {
        mult_r_4.setAttribute('fill', '#ffff33');
        mult_s_4.setAttribute('opacity', 0.4);
      } else if ( randomMult == -2) {
        mult_r_4.setAttribute('fill', '#ffffff');
        mult_s_4.setAttribute('opacity', 0.4);
      } else { 
        mult_s_4.setAttribute('opacity', 0);
      }

      band2_5.setAttribute('opacity', 0);
      band3_5.setAttribute('opacity', 0);
      mult_5.setAttribute('opacity', 0);
      mult_r_5.setAttribute('opacity', 0);
      mult_s_5.setAttribute('opacity', 0);

    } else if ( digits.length == 3 ) {
      body.setAttribute('fill', '#89dde9');
      band2_5.setAttribute('fill', colorMap[digits[1]]);
      band3_5.setAttribute('fill', colorMap[digits[2]]);
      mult_5.setAttribute('fill', colorMap[randomMult]);
      mult_r_5.setAttribute('fill', colorMap[randomMult]);

      band2_5.setAttribute('opacity', 1);
      band3_5.setAttribute('opacity', 1);
      mult_5.setAttribute('opacity', 1);
      mult_r_5.setAttribute('opacity', 0.75);
      
      if ( randomMult == -1) {
        mult_r_5.setAttribute('fill', '#ffff33');
        mult_s_5.setAttribute('opacity', 0.4);
      } else if ( randomMult == -2) {
        mult_r_5.setAttribute('fill', '#ffffff');
        mult_s_5.setAttribute('opacity', 0.4);
      } else { 
        mult_s_5.setAttribute('opacity', 0);
      }

      band2_4.setAttribute('opacity', 0);
      mult_4.setAttribute('opacity', 0);
      mult_r_4.setAttribute('opacity', 0);
      mult_s_4.setAttribute('opacity', 0);

    } // else {
    //   // be sad?
    // }
}

// generates a new resistance for question, updates resistor
function genQuestion() {
  let question, answer;
  let numPair = genResistance();
  updateResistor(numPair);
  answer = numPair[0] * Math.pow(10, numPair[1]);
  question = document.getElementById('svg1');
  // console.log(numPair[0], numPair[1], Math.pow(10, numPair[1]));
  // console.log(answer);
  return [question, answer]
}

// posts questions
function postQuestion(){
  answered = false
  gen = genQuestion();
  if ((lastQuestion === gen[0]) || (gen[0] == undefined)){
    postQuestion();
  };
  qn.textContent = `Question ${questionNumber}`;
  // q.textContent = gen[0];
  s.textContent = `${score}/${target}`;
  answer = gen[1];
  // console.log(answer);
  a.focus();
  a.click();
  a.addEventListener('keyup', checkAnswer);
};

// checks answer to question (triggered on keyup and recurses postQuestion)
function checkAnswer(e){
  if(e.keyCode == 13){
    // console.log("User Input:", a.value); // Log user input
    // console.log("Correct Answer:", answer); // Log correct answer
    // console.log("User Input Type:", typeof a.value); // Log type of user input
    // console.log("Correct Answer Type:", typeof answer); // Log type of correct answer
    // console.log("User Input to fixed:", Number(a.value).toFixed(2)); // 
    // console.log("Answer to fixed:", answer.toFixed(2));
    // console.log(gen[0]);
    
    QNum.push(questionNumber);
    lastQuestion = Q[-1];
    Q.push(String(gen[0].innerHTML));
    // console.log(Q);
    if (!Number.isInteger(answer)){
      if (answer < 1){
        answer = answer.toFixed(2);
      } else if (answer < 10){
          if (series == 'e3' || series == 'e6' || series == 'e12'  || series == 'e24'){
            answer = answer.toFixed(1);
          } else {
            answer = answer.toFixed(2);
          }
      } else if (answer < 100){
        answer = answer.toFixed(1);
      }
    }
    // if (isNaN(a.value)){
    //   var tempUserIn = a.value.replaceAll(' ', '');
    //   var tempUserIn = tempUserIn.replace('G', '000000000');
    //   var tempUserIn = tempUserIn.replace('M', '000000');
    //   var tempUserIn = tempUserIn.replace('k', '000');
    //   var userIn = tempUserIn;
    // }
    userA.push(a.value);
    trueA.push(answer);
    if ((Number(a.value) == answer) & (a.value != '')){
      score ++;
      isTrue.push(true)
      // console.log('correct!');
    }
    else if (Number(a.value) != answer){
      wrong ++;
      isTrue.push(false)
      // console.log('incorrect :(');
    };
    a.removeEventListener('keyup', checkAnswer);
    a.value = '';
    answered = true;
    questionNumber++;
    if (answered === true){
      if (score<target){
        postQuestion();
      }
      else{
        s.textContent = `${score}/${target}`;
        victory();
      };  
    }
  }
}

// // checks answer to question (triggered on keyup and recurses postQuestion)
// function checkAnswer(e, answer){
//   if(e.keyCode == 13){
//     console.log("User Input:", a.value); // Log user input
//     console.log("Correct Answer:", answer); // Log correct answer
//     QNum.push(questionNumber);
//     let userInput = Number(a.value.trim()); // Convert input value to number and remove leading/trailing whitespaces
//     console.log("User Input Type:", typeof userInput); // Log type of user input
//     console.log("Correct Answer Type:", typeof answer); // Log type of correct answer
//     userA.push(userInput); // Store user input for debugging
//     trueA.push(answer);
//     // Use strict equality check (===) and ensure both values are numbers
//     if (!isNaN(userInput) && userInput === answer){
//       score++;
//       isTrue.push(true);
//       console.log('correct!');
//     }
//     else {
//       wrong++;
//       isTrue.push(false);
//       console.log('incorrect!');
//     };
//     a.removeEventListener('keyup', checkAnswer);
//     a.value = '';
//     answered = true;
//     questionNumber++;
//     if (answered === true){
//       if (score < target){
//         postQuestion();
//       }
//       else{
//         s.textContent = `${score}/${target}`;
//         victory();
//       };  
//     }
//   }
// }


// got to victory page
function victory(){
  sessionStorage.setItem('wrong', wrong);
  sessionStorage.setItem('timer', `${convertToString(hour)}:${convertToString(minute)}:${convertToString(second)}`);
  sessionStorage.setItem('QNum', QNum);
  sessionStorage.setItem('Q', Q.join("%%%"));
  sessionStorage.setItem('userA', userA);
  sessionStorage.setItem('trueA', trueA);
  sessionStorage.setItem('isTrue', isTrue);
  sessionStorage.setItem('right', score);
  window.location.replace("results.html");
}

function start(){
  // every second, elapsed 
  addTime()
  timer = setInterval(addTime, 1000)
}

function convertToString(e){
  if (e < 10){
    e = `0${e}`;
  }
  return e;
}

function addTime(){
  second++;
  if (second === 60){
    minute++;
    second = 0
  }
  if (minute === 60){
    hour++;
    minute = 0
  }
  hr.textContent = convertToString(hour);
  min.textContent = convertToString(minute);
  sec.textContent = convertToString(second);
  
}

// run when page opens
sessionStorage.clear()
postQuestion()
start()
