import nodemailer from 'nodemailer'
import { render } from '@react-email/render'
import PurchaseConfirmation from '@/emails/PurchaseConfirmation'
import OrderStatusUpdate from '@/emails/OrderStatusUpdate'

interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

interface PurchaseConfirmationData {
  customerName: string
  customerEmail: string
  orderNumber: string
  items: Array<{
    name: string
    quantity: number
    price: number
    duration?: string
  }>
  totalAmount: number
  currency: string
  contactInfo: {
    phone: string
    whatsapp: string
    email: string
  }
}

interface OrderStatusUpdateData {
  customerName: string
  customerEmail: string
  orderNumber: string
  status: 'processing' | 'completed' | 'shipped' | 'delivered'
  items: Array<{
    name: string
    quantity: number
  }>
  contactInfo: {
    phone: string
    whatsapp: string
    email: string
  }
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null
  private fromEmail: string
  private fromName: string

  constructor() {
    this.fromEmail = process.env.EMAIL_FROM || 'noreply@submonth.com'
    this.fromName = process.env.EMAIL_FROM_NAME || 'Submonth'
    this.initializeTransporter()
  }

  private initializeTransporter() {
    try {
      const config: EmailConfig = {
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER || '',
          pass: process.env.EMAIL_PASS || ''
        }
      }

      // Validate required fields
      if (!config.auth.user || !config.auth.pass) {
        console.warn('Email credentials not configured. Email sending will be disabled.')
        return
      }

      this.transporter = nodemailer.createTransporter(config)
      
      // Verify connection
      this.transporter.verify((error, success) => {
        if (error) {
          console.error('Email transporter verification failed:', error)
        } else {
          console.log('Email transporter is ready to send messages')
        }
      })
    } catch (error) {
      console.error('Failed to initialize email transporter:', error)
    }
  }

  private async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    if (!this.transporter) {
      console.warn('Email transporter not initialized. Skipping email send.')
      return false
    }

    try {
      const mailOptions = {
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to,
        subject,
        html
      }

      const result = await this.transporter.sendMail(mailOptions)
      console.log('Email sent successfully:', result.messageId)
      return true
    } catch (error) {
      console.error('Failed to send email:', error)
      return false
    }
  }

  async sendPurchaseConfirmation(data: PurchaseConfirmationData): Promise<boolean> {
    try {
      const emailHtml = render(
        PurchaseConfirmation({
          ...data
        })
      )

      const subject = `Order Confirmation #${data.orderNumber} - Submonth`
      
      return await this.sendEmail(data.customerEmail, subject, emailHtml)
    } catch (error) {
      console.error('Failed to send purchase confirmation email:', error)
      return false
    }
  }

  async sendOrderStatusUpdate(data: OrderStatusUpdateData): Promise<boolean> {
    try {
      const emailHtml = render(
        OrderStatusUpdate({
          ...data
        })
      )

      const subject = `Order Update #${data.orderNumber} - ${data.status.charAt(0).toUpperCase() + data.status.slice(1)}`
      
      return await this.sendEmail(data.customerEmail, subject, emailHtml)
    } catch (error) {
      console.error('Failed to send order status update email:', error)
      return false
    }
  }

  async sendTestEmail(to: string): Promise<boolean> {
    try {
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #7c3aed;">Test Email from Submonth</h2>
          <p>This is a test email to verify that the email service is working correctly.</p>
          <p>If you received this email, the configuration is successful!</p>
          <hr style="margin: 20px 0;">
          <p style="color: #6b7280; font-size: 14px;">
            This is an automated test message. Please do not reply.
          </p>
        </div>
      `

      return await this.sendEmail(to, 'Test Email - Submonth', html)
    } catch (error) {
      console.error('Failed to send test email:', error)
      return false
    }
  }

  isConfigured(): boolean {
    return this.transporter !== null
  }
}

// Singleton instance
export const emailService = new EmailService()
export default emailService