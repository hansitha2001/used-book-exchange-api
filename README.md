# 📚 Used Book Exchange & Affordable Resale System

A RESTful backend API for a peer-to-peer used book marketplace, built as part of the ICA-03 assignment for the Web Services and Technology (IT2234) module.

---

## Problem Description

Students and low-income readers in Sri Lanka often struggle to afford new textbooks and academic resources. New books can cost thousands of rupees, creating a significant barrier to education.

## Proposed Solution

A web-based platform where users can:
- **List** used books for sale or exchange
- **Browse** available books by category, condition, or price
- **Request** to buy or exchange a book directly with the seller
- **Manage** their listings and transaction requests

This reduces book costs significantly and promotes a sustainable reading culture.

---

## Features

- Full CRUD operations on Books, Users, Orders, and Categories
- Search books by title, author, or description (MongoDB text index)
- Filter books by category, condition, price range, and exchange availability
- Pagination support for book listings
- Exchange request system (offer your book in return)
- Order status workflow: pending → accepted → rejected → completed → cancelled
- Auto-marks a book as unavailable when an order is accepted
- Centralized error handling with meaningful error messages
- Input validation at the model level (Mongoose validators)

---

## Technologies Used

| Technology | Purpose |
|---|---|
| Node.js | Runtime environment |
| Express.js | Web framework / REST API |
| MongoDB | NoSQL database |
| Mongoose | ODM for MongoDB |
| dotenv | Environment variable management |
| cors | Cross-origin request handling |
| nodemon | Dev auto-reload |
| Postman | API testing |
| GitHub | Version control |

---

## Project Structure

```
used-book-exchange/
├── models/
│   ├── Book.js          # Book schema & model
│   ├── User.js          # User schema & model
│   ├── Order.js         # Order schema & model
│   └── Category.js      # Category schema & model
├── routes/
│   ├── books.js
│   ├── users.js
│   ├── orders.js
│   └── categories.js
├── controllers/
│   ├── bookController.js
│   ├── userController.js
│   ├── orderController.js
│   └── categoryController.js
├── middleware/
│   └── errorHandler.js  # Global error handler
├── .env                 # Environment variables (not committed)
├── server.js            # Entry point
├── package.json
└── README.md
```

---

## API Endpoints

### Books

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/books` | Get all available books |
| GET | `/api/books?category=id&condition=good&minPrice=0&maxPrice=500` | Filter books |
| GET | `/api/books?search=python&exchange=true` | Search + filter |
| GET | `/api/books/:id` | Get a single book by ID |
| POST | `/api/books` | List a new book |
| PUT | `/api/books/:id` | Update a book listing |
| DELETE | `/api/books/:id` | Remove a book listing |

**POST /api/books – Request Body Example:**
```json
{
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "isbn": "9780132350884",
  "description": "A handbook of agile software craftsmanship",
  "category": "<category_id>",
  "condition": "good",
  "price": 750,
  "isAvailableForExchange": true,
  "seller": "<user_id>",
  "language": "English",
  "publishedYear": 2008
}
```

---

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users |
| GET | `/api/users/:id` | Get user profile + their listings |
| POST | `/api/users` | Register a new user |
| PUT | `/api/users/:id` | Update user profile |
| DELETE | `/api/users/:id` | Deactivate account |

**POST /api/users – Request Body Example:**
```json
{
  "name": "Kavinda Perera",
  "email": "kavinda@example.com",
  "password": "securepass123",
  "contactNumber": "+94771234567",
  "location": "Colombo, Sri Lanka",
  "bio": "Book lover and CS student"
}
```

---

### Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | Get all orders |
| GET | `/api/orders?buyer=id&status=pending` | Filter orders |
| GET | `/api/orders/:id` | Get a single order |
| POST | `/api/orders` | Create a buy or exchange request |
| PATCH | `/api/orders/:id/status` | Update order status |
| DELETE | `/api/orders/:id` | Cancel/delete a pending order |

**POST /api/orders – Buy Request:**
```json
{
  "book": "<book_id>",
  "buyer": "<user_id>",
  "type": "buy",
  "message": "Hi, I am interested in this book. Is the price negotiable?",
  "agreedPrice": 700
}
```

**POST /api/orders – Exchange Request:**
```json
{
  "book": "<book_id>",
  "buyer": "<user_id>",
  "type": "exchange",
  "offeredBook": "<offered_book_id>",
  "message": "I would like to exchange this for my copy of Design Patterns."
}
```

**PATCH /api/orders/:id/status – Request Body:**
```json
{ "status": "accepted" }
```
Valid statuses: `pending`, `accepted`, `rejected`, `completed`, `cancelled`

---

### Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | Get all categories |
| GET | `/api/categories/:id` | Get a single category |
| POST | `/api/categories` | Create a category |
| PUT | `/api/categories/:id` | Update a category |
| DELETE | `/api/categories/:id` | Delete a category |

**POST /api/categories – Request Body:**
```json
{
  "name": "Science Fiction",
  "description": "Speculative fiction based on science and technology"
}
```

---

## Setup Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher
- [MongoDB](https://www.mongodb.com/) (local installation or MongoDB Atlas)
- [Postman](https://www.postman.com/) for API testing

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/<your-username>/used-book-exchange.git
   cd used-book-exchange
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/used_book_exchange
   NODE_ENV=development
   ```
   For MongoDB Atlas, replace `MONGO_URI` with your Atlas connection string.

4. **Run the server**

   Development mode (auto-reload):
   ```bash
   npm run dev
   ```

   Production mode:
   ```bash
   npm start
   ```

5. **Verify it's running**

   Open your browser or Postman and visit:
   ```
   http://localhost:5000/
   ```
   You should see the API info JSON response.

---

## How to Run the Project

1. Ensure MongoDB is running locally (`mongod`) or your Atlas URI is set in `.env`
2. Start the server with `npm run dev`
3. Import the Postman collection and test all endpoints
4. Suggested testing order:
   - Create a **Category** first
   - Register two **Users** (one seller, one buyer)
   - **List a Book** using the seller's ID and the category ID
   - Create an **Order** using the buyer's ID and the book ID
   - **Update the order status** to `accepted`
   - Verify the book's `isAvailable` field becomes `false`

---

## Data Models Summary

### Book
`title` · `author` · `isbn` · `description` · `category` (ref) · `condition` (new/good/fair/worn) · `price` · `isAvailableForExchange` · `seller` (ref) · `isAvailable` · `images[]` · `language` · `publishedYear`

### User
`name` · `email` · `password` · `contactNumber` · `location` · `bio` · `isActive`

### Order
`book` (ref) · `buyer` (ref) · `seller` (ref) · `type` (buy/exchange) · `status` · `offeredBook` (ref, exchange only) · `message` · `agreedPrice`

### Category
`name` · `slug` (auto-generated) · `description`

---

## Author

- **Name:** [Your Name]
- **Student ID:** [Your ID]
- **Module:** IT2234 – Web Services and Technology
- **Year:** 2nd Year IT
