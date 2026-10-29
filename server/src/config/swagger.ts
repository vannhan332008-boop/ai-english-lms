import swaggerUi from 'swagger-ui-express'

export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'EnglishFlow LMS — Multi-tenant AI SaaS API',
    version: '1.0.0',
    description:
      'Backend API for EnglishFlow LMS — an Enterprise AI Learning Management & Center Operations platform for Language Centers in Vietnam.',
    contact: {
      name: 'EnglishFlow Architecture Team',
      email: 'tech@englishflow.vn',
    },
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Local Development Server',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Input your JWT Access Token: Bearer <token>',
      },
    },
    schemas: {
      ApiResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: { type: 'object' },
          meta: {
            type: 'object',
            properties: {
              timestamp: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
  },
  paths: {
    '/api/v1/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'User Login with Email and Password',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: {
                    type: 'string',
                    example: 'manager.hcm@englishflow.vn',
                  },
                  password: {
                    type: 'string',
                    example: 'password123',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful with access and refresh tokens',
          },
          401: {
            description: 'Invalid credentials',
          },
        },
      },
    },
    '/api/v1/auth/register-tenant': {
      post: {
        tags: ['Authentication'],
        summary: 'Register New Language Center (Tenant) & Manager Account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['centerName', 'centerCode', 'managerName', 'managerEmail', 'password'],
                properties: {
                  centerName: { type: 'string', example: 'VUS Landmark Branch' },
                  centerCode: { type: 'string', example: 'vus-landmark' },
                  managerName: { type: 'string', example: 'Nguyen Van Truong' },
                  managerEmail: { type: 'string', example: 'truong.nguyen@vus.edu.vn' },
                  password: { type: 'string', example: 'password123' },
                  phone: { type: 'string', example: '0908123456' },
                  city: { type: 'string', example: 'Ho Chi Minh City' },
                  address: { type: 'string', example: 'Landmark 81, Binh Thanh' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Center registered and manager created',
          },
        },
      },
    },
    '/api/v1/auth/refresh-token': {
      post: {
        tags: ['Authentication'],
        summary: 'Rotate and Refresh Access Token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['refreshToken'],
                properties: {
                  refreshToken: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'New token pair generated' },
          401: { description: 'Invalid or expired token' },
        },
      },
    },
    '/api/v1/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Get Current Authenticated User & Tenant Info',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Current user profile with active role & center' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/v1/auth/demo-switch': {
      post: {
        tags: ['Authentication'],
        summary: 'Instant Demo Role Switcher for Frontend Testing',
        description: 'Switches directly to a seeded account without typing passwords.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['role'],
                properties: {
                  role: {
                    type: 'string',
                    enum: ['SUPER_ADMIN', 'CENTER_MANAGER', 'TEACHER', 'STUDENT'],
                    example: 'CENTER_MANAGER',
                  },
                  tenantCode: {
                    type: 'string',
                    example: 'ef-landmark-hcm',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Switched successfully with live token' },
        },
      },
    },
  },
}

export { swaggerUi }

