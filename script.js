'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Oscar Garza',
  transactions: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  transactionsDates: [
    '2023-01-18T21:31:17.178Z',
    '2023-02-23T07:42:02.383Z',
    '2023-03-28T09:15:04.904Z',
    '2023-04-01T10:17:24.185Z',
    '2023-04-25T14:11:59.604Z',
    '2023-04-27T17:01:17.194Z',
    '2023-04-30T23:36:17.929Z',
    '2023-05-01T10:51:36.790Z',
  ],
  currency: 'USD',
  locale: 'en-US', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  transactions: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  transactionsDates: [
    '2022-11-01T13:15:33.035Z',
    '2022-11-30T09:48:16.867Z',
    '2022-12-25T06:04:23.907Z',
    '2023-01-25T14:18:46.235Z',
    '2023-02-05T16:33:06.386Z',
    '2023-06-10T14:43:26.374Z',
    '2023-07-05T18:49:59.371Z',
    '2023-07-06T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerTransactions = document.querySelector('.transactions');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

//////////////////////////////
// Functions

const formatTransactionDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);
  // console.log(locale);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  // const day = `${date.getDate()}`.padStart(2, 0);
  // const month = `${date.getMonth() + 1}`.padStart(2, 0);
  // const year = date.getFullYear();
  // return `${month}/${day}/${year}`;

  return new Intl.DateTimeFormat(locale).format(date);
};

const formatCurrency = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

const displayTransactions = function (account, sort = false) {
  containerTransactions.innerHTML = '';

  const trans = sort
    ? account.transactions.slice().sort((a, b) => a - b)
    : account.transactions;

  trans.forEach(function (transaction, index) {
    const type = transaction > 0 ? 'deposit' : 'withdrawal';
    const date = new Date(account.transactionsDates[index]);
    const displayDate = formatTransactionDate(date, account.locale);

    const formattedTransaction = formatCurrency(
      transaction,
      account.locale,
      account.currency
    );

    const html = `        
    <div class="transactions__row">
      <div class="transactions__type transactions__type--${type}">${
      index + 1
    } ${type}</div>
    <div class="transactions_date">${displayDate}</div>
      <div class="transactions__value">${formattedTransaction}</div>
    </div>
    `;

    containerTransactions.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (account) {
  account.balance = account.transactions.reduce(
    (accumulator, transaction) => accumulator + transaction,
    0
  );
  labelBalance.textContent = formatCurrency(
    account.balance,
    account.locale,
    account.currency
  );
};

const calcDisplaySummary = function (account) {
  const income = account.transactions
    .filter(transaction => transaction > 0)
    .reduce((acc, transaction) => acc + transaction, 0);
  labelSumIn.textContent = formatCurrency(
    income,
    account.locale,
    account.currency
  );

  const out = account.transactions
    .filter(transaction => transaction < 0)
    .reduce((acc, transaction) => acc + transaction, 0);
  labelSumOut.textContent = formatCurrency(
    out,
    account.locale,
    account.currency
  );

  const interest = account.transactions
    .filter(transaction => transaction > 0)
    .map(transaction => (transaction * account.interestRate) / 100)
    .filter(interest => interest >= 1)
    .reduce((acc, transaction) => acc + transaction, 0);
  labelSumInterest.textContent = formatCurrency(
    interest,
    account.locale,
    account.currency
  );
};

const createUserNames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};

createUserNames(accounts);

const updateUI = function (account) {
  // Display transactions
  displayTransactions(account);
  //Display balance
  calcDisplayBalance(account);
  // Display summary
  calcDisplaySummary(account);
};

const startLogOutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    // In each call , print the remaining time to UI
    labelTimer.textContent = `${min}:${sec}`;

    // When 0 seconds, stop timer and logout user
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textcontent = 'Log in to get started';
      containerApp.style.opacity = 0;
    }
    // Decrease 1 second
    time--;
  };
  // Set the time to 5 minutes
  let time = 120;
  // Call the timer every second
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

///////////////////////////////////////////////////////
// Event handlers
let currentAccount, timer;
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;

