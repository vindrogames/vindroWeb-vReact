# Highscores API Documentation

## Overview
The Highscores API allows authenticated users to submit game scores, view leaderboards, and manage their personal scores. All endpoints return JSON responses with a consistent format.

## Base URL
- Development: `http://localhost:8000/api/highscores/`
- Production: `https://backend.vindrogames.com/api/highscores/`

## Response Format
All responses follow this structure:
```json
{
  "success": true|false,
  "message": "Success message",  // On success
  "error": "Error message",      // On error
  "data": {}                     // Response data (if applicable)
}
```

## Supported Games
- `snake` - Scores: 0 to 10,000
- `tetris` - Scores: 0 to 999,999
- `pong` - Scores: 0 to 21

## Endpoints

### 1. Submit Highscore
**POST** `/api/highscores/create/`

**Authentication**: Required (user must be logged in)

**Request Body**:
```json
{
  "game_name": "snake",
  "score": 1500,
  "game_metadata": {           // Optional
    "level": 5,
    "time_played": 120,
    "difficulty": "hard"
  }
}
```

**Success Response** (201):
```json
{
  "success": true,
  "message": "Highscore submitted successfully",
  "data": {
    "id": 42,
    "user": {
      "id": 1,
      "username": "player1"
    },
    "game_name": "snake",
    "score": 1500,
    "game_metadata": {
      "level": 5,
      "time_played": 120
    },
    "created_at": "2025-12-27T10:30:00Z",
    "updated_at": "2025-12-27T10:30:00Z"
  }
}
```

**Error Responses**:
- 400: Invalid data (missing fields, invalid score range)
- 401: User not authenticated
- 429: Rate limit exceeded (max 5 submissions per 60 seconds)

**Rate Limiting**: Users can submit a maximum of 5 scores per minute across all games.

---

### 2. Get Leaderboard
**GET** `/api/highscores/`

**Authentication**: Not required (public endpoint)

**Query Parameters**:
- `game_name` (optional): Filter by specific game (e.g., `snake`, `tetris`, `pong`)
- `limit` (optional): Number of results (default: 100, max: 500)
- `offset` (optional): Pagination offset (default: 0)

**Examples**:
```
GET /api/highscores/
GET /api/highscores/?game_name=snake
GET /api/highscores/?game_name=tetris&limit=10
GET /api/highscores/?limit=50&offset=50
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "highscores": [
      {
        "id": 42,
        "user": {
          "id": 1,
          "username": "player1"
        },
        "game_name": "snake",
        "score": 1500,
        "game_metadata": {
          "level": 5
        },
        "created_at": "2025-12-27T10:30:00Z",
        "updated_at": "2025-12-27T10:30:00Z"
      }
    ],
    "pagination": {
      "total": 250,
      "limit": 100,
      "offset": 0,
      "has_more": true
    }
  }
}
```

**Notes**:
- Results are ordered by score (highest first), then by creation date
- Use pagination for better performance with large datasets

---

### 3. Get My Highscores
**GET** `/api/highscores/me/`

**Authentication**: Required

**Query Parameters**:
- `game_name` (optional): Filter by specific game
- `limit` (optional): Number of results (default: 100, max: 500)
- `offset` (optional): Pagination offset (default: 0)

**Examples**:
```
GET /api/highscores/me/
GET /api/highscores/me/?game_name=snake
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "highscores": [
      {
        "id": 42,
        "user": {
          "id": 1,
          "username": "player1"
        },
        "game_name": "snake",
        "score": 1500,
        "game_metadata": {},
        "created_at": "2025-12-27T10:30:00Z",
        "updated_at": "2025-12-27T10:30:00Z"
      }
    ],
    "pagination": {
      "total": 15,
      "limit": 100,
      "offset": 0,
      "has_more": false
    }
  }
}
```

**Error Responses**:
- 401: User not authenticated

---

### 4. Delete Highscore
**DELETE** `/api/highscores/<id>/`

**Authentication**: Required (can only delete own scores)

**Example**:
```
DELETE /api/highscores/42/
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Highscore deleted successfully"
}
```

**Error Responses**:
- 400: Invalid highscore ID
- 401: User not authenticated
- 403: Not authorized (trying to delete another user's score)
- 404: Highscore not found

---

## Authentication

All authenticated endpoints require the user to be logged in using the session-based authentication provided by `/api/auth/login/`.

**Important**: Include credentials (cookies) in your requests:
```javascript
// Using fetch API
fetch('http://localhost:8000/api/highscores/create/', {
  method: 'POST',
  credentials: 'include',  // Important!
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    game_name: 'snake',
    score: 1500
  })
})
```

```javascript
// Using axios
axios.post('http://localhost:8000/api/highscores/create/', {
  game_name: 'snake',
  score: 1500
}, {
  withCredentials: true  // Important!
})
```

---

## Common Error Codes

| Code | Meaning |
|------|---------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Not authorized to perform this action |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server issue |

---

## Complete Usage Example

```javascript
// 1. User logs in first (using existing auth endpoint)
await fetch('http://localhost:8000/api/auth/login/', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'player1',
    password: 'password123'
  })
});

// 2. Submit a highscore
const submitScore = await fetch('http://localhost:8000/api/highscores/create/', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    game_name: 'snake',
    score: 1500,
    game_metadata: {
      level: 5,
      time_played: 120
    }
  })
});

const result = await submitScore.json();
console.log(result);
// { success: true, message: "Highscore submitted successfully", data: {...} }

// 3. Get leaderboard for snake game (no auth needed)
const leaderboard = await fetch('http://localhost:8000/api/highscores/?game_name=snake&limit=10');
const scores = await leaderboard.json();
console.log(scores.data.highscores);

// 4. Get my personal scores
const myScores = await fetch('http://localhost:8000/api/highscores/me/?game_name=snake', {
  credentials: 'include'
});
const myData = await myScores.json();
console.log(myData.data.highscores);

// 5. Delete a score
await fetch('http://localhost:8000/api/highscores/42/', {
  method: 'DELETE',
  credentials: 'include'
});
```

---

## Adding New Games

To add support for new games, contact the backend team. They will need to update the game configuration with score validation rules.
