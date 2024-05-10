const QNum = sessionStorage.getItem('QNum').split(",");
const Q = sessionStorage.getItem('Q').split("%%%");
const userA = sessionStorage.getItem('userA').split(",");
const trueA = sessionStorage.getItem('trueA').split(",");
const isTrue = sessionStorage.getItem('isTrue').split(",");
const wrong = sessionStorage.getItem('wrong')
const eb = document.querySelector('.error-breakdown')
const output = []

console.log(isTrue);
console.log(Q);

for (let i=0; i<Q.length; i++){
  
  if (isTrue[i] === "true"){
    output.push(
      `
      <div class="a-${isTrue[i]}">
      <h3>Question ${QNum[i]}</h3>
      <svg
      version="1.2"
      x="0"
      y="0"
      width="1.5in"
      viewBox="0 0 39.397998 9.4490009"
      id="svg1"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:svg="http://www.w3.org/2000/svg">
      ${Q[i]}
      </svg>
      <p>your answer: ${userA[i]} &Omega;</p>
      </div>
      `
    )
  }
  else {
    output.push(
      `
      <div class="a-${isTrue[i]}">
      <h3>Question ${QNum[i]}</h3>
      <svg
      version="1.2"
      x="0"
      y="0"
      width="1.5in"
      viewBox="0 0 39.397998 9.4490009"
      id="svg1"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:svg="http://www.w3.org/2000/svg">
      ${Q[i]}
      </svg>
      <p>your answer: ${userA[i]} &Omega;<br>
      correct answer: ${trueA[i]} &Omega;</p>
      </div>
      `  
    )
  }
};

eb.innerHTML = output.join('');