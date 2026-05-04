const PORT = process.env.PORT || 5000;

const jsonContent = {
  content: {
    "application/json": {
      schema: { type: "object" }
    }
  }
};

const messageResponse = (description) => ({
  description,
  ...jsonContent
});

const idParam = (name = "id", description = "Numeric id") => ({
  name,
  in: "path",
  required: true,
  description,
  schema: { type: "integer" }
});

const bookIdParam = {
  name: "bookId",
  in: "path",
  required: true,
  description: "Book id",
  schema: { type: "integer" }
};

const eventIdParam = {
  name: "id",
  in: "path",
  required: true,
  description: "Event id",
  schema: { type: "integer" }
};

const statusBody = (allowed) => ({
  required: true,
  content: {
    "application/json": {
      schema: {
        type: "object",
        required: ["status"],
        properties: {
          status: { type: "string", enum: allowed }
        }
      }
    }
  }
});

module.exports = {
  openapi: "3.0.3",
  info: {
    title: "LAU Riyad Nassar Library API",
    version: "1.1.0",
    description:
      "Interactive documentation for the LAU Library full-stack backend: authentication, books, events, loans, favorites, reviews, reading progress, dashboard, and services."
  },
  servers: [
    {
      url: `http://localhost:${PORT}`,
      description: "Local development server"
    },
    {
      url: "https://library-api-46jn.onrender.com",
      description: "Production Render backend"
    }
  ],
  tags: [
    { name: "Auth", description: "Registration, login, and JWT issuance" },
    { name: "Users", description: "Current authenticated user" },
    { name: "Dashboard", description: "Aggregated user library activity" },
    { name: "Books", description: "Catalog reads and admin catalog management" },
    { name: "Events", description: "Event reads, admin event management, and event registration" },
    { name: "Loans", description: "Borrowing, returning, and reservations" },
    { name: "Favorites", description: "Per-user favorite books" },
    { name: "Reviews", description: "Book reviews" },
    { name: "Reading Progress", description: "Per-user book reading progress" },
    { name: "Services", description: "Study-room bookings and help requests" }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          message: { type: "string", example: "Invalid token" }
        }
      },
      User: {
        type: "object",
        properties: {
          id: { type: "integer", example: 7 },
          full_name: { type: "string", example: "LAU Student" },
          email: { type: "string", format: "email", example: "student@lau.edu" },
          createdAt: { type: "string", format: "date-time", nullable: true }
        }
      },
      RegisterRequest: {
        type: "object",
        required: ["full_name", "email", "password"],
        properties: {
          full_name: { type: "string", example: "LAU Student" },
          email: { type: "string", format: "email", example: "student@lau.edu" },
          password: { type: "string", example: "Aa123456!" }
        }
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "student@lau.edu" },
          password: { type: "string", example: "Aa123456!" }
        }
      },
      AuthResponse: {
        type: "object",
        properties: {
          message: { type: "string", example: "Login successful" },
          token: { type: "string", example: "eyJhbGciOi..." },
          user: { $ref: "#/components/schemas/User" }
        }
      },
      Book: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          title: { type: "string", example: "The Story of Art" },
          author: { type: "string", example: "E.H. Gombrich" },
          genre: { type: "string", nullable: true, example: "Art" },
          language: { type: "string", nullable: true, example: "English" },
          year: { type: "integer", nullable: true, example: 1950 },
          rating: { type: "number", nullable: true, example: 4.5 },
          pages: { type: "integer", nullable: true, example: 688 },
          publisher: { type: "string", nullable: true, example: "Phaidon Press" },
          isbn: { type: "string", nullable: true, example: "9780714832470" },
          description: { type: "string", nullable: true },
          cover: { type: "string", nullable: true, example: "https://example.com/cover.jpg" },
          copies: { type: "integer", example: 3 },
          availableCopies: { type: "integer", example: 3 },
          totalCopies: { type: "integer", example: 3 }
        }
      },
      BookUpsertRequest: {
        type: "object",
        required: ["title", "author"],
        properties: {
          title: { type: "string", example: "Clean Architecture" },
          author: { type: "string", example: "Robert C. Martin" },
          genre: { type: "string", example: "Programming" },
          category: { type: "string", example: "Programming" },
          language: { type: "string", example: "English" },
          publisher: { type: "string", example: "Pearson" },
          isbn: { type: "string", example: "9780134494166" },
          description: { type: "string", example: "Software architecture best practices." },
          cover: { type: "string", example: "https://example.com/cover.jpg" },
          image: { type: "string", example: "https://example.com/cover.jpg" },
          availableCopies: { type: "integer", example: 3 },
          copies: { type: "integer", example: 3 },
          year: { type: "integer", example: 2017 },
          pages: { type: "integer", example: 432 },
          rating: { type: "number", example: 4.7 }
        }
      },
      Event: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          title: { type: "string", example: "Research Skills Workshop" },
          date: { type: "string", format: "date", example: "2026-05-15" },
          time: { type: "string", nullable: true, example: "2:00 PM - 4:00 PM" },
          location: { type: "string", nullable: true, example: "Riyad Nassar Library, Beirut" },
          category: { type: "string", nullable: true, example: "Workshops" },
          format: { type: "string", nullable: true, example: "In-Person" },
          featured: { type: "boolean", example: false },
          image: { type: "string", nullable: true },
          description: { type: "string", nullable: true },
          longDescription: { type: "string", nullable: true },
          speaker: { type: "string", nullable: true },
          seats: { type: "integer", nullable: true, example: 30 },
          registered: { type: "integer", nullable: true, example: 12 },
          audience: { type: "string", nullable: true },
          takeaway: { type: "string", nullable: true },
          highlights: { type: "array", nullable: true, items: { type: "string" } },
          createdBy: { type: "integer", nullable: true },
          createdAt: { type: "string", format: "date-time", nullable: true }
        }
      },
      EventUpsertRequest: {
        type: "object",
        required: ["title", "date"],
        properties: {
          title: { type: "string", example: "Research Skills Workshop" },
          date: { type: "string", format: "date", example: "2026-05-15" },
          time: { type: "string", example: "2:00 PM - 4:00 PM" },
          location: { type: "string", example: "Riyad Nassar Library, Beirut" },
          category: { type: "string", example: "Workshops" },
          format: { type: "string", example: "In-Person" },
          featured: { type: "boolean", example: false },
          image: { type: "string", example: "https://example.com/event.jpg" },
          description: { type: "string" },
          longDescription: { type: "string" },
          speaker: { type: "string", example: "Library Team" },
          seats: { type: "integer", example: 30 },
          registered: { type: "integer", example: 0 },
          audience: { type: "string" },
          takeaway: { type: "string" },
          highlights: { type: "array", items: { type: "string" } }
        }
      },
      EventRegistration: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          title: { type: "string", example: "Research Skills Workshop" },
          date: { type: "string", format: "date", example: "2026-05-15" },
          time: { type: "string", nullable: true },
          location: { type: "string", nullable: true },
          registeredAt: { type: "string", format: "date-time", nullable: true }
        }
      },
      Loan: {
        type: "object",
        properties: {
          id: { type: "integer", example: 12 },
          book_id: { type: "integer", example: 1 },
          title: { type: "string", example: "The Story of Art" },
          author: { type: "string", example: "E.H. Gombrich" },
          borrow_date: { type: "string", format: "date", example: "2026-05-01" },
          due_date: { type: "string", format: "date", example: "2026-05-15" },
          return_date: { type: "string", format: "date", nullable: true },
          renew_count: { type: "integer", example: 0 },
          status: { type: "string", example: "active" }
        }
      },
      Reservation: {
        type: "object",
        properties: {
          id: { type: "integer", example: 4 },
          book_id: { type: "integer", example: 1 },
          title: { type: "string" },
          author: { type: "string" },
          reserved_at: { type: "string", format: "date-time" },
          fulfilled_at: { type: "string", format: "date-time", nullable: true },
          status: { type: "string", example: "active" }
        }
      },
      Review: {
        type: "object",
        properties: {
          id: { type: "integer", example: 8 },
          bookId: { type: "integer", example: 1 },
          userId: { type: "integer", nullable: true, example: 7 },
          reviewer_name: { type: "string", example: "LAU Student" },
          rating: { type: "integer", minimum: 1, maximum: 5, example: 5 },
          comment: { type: "string", nullable: true, example: "Excellent introduction." },
          createdAt: { type: "string", format: "date-time", nullable: true }
        }
      },
      ReviewRequest: {
        type: "object",
        required: ["rating"],
        properties: {
          rating: { type: "integer", minimum: 1, maximum: 5, example: 5 },
          comment: { type: "string", example: "Excellent introduction." }
        }
      },
      ReadingProgress: {
        type: "object",
        properties: {
          bookId: { type: "integer", example: 1 },
          progress: { type: "integer", minimum: 0, maximum: 100, example: 56 },
          updatedAt: { type: "string", format: "date-time", nullable: true }
        }
      },
      ReadingProgressRequest: {
        type: "object",
        required: ["progress"],
        properties: {
          progress: { type: "number", minimum: 0, maximum: 100, example: 56 }
        }
      },
      StudyRoomBooking: {
        type: "object",
        properties: {
          id: { type: "integer", example: 15 },
          campus: { type: "string", enum: ["Beirut", "Byblos"] },
          room: { type: "string", example: "RNL-805" },
          date: { type: "string", format: "date", example: "2026-05-02" },
          time: { type: "string", example: "10:00" },
          duration: { type: "string", enum: ["30 minutes", "1 hour", "2 hours"] },
          people: { type: "integer", example: 4 },
          studentId: { type: "string", example: "202600123" },
          requestedAt: { type: "string", format: "date-time", nullable: true },
          status: { type: "string", enum: ["pending", "confirmed", "cancelled"] },
          notes: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time", nullable: true }
        }
      },
      StudyRoomBookingRequest: {
        type: "object",
        required: ["campus", "room", "date", "duration", "time", "people", "studentId"],
        properties: {
          campus: { type: "string", enum: ["Beirut", "Byblos"], example: "Beirut" },
          room: { type: "string", example: "RNL-805" },
          date: { type: "string", format: "date", example: "2026-05-02" },
          duration: { type: "string", enum: ["30 minutes", "1 hour", "2 hours"], example: "1 hour" },
          time: { type: "string", enum: ["08:00", "10:00", "12:00", "14:00", "16:00"], example: "10:00" },
          people: { type: "integer", minimum: 1, maximum: 20, example: 4 },
          studentId: { type: "string", pattern: "^\\d{8,9}$", example: "202600123" },
          notes: { type: "string", example: "Need a screen if available." }
        }
      },
      StudyRoomAvailability: {
        type: "object",
        properties: {
          campus: { type: "string", example: "Beirut" },
          room: { type: "string", example: "RNL-805" },
          date: { type: "string", format: "date", example: "2026-05-02" },
          slots: {
            type: "array",
            items: {
              type: "object",
              properties: {
                time: { type: "string", example: "10:00" },
                available: { type: "boolean", example: true }
              }
            }
          }
        }
      },
      HelpRequest: {
        type: "object",
        properties: {
          id: { type: "integer", example: 3 },
          name: { type: "string", nullable: true, example: "LAU Student" },
          email: { type: "string", format: "email", nullable: true, example: "student@lau.edu" },
          message: { type: "string", example: "I need help finding sources." },
          requestedAt: { type: "string", format: "date-time", nullable: true },
          status: { type: "string", enum: ["open", "in_progress", "resolved"] },
          createdAt: { type: "string", format: "date-time", nullable: true }
        }
      },
      HelpRequestCreate: {
        type: "object",
        required: ["message"],
        properties: {
          name: { type: "string", example: "LAU Student" },
          email: { type: "string", format: "email", example: "student@lau.edu" },
          message: { type: "string", example: "I need help finding sources for a paper." }
        }
      }
    },
    responses: {
      BadRequest: { description: "Invalid input", ...jsonContent },
      Unauthorized: { description: "Missing or invalid JWT", ...jsonContent },
      Forbidden: { description: "Authenticated user is not authorized", ...jsonContent },
      NotFound: { description: "Resource not found", ...jsonContent },
      Conflict: { description: "Request conflicts with current state", ...jsonContent },
      ServerError: { description: "Unexpected server error", ...jsonContent }
    }
  },
  paths: {
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/RegisterRequest" } } }
        },
        responses: {
          201: { description: "User registered", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } } },
          400: { $ref: "#/components/responses/BadRequest" },
          500: { $ref: "#/components/responses/ServerError" }
        }
      }
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login and receive a JWT",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/LoginRequest" } } }
        },
        responses: {
          200: { description: "Login successful", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } } },
          400: { $ref: "#/components/responses/BadRequest" },
          401: { $ref: "#/components/responses/Unauthorized" },
          500: { $ref: "#/components/responses/ServerError" }
        }
      }
    },
    "/api/users/me": {
      get: {
        tags: ["Users"],
        summary: "Get the current authenticated user",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Current user", content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } } },
          401: { $ref: "#/components/responses/Unauthorized" }
        }
      }
    },
    "/api/dashboard": {
      get: {
        tags: ["Dashboard"],
        summary: "Get loans, history, overdue items, and renewals for the current user",
        security: [{ bearerAuth: [] }],
        responses: {
          200: messageResponse("Dashboard data returned"),
          401: { $ref: "#/components/responses/Unauthorized" },
          500: { $ref: "#/components/responses/ServerError" }
        }
      }
    },
    "/api/books": {
      get: {
        tags: ["Books"],
        summary: "List catalog books",
        parameters: [
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "genre", in: "query", schema: { type: "string" } },
          { name: "language", in: "query", schema: { type: "string" } },
          { name: "campus", in: "query", schema: { type: "string" } },
          { name: "availability", in: "query", schema: { type: "string", enum: ["Available", "Unavailable"] } },
          { name: "sort", in: "query", schema: { type: "string" } },
          { name: "limit", in: "query", schema: { type: "integer" } }
        ],
        responses: {
          200: { description: "Books list", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Book" } } } } },
          500: { $ref: "#/components/responses/ServerError" }
        }
      },
      post: {
        tags: ["Books"],
        summary: "Create a book",
        description: "Admin-only catalog write.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/BookUpsertRequest" } } }
        },
        responses: {
          201: { description: "Book created", content: { "application/json": { schema: { $ref: "#/components/schemas/Book" } } } },
          400: { $ref: "#/components/responses/BadRequest" },
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
          500: { $ref: "#/components/responses/ServerError" }
        }
      }
    },
    "/api/books/{id}": {
      get: {
        tags: ["Books"],
        summary: "Get one book by id",
        parameters: [idParam()],
        responses: {
          200: { description: "Book returned", content: { "application/json": { schema: { $ref: "#/components/schemas/Book" } } } },
          400: { $ref: "#/components/responses/BadRequest" },
          404: { $ref: "#/components/responses/NotFound" },
          500: { $ref: "#/components/responses/ServerError" }
        }
      },
      put: {
        tags: ["Books"],
        summary: "Update a book",
        description: "Admin-only catalog write.",
        security: [{ bearerAuth: [] }],
        parameters: [idParam()],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/BookUpsertRequest" } } }
        },
        responses: {
          200: { description: "Book updated", content: { "application/json": { schema: { $ref: "#/components/schemas/Book" } } } },
          400: { $ref: "#/components/responses/BadRequest" },
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
          404: { $ref: "#/components/responses/NotFound" },
          500: { $ref: "#/components/responses/ServerError" }
        }
      },
      delete: {
        tags: ["Books"],
        summary: "Delete a book",
        description: "Admin-only catalog write.",
        security: [{ bearerAuth: [] }],
        parameters: [idParam()],
        responses: {
          200: messageResponse("Book deleted"),
          400: { $ref: "#/components/responses/BadRequest" },
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
          404: { $ref: "#/components/responses/NotFound" },
          500: { $ref: "#/components/responses/ServerError" }
        }
      }
    },
    "/api/books/{id}/borrow": {
      post: {
        tags: ["Books", "Loans"],
        summary: "Borrow a book from the book detail flow",
        security: [{ bearerAuth: [] }],
        parameters: [idParam()],
        responses: {
          201: { description: "Loan created", content: { "application/json": { schema: { $ref: "#/components/schemas/Loan" } } } },
          400: { $ref: "#/components/responses/BadRequest" },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
          409: { $ref: "#/components/responses/Conflict" },
          500: { $ref: "#/components/responses/ServerError" }
        }
      }
    },
    "/api/books/{id}/reserve": {
      post: {
        tags: ["Books", "Loans"],
        summary: "Reserve an unavailable book",
        security: [{ bearerAuth: [] }],
        parameters: [idParam()],
        responses: {
          201: { description: "Reservation created", content: { "application/json": { schema: { $ref: "#/components/schemas/Reservation" } } } },
          400: { $ref: "#/components/responses/BadRequest" },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
          409: { $ref: "#/components/responses/Conflict" },
          500: { $ref: "#/components/responses/ServerError" }
        }
      }
    },
    "/api/events": {
      get: {
        tags: ["Events"],
        summary: "List library events",
        parameters: [
          { name: "category", in: "query", schema: { type: "string" } },
          { name: "format", in: "query", schema: { type: "string" } },
          { name: "month", in: "query", schema: { type: "integer", minimum: 1, maximum: 12 } },
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "featured", in: "query", schema: { type: "string", enum: ["true"] } }
        ],
        responses: {
          200: { description: "Events list", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Event" } } } } },
          500: { $ref: "#/components/responses/ServerError" }
        }
      },
      post: {
        tags: ["Events"],
        summary: "Create an event",
        description: "Admin-only event write.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/EventUpsertRequest" } } }
        },
        responses: {
          201: { description: "Event created", content: { "application/json": { schema: { $ref: "#/components/schemas/Event" } } } },
          400: { $ref: "#/components/responses/BadRequest" },
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
          500: { $ref: "#/components/responses/ServerError" }
        }
      }
    },
    "/api/events/registrations/me": {
      get: {
        tags: ["Events"],
        summary: "List the current user's event registrations",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Event registrations", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/EventRegistration" } } } } },
          401: { $ref: "#/components/responses/Unauthorized" },
          500: { $ref: "#/components/responses/ServerError" }
        }
      }
    },
    "/api/events/{id}/register": {
      post: {
        tags: ["Events"],
        summary: "Register the current user for an event",
        security: [{ bearerAuth: [] }],
        parameters: [eventIdParam],
        responses: {
          201: messageResponse("Registered for event"),
          400: { $ref: "#/components/responses/BadRequest" },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
          409: { $ref: "#/components/responses/Conflict" },
          500: { $ref: "#/components/responses/ServerError" }
        }
      },
      delete: {
        tags: ["Events"],
        summary: "Cancel the current user's event registration",
        security: [{ bearerAuth: [] }],
        parameters: [eventIdParam],
        responses: {
          200: messageResponse("Event registration cancelled"),
          400: { $ref: "#/components/responses/BadRequest" },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
          500: { $ref: "#/components/responses/ServerError" }
        }
      }
    },
    "/api/events/{id}": {
      get: {
        tags: ["Events"],
        summary: "Get one event by id",
        parameters: [eventIdParam],
        responses: {
          200: { description: "Event returned", content: { "application/json": { schema: { $ref: "#/components/schemas/Event" } } } },
          400: { $ref: "#/components/responses/BadRequest" },
          404: { $ref: "#/components/responses/NotFound" },
          500: { $ref: "#/components/responses/ServerError" }
        }
      },
      put: {
        tags: ["Events"],
        summary: "Update an event",
        description: "Admin-only and owner-checked in the controller.",
        security: [{ bearerAuth: [] }],
        parameters: [eventIdParam],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/EventUpsertRequest" } } }
        },
        responses: {
          200: { description: "Event updated", content: { "application/json": { schema: { $ref: "#/components/schemas/Event" } } } },
          400: { $ref: "#/components/responses/BadRequest" },
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
          404: { $ref: "#/components/responses/NotFound" },
          500: { $ref: "#/components/responses/ServerError" }
        }
      },
      delete: {
        tags: ["Events"],
        summary: "Delete an event",
        description: "Admin-only and owner-checked in the controller.",
        security: [{ bearerAuth: [] }],
        parameters: [eventIdParam],
        responses: {
          200: messageResponse("Event deleted"),
          400: { $ref: "#/components/responses/BadRequest" },
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
          404: { $ref: "#/components/responses/NotFound" },
          500: { $ref: "#/components/responses/ServerError" }
        }
      }
    },
    "/api/loans": {
      get: {
        tags: ["Loans"],
        summary: "List active loans for the current user",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Active loans", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Loan" } } } } },
          401: { $ref: "#/components/responses/Unauthorized" },
          500: { $ref: "#/components/responses/ServerError" }
        }
      },
      post: {
        tags: ["Loans"],
        summary: "Borrow a book",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object", required: ["bookId"], properties: { bookId: { type: "integer", example: 1 } } } } }
        },
        responses: {
          201: { description: "Loan created", content: { "application/json": { schema: { $ref: "#/components/schemas/Loan" } } } },
          400: { $ref: "#/components/responses/BadRequest" },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
          409: { $ref: "#/components/responses/Conflict" },
          500: { $ref: "#/components/responses/ServerError" }
        }
      }
    },
    "/api/loans/reservations": {
      post: {
        tags: ["Loans"],
        summary: "Reserve an unavailable book",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object", required: ["bookId"], properties: { bookId: { type: "integer", example: 1 } } } } }
        },
        responses: {
          201: { description: "Reservation created", content: { "application/json": { schema: { $ref: "#/components/schemas/Reservation" } } } },
          400: { $ref: "#/components/responses/BadRequest" },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
          409: { $ref: "#/components/responses/Conflict" },
          500: { $ref: "#/components/responses/ServerError" }
        }
      }
    },
    "/api/loans/{id}/return": {
      post: {
        tags: ["Loans"],
        summary: "Return one active loan",
        security: [{ bearerAuth: [] }],
        parameters: [idParam()],
        responses: {
          200: messageResponse("Loan returned"),
          400: { $ref: "#/components/responses/BadRequest" },
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
          404: { $ref: "#/components/responses/NotFound" },
          409: { $ref: "#/components/responses/Conflict" },
          500: { $ref: "#/components/responses/ServerError" }
        }
      }
    },
    "/api/favorites": {
      get: {
        tags: ["Favorites"],
        summary: "List current user's favorite books",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Favorite books", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Book" } } } } },
          401: { $ref: "#/components/responses/Unauthorized" },
          500: { $ref: "#/components/responses/ServerError" }
        }
      }
    },
    "/api/favorites/{bookId}": {
      post: {
        tags: ["Favorites"],
        summary: "Add a book to favorites",
        security: [{ bearerAuth: [] }],
        parameters: [bookIdParam],
        responses: {
          201: messageResponse("Added to favorites"),
          400: { $ref: "#/components/responses/BadRequest" },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
          500: { $ref: "#/components/responses/ServerError" }
        }
      },
      delete: {
        tags: ["Favorites"],
        summary: "Remove a book from favorites",
        security: [{ bearerAuth: [] }],
        parameters: [bookIdParam],
        responses: {
          200: messageResponse("Removed from favorites"),
          400: { $ref: "#/components/responses/BadRequest" },
          401: { $ref: "#/components/responses/Unauthorized" },
          500: { $ref: "#/components/responses/ServerError" }
        }
      }
    },
    "/api/reviews/book/{bookId}": {
      get: {
        tags: ["Reviews"],
        summary: "List reviews for a book",
        parameters: [bookIdParam],
        responses: {
          200: { description: "Reviews", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Review" } } } } },
          400: { $ref: "#/components/responses/BadRequest" },
          500: { $ref: "#/components/responses/ServerError" }
        }
      },
      post: {
        tags: ["Reviews"],
        summary: "Create or update the current user's review for a book",
        security: [{ bearerAuth: [] }],
        parameters: [bookIdParam],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ReviewRequest" } } }
        },
        responses: {
          200: { description: "Review updated", content: { "application/json": { schema: { $ref: "#/components/schemas/Review" } } } },
          201: { description: "Review created", content: { "application/json": { schema: { $ref: "#/components/schemas/Review" } } } },
          400: { $ref: "#/components/responses/BadRequest" },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
          500: { $ref: "#/components/responses/ServerError" }
        }
      }
    },
    "/api/reviews/{id}": {
      delete: {
        tags: ["Reviews"],
        summary: "Delete the current user's review",
        security: [{ bearerAuth: [] }],
        parameters: [idParam()],
        responses: {
          200: messageResponse("Review deleted"),
          400: { $ref: "#/components/responses/BadRequest" },
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
          404: { $ref: "#/components/responses/NotFound" },
          500: { $ref: "#/components/responses/ServerError" }
        }
      }
    },
    "/api/reading-progress/{bookId}": {
      get: {
        tags: ["Reading Progress"],
        summary: "Get current user's progress for one book",
        security: [{ bearerAuth: [] }],
        parameters: [bookIdParam],
        responses: {
          200: { description: "Reading progress", content: { "application/json": { schema: { $ref: "#/components/schemas/ReadingProgress" } } } },
          400: { $ref: "#/components/responses/BadRequest" },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
          500: { $ref: "#/components/responses/ServerError" }
        }
      },
      put: {
        tags: ["Reading Progress"],
        summary: "Save current user's progress for one book",
        security: [{ bearerAuth: [] }],
        parameters: [bookIdParam],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ReadingProgressRequest" } } }
        },
        responses: {
          200: { description: "Reading progress saved", content: { "application/json": { schema: { $ref: "#/components/schemas/ReadingProgress" } } } },
          400: { $ref: "#/components/responses/BadRequest" },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
          500: { $ref: "#/components/responses/ServerError" }
        }
      }
    },
    "/api/study-room-bookings/availability": {
      get: {
        tags: ["Services"],
        summary: "Check study-room time-slot availability",
        parameters: [
          { name: "campus", in: "query", schema: { type: "string", enum: ["Beirut", "Byblos"] } },
          { name: "room", in: "query", required: true, schema: { type: "string", example: "RNL-805" } },
          { name: "date", in: "query", required: true, schema: { type: "string", format: "date", example: "2026-05-02" } }
        ],
        responses: {
          200: { description: "Availability", content: { "application/json": { schema: { $ref: "#/components/schemas/StudyRoomAvailability" } } } },
          400: { $ref: "#/components/responses/BadRequest" },
          500: { $ref: "#/components/responses/ServerError" }
        }
      }
    },
    "/api/study-room-bookings": {
      get: {
        tags: ["Services"],
        summary: "List study-room bookings",
        description: "Admin-only.",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Study-room bookings", content: { "application/json": { schema: { type: "object", properties: { bookings: { type: "array", items: { $ref: "#/components/schemas/StudyRoomBooking" } } } } } } },
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
          500: { $ref: "#/components/responses/ServerError" }
        }
      },
      post: {
        tags: ["Services"],
        summary: "Create a study-room booking",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/StudyRoomBookingRequest" } } }
        },
        responses: {
          201: { description: "Study-room booking confirmed", content: { "application/json": { schema: { type: "object", properties: { message: { type: "string" }, booking: { $ref: "#/components/schemas/StudyRoomBooking" } } } } } },
          400: { $ref: "#/components/responses/BadRequest" },
          409: { $ref: "#/components/responses/Conflict" },
          500: { $ref: "#/components/responses/ServerError" }
        }
      }
    },
    "/api/study-room-bookings/{id}/status": {
      patch: {
        tags: ["Services"],
        summary: "Update a study-room booking status",
        description: "Admin-only.",
        security: [{ bearerAuth: [] }],
        parameters: [idParam()],
        requestBody: statusBody(["pending", "confirmed", "cancelled"]),
        responses: {
          200: messageResponse("Study-room booking updated"),
          400: { $ref: "#/components/responses/BadRequest" },
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
          404: { $ref: "#/components/responses/NotFound" },
          500: { $ref: "#/components/responses/ServerError" }
        }
      }
    },
    "/api/services/study-rooms/availability": {
      get: {
        tags: ["Services"],
        summary: "Compatibility alias for study-room availability",
        parameters: [
          { name: "campus", in: "query", schema: { type: "string", enum: ["Beirut", "Byblos"] } },
          { name: "room", in: "query", required: true, schema: { type: "string", example: "RNL-805" } },
          { name: "date", in: "query", required: true, schema: { type: "string", format: "date", example: "2026-05-02" } }
        ],
        responses: {
          200: { description: "Availability", content: { "application/json": { schema: { $ref: "#/components/schemas/StudyRoomAvailability" } } } },
          400: { $ref: "#/components/responses/BadRequest" },
          500: { $ref: "#/components/responses/ServerError" }
        }
      }
    },
    "/api/services/study-rooms": {
      get: {
        tags: ["Services"],
        summary: "Compatibility alias for listing study-room bookings",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Study-room bookings", content: { "application/json": { schema: { type: "object", properties: { bookings: { type: "array", items: { $ref: "#/components/schemas/StudyRoomBooking" } } } } } } },
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
          500: { $ref: "#/components/responses/ServerError" }
        }
      },
      post: {
        tags: ["Services"],
        summary: "Compatibility alias for creating a study-room booking",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/StudyRoomBookingRequest" } } }
        },
        responses: {
          201: { description: "Study-room booking confirmed", content: { "application/json": { schema: { type: "object", properties: { message: { type: "string" }, booking: { $ref: "#/components/schemas/StudyRoomBooking" } } } } } },
          400: { $ref: "#/components/responses/BadRequest" },
          409: { $ref: "#/components/responses/Conflict" },
          500: { $ref: "#/components/responses/ServerError" }
        }
      }
    },
    "/api/services/study-rooms/{id}/status": {
      patch: {
        tags: ["Services"],
        summary: "Compatibility alias for updating a study-room booking status",
        security: [{ bearerAuth: [] }],
        parameters: [idParam()],
        requestBody: statusBody(["pending", "confirmed", "cancelled"]),
        responses: {
          200: messageResponse("Study-room booking updated"),
          400: { $ref: "#/components/responses/BadRequest" },
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
          404: { $ref: "#/components/responses/NotFound" },
          500: { $ref: "#/components/responses/ServerError" }
        }
      }
    },
    "/api/help-requests": {
      get: {
        tags: ["Services"],
        summary: "List librarian help requests",
        description: "Admin-only.",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Help requests", content: { "application/json": { schema: { type: "object", properties: { requests: { type: "array", items: { $ref: "#/components/schemas/HelpRequest" } } } } } } },
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
          500: { $ref: "#/components/responses/ServerError" }
        }
      },
      post: {
        tags: ["Services"],
        summary: "Create a librarian help request",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/HelpRequestCreate" } } }
        },
        responses: {
          201: { description: "Help request received", content: { "application/json": { schema: { type: "object", properties: { message: { type: "string" }, request: { $ref: "#/components/schemas/HelpRequest" } } } } } },
          400: { $ref: "#/components/responses/BadRequest" },
          500: { $ref: "#/components/responses/ServerError" }
        }
      }
    },
    "/api/help-requests/{id}/status": {
      patch: {
        tags: ["Services"],
        summary: "Update a help request status",
        description: "Admin-only.",
        security: [{ bearerAuth: [] }],
        parameters: [idParam()],
        requestBody: statusBody(["open", "in_progress", "resolved"]),
        responses: {
          200: messageResponse("Help request updated"),
          400: { $ref: "#/components/responses/BadRequest" },
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
          404: { $ref: "#/components/responses/NotFound" },
          500: { $ref: "#/components/responses/ServerError" }
        }
      }
    },
    "/api/services/help-requests": {
      get: {
        tags: ["Services"],
        summary: "Compatibility alias for listing help requests",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Help requests", content: { "application/json": { schema: { type: "object", properties: { requests: { type: "array", items: { $ref: "#/components/schemas/HelpRequest" } } } } } } },
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
          500: { $ref: "#/components/responses/ServerError" }
        }
      },
      post: {
        tags: ["Services"],
        summary: "Compatibility alias for creating a help request",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/HelpRequestCreate" } } }
        },
        responses: {
          201: { description: "Help request received", content: { "application/json": { schema: { type: "object", properties: { message: { type: "string" }, request: { $ref: "#/components/schemas/HelpRequest" } } } } } },
          400: { $ref: "#/components/responses/BadRequest" },
          500: { $ref: "#/components/responses/ServerError" }
        }
      }
    },
    "/api/services/help-requests/{id}/status": {
      patch: {
        tags: ["Services"],
        summary: "Compatibility alias for updating a help request status",
        security: [{ bearerAuth: [] }],
        parameters: [idParam()],
        requestBody: statusBody(["open", "in_progress", "resolved"]),
        responses: {
          200: messageResponse("Help request updated"),
          400: { $ref: "#/components/responses/BadRequest" },
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
          404: { $ref: "#/components/responses/NotFound" },
          500: { $ref: "#/components/responses/ServerError" }
        }
      }
    }
  }
};
