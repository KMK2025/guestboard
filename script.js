/* GitHub Pages용: 서버 없이 localStorage로 데이터 저장 */

const STORAGE_KEY = 'board-posts';

let cachedPosts = [];

let formMode = 'create';
let editingPostId = null;

function getPosts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function savePosts(posts) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  } catch (err) {
    alert('저장 중 오류가 발생했습니다.');
  }
}

function showListView() {
  const listSection = document.getElementById('listSection');
  const writeSection = document.getElementById('writeSection');
  const detailSection = document.getElementById('detailSection');

  if (listSection) listSection.hidden = false;
  if (writeSection) writeSection.hidden = true;
  if (detailSection) detailSection.hidden = true;
}

function showWriteView() {
  const listSection = document.getElementById('listSection');
  const writeSection = document.getElementById('writeSection');
  const detailSection = document.getElementById('detailSection');

  if (listSection) listSection.hidden = true;
  if (writeSection) writeSection.hidden = false;
  if (detailSection) detailSection.hidden = true;
}

function resetForm() {
  const titleEl = document.getElementById('title');
  const authorEl = document.getElementById('author');
  const passwordEl = document.getElementById('password');
  const contentEl = document.getElementById('content');

  if (titleEl) titleEl.value = '';
  if (authorEl) authorEl.value = '';
  if (passwordEl) passwordEl.value = '';
  if (contentEl) contentEl.value = '';
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
}

function renderPosts(posts) {
  cachedPosts = posts.slice();
  const tbody = document.getElementById('postList');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (!posts.length) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 4;
    td.className = 'empty-state';
    td.textContent = '등록된 게시글이 없습니다. 첫 글을 작성해보세요!';
    tr.appendChild(td);
    tbody.appendChild(tr);
    return;
  }

  posts
    .slice()
    .sort((a, b) => b.id - a.id)
    .forEach((post, index) => {
      const tr = document.createElement('tr');

      const noTd = document.createElement('td');
      noTd.textContent = posts.length - index;
      tr.appendChild(noTd);

      const titleTd = document.createElement('td');
      const titleButton = document.createElement('button');
      titleButton.type = 'button';
      titleButton.className = 'post-title-link';
      titleButton.textContent = post.title;
      titleButton.dataset.id = post.id;
      titleTd.appendChild(titleButton);
      tr.appendChild(titleTd);

      const authorTd = document.createElement('td');
      authorTd.textContent = post.author;
      tr.appendChild(authorTd);

      const dateTd = document.createElement('td');
      const created = document.createElement('div');
      created.className = 'post-meta';
      created.textContent = formatDate(post.createdAt);
      dateTd.appendChild(created);
      tr.appendChild(dateTd);

      tbody.appendChild(tr);
    });
}

function loadPosts() {
  const posts = getPosts();
  renderPosts(posts);
  showListView();
}

function handleSubmitPost(event) {
  event.preventDefault();
  const titleEl = document.getElementById('title');
  const authorEl = document.getElementById('author');
  const passwordEl = document.getElementById('password');
  const contentEl = document.getElementById('content');

  const title = titleEl.value.trim();
  const author = authorEl.value.trim();
  const password = passwordEl.value;
  const content = contentEl.value.trim();

  if (!title || !author || !password || !content) {
    alert('모든 항목을 입력해 주세요.');
    return;
  }

  const posts = getPosts();
  const now = new Date().toISOString();

  if (formMode === 'edit' && editingPostId !== null) {
    const index = posts.findIndex((p) => p.id === editingPostId);
    if (index === -1) {
      alert('해당 게시글을 찾을 수 없습니다.');
      return;
    }
    const post = posts[index];
    if (post.password !== password) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    post.title = title;
    post.author = author;
    post.content = content;
    post.updatedAt = now;
    posts[index] = post;

    resetForm();
    formMode = 'create';
    editingPostId = null;
  } else {
    const newId = posts.length ? Math.max(...posts.map((p) => p.id)) + 1 : 1;
    const post = {
      id: newId,
      title,
      author,
      content,
      password,
      createdAt: now,
      updatedAt: now,
    };
    posts.push(post);
    resetForm();
  }

  savePosts(posts);
  loadPosts();
  showListView();
}

