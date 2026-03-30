# Meenaakshi Cafe Corner — Feedback System Setup

## File Structure

```
meenaakshi_cafe/
├── index.html          ← Updated frontend (with feedback section)
├── styles.css          ← Original stylesheet (unchanged)
├── feedback_styles.css ← NEW — paste contents at the END of styles.css
├── script.js           ← Original JS (unchanged)
├── feedback.js         ← NEW — frontend feedback logic
├── app.py              ← NEW — Flask backend
├── schema.sql          ← NEW — MySQL table definition
└── README.md           ← This file
```

---

## Step 1 — Set Up MySQL Database

```bash
mysql -u root -p < schema.sql
```

Or run the SQL manually in MySQL Workbench / phpMyAdmin.

---

## Step 2 — Install Python Dependencies

```bash
pip install flask flask-cors flask-mysqldb
```

> **Note for Windows users:** `flask-mysqldb` requires the MySQL C client.
> Install [MySQL Connector C 6.0.2](https://dev.mysql.com/downloads/connector/c/) first,
> or use `PyMySQL` as an alternative (see below).

### Alternative — Using PyMySQL instead of MySQLdb

If `flask-mysqldb` is hard to install, swap it out:

```bash
pip install flask flask-cors pymysql
```

Then replace the DB section in `app.py` with:

```python
import pymysql

def get_connection():
    return pymysql.connect(
        host='localhost',
        user='root',
        password='yourpassword',
        database='meenaakshi_cafe',
        cursorclass=pymysql.cursors.DictCursor
    )
```

And update each route to use `get_connection()` instead of `mysql.connection.cursor()`.

---

## Step 3 — Configure Database Credentials

Open `app.py` and update these lines:

```python
app.config['MYSQL_PASSWORD'] = 'yourpassword'   # ← your MySQL root password
```

Or use environment variables:

```bash
export DB_HOST=localhost
export DB_USER=root
export DB_PASS=yourpassword
export DB_NAME=meenaakshi_cafe
```

---

## Step 4 — Run the Flask Server

```bash
python app.py
```

The server starts at `http://localhost:5000`.

---

## Step 5 — Update the Frontend API URL

In `feedback.js`, line 12:

```js
const API_BASE = 'http://localhost:5000';
```

Change `localhost:5000` to your server's IP or domain if you deploy it.

---

## Step 6 — Update styles.css

Paste the entire contents of `feedback_styles.css` at the **end** of `styles.css`.

---

## API Endpoints

| Method   | Endpoint                   | Description                  |
|----------|----------------------------|------------------------------|
| `GET`    | `/`                        | Health check                 |
| `POST`   | `/api/feedback`            | Submit a new feedback        |
| `GET`    | `/api/feedbacks`           | Get all feedbacks (max 100)  |
| `GET`    | `/api/feedbacks/<id>`      | Get a single feedback by ID  |
| `DELETE` | `/api/feedbacks/<id>`      | Delete a feedback (admin)    |

### POST /api/feedback — Request Body

```json
{
  "name":       "Ravi Kumar",
  "email":      "ravi@example.com",
  "phone":      "9876543210",
  "visit_type": "Dine-in",
  "rating":     5,
  "message":    "Amazing paniyaram and ginger tea!"
}
```

### GET /api/feedbacks — Response

```json
{
  "success": true,
  "count": 3,
  "feedbacks": [
    {
      "id": 3,
      "name": "Ravi Kumar",
      "visit_type": "Dine-in",
      "rating": 5,
      "message": "Amazing paniyaram and ginger tea!",
      "created_at": "2025-06-15 14:30:00"
    },
    ...
  ]
}
```

---

## Production Checklist

- [ ] Set `debug=False` in `app.py`
- [ ] Use a `.env` file / environment variables for DB credentials (never hardcode passwords)
- [ ] Add authentication to the DELETE endpoint
- [ ] Serve the frontend via Nginx/Apache instead of opening HTML directly
- [ ] Enable HTTPS (use Let's Encrypt)
- [ ] Consider rate-limiting the POST endpoint to prevent spam

## Render deployment (done)

1. Add `render.yaml` (included) and `Procfile` (included).
2. Ensure `requirements.txt` includes `gunicorn`.
3. In Render dashboard, connect repo and deploy.
4. Configure a managed PostgreSQL database and set `DATABASE_URL` in service envs.
5. Set `FLASK_DEBUG=false`.

Launch command is implicitly from `render.yaml`:
- `gunicorn app:app --bind 0.0.0.0:$PORT --workers 2`

