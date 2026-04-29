const PORT = process.env.PORT || 5000;

module.exports = {
  openapi: "3.0.3",
  info: {
    title: "LAU Library API",
    version: "1.0.0",
    description: "Interactive documentation for auth, user, dashboard, and books endpoints."
  },
  servers: [
    {
      url: `http://localhost:${PORT}`,
      description: "Local development server"
    }
  ],
  tags: [
    { name: "Auth" },
    { name: "Users" },
    { name: "Dashboard" },
    { name: "Books" }
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
      RegisterRequest: {
        type: "object",
        required: ["full_name", "email", "password"],
        properties: {
          full_name: { type: "string", example: "Kareem Naous" },
          email: { type: "string", format: "email", example: "kareem@lau.edu" },
          password: { type: "string", example: "Aa123456!" }
        }
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "kareem@lau.edu" },
          password: { type: "string", example: "Aa123456!" }
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
          image: { type: "string", example: "https://example.com/cover.jpg" },
          availableCopies: { type: "integer", example: 3 },
          year: { type: "integer", example: 2017 },
          pages: { type: "integer", example: 432 },
          rating: { type: "number", example: 4.7 }
        }
      }
    }
  },
  paths: {
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterRequest" }
            }
          }
        },
        responses: {
          201: { description: "User registered" },
          400: { description: "Validation error" }
        }
      }
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" }
            }
          }
        },
        responses: {
          200: { description: "Login successful" },
          401: { description: "Invalid credentials" }
        }
      }
    },
    "/api/users/me": {
      get: {
        tags: ["Users"],
        summary: "Get current user profile",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "User profile" },
          401: { description: "Unauthorized" }
        }
      }
    },
    "/api/dashboard": {
      get: {
        tags: ["Dashboard"],
        summary: "Get dashboard loans data",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Dashboard data returned" },
          401: { description: "Unauthorized" }
        }
      }
    },
    "/api/books": {
      get: {
        tags: ["Books"],
        summary: "List books",
        responses: {
          200: { description: "Books list returned" }
        }
      },
      post: {
        tags: ["Books"],
        summary: "Create a book",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/BookUpsertRequest" }
            }
          }
        },
        responses: {
          201: { description: "Book created" },
          400: { description: "Validation error" },
          401: { description: "Unauthorized" }
        }
      }
    },
    "/api/books/{id}": {
      get: {
        tags: ["Books"],
        summary: "Get book by ID",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } }
        ],
        responses: {
          200: { description: "Book returned" },
          404: { description: "Book not found" }
        }
      },
      put: {
        tags: ["Books"],
        summary: "Update a book",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/BookUpsertRequest" }
            }
          }
        },
        responses: {
          200: { description: "Book updated" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
          404: { description: "Book not found" }
        }
      },
      delete: {
        tags: ["Books"],
        summary: "Delete a book",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } }
        ],
        responses: {
          200: { description: "Book deleted" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
          404: { description: "Book not found" }
        }
      }
    }
  }
};

