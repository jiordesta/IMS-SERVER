export type CreateDeliveryDetailsData = {
  productId: number;
  quantity: number;
  deliveryDate: Date;
  brand?: string;
};

export type UpdateDeliveryDetailsData = {
  productId: number;
  quantity: number;
  deliveryDate: Date;
  brand?: string;
};