btnLogin.addEventListener('click', function (event) {
  event.preventDefault();
  currentAccount = accounts.find(
    account => account.username === inputLoginUsername.value
  );
  // console.log(currentAccount);
  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and welcome message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    // Current Date
    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      weekday: 'long',
    };

    // const locale = navigator.language;

    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);
    // const day = `${now.getDate()}`.padStart(2, 0);
    // const month = `${now.getMonth() + 1}`.padStart(2, 0);
    // const year = now.getFullYear();
    // const hour = `${now.getHours()}`.padStart(2, 0);
    // const min = `${now.getMinutes()}`.padStart(2, 0);

    // labelDate.textContent = `${month}/${day}/${year}, ${hour}:${min}`;

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // Timer
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();
    // UPdate the User Interface
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (event) {
  event.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';
  inputTransferAmount.blur();
  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    currentAccount.transactions.push(-amount);
    receiverAcc.transactions.push(amount);

    // Add transfer date
    currentAccount.transactionsDates.push(new Date().toISOString());
    receiverAcc.transactionsDates.push(new Date().toISOString());

    // UPdate user interface
    updateUI(currentAccount);

    // Reset the timer
    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

btnLoan.addEventListener('click', function (event) {
  event.preventDefault();
  const amount = Math.floor(inputLoanAmount.value);
  if (
    amount > 0 &&
    currentAccount.transactions.some(transaction => transaction >= amount * 0.1)
  ) {
    // Add transaction
    setTimeout(function () {
      currentAccount.transactions.push(amount);
      // Add loan date
      currentAccount.transactionsDates.push(new Date().toISOString());
      //Update UI
      updateUI(currentAccount);

      // Reset Timer
      clearInterval(timer);
      timer = startLogOutTimer();
    }, 2500);
  }
  inputLoanAmount.value = '';
  inputLoanAmount.blur();
});

btnClose.addEventListener('click', function (event) {
  event.preventDefault();
  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );

    // Delete Account
    accounts.splice(index, 1);
    // Hide UI
    containerApp.style.opacity = 0;
  }
  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (event) {
  event.preventDefault();
  displayTransactions(currentAccount, !sorted);
  sorted = !sorted;
});

const transactions = [200, 450, -400, 3000, -650, -130, 70, 1300];

///////////////////////////////////////////////////////////////////////
// setInterval(function () {
//   const options = {
//     hour: 'numeric',
//     minute: 'numeric',
//     second: 'numeric',
//   };
//   const now = new Date();
//   console.log(now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds());
// }, 1000);
// const ingredients = ['pepperoni', 'extra cheese', 'jalapenos'];

// const orderPizza = setTimeout(
//   (ing1, ing2, ing3) => {
//     console.log(`Here is your ${ing1}, ${ing2}, and ${ing3} pizza 🍕`);
//   },
//   3000,
//   ...ingredients
// );
// console.log('Waiting for pizza...');

// if (ingredients.includes('jalapenos')) clearTimeout(orderPizza);

// const num = 3884764.23;
// const options2 = {
//   style: 'currency',
//   unit: 'celsius',
//   currency: 'USD',
// };

// console.log('US:', new Intl.NumberFormat('en-US', options2).format(num));
// console.log('Germany:', new Intl.NumberFormat('de-DE', options2).format(num));
// console.log('Syria:', new Intl.NumberFormat('ar-SY', options2).format(num));
// console.log(
//   navigator.language,
//   new Intl.NumberFormat(navigator.language).format(num)
// );

// const future = new Date(2037, 10, 19, 15, 23);
// console.log(+future);

// const calcDaysPassed = (date1, date2) =>
//   Math.abs(date2 - date1) / (1000 * 60 * 60 * 24);

// const days1 = calcDaysPassed(new Date(2037, 3, 14), new Date(2037, 3, 24));
// console.log(days1);
// const now = new Date();
// console.log(now);

// console.log(new Date('April 27 2023'));
// console.log(new Date('Decmber 25, 2023'));
// console.log(new Date(account1.transactionsDates[0]));
// console.log(new Date(2023, 3, 19, 15, 23, 5));
// console.log(new Date(0));
// console.log(new Date(3 * 24 * 60 * 60 * 1000));

// // Working with Dates
// const future = new Date(2037, 10, 19, 15, 23);
// console.log(future);
// console.log(future.getDate());
// console.log(future.getHours());
// console.log(future.getMinutes());
// console.log(future.getSeconds());
// console.log(future.toISOString());
// console.log(future.getTime());
// console.log(new Date(2142278580000));
// console.log(Date.now());
// future.setFullYear(2040);
// console.log(future);
// const diameter = 287_460_000_000;
// console.log(diameter);

// const price = 345_99;
// console.log(price);

// const transferFree = 15_00;
// const transferFee = 1_500;

