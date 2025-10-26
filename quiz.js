// quiz.js - نسخة اختبار + مسابقة واحدة (10 أسئلة) - جائزة 200,000 كوينز

///// العناصر /////
const startBtn = document.getElementById("start-btn");
const quizBox = document.getElementById("quiz-box");
const questionContainer = document.getElementById("question-container");
const answersContainer = document.getElementById("answers-container");
const timerElement = document.getElementById("timer");
const resultBox = document.getElementById("result-box");
const startBox = document.getElementById("start-box");
const testBtn = document.getElementById("test-btn");
const msgBox = document.getElementById("msg-box");

///// إعدادات المسابقة /////
const PLAYED_KEY = "fifa_arab_played_single_v2";
const PRIZE_AMOUNT = 200000;
const CODE_PREFIX = "FA-";

///// حالة اللعبة /////
let questions = [];
let currentQuestion = 0;
let score = 0;
let timeLeft = 15;
let timerInterval = null;
let isTestMode = false; // وضع التجربة

///// دوال مساعدة /////
function showMsg(text, type = "error") {
  msgBox.textContent = text;
  msgBox.className = type === "success" ? "success" : "error";
  msgBox.style.display = "block";
  setTimeout(() => (msgBox.style.display = "none"), 4000);
}

function shuffleArray(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

function generateWinnerCode() {
  return CODE_PREFIX + Math.floor(10000 + Math.random() * 90000);
}

///// تحميل الأسئلة من ملف JSON /////
async function loadQuestions() {
  try {
    const res = await fetch("questions.json");
    if (!res.ok) throw new Error("فشل تحميل ملف الأسئلة");
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      showMsg("حدث خطأ أثناء تحميل الأسئلة، حاول لاحقًا.", "error");
      return false;
    }
    questions = shuffleArray(data).slice(0, 10); // نختار 10 عشوائية
    questions.forEach(q => q.options = shuffleArray(q.options));
    return true;
  } catch (err) {
    console.error(err);
    showMsg("حدث خطأ أثناء تحميل الأسئلة، حاول لاحقًا.", "error");
    return false;
  }
}

///// عرض السؤال /////
function showQuestion() {
  const q = questions[currentQuestion];
  questionContainer.textContent = `${currentQuestion + 1}. ${q.question}`;
  answersContainer.innerHTML = "";

  q.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.className = "answer-btn";
    btn.textContent = opt;
    btn.onclick = () => selectAnswer(btn, q.answer);
    answersContainer.appendChild(btn);
  });

  resetTimer();
  startTimer();
}

///// اختيار الإجابة /////
function selectAnswer(btn, correct) {
  clearInterval(timerInterval);
  if (btn.textContent === correct) score++;
  if (currentQuestion < questions.length - 1) {
    currentQuestion++;
    setTimeout(showQuestion, 300);
  } else {
    setTimeout(finishQuiz, 300);
  }
}

///// المؤقت /////
function startTimer() {
  timeLeft = 15;
  timerElement.textContent = timeLeft;
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeLeft--;
    timerElement.textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      finishQuiz();
    }
  }, 1000);
}

function resetTimer() {
  clearInterval(timerInterval);
  timeLeft = 15;
  timerElement.textContent = timeLeft;
}

///// نهاية المسابقة /////
function finishQuiz() {
  clearInterval(timerInterval);
  quizBox.classList.add("hidden");
  resultBox.classList.remove("hidden");

  const total = questions.length;

  if (score === total) {
    const code = generateWinnerCode();
    resultBox.innerHTML = `
      <h2>🎉 مبروك الفوز يا بطل!</h2>
      <p>جاوبت صح على كل الأسئلة 👑</p>
      <p>الجائزة: ${PRIZE_AMOUNT.toLocaleString('en-US')} كوينز</p>
      <p>كود الفوز الخاص بك:</p>
      <div style="color:#FFD700;font-size:20px;font-weight:bold;margin-top:5px">${code}</div>
      <p>1️⃣ احتفظ بالكود لتسليم جائزتك (سكرين شوت)</p>
      <p>2️⃣ تابع حسابات المتجر على تويتر وانستجرام وقناة الواتساب.</p>
      <a href="https://fifa-arab.com" target="_blank" class="store-btn">🏪 الدخول للمتجر</a>
    `;
  } else {
    resultBox.innerHTML = `
      <h2>حظ أوفر المرة القادمة 😎</h2>
      <p>أجبت ${score} من ${total} إجابات صحيحة.</p>
      <p>استعد للتحدي القادم مع متجر فيفا عرب 💪</p>
    `;
  }

  if (!isTestMode) {
    localStorage.setItem(PLAYED_KEY, "1");
  }

  isTestMode = false;
}

///// بدء المسابقة /////
startBtn.addEventListener("click", async () => {
  if (!isTestMode && localStorage.getItem(PLAYED_KEY)) {
    showMsg("لقد شاركت بالفعل في المسابقة! لا يمكنك اللعب مرة ثانية.", "error");
    return;
  }

  const loaded = await loadQuestions();
  if (!loaded) return;

  currentQuestion = 0;
  score = 0;
  startBox.classList.add("hidden");
  resultBox.classList.add("hidden");
  quizBox.classList.remove("hidden");
  testBtn.hidden = true;

  showQuestion();
});

///// زر التجربة /////
testBtn.addEventListener("click", async () => {
  isTestMode = true;
  const loaded = await loadQuestions();
  if (!loaded) return;

  currentQuestion = 0;
  score = 0;
  startBox.classList.add("hidden");
  resultBox.classList.add("hidden");
  quizBox.classList.remove("hidden");

  showQuestion();
});

// تهيئة الصفحة
document.addEventListener("DOMContentLoaded", () => {
  resultBox.classList.add("hidden");
});
