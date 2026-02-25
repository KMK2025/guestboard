let currentPostId = null;

function getPosts() {
  return JSON.parse(localStorage.getItem("posts") || "[]");
}

function savePostsToStorage(posts) {
  localStorage.setItem("posts", JSON.stringify(posts));
}

function renderPosts() {
  const posts = getPosts();
  const tbody = document.getElementById("postTableBody");
  tbody.innerHTML = "";

  posts.forEach((post) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${post.id}</td>
      <td><a href="#" onclick="viewPost(${post.id})">${post.title}</a></td>
      <td>${new Date(post.createdAt).toLocaleDateString()}</td>
    `;

    tbody.appendChild(tr);
  });
}

function showWrite() {
  currentPostId = null;
  document.getElementById("title").value = "";
  document.getElementById("author").value = "";
  document.getElementById("password").value = "";
  document.getElementById("content").value = "";

  document.getElementById("listSection").style.display = "none";
  document.getElementById("writeSection").style.display = "block";
}

function goList() {
  document.getElementById("writeSection").style.display = "none";
  document.getElementById("listSection").style.display = "block";
  renderPosts();
}

function viewPost(id) {
  const posts = getPosts();
  const post = posts.find(p => p.id === id);

  currentPostId = id;

  document.getElementById("title").value = post.title;
  document.getElementById("author").value = post.author;
  document.getElementById("content").value = post.content;

  document.getElementById("password").value = "";

  document.getElementById("listSection").style.display = "none";
  document.getElementById("writeSection").style.display = "block";
}

function savePost() {
  const title = document.getElementById("title").value.trim();
  const author = document.getElementById("author").value.trim();
  const password = document.getElementById("password").value.trim();
  const content = document.getElementById("content").value.trim();

  if (!title || !author || !password || !content) {
    alert("모든 항목을 입력하세요.");
    return;
  }

  let posts = getPosts();

  if (currentPostId) {
    const index = posts.findIndex(p => p.id === currentPostId);
    if (posts[index].password !== password) {
      alert("비밀번호가 틀렸습니다.");
      return;
    }

    posts[index].title = title;
    posts[index].author = author;
    posts[index].content = content;
  } else {
    const newPost = {
      id: posts.length ? posts[posts.length - 1].id + 1 : 1,
      title,
      author,
      password,
      content,
      createdAt: new Date().toISOString()
    };
    posts.push(newPost);
  }

  savePostsToStorage(posts);
  goList();
}

function deletePost() {
  if (!currentPostId) return;

  const password = document.getElementById("password").value.trim();
  let posts = getPosts();
  const index = posts.findIndex(p => p.id === currentPostId);

  if (posts[index].password !== password) {
    alert("비밀번호가 틀렸습니다.");
    return;
  }

  posts.splice(index, 1);
  savePostsToStorage(posts);
  goList();
}

renderPosts();