// const PI = 3.1415;
// labelBalance.addEventListener('click', function () {
//   [...document.querySelectorAll('.transactions__row')].forEach(function (
//     row,
//     i
//   ) {
//     console.log(i);
//     if (i % 2 === 0) row.style.backgroundColor = 'orangered';
//   });
// });

//////////////////////////////////////////////////////////////////////////////
// Coding Challenge #4

/* 
Julia and Kate are still studying dogs, and this time they are studying if dogs are eating too much or too little.
Eating too much means the dog's current food portion is larger than the recommended portion, and eating too little is the opposite.
Eating an okay amount means the dog's current food portion is within a range 10% above and 10% below the recommended portion (see hint).

1. Loop over the array containing dog objects, and for each dog, calculate the recommended food portion and add it to the object as a new property. Do NOT create a new array, simply loop over the array. Forumla: recommendedFood = weight ** 0.75 * 28. (The result is in grams of food, and the weight needs to be in kg)
2. Find Sarah's dog and log to the console whether it's eating too much or too little. HINT: Some dogs have multiple owners, so you first need to find Sarah in the owners array, and so this one is a bit tricky (on purpose) 🤓
3. Create an array containing all owners of dogs who eat too much ('ownersEatTooMuch') and an array with all owners of dogs who eat too little ('ownersEatTooLittle').
4. Log a string to the console for each array created in 3., like this: "Matilda and Alice and Bob's dogs eat too much!" and "Sarah and John and Michael's dogs eat too little!"
5. Log to the console whether there is any dog eating EXACTLY the amount of food that is recommended (just true or false)
6. Log to the console whether there is any dog eating an OKAY amount of food (just true or false)
7. Create an array containing the dogs that are eating an OKAY amount of food (try to reuse the condition used in 6.)
8. Create a shallow copy of the dogs array and sort it by recommended food portion in an ascending order (keep in mind that the portions are inside the array's objects)

HINT 1: Use many different tools to solve these challenges, you can use the summary lecture to choose between them 😉
HINT 2: Being within a range 10% above and below the recommended portion means: current > (recommended * 0.90) && current < (recommended * 1.10). Basically, the current portion should be between 90% and 110% of the recommended portion.

TEST DATA:


GOOD LUCK 😀
*/
// const dogs = [
//   { weight: 22, curFood: 250, owners: ['Alice', 'Bob'] },
//   { weight: 8, curFood: 200, owners: ['Matilda'] },
//   { weight: 13, curFood: 275, owners: ['Sarah', 'John'] },
//   { weight: 32, curFood: 340, owners: ['Michael'] },
// ];

// // 1)////////////////////////////////
// dogs.forEach(dog => (dog.recFood = Math.trunc(dog.weight ** 0.75 * 28)));
// console.log(dogs);
// // 2) ////////////////////////////////
// const dogSarah = dogs.find(dog => dog.owners.includes('Sarah'));
// console.log(dogSarah);
// console.log(
//   `Sarah's dog is eating too ${
//     dogSarah.curFood > dogSarah.recFood ? 'much' : 'little'
//   }.`
// );
// // 3)//////////////////////////////////////////////
// const ownersEatTooMuch = dogs
//   .filter(dog => dog.curFood > dog.recFood)
//   .flatMap(dog => dog.owners);
// console.log(ownersEatTooMuch);

// const ownersEatTooLittle = dogs
//   .filter(dog => dog.curFood < dog.recFood)
//   .flatMap(dog => dog.owners);
// console.log(ownersEatTooLittle);
// // 4)//////////////////////////////////////////////
// console.log(`${ownersEatTooMuch.join(' and ')}'s dogs eat too much!`);
// console.log(`${ownersEatTooLittle.join(' and ')}'s dogs eat too little!`);
// // 5)/////////////////////////////////////////////
// console.log(dogs.some(dog => dog.curFood === dog.recFood));
// // 6 ) //////////////////////////////////////
// const checkEatingOkay = dog =>
//   dog.curFood > dog.recFood * 0.9 && dog.curFood < dog.recFood * 1.1;
// console.log(dogs.some(checkEatingOkay));
// // 7 ) //////////////////////////////////////
// console.log(dogs.filter(checkEatingOkay));
// // 8 ) //////////////////////////////////////
// const dogsSorted = dogs.slice().sort((a, b) => a.recFood - b.recFood);
// console.log(dogsSorted);
////////////////////////////////////////////////////////////////////////////////
// Array Practice
// 1.
// const bankDepositSum = accounts
//   .flatMap(acc => acc.transactions)
//   .filter(transaction => transaction > 0)
//   .reduce((acc, transaction) => acc + transaction, 0);
// console.log(bankDepositSum);

