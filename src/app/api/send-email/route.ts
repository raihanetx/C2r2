import { NextRequest, NextResponse } from 'next/server'
import emailService from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, data, to } = body

    // Validate required fields
    if (!type || !data) {
      return NextResponse.json(
        { error: 'Missing required fields: type and data' },
        { status: 400 }
      )
    }

    // Check if email service is configured
    if (!emailService.isConfigured()) {
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 503 }
      )
    }

    let result = false

    switch (type) {
      case 'purchase_confirmation':
        result = await emailService.sendPurchaseConfirmation(data)
        break
      
      case 'order_status_update':
        result = await emailService.sendOrderStatusUpdate(data)
        break
      
      case 'test':
        if (!to) {
          return NextResponse.json(
            { error: 'Test email requires recipient email' },
            { status: 400 }
          )
        }
        result = await emailService.sendTestEmail(to)
        break
      
      default:
        return NextResponse.json(
          { error: 'Invalid email type' },
          { status: 400 }
        )
    }

    if (result) {
      return NextResponse.json(
        { success: true, message: 'Email sent successfully' },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Email API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Email API endpoint',
    configured: emailService.isConfigured(),
    usage: {
      purchase_confirmation: {
        method: 'POST',
        body: {
          type: 'purchase_confirmation',
          data: {
            customerName: 'string',
            customerEmail: 'string',
            orderNumber: 'string',
            items: [{ name: 'string', quantity: 'number', price: 'number', duration: 'string' }],
            totalAmount: 'number',
            currency: 'string',
            contactInfo: { phone: 'string', whatsapp: 'string', email: 'string' }
          }
        }
      },
      order_status_update: {
        method: 'POST',
        body: {
          type: 'order_status_update',
          data: {
            customerName: 'string',
            customerEmail: 'string',
            orderNumber: 'string',
            status: 'processing|completed|shipped|delivered',
            items: [{ name: 'string', quantity: 'number' }],
            contactInfo: { phone: 'string', whatsapp: 'string', email: 'string' }
          }
        }
      },
      test: {
        method: 'POST',
        body: {
          type: 'test',
          to: 'recipient@example.com'
        }
      }
    }
  })
}