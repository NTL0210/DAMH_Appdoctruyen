const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Comic Backend API',
      version: '1.0.0',
      description: 'RESTful API for comic reading platform with authentication, comic management, comments, follows, and real-time notifications',
      contact: {
        name: 'API Support'
      }
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3000',
        description: 'API Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtained from /auth/login or /auth/register'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'object',
              properties: {
                code: {
                  type: 'string',
                  example: 'ERROR_CODE'
                },
                message: {
                  type: 'string',
                  example: 'Error description'
                },
                details: {
                  type: 'object'
                }
              }
            },
            timestamp: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string'
            },
            username: {
              type: 'string'
            },
            email: {
              type: 'string',
              format: 'email'
            },
            avatarUrl: {
              type: 'string'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Comic: {
          type: 'object',
          properties: {
            id: {
              type: 'string'
            },
            comicId: {
              type: 'string'
            },
            name: {
              type: 'string'
            },
            slug: {
              type: 'string'
            },
            originName: {
              type: 'string'
            },
            status: {
              type: 'string',
              enum: ['ongoing', 'completed', 'hiatus']
            },
            thumbUrl: {
              type: 'string'
            },
            chaptersLatest: {
              type: 'array',
              items: {
                type: 'object'
              }
            },
            comicGenres: {
              type: 'array',
              items: {
                type: 'object'
              }
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Chapter: {
          type: 'object',
          properties: {
            id: {
              type: 'string'
            },
            comicId: {
              type: 'string'
            },
            slug: {
              type: 'string'
            },
            chapterName: {
              type: 'string'
            },
            chapterTitle: {
              type: 'string'
            },
            chapterIndex: {
              type: 'number'
            },
            chapterApiData: {
              type: 'string'
            },
            serverName: {
              type: 'string'
            },
            filename: {
              type: 'string'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Comment: {
          type: 'object',
          properties: {
            id: {
              type: 'string'
            },
            comicId: {
              type: 'string'
            },
            userName: {
              type: 'string'
            },
            content: {
              type: 'string'
            },
            parentCommentId: {
              type: 'string'
            },
            replies: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Comment'
              }
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Pagination: {
          type: 'object',
          properties: {
            totalPages: {
              type: 'number'
            },
            totalElements: {
              type: 'number'
            },
            pageSize: {
              type: 'number'
            },
            pageNumber: {
              type: 'number'
            }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication token is missing or invalid',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        ValidationError: {
          description: 'Request validation failed',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        RateLimitError: {
          description: 'Rate limit exceeded',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and registration'
      },
      {
        name: 'Profile',
        description: 'User profile management'
      },
      {
        name: 'Comics',
        description: 'Comic catalog and search'
      },
      {
        name: 'Chapters',
        description: 'Chapter management and pages'
      },
      {
        name: 'Comments',
        description: 'Comment system'
      },
      {
        name: 'Follows',
        description: 'Follow/unfollow comics'
      },
      {
        name: 'Reading Progress',
        description: 'Track reading progress'
      },
      {
        name: 'Genres',
        description: 'Genre management'
      }
    ]
  },
  apis: ['./src/routes/*.js'] // Path to route files with JSDoc comments
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