function handleDeletePost(id) {
  if (!window.confirm('이 게시글을 정말 삭제하시겠습니까?')) return;

  const password = window.prompt('이 글의 비밀번호를 입력하세요.');
  if (password === null || password === '') return;

  const posts = getPosts();
  const index = posts.findIndex((p) => String(p.id) === String(id));
  if (index === -1) {
    alert('해당 게시글을 찾을 수 없습니다.');
    return;
  }

  const post = posts[index];
  if (post.password !== password) {
    alert('비밀번호가 일치하지 않습니다.');
    return;
  }

  posts.splice(index, 1);
  savePosts(posts);
  loadPosts();
  showListView();
}

function showPostDetail(id) {
  const post = cachedPosts.find((p) => String(p.id) === String(id));
  if (!post) return;

  const section = document.getElementById('detailSection');
  const titleEl = document.getElementById('detailTitle');
  const authorEl = document.getElementById('detailAuthor');
  const dateEl = document.getElementById('detailDate');
  const contentEl = document.getElementById('detailContent');

  if (titleEl) titleEl.textContent = post.title;
  if (authorEl) authorEl.textContent = `작성자: ${post.author}`;
  if (dateEl) dateEl.textContent = `작성일: ${formatDate(post.createdAt)}`;
  if (contentEl) contentEl.textContent = post.content;

  if (section) {
    section.dataset.postId = String(post.id);
  }

  showDetailView();
}

function showDetailView() {
  const listSection = document.getElementById('listSection');
  const writeSection = document.getElementById('writeSection');
  const detailSection = document.getElementById('detailSection');

  if (listSection) listSection.hidden = true;
  if (writeSection) writeSection.hidden = true;
  if (detailSection) detailSection.hidden = false;
}

function setupEvents() {
  const form = document.getElementById('postForm');
  if (form) form.addEventListener('submit', handleSubmitPost);

  const showWriteButton = document.getElementById('showWriteButton');
  if (showWriteButton) {
    showWriteButton.addEventListener('click', () => {
      formMode = 'create';
      editingPostId = null;
      resetForm();
      showWriteView();
    });
  }

  const backToListButton = document.getElementById('backToListButton');
  if (backToListButton) {
    backToListButton.addEventListener('click', () => {
      showListView();
    });
  }

  const detailEditButton = document.getElementById('detailEditButton');
  if (detailEditButton) {
    detailEditButton.addEventListener('click', () => {
      const section = document.getElementById('detailSection');
      if (!section) return;
      const id = section.dataset.postId;
      if (!id) return;
      const post = cachedPosts.find((p) => String(p.id) === String(id));
      if (!post) return;
      formMode = 'edit';
      editingPostId = post.id;

      const titleEl = document.getElementById('title');
      const authorEl = document.getElementById('author');
      const passwordEl = document.getElementById('password');
      const contentEl = document.getElementById('content');

      if (titleEl) titleEl.value = post.title;
      if (authorEl) authorEl.value = post.author;
      if (contentEl) contentEl.value = post.content;
      if (passwordEl) passwordEl.value = '';

      showWriteView();
    });
  }

  const detailDeleteButton = document.getElementById('detailDeleteButton');
  if (detailDeleteButton) {
    detailDeleteButton.addEventListener('click', () => {
      const section = document.getElementById('detailSection');
      if (!section) return;
      const id = section.dataset.postId;
      if (!id) return;
      handleDeletePost(id);
    });
  }

  const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};

  const tbody = document.getElementById('postList');
  if (tbody) {
    tbody.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      if (target.classList.contains('post-title-link')) {
        const id = target.dataset.id;
        if (!id) return;
        showPostDetail(id);
      }
    });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  setupEvents();
  loadPosts();
});

