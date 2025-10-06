import * as React from 'react'
import { Html, Head, Body, Container, Section, Text, Button, Hr, Row, Column, Font } from '@react-email/components'

interface PurchaseConfirmationProps {
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

export default function PurchaseConfirmation({
  customerName,
  customerEmail,
  orderNumber,
  items,
  totalAmount,
  currency,
  contactInfo
}: PurchaseConfirmationProps) {
  const formatPrice = (price: number) => {
    return currency === 'USD' ? `$${price.toFixed(2)}` : `৳${price.toFixed(0)}`
  }

  return (
    <Html>
      <Head>
        <Font fontFamily="Inter" fallbackFontFamily="Arial" />
        <style>{`
          body { font-family: Inter, Arial, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
          .product-row { border-bottom: 1px solid #e5e7eb; }
          .footer { background-color: #f9fafb; }
        `}</style>
      </Head>
      <Body style={{ backgroundColor: '#f3f4f6', margin: 0, padding: '20px 0' }}>
        <Container className="container" style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
          {/* Header */}
          <Section className="header" style={{ padding: '40px 30px', textAlign: 'center' }}>
            <Text style={{ color: 'white', fontSize: '32px', fontWeight: 'bold', margin: 0 }}>
              🎉 Order Confirmed!
            </Text>
            <Text style={{ color: 'white', fontSize: '16px', marginTop: '10px' }}>
              Thank you for your purchase
            </Text>
          </Section>

          {/* Order Info */}
          <Section style={{ padding: '30px' }}>
            <Text style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '20px' }}>
              Hello {customerName},
            </Text>
            <Text style={{ fontSize: '16px', color: '#4b5563', lineHeight: '1.6', marginBottom: '20px' }}>
              We're excited to confirm your order! Your digital subscriptions have been processed and you'll receive access details shortly.
            </Text>

            {/* Order Details */}
            <div style={{ backgroundColor: '#f9fafb', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
              <Text style={{ fontSize: '14px', color: '#6b7280', marginBottom: '5px' }}>Order Number</Text>
              <Text style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', marginBottom: '15px' }}>
                #{orderNumber}
              </Text>
              
              <Text style={{ fontSize: '14px', color: '#6b7280', marginBottom: '5px' }}>Email</Text>
              <Text style={{ fontSize: '16px', color: '#1f2937', marginBottom: '15px' }}>
                {customerEmail}
              </Text>
            </div>

            {/* Products */}
            <Text style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', marginBottom: '15px' }}>
              Order Details
            </Text>
            
            {items.map((item, index) => (
              <Row key={index} className="product-row" style={{ padding: '15px 0' }}>
                <Column style={{ width: '60%' }}>
                  <Text style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                    {item.name}
                  </Text>
                  {item.duration && (
                    <Text style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                      Duration: {item.duration}
                    </Text>
                  )}
                  <Text style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                    Quantity: {item.quantity}
                  </Text>
                </Column>
                <Column style={{ width: '40%', textAlign: 'right' }}>
                  <Text style={{ fontSize: '16px', fontWeight: 'bold', color: '#1f2937' }}>
                    {formatPrice(item.price)}
                  </Text>
                </Column>
              </Row>
            ))}

            {/* Total */}
            <Hr style={{ margin: '20px 0', borderColor: '#e5e7eb' }} />
            <Row>
              <Column style={{ width: '60%' }}>
                <Text style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937' }}>
                  Total Amount
                </Text>
              </Column>
              <Column style={{ width: '40%', textAlign: 'right' }}>
                <Text style={{ fontSize: '20px', fontWeight: 'bold', color: '#7c3aed' }}>
                  {formatPrice(totalAmount)}
                </Text>
              </Column>
            </Row>
          </Section>

          {/* CTA Section */}
          <Section style={{ padding: '0 30px 30px' }}>
            <div style={{ textAlign: 'center', backgroundColor: '#f3e8ff', padding: '25px', borderRadius: '8px' }}>
              <Text style={{ fontSize: '16px', color: '#1f2937', marginBottom: '15px' }}>
                Need help with your order? We're here to assist you!
              </Text>
              <Button 
                href={`mailto:${contactInfo.email}`}
                style={{ 
                  backgroundColor: '#7c3aed', 
                  color: 'white', 
                  padding: '12px 24px', 
                  borderRadius: '6px', 
                  textDecoration: 'none',
                  fontWeight: '600',
                  display: 'inline-block'
                }}
              >
                Contact Support
              </Button>
            </div>
          </Section>

          {/* Footer */}
          <Section className="footer" style={{ padding: '30px', textAlign: 'center' }}>
            <Text style={{ fontSize: '14px', color: '#6b7280', marginBottom: '15px' }}>
              This is an automated confirmation email. Please do not reply to this message.
            </Text>
            
            <div style={{ marginBottom: '20px' }}>
              <Text style={{ fontSize: '14px', color: '#4b5563', fontWeight: '600', marginBottom: '10px' }}>
                Contact Information
              </Text>
              <Text style={{ fontSize: '13px', color: '#6b7280', margin: '5px 0' }}>
                📞 Phone: {contactInfo.phone}
              </Text>
              <Text style={{ fontSize: '13px', color: '#6b7280', margin: '5px 0' }}>
                💬 WhatsApp: {contactInfo.whatsapp}
              </Text>
              <Text style={{ fontSize: '13px', color: '#6b7280', margin: '5px 0' }}>
                ✉️ Email: {contactInfo.email}
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