# BizFlow SaaS API - Thunder Client Tests

Base URL:

```text
http://localhost:5000
```

Variables consigliate in Thunder Client:

```text
customerToken
adminToken
productId
orderId
invoiceId
subscriptionId
userId
```

## Ordine corretto di test

1. `GET /` per verificare che il server risponda.
2. `POST /api/auth/register` per creare un customer.
3. `POST /api/auth/login` per salvare `customerToken`.
4. Effettua login con un admin già presente e salva `adminToken`.
5. `GET /api/auth/me` con `customerToken`.
6. `GET /api/auth/admin-test` con `adminToken`.
7. `POST /api/products` con `adminToken`, poi salva `productId`.
8. `GET /api/products`.
9. `PUT /api/products/:id` con `adminToken`.
10. `POST /api/orders` con `customerToken`, poi salva `orderId`.
11. `GET /api/orders/my-orders` con `customerToken`.
12. `GET /api/orders` con `adminToken`.
13. `PUT /api/orders/:id/status` con `adminToken`.
14. `GET /api/dashboard/stats` con `adminToken`.
15. `GET /api/dashboard/recent-orders` con `adminToken`.
16. `GET /api/users` con `adminToken`, poi salva `userId`.
17. `GET /api/users/:id` con `adminToken`.
18. `PUT /api/users/:id` con `adminToken`.
19. `POST /api/invoices/from-order` con `adminToken`, poi salva `invoiceId`.
20. `GET /api/invoices` con `adminToken`.
21. `GET /api/invoices/my-invoices` con `customerToken`.
22. `GET /api/subscriptions/plans`.
23. `POST /api/subscriptions` con `customerToken`, poi salva `subscriptionId`.
24. `GET /api/subscriptions/my-subscription` con `customerToken`.
25. `GET /api/subscriptions` con `adminToken`.
26. `PUT /api/subscriptions/:id/status` con `adminToken`.
27. `DELETE /api/products/:id` con `adminToken` solo alla fine, se vuoi pulire il prodotto test.
28. `DELETE /api/users/:id` con `adminToken` solo su utenti di test, mai sul tuo admin.

Header JSON:

```json
{
  "Content-Type": "application/json"
}
```

Header protetto:

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {{customerToken}}"
}
```

Header admin:

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {{adminToken}}"
}
```

