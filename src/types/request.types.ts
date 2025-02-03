import { Request } from 'express';
import { OrderStatus } from './shared.types';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
  };
}

export interface OrderProductRequest {
  product_id: number;
  quantity: number;
}

export interface OrderStatusRequest {
  status: OrderStatus;
}

export interface OrderRequestBody {
  product_id?: number;
  quantity?: number;
  status?: OrderStatus;
}

// Type guard for order product request
export const isOrderProductRequest = (
  body: unknown
): body is OrderProductRequest => {
  if (typeof body !== 'object' || body === null) {
    return false;
  }

  const request = body as Record<string, unknown>;
  return (
    typeof request.product_id === 'number' &&
    typeof request.quantity === 'number' &&
    request.product_id > 0 &&
    request.quantity > 0
  );
};

// Type guard for order status request
export const isOrderStatusRequest = (
  body: unknown
): body is OrderStatusRequest => {
  if (typeof body !== 'object' || body === null) {
    return false;
  }

  const request = body as Record<string, unknown>;
  return (
    typeof request.status === 'string' &&
    (request.status === 'active' || request.status === 'complete')
  );
};
