const client = supabase.createClient(
  "https://fjplxctsssuyqildpjxt.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqcGx4Y3Rzc3N1eXFpbGRwanh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2ODM3OTIsImV4cCI6MjA5MjI1OTc5Mn0.bk8cK0nhy9Et2oAS5-LSGwq2tneT1NUAa5Aksw1svBc"
);

let user = null;
let currentQuiz = null;

// ===== 初期 =====
init();

async function init() {
  const { data, error } = await client.auth.getUser();

  if (error) {
    console.error(error);
    return;
  }

  user = data.user;

  if (user) renderHome();
  else renderLogin();
}

// ===== ログイン =====
function renderLogin() {
  app.innerHTML = `
    <div class="card">
      <h2>ログイン</h2>
      <button onclick="login()">Googleログイン</button>
    </div>
  `;
}

async function login() {
  await supabase.auth.signInWithOAuth({ provider: "google" });
}

// ===== ホーム =====
function renderHome() {
  actions.innerHTML = `<button onclick="logout()">ログアウト</button>`;

  app.innerHTML = `
    <div class="card">
      <h2>${user.email}</h2>
      <button onclick="createUI()">問題作成</button>
      <button onclick="loadQuestions()">問題一覧</button>
      <div id="list"></div>
    </div>
  `;
}

// ===== ログアウト =====
async function logout() {
  await supabase.auth.signOut();
  location.reload();
}

// ===== 作成UI =====
function createUI() {
  app.innerHTML = `
    <div class="card">
      <h2>問題作成</h2>
      <input id="title" class="input" placeholder="タイトル">
      <input id="content" class="input" placeholder="問題文">
      <button onclick="save()">保存</button>
    </div>
  `;
}

// ===== 保存 =====
async function save() {
  const title = val("title");
  const content = val("content");

  if (!title || !content) return alert("入力不足");

  await supabase.from("questions").insert([
    { title, content, user_id: user.id }
  ]);

  renderHome();
}

// ===== 一覧 =====
async function loadQuestions() {
  const { data } = await supabase
    .from("questions")
    .select("*")
    .order("created_at", { ascending: false });

  const list = document.getElementById("list");
  list.innerHTML = "";

  data.forEach(q => {
    const div = document.createElement("div");
    div.className = "card";

    const title = document.createElement("b");
    title.textContent = q.title;

    const btn = document.createElement("button");
    btn.textContent = "解く";
    btn.onclick = () => start(q);

    div.appendChild(title);
    div.appendChild(btn);
    list.appendChild(div);
  });
}

// ===== 開始 =====
function start(q) {
  currentQuiz = q;

  app.innerHTML = `
    <div class="card">
      <h2>${q.title}</h2>
      <p>${q.content}</p>
      <input id="answer" class="input">
      <button onclick="submit()">提出</button>
    </div>
  `;
}

// ===== 提出 =====
async function submit() {
  const answer = val("answer");

  await supabase.from("submissions").insert([
    {
      user_id: user.id,
      question_id: currentQuiz.id,
      answer
    }
  ]);

  renderHome();
}

// ===== util =====
function val(id) {
  return document.getElementById(id).value;
}
