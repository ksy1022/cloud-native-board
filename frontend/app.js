// app.js

const API_BASE = "/api/posts";

const form = document.getElementById("post-form");
const titleInput = document.getElementById("title");
const contentInput = document.getElementById("content");
const postListEl = document.getElementById("post-list");
const statusEl = document.getElementById("status");

// 상태 메시지 표시용 (선택)
function setStatus(msg) {
  if (!statusEl) return;
  statusEl.textContent = msg || "";
}

// 게시글 목록 불러오기
async function loadPosts() {
  try {
    setStatus("게시글 불러오는 중...");

    const res = await fetch(API_BASE);

    if (!res.ok) {
      console.error("GET /api/posts 실패:", res.status, res.statusText);
      setStatus("게시글 불러오기에 실패했습니다.");
      return;
    }

    const posts = await res.json();
    renderPosts(posts);
    setStatus("");
  } catch (err) {
    console.error("GET /api/posts 에러:", err);
    setStatus("서버와 통신 중 오류가 발생했습니다.");
  }
}

// 게시글 목록 렌더링
function renderPosts(posts) {
  if (!Array.isArray(posts)) return;

  if (posts.length === 0) {
    postListEl.innerHTML = "<p>등록된 게시글이 없습니다.</p>";
    return;
  }

  const list = document.createElement("ul");
  list.className = "post-list";

  posts.forEach((post) => {
    const li = document.createElement("li");
    li.className = "post-item";

    const title = document.createElement("strong");
    title.textContent = post.title;

    const content = document.createElement("p");
    content.textContent = post.content;

    const btnBox = document.createElement("div");
    btnBox.className = "post-actions";

    // 수정 버튼
    const editBtn = document.createElement("button");
    editBtn.textContent = "수정";
    editBtn.onclick = () => editPost(post);

    // 삭제 버튼
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "삭제";
    deleteBtn.onclick = () => deletePost(post.id);

    btnBox.appendChild(editBtn);
    btnBox.appendChild(deleteBtn);

    li.appendChild(title);
    li.appendChild(content);
    li.appendChild(btnBox);

    list.appendChild(li);
  });

  postListEl.innerHTML = "";
  postListEl.appendChild(list);
}

// 게시글 작성
async function createPost(event) {
  event.preventDefault();  // 폼 기본 제출 막기

  const title = titleInput.value.trim();
  const content = contentInput.value.trim();

  if (!title || !content) {
    alert("제목과 내용을 모두 입력해주세요.");
    return;
  }

  try {
    setStatus("게시글을 작성하는 중...");

    const res = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });

    if (!res.ok) {
      console.error("POST /api/posts 실패:", res.status, res.statusText);
      alert("게시글 작성에 실패했습니다.");
      setStatus("");
      return;
    }

    // 폼 초기화
    titleInput.value = "";
    contentInput.value = "";

    // 목록 다시 로딩
    await loadPosts();
  } catch (err) {
    console.error("POST /api/posts 에러:", err);
    alert("서버와 통신 중 오류가 발생했습니다.");
  } finally {
    setStatus("");
  }
}

// 게시글 수정
async function editPost(post) {
  const newTitle = prompt("새 제목을 입력하세요.", post.title);
  if (newTitle === null) return; // 취소

  const newContent = prompt("새 내용을 입력하세요.", post.content);
  if (newContent === null) return; // 취소

  try {
    setStatus("게시글을 수정하는 중...");

    const res = await fetch(`${API_BASE}/${post.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newTitle.trim() || post.title,
        content: newContent.trim() || post.content,
      }),
    });

    if (!res.ok) {
      console.error("PUT /api/posts 실패:", res.status, res.statusText);
      alert("게시글 수정에 실패했습니다.");
      setStatus("");
      return;
    }

    await loadPosts();
  } catch (err) {
    console.error("PUT /api/posts 에러:", err);
    alert("서버와 통신 중 오류가 발생했습니다.");
  } finally {
    setStatus("");
  }
}

// 게시글 삭제
async function deletePost(id) {
  if (!confirm("정말 삭제하시겠습니까?")) return;

  try {
    setStatus("게시글을 삭제하는 중...");

    const res = await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      console.error("DELETE /api/posts 실패:", res.status, res.statusText);
      alert("게시글 삭제에 실패했습니다.");
      setStatus("");
      return;
    }

    await loadPosts();
  } catch (err) {
    console.error("DELETE /api/posts 에러:", err);
    alert("서버와 통신 중 오류가 발생했습니다.");
  } finally {
    setStatus("");
  }
}

// 초기 로딩
document.addEventListener("DOMContentLoaded", () => {
  if (form) {
    form.addEventListener("submit", createPost);
  }
  loadPosts();
});

