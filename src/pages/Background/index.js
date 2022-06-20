// import { initializeApp } from 'firebase/app';
// import { getAnalytics } from 'firebase/analytics';
// console.log('This is the background page.');
// console.log('Put the background scripts here.');
// import { Seaport } from '@opensea/seaport-js';
// import { ethers } from 'ethers';
// const provider = ethers.getDefaultProvider();

// const seaport = new Seaport(provider);

// console.log('seaport', seaport);
// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: 'AIzaSyBfhHb6ijvI30ej0lkMMNtSVnMX-uZ2nik',
//   authDomain: 'spy-volcano.firebaseapp.com',
//   projectId: 'spy-volcano',
//   storageBucket: 'spy-volcano.appspot.com',
//   messagingSenderId: '820658952893',
//   appId: '1:820658952893:web:52d63277461057fd8eb5d4',
//   measurementId: 'G-R2V0FT6BWX',
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

chrome.storage.onChanged.addListener(function (changes, areaName) {
  console.log('storage area ', areaName);
  if (changes.extensionConfig) {
    console.log('storage changes', changes.extensionConfig);
  }
});