// // 2.
// // const numDeposits1000 = accounts
// //   .flatMap(acc => acc.transactions)
// //   .filter(transaction => transaction >= 1000).length;
// // console.log(numDeposits1000);

// const numDeposits1000 = accounts
//   .flatMap(acc => acc.transactions)
//   .reduce((acc, cur) => (cur >= 1000 ? ++acc : acc), 0);
// console.log(numDeposits1000);

// // 3.
// const { deposits, withdrawals } = accounts
//   .flatMap(acc => acc.transactions)
//   .reduce(
//     (sum, cur) => {
//       // cur > 0 ? (sum.deposits += cur) : (sum.withdrawals += cur);
//       sum[cur > 0 ? 'deposits' : 'withdrawals'] += cur;
//       return sum;
//     },
//     { deposits: 0, withdrawals: 0 }
//   );

// console.log(deposits, withdrawals);

// // 4.
// // this is a nice title => This Is a Nice Title
// const convertTitleCase = function (title) {
//   const capitalize = str => str[0].toUpperCase() + str.slice(1);

//   const exceptions = [
//     'a',
//     'an',
//     'the',
//     'but',
//     'and',
//     'or',
//     'on',
//     'in',
//     'width',
//   ];

//   const titleCase = title
//     .toLowerCase()
//     .split(' ')
//     .map(word => (exceptions.includes(word) ? word : capitalize(word)))
//     .join(' ');
//   return capitalize(titleCase);
// };

// console.log(convertTitleCase('this is a nice title'));
// console.log(convertTitleCase('this is a LONG title but not too long'));
// console.log(convertTitleCase('and here is another title with an EXMPLE'));

// const x = new Array(7);
// console.log(x);
// // console.log(x.map(() => 5));
// x.fill(1, 3, 5);
// console.log(x);

// x.fill(23, 2, 6);
// console.log(x);
// const y = Array.from({ length: 7 }, () => 1);
// console.log(y);

// const z = Array.from({ length: 7 }, (_, i) => i + 1);
// console.log(z);

// labelBalance.addEventListener('click', function () {
//   const transactionsUI = Array.from(
//     document.querySelectorAll('.transactions__value'),
//     el => Number(el.textContent.replace('$', ''))
//   );
//   console.log(transactionsUI);
// });

// const diceRoll = Array.from({ length: 100 }, () =>
//   Math.floor(Math.random() * 6 + 1)
// );

// console.log(diceRoll);
// const owners = ['Oscar', 'David', 'Michael', 'Tiger'];
// console.log(owners.sort());
// console.log(owners);

// console.log(transactions);
// transactions.sort((a, b) => {
//   if (a > b) return 1;
//   if (b > a) return -1;
// });

// console.log(transactions);
// transactions.sort((a, b) => {
//   if (a > b) return -1;
//   if (b > a) return 1;
// });

// console.log(transactions);
// transactions.sort((a, b) => a - b);
// console.log(transactions);
// transactions.sort((a, b) => b - a);
// console.log(transactions);

// const arr = [1, 2, 3, [4, 5, 6], 7, 8];
// console.log(arr.flat());
// const arrDeep = [[1, 2], 3, [4, [5, 6]], 7, 8];
// console.log(arrDeep.flat(2));
// console.log(accounts);
// const accountTransactions = accounts.map(acc => acc.transactions);
// console.log(accountTransactions);
// const allTransactions = accountTransactions.flat();
// const overallBalance = allTransactions.reduce(
//   (acc, transaction) => acc + transaction,
//   0
// );
// console.log(overallBalance);
// const overAllBalance = accounts
//   .map(acc => acc.transactions)
//   .flat()
//   .reduce((acc, tran) => acc + tran, 0);
// console.log(overAllBalance);

// const overAllBalance2 = accounts
//   .flatMap(acc => acc.transactions)
//   .reduce((acc, tran) => acc + tran, 0);
// console.log(overAllBalance2);
// console.log(transactions.every(transaction => transaction > 0));
// console.log(account4.transactions.every(transaction => transaction > 0));

// const deposit = transaction => transaction < 0;
// console.log(transactions.some(deposit));
// console.log(transactions.every(deposit));
// console.log(transactions.filter(deposit));

