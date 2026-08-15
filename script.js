// ================================================
// 1. ИСПОЛЬЗУЕМ ГЛОБАЛЬНУЮ db ИЗ firebase-config.js
// ================================================
// НЕ ОБЪЯВЛЯЕМ const db! Используем window.db

// УНИКАЛЬНОЕ ИМЯ, КОТОРОЕ ТОЧНО НИГДЕ НЕ ВСТРЕТИТСЯ
const RELATIONSHIP_START_TIMESTAMP = new Date('2025-12-05T00:00:00');

// ================================================
// 2. ТАЙМЕР
// ================================================
function updateTimer() {
    const now = new Date();
    const diffMs = now - RELATIONSHIP_START_TIMESTAMP;
    const diffSec = Math.floor(diffMs / 1000);
    const days = Math.floor(diffSec / 86400);
    const hours = Math.floor((diffSec % 86400) / 3600);
    const minutes = Math.floor((diffSec % 3600) / 60);
    const seconds = diffSec % 60;
    const timerElement = document.getElementById('timerDisplay');
    if (timerElement) {
        timerElement.innerHTML = 
            `${days} <span style="font-size:0.4rem;">дней</span> ` +
            `${hours} <span style="font-size:0.4rem;">ч</span> ` +
            `${minutes} <span style="font-size:0.4rem;">мин</span> ` +
            `${seconds} <span style="font-size:0.4rem;">сек</span>`;
    }
}
updateTimer();
setInterval(updateTimer, 1000);

// ================================================
// 3. МУЗЫКАЛЬНАЯ КНОПКА
// ================================================
function toggleMusic() {
    const audio = document.getElementById('loveAudio');
    const btn = document.getElementById('playMusicBtn');
    if (!audio || !btn) return;
    if (audio.paused) {
        audio.play()
            .then(() => {
                btn.innerHTML = '⏸ Остановить музыку';
            })
            .catch(err => {
                alert('Не удалось воспроизвести музыку. Проверьте файл love_song.mp3.');
                console.error('Ошибка воспроизведения:', err);
            });
    } else {
        audio.pause();
        btn.innerHTML = '🎵 Послушай как звучат мои чувства к тебе';
    }
}
window.toggleMusic = toggleMusic;

document.addEventListener('DOMContentLoaded', function() {
    const audio = document.getElementById('loveAudio');
    if (audio) {
        audio.addEventListener('ended', function() {
            const btn = document.getElementById('playMusicBtn');
            if (btn) btn.innerHTML = '🎵 Послушай как звучат мои чувства к тебе';
        });
    }
});

// ================================================
// 4. ЧАТ С АВТОРОМ И ПОЛНОЙ ДАТОЙ
// ================================================
function sendMessage() {
    const input = document.getElementById('messageInput');
    const text = input.value.trim();
    if (text === '') return;

    const authorRadio = document.querySelector('input[name="author"]:checked');
    const author = authorRadio ? authorRadio.value : 'Я';

    window.db.collection('messages').add({
        text: text,
        author: author,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        likes: 0
    })
    .then(() => {
        input.value = '';
        input.focus();
    })
    .catch(err => alert('Ошибка отправки: ' + err.message));
}
window.sendMessage = sendMessage;

document.addEventListener('DOMContentLoaded', function() {
    const input = document.getElementById('messageInput');
    if (input) {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
});

function likeMessage(messageId, currentLikes) {
    window.db.collection('messages').doc(messageId).update({
        likes: firebase.firestore.FieldValue.increment(1)
    })
    .catch(err => console.error('Ошибка лайка:', err));
}
window.likeMessage = likeMessage;

// Подписка на сообщения
window.db.collection('messages')
    .orderBy('timestamp', 'asc')
    .limit(100)
    .onSnapshot((snapshot) => {
        const messagesList = document.getElementById('messagesList');
        let html = '';
        snapshot.forEach((doc) => {
            const data = doc.data();
            const id = doc.id;
            const text = data.text || '❤️';
            const author = data.author || 'Аноним';
            const likes = data.likes || 0;
            let dateTimeStr = '';
            if (data.timestamp) {
                const date = data.timestamp.toDate();
                dateTimeStr = date.toLocaleString('ru-RU', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }
            const messageClass = (author === 'Я') ? 'message-my' : 'message-her';
            html += `
                <div class="${messageClass}" style="display: flex; justify-content: space-between; align-items: center; padding-right: 10px;">
                    <div>
                        <span class="message-author">${author}</span>
                        <span class="message-time">${dateTimeStr}</span><br>
                        ${text}
                    </div>
                    <div style="display: flex; align-items: center; gap: 5px;">
                        <button onclick="likeMessage('${id}', ${likes})" style="background: none; border: none; font-size: 1.2em; cursor: pointer; color: #d4538c;">❤️</button>
                        <span style="font-weight: bold; color: #b34180;">${likes}</span>
                    </div>
                </div>
            `;
        });
        messagesList.innerHTML = html;
        messagesList.scrollTop = messagesList.scrollHeight;
    }, (error) => {
        console.error('Ошибка загрузки чата:', error);
        document.getElementById('messagesList').innerHTML = '<p>Ошибка загрузки чата. Проверьте Firebase.</p>';
    });