import { rateLimit } from 'express-rate-limit'
import { NextResponse } from 'next/server'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_, __, ___, options) => {
    return NextResponse.json(
      { error: options.message || 'Too many requests, please try again later.' },
      { status: options.statusCode || 429 }
    )
  },
  keyGenerator: (req) => {
    return req.ip || req.headers.get('x-forwarded-for') || 'unknown'
  }
})

export default limiter
