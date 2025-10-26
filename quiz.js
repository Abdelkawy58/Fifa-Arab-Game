// quiz.js
// الإعدادات والـ IDs يجب أن تكون متطابقة مع HTML

// عناصر الواجهة
const startBtn = document.getElementById("start-btn");
const testBtn = document.getElementById("test-btn");
const quizBox = document.getElementById("quiz-box");
const questionContainer = document.getElementById("question-container");
const answersContainer = document.getElementById("answers-container");
const timerElement = document.getElementById("timer");
const resultBox = document.getElementById("result-box");
const startBox = document.getElementById("start-box");
const msgBox = document.getElementById("msg-box");

// مفاتيح التخزين
const PLAYED_KEY = "fifa_arab_played_single_v1";
const PLAYER_ID_KEY = "fifa_player_id";

// إعدادات المسابقة
const PRIZE_AMOUNT = 200000;
const CODE_PREFIX = "FA-";

// حالة
let questions = [];
let questionsLoaded = false;
let currentQuestion = 0;
let score = 0;
let timeLeft = 15;
let timerInterval = null;
let isTrial = false;

// دوال مساعدة
function showMsg(type, text) {
  // type: "error" | "success" | "info"
  msgBox.className = ""; // reset classes
  msgBox.classList.remove("hidden");
  if (type === "error") {
    msgBox.classList.add("error");
    msgBox.classList.remove("success", "info");
    msgBox.classList.add("error"); // style handled by CSS via #msg-box (we use classes for potential extensions)
  } else if (type === "success") {
    msgBox.classList.add("success");
  } else {
    msgBox.classList.add("info");
  }
  msgBox.textContent = text;
  msgBox.style.display = "block";
}

function hideMsg() {
  msgBox.style.display = "none";
  msgBox.className = "";
  msgBox.textContent = "";
}

function ensurePlayerId() {
  let pid = localStorage.getItem(PLAYER_ID_KEY);
  if (!pid) {
    pid = "p-" + Math.random().toString(36).slice(2, 12);
    try { localStorage.setItem(PLAYER_ID_KEY, pid); } catch (e) {}
  }
  return pid;
}

function generateWinnerCode() {
  return CODE_PREFIX + Math.floor(10000 + Math.random() * 90000);
}

// تحميل الأسئلة من questions.json (ملف في نفس المجلد)
async function loadQuestions() {
  questionsLoaded = false;
  try {
    const res = await fetch("questions.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    // الدالة تدعم إما مصفوفة أو كائن يملك حقل questions
    if (Array.isArray(data)) questions = data;
    else if (data && Array.isArray(data.questions)) questions = data.questions;
    else throw new Error("شكل ملف الأسئلة غير صحيح");
    if (questions.length === 0) throw new Error("قائمة الأسئلة فارغة");
    questionsLoaded = true;
    hideMsg();
  } catch (err) {
    console.error("خطأ تحميل الأسئلة:", err);
    showMsg("error", "نعتذر! حدث خطأ أثناء تحميل الأسئلة. تأكد من وجود ملف questions.json.");
  }
}

// عرض سؤال
function showQuestion() {
  if (!questionsLoaded || !questions || questions.length === 0) {
    showMsg("error", "نعتذر! الأسئلة غير متاحة الآن.");
    // إرجاع للـ start screen (لو كنت في trial، اظهر startBox)
    return;
  }

  // اخفاء زر التجربة أثناء الأسئلة
  if (testBtn) testBtn.style.display = "none";

  hideMsg();
  const q = questions[currentQuestion];
  questionContainer.textContent = `${currentQuestion + 1}. ${q.question}`;
  answersContainer.innerHTML = "";

  q.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.className = "answer-btn";
    btn.textContent = opt;
    btn.addEventListener("click", () => {
      // تعطيل كل الأزرار بعد اختيار واحد
      answersContainer.querySelectorAll(".answer-btn").forEach(b => b.disabled = true);
      selectAnswer(btn, q.answer);
    });
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
    setTimeout(showQuestion, 300);
  } else {
    setTimeout(finishQuiz, 300);
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
      // لو فات الوقت لأي سؤال => نهاية المسابقة مباشرة
      finishQuiz();
    }
  }, 1000);
}

function resetTimer() {
  clearInterval(timerInterval);
  timeLeft = 15;
  timerElement.textContent = timeLeft;
}