// console.log(transactions);
// console.log(transactions.includes(-130));

// transactions.some(move => move === -130);

// const anyDeposits = transactions.some(transaction => transaction > 1500);
// console.log(anyDeposits);
// console.log(transactions.find(transaction => transaction < 0));

// console.log(accounts);
// const account = accounts.find(acc => acc.owner === 'Jessica Davis');
// console.log(account);

// let accountSecond;
// for (let account of accounts) {
//   if (account.owner === 'Jessica Davis') {
//     accountSecond = account;
//   }
// }

// console.log(accountSecond);
// const totalDepositEuro = transactions
//   .filter(transaction => transaction > 0)
//   .map(transaction => transaction / 1.1)
//   .reduce((acc, transaction) => acc + transaction, 0);

// console.log(totalDepositEuro);

///////////////////////////////////////////////////
// Coding Challenge #2
/*
Let's go back to Julia and Kate's study about dogs. This time, they want to convert dog ages to human ages and calculate the average age of the dogs in their study.

Create a function 'calcAverageHumanAge', which accepts an array of dog's ages ('ages'), and does the following things in order: 

1. Calculate the dog age in human years using the following formula: if the dog is <= 2 years old, humanAge = 2 * dogAGe. If the dog is > 2 years old, humanAge = 16 + dogAge * 4.
2. Exclude all dogs that are less than 18 human years old (which is the same as keeping dogs that are at least 18 years old).
3. Calculate the average human age of all adult dogs (you should already know from other challenges how we calculate averages)
4. Run the function for both test datasets

TEST DATE 1: [5, 2, 4, 1, 15, 8, 3]
TEST DATE 2: [16, 6, 10, 5, 6, 1, 4]

*/

// const calcAverageHumanAge = function (ages) {
//   const dogToHumanAverage = ages
//     .map(age => (age <= 2 ? 2 * age : 16 + age * 4))
//     .filter(age => age >= 18)
//     .reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);
//   // const adults = humanAges.filter(age => age >= 18);
//   // const average = adults.reduce(
//   //   (acc, cur, i, arr) => acc + cur / arr.length,
//   //   0
//   // );
//   return dogToHumanAverage;
// };

// const avg1 = calcAverageHumanAge([5, 2, 4, 1, 15, 8, 3]);
// const avg2 = calcAverageHumanAge([16, 6, 10, 5, 6, 1, 4]);
// console.log(avg1, avg2);
/////////////////////////////////////////////////
// Coding Challenge #1
/*

Julia and Kate are doing a study on dogs. So each of them asked 5 dog owners about their dog's age, and stored the data into an array (one array for each). For now, they are just interested in knowing whether a dog is an adult or a puppy. A dog is an adult if it is at least 3 years old, and it's a puppy if it's less than 3 years old. 

Create a function 'checkDogs', which accepts 2 arrays of dog's ages ('dogsJulia' and 'dogsKate'), and does the following things:

1. Julia found out that the owners of the FIRST and the LAST TWO dogs actually have cats, not dogs! So create a shallow copy of Julia's array, and remove the cat ages from that copied array (because it's a bad practice to mutate function parameters)
2. Create an array with both Julia's (corrected) and Kate's data
3. For each remaining dog, log to the console whether it's an adult ("Dog number 1 is an adult, and is 5 years old") or a puppy ("Dog number 2 is still a puppy 🐶")
4. Run the function for both test datasets

HINT: Use tools from all lectures in this section.

TEST DATA 1: Julia's data [3, 5, 2, 12, 7], Kate's data [4, 1, 15, 8, 3]
TEST DATA 2: Julia's data [9, 16, 6, 8, 3], Kate's data [10, 5, 6, 1, 4]

*/
// const dogsJulia = [3, 5, 2, 12, 7];
// const dogsKate = [4, 1, 15, 8, 3];

// const checkDogs = function (arr1, arr2) {
//   const dogsJuliaCorrected = arr1.slice();
//   dogsJuliaCorrected.splice(0, 1);
//   dogsJuliaCorrected.splice(-2);

//   const dogsCombined = dogsJuliaCorrected.concat(arr2);
//   dogsCombined.forEach(function (dog, index, arr) {
//     dog >= 3
//       ? console.log(
//           `Dog number ${index + 1} is an adult, and is ${dog} years old`
//         )
//       : console.log(`Dog number ${index + 1} is still a puppy 🐶`);
//   });
// };

