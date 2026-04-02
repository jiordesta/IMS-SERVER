export type ItemOrderData = {
  productId: number;
  quantity: number;
};

export type UpdateOrderData = {
  shopId?: number;
  status?: number;
  type?: number;
  orderDate?: Date;
  items?: ItemOrderData[];
};

export type CreateOrderData = {
  shopId: number;
  orderDate: Date;
  items: ItemOrderData[];
};
