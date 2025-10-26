// quiz.js - نسخة نهائية مستقرة تدعم كل الأجهزة (بما فيها الموبايل)

// العناصر
const startBtn = document.getElementById("start-btn");
const quizBox = document.getElementById("quiz-box");
const questionContainer = document.getElementById("question-container");
const answersContainer = document.getElementById("answers-container");
const timerElement = document.getElementById("timer");
const resultBox = document.getElementById("result-box");
const startBox = document.getElementById("start-box");
const testBtn = document.getElementById("test-btn");
const msgBox = document.getElementById("msg-box");

// إعدادات المسابقة
const PLAYED_KEY = "fifa_arab_played_single_v5";
const STARTED_KEY = "fifa_arab_started_v5";
const PRIZE_AMOUNT = 200000;
const CODE_PREFIX = "FA-";

// حالة اللعبة
let questions = [];
let currentQuestion = 0;
let score = 0;
let timeLeft = 15;
let timerInterval = null;
let isTestMode = false;

// دوال المساعدة
function showMsg(text) {
  msgBox.textContent = text;
  msgBox.classList.add("show");
  msgBox.style.display = "block";
  setTimeout(() => {
    msgBox.style.display = "none";
  }, 4000);
}

function shuffleArray(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

function generateWinnerCode() {
  return CODE_PREFIX + Math.floor(10000 + Math.random() * 90000);
}

// تحميل الأسئلة
async function loadQuestions() {
  try {
    const res = await fetch("questions.json");
    const data = await res.json();
    questions = shuffleArray(data).slice(0, 10);
    questions.forEach(q => q.options = shuffleArray(q.options));
    return true;
  } catch (err) {
    console.error(err);
    showMsg("حدث خطأ أثناء تحميل الأسئلة.");
    return false;
  }
}

// عرض السؤال
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

// اختيار الإجابة
function selectAnswer(btn, correct) {
  clearInterval(timerInterval);
  if (btn.textContent === correct) score++;
  if (currentQuestion < questions.length - 1) {
    currentQuestion++;
    setTimeout(showQuestion, 400);
  } else {
    setTimeout(finishQuiz, 400);
  }
}

// المؤقت
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
  timerElement.textContent = "15";
}

// إنهاء المسابقة
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
      <p>الجائزة: 200 ألف كوينز 💰</p>
      <p>كود الفوز الخاص بك:</p>
      <div style="color:#FFD700;font-size:20px;font-weight:bold;margin-top:5px">${code}</div>
      <p>1️⃣ احتفظ بالكود لتسليم جائزتك (سكرين شوت)</p> 
      <p>2️⃣ تابع حسابات المتجر على تويتر وإنستجرام وقناة الواتساب.</p> 
      <p>3️⃣ ادخل على رابط المتجر وسجل بياناتك.👇</p>
      <a href="https://fifa-arab.com/RvlmExD" target="_blank" class="store-btn">🛒 الدخول للمتجر</a>
    `;
  } else {
    resultBox.innerHTML = `
      <h2>حظ أوفر المرة القادمة 🥺</h2>
      <p>أجبت ${score} من ${total} إجابات صحيحة.</p>
      <p>استعد للتحدي القادم مع متجر فيفا عرب 💪</p>
    `;
  }

  // بعد انتهاء المسابقة: تسجيل اللعب لمرة واحدة فقط
  if (!isTestMode) {
    localStorage.setItem(PLAYED_KEY, "1");
  }

  // نحذف مفتاح البداية لأنه خلصت المحاولة
  localStorage.removeItem(STARTED_KEY);

  isTestMode = false;
}

// بدء المسابقة
startBtn.addEventListener("click", async () => {
  // منع اللعب إذا سبق وشارك المستخدم
  if (!isTestMode && localStorage.getItem(PLAYED_KEY)) {
    showMsg("لقد بدأت المسابقة من قبل ولا يمكنك إعادة المحاولة 🔒");
    return;
  }

  // منع اللعب إذا بدأ بالفعل وخرج قبل النهاية
  if (!isTestMode && localStorage.getItem(STARTED_KEY)) {
    showMsg("لقد بدأت المسابقة مسبقًا ولا يمكنك إعادة المحاولة.");
    return;
  }

  const loaded = await loadQuestions();
  if (!loaded) return;

  // تسجيل أنه بدأ اللعبة فعليًا ولمنع أي محاولة لاحقة
  if (!isTestMode) {
    localStorage.setItem(STARTED_KEY, "1");
    localStorage.setItem(PLAYED_KEY, "1"); // هنا نسجل PLAYED_KEY من أول مرة
  }

  startBox.classList.add("hidden");
  resultBox.classList.add("hidden");
  quizBox.classList.remove("hidden");
  showQuestion();
});


// زر التجربة
testBtn.addEventListener("click", () => {
  isTestMode = true;
  showMsg("تم تفعيل وضع التجربة.");
});

// عند تحميل الصفحة
window.addEventListener("load", () => {
  // لو المستخدم خلص أو بدأ فعلاً يمنع فقط وضع اللعب العادي
  if (localStorage.getItem(PLAYED_KEY) || localStorage.getItem(STARTED_KEY)) {
    if (!isTestMode) {
      startBtn.disabled = false; // نسمح بالضغط لكن نعالج المنع من الداخل
      testBtn.hidden = false;
    }
  }
});