Risposta errore standard:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Valid email is required"
    }
  ]
}
```

## Health

### GET `/`

Headers: nessuno

Body: nessuno

Expected `200`:

```text
BizFlow SaaS API is running...
```

## Auth

### POST `/api/auth/register`

Headers: JSON

Body:

```json
{
  "name": "Customer User",
  "email": "customer@example.com",
  "password": "123456"
}
```

Expected `201`:

```json
{
  "_id": "USER_ID",
  "name": "Customer User",
  "email": "customer@example.com",
  "role": "customer",
  "token": "JWT_TOKEN"
}
```

### POST `/api/auth/login`

Headers: JSON

Body:

```json
{
  "email": "customer@example.com",
  "password": "123456"
}
```

Expected `200`:

```json
{
  "_id": "USER_ID",
  "name": "Customer User",
  "email": "customer@example.com",
  "role": "customer",
  "token": "JWT_TOKEN"
}
```

### GET `/api/auth/me`

Headers: protetto

Body: nessuno

Expected `200`:

```json
{
  "_id": "USER_ID",
  "name": "Customer User",
  "email": "customer@example.com",
  "role": "customer"
}
```

### GET `/api/auth/admin-test`

Headers: admin

Body: nessuno

Expected `200`:

```json
{
  "message": "Welcome admin"
}
```

## Products

### GET `/api/products`

Headers: nessuno

Body: nessuno

Expected `200`:

```json
[
  {
    "_id": "PRODUCT_ID",
    "name": "CRM Starter",
    "description": "Starter SaaS product",
    "price": 49.99,
    "stock": 20,
    "category": "software",
    "image": "",
    "createdAt": "DATE",
    "updatedAt": "DATE"
  }
]
```

### POST `/api/products`

Headers: admin

Body:

```json
{
  "name": "CRM Starter",
  "description": "Starter SaaS product",
  "price": 49.99,
  "stock": 20,
  "category": "software",
  "image": ""
}
```

Expected `201`:

```json
{
  "_id": "PRODUCT_ID",
  "name": "CRM Starter",
  "description": "Starter SaaS product",
  "price": 49.99,
  "stock": 20,
  "category": "software",
  "image": ""
}
```

### PUT `/api/products/:id`

Headers: admin

Body:

```json
{
  "price": 59.99,
  "stock": 15
}
```

Expected `200`:

```json
{
  "_id": "PRODUCT_ID",
  "name": "CRM Starter",
  "price": 59.99,
  "stock": 15
}
```

### DELETE `/api/products/:id`

Headers: admin

Body: nessuno

Expected `200`:

```json
{
  "message": "Product deleted successfully"
}
```

## Orders

### POST `/api/orders`

Headers: protetto

Body:

```json
{
  "orderItems": [
    {
      "product": "{{productId}}",
      "quantity": 2
    }
  ]
}
```

Expected `201`:

```json
{
  "_id": "ORDER_ID",
  "user": "USER_ID",
  "orderItems": [
    {
      "product": "PRODUCT_ID",
      "name": "CRM Starter",
      "quantity": 2,
      "price": 49.99
    }
  ],
  "totalPrice": 99.98,
  "status": "pending",
  "paymentStatus": "unpaid"
}
```

### GET `/api/orders/my-orders`

Headers: protetto

Body: nessuno

Expected `200`:

```json
[
  {
    "_id": "ORDER_ID",
    "user": "USER_ID",
    "orderItems": [],
    "totalPrice": 99.98,
    "status": "pending"
  }
]
```

### GET `/api/orders`

Headers: admin

Body: nessuno

Expected `200`:

```json
[
  {
    "_id": "ORDER_ID",
    "user": {
      "_id": "USER_ID",
      "name": "Customer User",
      "email": "customer@example.com",
      "role": "customer"
    },
    "totalPrice": 99.98,
    "status": "pending"
  }
]
```

### PUT `/api/orders/:id/status`

Headers: admin

Body:

```json
{
  "status": "processing"
}
```

Expected `200`:

```json
{
  "_id": "ORDER_ID",
  "status": "processing",
  "paymentStatus": "unpaid"
}
```

Allowed statuses: `pending`, `processing`, `shipped`, `delivered`.

## Dashboard

### GET `/api/dashboard/stats`

Headers: admin

Body: nessuno

Expected `200`:

```json
{
  "totalUsers": 2,
  "totalProducts": 5,
  "totalOrders": 10,
  "totalInvoices": 3,
  "activeSubscriptions": 1,
  "totalRevenue": 499.9
}
```

### GET `/api/dashboard/recent-orders`

Headers: admin

Body: nessuno

Expected `200`:

```json
[
  {
    "_id": "ORDER_ID",
    "user": {
      "_id": "USER_ID",
      "name": "Customer User",
      "email": "customer@example.com",
      "role": "customer"
    },
    "totalPrice": 99.98,
    "status": "pending"
  }
]
```

## Users Admin

### GET `/api/users`

Headers: admin

Body: nessuno

Expected `200`:

```json
[
  {
    "_id": "USER_ID",
    "name": "Customer User",
    "email": "customer@example.com",
    "role": "customer"
  }
]
```

### GET `/api/users/:id`

Headers: admin

Body: nessuno

Expected `200`:

```json
{
  "_id": "USER_ID",
  "name": "Customer User",
  "email": "customer@example.com",
  "role": "customer"
}
```

### PUT `/api/users/:id`

Headers: admin

Body:

```json
{
  "name": "Updated User",
  "role": "customer"
}
```

Expected `200`:

```json
{
  "_id": "USER_ID",
  "name": "Updated User",
  "email": "customer@example.com",
  "role": "customer"
}
```

### DELETE `/api/users/:id`

Headers: admin

Body: nessuno

Expected `200`:

```json
{
  "message": "User deleted successfully"
}
```

## Invoices

### POST `/api/invoices/from-order`

Headers: admin

Body:

```json
{
  "orderId": "{{orderId}}"
}
```

Expected `201`:

```json
{
  "_id": "INVOICE_ID",
  "invoiceNumber": "INV-1760000000000",
  "order": "ORDER_ID",
  "user": "USER_ID",
  "items": [],
  "subtotal": 99.98,
  "total": 99.98,
  "status": "issued"
}
```

### GET `/api/invoices`

Headers: admin

Body: nessuno

Expected `200`:

```json
[
  {
    "_id": "INVOICE_ID",
    "invoiceNumber": "INV-1760000000000",
    "user": {
      "_id": "USER_ID",
      "name": "Customer User",
      "email": "customer@example.com",
      "role": "customer"
    },
    "total": 99.98,
    "status": "issued"
  }
]
```

### GET `/api/invoices/my-invoices`

Headers: protetto

Body: nessuno

Expected `200`:

```json
[
  {
    "_id": "INVOICE_ID",
    "invoiceNumber": "INV-1760000000000",
    "order": "ORDER_ID",
    "user": "USER_ID",
    "total": 99.98,
    "status": "issued"
  }
]
```

## Subscriptions

### GET `/api/subscriptions/plans`

Headers: nessuno

Body: nessuno

Expected `200`:

```json
[
  {
    "code": "starter",
    "name": "Starter",
    "price": 29,
    "interval": "month",
    "features": ["Basic dashboard", "Products", "Orders"]
  }
]
```

### POST `/api/subscriptions`

Headers: protetto

Body:

```json
{
  "planCode": "growth"
}
```

Expected `201` or `200`:

```json
{
  "_id": "SUBSCRIPTION_ID",
  "user": "USER_ID",
  "planCode": "growth",
  "planName": "Growth",
  "price": 79,
  "interval": "month",
  "status": "active"
}
```

### GET `/api/subscriptions/my-subscription`

Headers: protetto

Body: nessuno

Expected `200`:

```json
{
  "_id": "SUBSCRIPTION_ID",
  "user": {
    "_id": "USER_ID",
    "name": "Customer User",
    "email": "customer@example.com",
    "role": "customer"
  },
  "planCode": "growth",
  "status": "active"
}
```

### GET `/api/subscriptions`

Headers: admin

Body: nessuno

Expected `200`:

```json
[
  {
    "_id": "SUBSCRIPTION_ID",
    "user": {
      "_id": "USER_ID",
      "name": "Customer User",
      "email": "customer@example.com",
      "role": "customer"
    },
    "planCode": "growth",
    "status": "active"
  }
]
```

### PUT `/api/subscriptions/:id/status`

Headers: admin

Body:

```json
{
  "status": "cancelled"
}
```

Expected `200`:

```json
{
  "_id": "SUBSCRIPTION_ID",
  "planCode": "growth",
  "status": "cancelled"
}
```

Allowed statuses: `active`, `cancelled`, `past_due`, `expired`.