// checkDogs(dogsJulia, dogsKate);

/////////////////////////////////////////////////
// LECTURES

// const currencies = new Map([
//   ['USD', 'United States dollar'],
//   ['EUR', 'Euro'],
//   ['GBP', 'Pound sterling'],
// ]);

// const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

/////////////////////////////////////////////////
// let arr = ['a', 'b', 'c', 'd', 'e'];

// // SLICE
// console.log(arr.slice(2));
// console.log(arr.slice(2, 4));
// console.log(arr.slice(-2));
// console.log(arr.slice(-1));
// console.log(arr.slice(1, -2));
// console.log(arr.slice());
// console.log([...arr]);

// // SPLICE
// // console.log(arr.splice(2));
// arr.splice(-1);
// console.log(arr);
// arr.splice(1, 2);
// console.log(arr);

// // REVERSE
// arr = ['a', 'b', 'c', 'd', 'e'];
// const arr2 = ['j', 'i', 'h', 'g', 'f'];
// console.log(arr2.reverse());
// console.log(arr2);

// // CONCAT
// const letters = arr.concat(arr2);
// console.log(letters);
// console.log([...arr, ...arr2]);

// // JOIN
// console.log(letters.join(' - '));

// const arr = [23, 11, 64];
// console.log(arr[0]);
// console.log(arr.at(0));

// console.log(arr[arr.length - 1]);
// console.log(arr.slice(-1)[0]);
// console.log(arr.at(-1));
// console.log('Oscar Garza'.at(-1));

// forEach();
// const transactions = [200, 450, -400, 3000, -650, -130, 70, 1300];

// // for (const transaction of transactions) {
// for (const [i, transaction] of transactions.entries()) {
//   if (transaction > 0) {
//     console.log(`Transaction ${i + 1}: You deposited ${transaction} dollars`);
//   } else {
//     console.log(
//       `Transaction ${i + 1}: You withdrew ${Math.abs(transaction)} dollars`
//     );
//   }
// }
// console.log('---------------- forEach() ----------------------');
// transactions.forEach(function (transaction, index, array) {
//   transaction > 0
//     ? console.log(
//         `Transaction ${index + 1}: You deposited ${transaction} dollars`
//       )
//     : console.log(
//         `Transaction ${index + 1}: You withdrew ${Math.abs(
//           transaction
//         )} dollars`
//       );
// });

// Map
// const currencies = new Map([
//   ['USD', 'United States dollar'],
//   ['EUR', 'Euro'],
//   ['GBP', 'Pound sterling'],
// ]);

// currencies.forEach(function (value, key, map) {
//   console.log(`${key}: ${value}`);
// });

// // Set
// const currenciesUnique = new Set(['USD', 'GBP', 'USD', 'EUR', 'EUR']);
// console.log(currenciesUnique);
// currenciesUnique.forEach(function (value, key, map) {
//   console.log(`${key}: ${value}`);
// });
// const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

// const eurtoUsd = 1.1;

// const movementsUSD = movements.map(mov => mov * eurtoUsd);

// console.log(movements);
// console.log(movementsUSD);

// const movementsUSDfor = [];
// for (const mov of movements) movementsUSDfor.push(mov * eurtoUsd);
// console.log(movementsUSDfor);

// const movementsDescriptions = movements.map(
//   (movement, index) =>
//     `Movement ${index + 1}: You ${
//       movement > 0 ? 'deposited' : 'withdrew'
//     } ${Math.abs(movement)}`
// );

// console.log(movementsDescriptions);

// const deposits = transactions.filter(transaction => transaction > 0);
// const withdrawals = transactions.filter(transaction => transaction < 0);
// console.log(transactions);
// console.log(deposits);
// console.log(withdrawals);
// console.log(transactions);

// accumulator is like a snowball
// const balance = transactions.reduce(function (
//   accumulator,
//   current,
//   index,
//   array
// ) {
//   console.log(`Iteration ${index}: ${accumulator}`);
//   return accumulator + current;
// },
// // 0);
// const balance = transactions.reduce((acc, cur) => acc + cur, 0);

// let balance2 = 0;
// for (const mov of transactions) balance2 += mov;

// console.log(balance);
// console.log(balance2);

// // Maximum value of the transactions array
// const maxValue = transactions.reduce((acc, cur) => {
//   if (acc > cur) return acc;
//   else return cur;
// }, transactions[0]);

// console.log(maxValue);
