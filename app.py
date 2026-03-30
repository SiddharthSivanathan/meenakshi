
import socket
_orig_getaddrinfo = socket.getaddrinfo

def _ipv4_only(host, port, family=0, type=0, proto=0, flags=0):
    return _orig_getaddrinfo(host, port, socket.AF_INET, type, proto, flags)

socket.getaddrinfo = _ipv4_only

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
import os

# ── Load env ─────────────────────────────────────────────
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL not set in .env file")

# ── App setup ────────────────────────────────────────────
app = Flask(__name__)
CORS(app)

# ── DB connection ────────────────────────────────────────
def get_db_connection():
    return psycopg2.connect(
        DATABASE_URL,
        cursor_factory=RealDictCursor
    )

# ── Routes ───────────────────────────────────────────────

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

# Optional: keep a health endpoint for API checks
@app.route('/api/health')
def health_check():
    return jsonify({
        "status": "ok",
        "message": "Supabase Flask API running 🚀"
    })

# ✅ POST feedback
@app.route('/api/feedback', methods=['POST'])
def submit_feedback():
    data = request.get_json()

    if not data:
        return jsonify({"error": "Invalid JSON"}), 400

    name       = data.get('name', '').strip()
    email      = data.get('email', '').strip()
    phone      = data.get('phone', '').strip()
    visit      = data.get('visit_type', 'Dine-in')
    message    = data.get('message', '').strip()

    try:
        rating = int(data.get('rating'))
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid rating"}), 400

    if not name or not message:
        return jsonify({"error": "Name and message are required"}), 400

    if not (1 <= rating <= 5):
        return jsonify({"error": "Rating must be between 1 and 5"}), 400

    try:
        conn = get_db_connection()
        cur  = conn.cursor()

        cur.execute("""
            INSERT INTO feedbacks (name, email, phone, visit_type, rating, message)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (name, email or None, phone or None, visit, rating, message))

        new_id = cur.fetchone()['id']
        conn.commit()
        cur.close()
        conn.close()

        return jsonify({"success": True, "id": new_id}), 201

    except Exception as e:
        print("🔥 DB ERROR (submit):", e)
        return jsonify({"error": str(e)}), 500


# ✅ GET all feedbacks  ← FIXED: returns key "feedbacks" to match feedback.js
@app.route('/api/feedbacks', methods=['GET'])
def get_feedbacks():
    try:
        conn = get_db_connection()
        cur  = conn.cursor()

        cur.execute("""
            SELECT id, name, email, phone, visit_type, rating, message,
                   created_at::text AS created_at
            FROM feedbacks
            ORDER BY created_at DESC
            LIMIT 100
        """)

        rows = cur.fetchall()
        cur.close()
        conn.close()

        # Convert RealDictRow list to plain dicts (JSON-serialisable)
        feedbacks = [dict(row) for row in rows]

        return jsonify({
            "success":   True,
            "count":     len(feedbacks),
            "feedbacks": feedbacks          # ← key matches feedback.js
        })

    except Exception as e:
        print("🔥 DB ERROR (get_all):", e)
        return jsonify({"error": str(e)}), 500


# ✅ GET single feedback
@app.route('/api/feedbacks/<int:feedback_id>', methods=['GET'])
def get_feedback(feedback_id):
    try:
        conn = get_db_connection()
        cur  = conn.cursor()

        cur.execute(
            "SELECT *, created_at::text AS created_at FROM feedbacks WHERE id = %s",
            (feedback_id,)
        )
        row = cur.fetchone()
        cur.close()
        conn.close()

        if not row:
            return jsonify({"error": "Not found"}), 404

        return jsonify({"success": True, "data": dict(row)})

    except Exception as e:
        print("🔥 DB ERROR (get_one):", e)
        return jsonify({"error": str(e)}), 500


# ✅ DELETE feedback
@app.route('/api/feedbacks/<int:feedback_id>', methods=['DELETE'])
def delete_feedback(feedback_id):
    try:
        conn = get_db_connection()
        cur  = conn.cursor()

        cur.execute("DELETE FROM feedbacks WHERE id = %s", (feedback_id,))
        affected = cur.rowcount
        conn.commit()
        cur.close()
        conn.close()

        if affected == 0:
            return jsonify({"error": "Not found"}), 404

        return jsonify({"success": True, "message": "Deleted successfully"})

    except Exception as e:
        print("🔥 DB ERROR (delete):", e)
        return jsonify({"error": str(e)}), 500


# Serve other static assets (css/js/images) from repo root
@app.route('/<path:path>')
def static_files(path):
    return send_from_directory('.', path)


# ── Run ──────────────────────────────────────────────────
if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug_flag = os.getenv('FLASK_DEBUG', 'False').lower() in ('1', 'true', 'yes')
    app.run(host='0.0.0.0', port=port, debug=debug_flag)