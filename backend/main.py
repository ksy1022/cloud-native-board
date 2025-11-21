from flask import Flask, request, jsonify
import psycopg2
import os

app = Flask(__name__)

DB_HOST = os.getenv("DB_HOST", "postgres-svc")
DB_NAME = os.getenv("DB_NAME", "boarddb")
DB_USER = os.getenv("DB_USER", "admin")
DB_PASS = os.getenv("DB_PASS", "admin123")

def get_conn():
    return psycopg2.connect(
        host=DB_HOST,
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASS
    )

@app.route("/posts", methods=["GET"])
def get_posts():
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT id, title, content FROM posts ORDER BY id DESC;")
    rows = cur.fetchall()
    cur.close()
    conn.close()

    posts = [{"id": r[0], "title": r[1], "content": r[2]} for r in rows]
    return jsonify(posts)

@app.route("/posts", methods=["POST"])
def create_post():
    data = request.json
    title = data["title"]
    content = data["content"]

    conn = get_conn()
    cur = conn.cursor()
    cur.execute("INSERT INTO posts (title, content) VALUES (%s, %s);", (title, content))
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"message": "created"}), 201

@app.route("/posts/<int:post_id>", methods=["PUT"])
def update_post(post_id):
    data = request.json
    title = data["title"]
    content = data["content"]

    conn = get_conn()
    cur = conn.cursor()
    cur.execute("UPDATE posts SET title=%s, content=%s WHERE id=%s;", (title, content, post_id))
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"message": "updated"})


@app.route("/posts/<int:post_id>", methods=["DELETE"])
def delete_post(post_id):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("DELETE FROM posts WHERE id=%s;", (post_id,))
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"message": "deleted"})

@app.route("/")
def health():
    return {"ok": True}

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
