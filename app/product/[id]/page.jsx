import { ProductDetail } from './ProductDetailClient';

export async function generateStaticParams() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '');
  if (!apiUrl) {
    throw new Error('NEXT_PUBLIC_API_URL must be set to generate product pages.');
  }

  const response = await fetch(`${apiUrl}/api/product-all`);
  if (!response.ok) {
    throw new Error(`Failed to load products for static export: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  if (!Array.isArray(data.product)) {
    throw new Error('The product-all API response must contain a product array.');
  }

  return Array.from(
    new Set(
      data.product
        .filter((product) => product.id !== undefined && product.id !== null)
        .map((product) => String(product.id))
    ),
    (id) => ({ id })
  );
}

export default function ProductPage() {
  return <ProductDetail />;
}