// إنهاء المسابقة
function finishQuiz() {
  clearInterval(timerInterval);
  quizBox.classList.add("hidden");
  resultBox.classList.remove("hidden");

  const total = questions.length;
  ensurePlayerId();

  if (score === total) {
    const code = generateWinnerCode();
    resultBox.innerHTML = `
      <h2>🎉 مبروك الفوز يا بطل!</h2>
      <p>جاوبت صح على كل الأسئلة 👑</p>
      <p>الجائزة: ${PRIZE_AMOUNT.toLocaleString("en-US")} كوينز</p>
      <p>كود الفوز الخاص بك:</p>
      <div style="color:#FFD700;font-size:20px;font-weight:bold;margin-top:5px">${code}</div>
      <p>1️⃣ احتفظ بالكود لتسليم جائزتك (سكرين شوت)</p>
      <p>2️⃣ تابع حسابات المتجر على تويتر وانستجرام وقناة الواتساب.</p>
      <p>3️⃣ ادخل على رابط المتجر وسجل بياناتك.👇</p>
      <a href="https://fifa-arab.com" target="_blank" class="store-btn">🏪 الدخول للمتجر</a>
    `;
  } else {
    resultBox.innerHTML = `
      <h2>حظ أوفر المرة القادمة</h2>
      <h2>روق يا بطل! 😎</h2>
      <p>أجبت ${score} من ${total} إجابات صحيحة.</p>
      <p>مع متجر فيفا عرب دايمًا كسبان انتظر المسابقة القادمة 💪</p>
    `;
  }

  // في حالة اللعب الحقيقي، نسجل أن اللاعب شارك بالمحاولة الحقيقية
  if (!isTrial) {
    try { localStorage.setItem(PLAYED_KEY, "1"); }
    catch (e) { console.warn("تعذر حفظ حالة المشاركة:", e); }
    showMsg("success", "تم تسجيل مشاركتك. مبروك إن فزت!"); // رسالة بسيطة توضح التسجيل
    // نخفي زر التجربة (لو أنت عايز تحكم فيه من CSS، ممكن تفعّله يدوياً)
    if (testBtn) testBtn.style.display = "none";
  } else {
    // لو كانت تجربة: نعرض رسالة ونرجع للشاشة الابتدائية بعد 1.5 ثانية
    showMsg("info", "هذه كانت محاولة تجريبية — اضغط ابدأ لو تريد اللعب الحقيقي.");
    isTrial = false;
    // أظهر زر التجربة لو كان مخفي سابقًا (لا نغّيره لو إنت بتحكم في CSS خارجي)
    if (testBtn && testBtn.hasAttribute("hidden")) {
      // لو كنت قد أخفيته في HTML عبر attribute hidden، لا نغيره
    } else if (testBtn) {
      testBtn.style.display = "inline-block";
    }
    // بعد انتهاء التجربة نعرض شاشة البداية حتى تضغط "ابدأ التحدي" لو حبيت
    setTimeout(() => {
      resultBox.classList.add("hidden");
      startBox.classList.remove("hidden");
    }, 900);
  }
}

// بدء المسابقة (حقيقي)
startBtn.addEventListener("click", () => {
  // منع اللعب أكثر من مرة (محلياً)
  if (localStorage.getItem(PLAYED_KEY)) {
    showMsg("error", "لقد شاركت بالفعل في المسابقة! لا يمكن اللعب مرة ثانية.");
    return;
  }

  // التأكد من تحميل الأسئلة
  if (!questionsLoaded || !questions || questions.length === 0) {
    showMsg("error", "نعتذر! الأسئلة غير محمّلة حالياً.");
    return;
  }

  // بدء اللعب الحقيقي
  isTrial = false;
  currentQuestion = 0;
  score = 0;
  startBox.classList.add("hidden");
  resultBox.classList.add("hidden");
  quizBox.classList.remove("hidden");
  // اخفاء زر التجربة أثناء اللعب
  if (testBtn) testBtn.style.display = "none";
  showQuestion();
});

// زر التجربة (trial) — يفتح تجربة بدون تسجيل PLAYED_KEY
if (testBtn) {
  testBtn.addEventListener("click", () => {
    // تحميل الأسئلة إن لم تكن محمّلة
    if (!questionsLoaded) {
      showMsg("info", "جارٍ تحميل الأسئلة... انتظر لحظة.");
      loadQuestions().then(() => {
        if (!questionsLoaded) return;
        startTrial();
      });
      return;
    }
    startTrial();
  });
}

function startTrial() {
  isTrial = true;
  currentQuestion = 0;
  score = 0;
  // نعرض الكويز بسدة trial، ونخفي startBox لراحة العرض
  startBox.classList.add("hidden");
  resultBox.classList.add("hidden");
  quizBox.classList.remove("hidden");
  // اخفاء زر التجربة أثناء العرض
  if (testBtn) testBtn.style.display = "none";
  showQuestion();
}

// تحميل الأسئلة عند فتح الصفحة
document.addEventListener("DOMContentLoaded", () => {
  resultBox.classList.add("hidden");
  // نحمّل الأسئلة لكن نظهر رسالة داخل الواجهة فقط عند الفشل
  loadQuestions();
});
