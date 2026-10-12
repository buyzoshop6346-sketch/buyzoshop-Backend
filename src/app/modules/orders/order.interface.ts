export interface CreateOrderPayload {
  name: string;
  phone: string;
  district: string;
  thana: string;
  address: string;
  note?: string;
  isInsideDhaka: boolean;
}

export interface BuyNowOrderPayload extends CreateOrderPayload {
  productId: string;
  quantity?: number;
}

export interface CheckoutOrderPayload extends CreateOrderPayload {}

export interface GetAllOrdersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface AddProductToOrderPayload {
  productId: string;
  quantity?: number;
  size?: string | null;
  color?: string | null;
}
