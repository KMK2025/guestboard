import { initializeApp } from 
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

import { 
  getFirestore,
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  query,
  orderBy
} from 
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "여기에_본인값_입력",
  authDomain: "여기에_본인값_입력",
  projectId: "여기에_본인값_입력",
  storageBucket: "여기에_본인값_입력",
  messagingSenderId: "여기에_본인값_입력",
  appId: "여기에_본인값_입력"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const form = document.getElementById("postForm");
const postList = document.getElementById("postList");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("title").value.trim();
  const author = document.getElementById("author").value.trim();
  const content = document.getElementById("content").value.trim();

  if (!title || !author || !content) {
    alert("모든 항목을 입력하세요.");
    return;
  }

  await addDoc(collection(db, "posts"), {
    title,
    author,
    content,
    createdAt: serverTimestamp()
  });

  form.reset();
  loadPosts();
});

async function loadPosts() {
  postList.innerHTML = "";

  const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);

  querySnapshot.forEach((doc) => {
    const post = doc.data();
    const row = document.createElement("tr");

    const date = post.createdAt?.toDate();
    const formattedDate = date
      ? date.toLocaleString()
      : "";

    row.innerHTML = `
      <td>${post.title}</td>
      <td>${post.author}</td>
      <td>${formattedDate}</td>
    `;

    postList.appendChild(row);
  });
}

loadPosts();
