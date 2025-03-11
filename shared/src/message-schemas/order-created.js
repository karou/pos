/**
 * Order Created Event Schema
 * Used for communication between services via RabbitMQ
 */
module.exports = {
  type: 'order.created',
  properties: {
    data: {
      orderId: { type: 'string', required: true },
      orderNumber: { type: 'string', required: true },
      store: { type: 'string', required: true },
      customer: { type: 'string' },
      items: [
        {
          product: { type: 'string', required: true },
          name: { type: 'string', required: true },
          quantity: { type: 'number', required: true, min: 1 },
          basePrice: { type: 'number', required: true, min: 0 },
          variations: [
            {
              name: { type: 'string', required: true },
              value: { type: 'string', required: true },
              priceAdjustment: { type: 'number', default: 0 }
            }
          ],
          toppings: [
            {
              name: { type: 'string', required: true },
              price: { type: 'number', required: true, min: 0 }
            }
          ],
          subtotal: { type: 'number', required: true, min: 0 }
        }
      ],
      subtotal: { type: 'number', required: true, min: 0 },
      tax: { type: 'number', required: true, min: 0 },
      total: { type: 'number', required: true, min: 0 },
      createdAt: { type: 'string', format: 'date-time', required: true }
    },
    metadata: {
      timestamp: { type: 'string', format: 'date-time', required: true },
      source: { type: 'string', default: 'order-service' }
    }
  }
};
