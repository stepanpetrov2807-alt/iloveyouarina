// firebase-config.js
// =============================================
// 1. ВАШИ ДАННЫЕ FIREBASE (скопируйте из консоли)
// =============================================
const firebaseConfig = {
    apiKey: "AIzaSyCNNBwdcnvtfI_JontLKeyDT-P7OTuVwQY",
    authDomain: "ourlove-47edb.firebaseapp.com",
    projectId: "ourlove-47edb",
    storageBucket: "ourlove-47edb.firebasestorage.app",
    messagingSenderId: "661558001416",
    appId: "1:661558001416:web:7f0dac7ccbf51c427b76bd"
};

// Инициализация Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
db.settings({ merge: true });

// Экспортируем db для использования в других скриптах
window.db = db;