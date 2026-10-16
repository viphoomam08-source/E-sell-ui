import { ShopClientView } from './ShopClientView';

export async function generateStaticParams() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '');
  if (!apiUrl) {
    throw new Error('NEXT_PUBLIC_API_URL must be set to generate shop pages.');
  }

  const response = await fetch(`${apiUrl}/api/seller-list`);
  if (!response.ok) {
    throw new Error(`Failed to load sellers for static export: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  if (!Array.isArray(data.seller)) {
    throw new Error('The seller-list API response must contain a seller array.');
  }

  return data.seller
    .filter((seller) => seller.id !== undefined && seller.id !== null)
    .map((seller) => ({ id: String(seller.id) }));
}

export default async function ShopPage({ params }) {
  const { id } = await params;
  return <ShopClientView shopId={id} />;
}
