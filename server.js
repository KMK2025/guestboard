const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'posts.json');

app.use(express.json());
app.use(express.static(__dirname));

function readPosts() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    if (!raw.trim()) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read posts:', err);
    return [];
  }
}

function writePosts(posts) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to write posts:', err);
  }
}

function sanitizeInput(value) {
  if (typeof value !== 'string') return '';
  return value.trim();
}

app.get('/api/posts', (req, res) => {
  const posts = readPosts();
  const safePosts = posts.map(({ password, ...rest }) => rest);
  res.json(safePosts);
});

app.post('/api/posts', (req, res) => {
  const title = sanitizeInput(req.body.title);
  const author = sanitizeInput(req.body.author);
  const password = String(req.body.password || '');
  const content = sanitizeInput(req.body.content);

  if (!title || !author || !password || !content) {
    return res.status(400).json({ message: '모든 필드를 입력해 주세요.' });
  }

  const posts = readPosts();
  const now = new Date().toISOString();
  const newId = posts.length ? posts[posts.length - 1].id + 1 : 1;

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
  writePosts(posts);

  const { password: _, ...responsePost } = post;
  res.status(201).json(responsePost);
});

app.put('/api/posts/:id', (req, res) => {
  const id = Number(req.params.id);
  const password = String(req.body.password || '');
  const title = sanitizeInput(req.body.title);
  const author = sanitizeInput(req.body.author);
  const content = sanitizeInput(req.body.content);

  if (!password) {
    return res.status(400).json({ message: '비밀번호를 입력해 주세요.' });
  }
  if (!title || !author || !content) {
    return res.status(400).json({ message: '제목, 작성자, 내용을 입력해 주세요.' });
  }

  const posts = readPosts();
  const index = posts.findIndex((p) => p.id === id);
  if (index === -1) {
    return res.status(404).json({ message: '해당 게시글을 찾을 수 없습니다.' });
  }

  const post = posts[index];
  if (post.password !== password) {
    return res.status(403).json({ message: '비밀번호가 일치하지 않습니다.' });
  }

  post.title = title;
  post.author = author;
  post.content = content;
  post.updatedAt = new Date().toISOString();

  posts[index] = post;
  writePosts(posts);

  const { password: _, ...responsePost } = post;
  res.json(responsePost);
});

app.delete('/api/posts/:id', (req, res) => {
  const id = Number(req.params.id);
  const password = String(req.body.password || '');

  if (!password) {
    return res.status(400).json({ message: '비밀번호를 입력해 주세요.' });
  }

  const posts = readPosts();
  const index = posts.findIndex((p) => p.id === id);
  if (index === -1) {
    return res.status(404).json({ message: '해당 게시글을 찾을 수 없습니다.' });
  }

  const post = posts[index];
  if (post.password !== password) {
    return res.status(403).json({ message: '비밀번호가 일치하지 않습니다.' });
  }

  posts.splice(index, 1);
  writePosts(posts);

  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

