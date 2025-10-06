import * as React from 'react'
import { Html, Head, Body, Container, Section, Text, Button, Hr, Font } from '@react-email/components'

interface OrderStatusUpdateProps {
  customerName: string
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

export default function OrderStatusUpdate({
  customerName,
  orderNumber,
  status,
  items,
  contactInfo
}: OrderStatusUpdateProps) {
  const getStatusInfo = () => {
    switch (status) {
      case 'processing':
        return {
          icon: '⏳',
          title: 'Order Processing',
          message: 'Your order is being processed and will be ready soon.',
          color: '#f59e0b'
        }
      case 'completed':
        return {
          icon: '✅',
          title: 'Order Completed',
          message: 'Your digital subscriptions are now active! Check your email for access details.',
          color: '#10b981'
        }
      case 'shipped':
        return {
          icon: '🚀',
          title: 'Access Details Sent',
          message: 'Your subscription access details have been sent to your email.',
          color: '#3b82f6'
        }
      case 'delivered':
        return {
          icon: '🎉',
          title: 'Successfully Delivered',
          message: 'Your subscriptions are now active and ready to use!',
          color: '#8b5cf6'
        }
      default:
        return {
          icon: '📦',
          title: 'Order Update',
          message: 'Your order status has been updated.',
          color: '#6b7280'
        }
    }
  }

  const statusInfo = getStatusInfo()

  return (
    <Html>
      <Head>
        <Font fontFamily="Inter" fallbackFontFamily="Arial" />
      </Head>
      <Body style={{ backgroundColor: '#f3f4f6', margin: 0, padding: '20px 0' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
          {/* Header */}
          <Section style={{ backgroundColor: statusInfo.color, padding: '40px 30px', textAlign: 'center' }}>
            <Text style={{ color: 'white', fontSize: '48px', margin: 0 }}>
              {statusInfo.icon}
            </Text>
            <Text style={{ color: 'white', fontSize: '28px', fontWeight: 'bold', marginTop: '10px' }}>
              {statusInfo.title}
            </Text>
          </Section>

          {/* Content */}
          <Section style={{ padding: '30px' }}>
            <Text style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '20px' }}>
              Hello {customerName},
            </Text>
            
            <Text style={{ fontSize: '16px', color: '#4b5563', lineHeight: '1.6', marginBottom: '25px' }}>
              {statusInfo.message}
            </Text>

            {/* Order Info */}
            <div style={{ backgroundColor: '#f9fafb', padding: '20px', borderRadius: '8px', marginBottom: '25px' }}>
              <Text style={{ fontSize: '14px', color: '#6b7280', marginBottom: '5px' }}>Order Number</Text>
              <Text style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937' }}>
                #{orderNumber}
              </Text>
            </div>

            {/* Items Summary */}
            <div style={{ backgroundColor: '#fef3c7', padding: '20px', borderRadius: '8px', marginBottom: '25px' }}>
              <Text style={{ fontSize: '16px', fontWeight: '600', color: '#92400e', marginBottom: '10px' }}>
                Order Items:
              </Text>
              {items.map((item, index) => (
                <Text key={index} style={{ fontSize: '14px', color: '#78350f', margin: '5px 0' }}>
                  • {item.name} (Quantity: {item.quantity})
                </Text>
              ))}
            </div>

            {/* CTA */}
            <div style={{ textAlign: 'center', margin: '30px 0' }}>
              <Button 
                href={`mailto:${contactInfo.email}`}
                style={{ 
                  backgroundColor: '#7c3aed', 
                  color: 'white', 
                  padding: '12px 24px', 
                  borderRadius: '6px', 
                  textDecoration: 'none',
                  fontWeight: '600'
                }}
              >
                Contact Support
              </Button>
            </div>
          </Section>

          {/* Footer */}
          <Section style={{ backgroundColor: '#f9fafb', padding: '30px', textAlign: 'center' }}>
            <Text style={{ fontSize: '14px', color: '#6b7280', marginBottom: '15px' }}>
              This is an automated notification. Please do not reply to this message.
            </Text>
            
            <div style={{ marginBottom: '20px' }}>
              <Text style={{ fontSize: '13px', color: '#6b7280', margin: '5px 0' }}>
                📞 {contactInfo.phone}
              </Text>
              <Text style={{ fontSize: '13px', color: '#6b7280', margin: '5px 0' }}>
                💬 {contactInfo.whatsapp}
              </Text>
              <Text style={{ fontSize: '13px', color: '#6b7280', margin: '5px 0' }}>
                ✉️ {contactInfo.email}
              </Text>
            </div>

            <Hr style={{ margin: '20px auto', width: '50px', borderColor: '#e5e7eb' }} />
            
            <Text style={{ fontSize: '12px', color: '#9ca3af' }}>
              © 2024 Submonth. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}