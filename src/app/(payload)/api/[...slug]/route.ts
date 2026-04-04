import { REST_DELETE, REST_GET, REST_PATCH, REST_POST } from '@payloadcms/next/routes'
import config from '@payload-config'

// Payload REST API catch-all route
// Handles: GET /api/*, POST /api/*, PATCH /api/*, DELETE /api/*
export const GET = REST_GET(config)
export const POST = REST_POST(config)
export const PATCH = REST_PATCH(config)
export const DELETE = REST_DELETE(config)
