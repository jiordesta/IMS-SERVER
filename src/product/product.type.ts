export type CreateProductData = {
  originalName: string;
  commonName: string;
  price?: number;
};

export type UpdateProductData = {
  originalName?: string;
  commonName?: string;
  stocks?: number;
  image?: any;
  price?: number;
};
