const postForm = document.getElementById("postForm");
const postTableBody = document.getElementById("postTableBody");

function getPosts() {
  return JSON.parse(localStorage.getItem("posts") || "[]");
}

function savePosts(posts) {
  localStorage.setItem("posts", JSON.stringify(posts));
}

function renderPosts() {
  const posts = getPosts();
  postTableBody.innerHTML = "";

  if (posts.length === 0) {
    postTableBody.innerHTML =
      "<tr><td colspan='5' class='empty-state'>게시글이 없습니다.</td></tr>";
    return;
  }

  posts.forEach((post) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${post.id}</td>
      <td>
        <div class="post-title">${post.title}</div>
        <div class="post-content">${post.content}</div>
      </td>
      <td>${post.author}</td>
      <td>${new Date(post.createdAt).toLocaleString()}</td>
      <td class="actions">
        <button class="delete-btn" onclick="deletePost(${post.id})">삭제</button>
      </td>
    `;

    postTableBody.appendChild(tr);
  });
}

postForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const title = document.getElementById("title").value.trim();
  const author = document.getElementById("author").value.trim();
  const content = document.getElementById("content").value.trim();

  if (!title || !author || !content) {
    alert("모든 필드를 입력하세요.");
    return;
  }

  const posts = getPosts();
  const newPost = {
    id: posts.length ? posts[posts.length - 1].id + 1 : 1,
    title,
    author,
    content,
    createdAt: new Date().toISOString(),
  };

  posts.push(newPost);
  savePosts(posts);

  postForm.reset();
  renderPosts();
});

function deletePost(id) {
  let posts = getPosts();
  posts = posts.filter((p) => p.id !== id);
  savePosts(posts);
  renderPosts();
}

renderPosts();
