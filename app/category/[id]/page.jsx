import CategoryClientView from './CategoryClientView';

export async function generateStaticParams() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '');
  if (!apiUrl) {
    throw new Error('NEXT_PUBLIC_API_URL must be set to generate category pages.');
  }

  const response = await fetch(`${apiUrl}/api/category-list`);
  if (!response.ok) {
    throw new Error(`Failed to load categories for static export: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const categories = data.list ?? data.category ?? data.data;
  if (!Array.isArray(categories)) {
    throw new Error('The category-list API response must contain a category array.');
  }

  const ids = new Set();
  const addCategoryIds = (items) => {
    for (const category of items) {
      if (category.id !== undefined && category.id !== null) {
        ids.add(String(category.id));
      }
      if (Array.isArray(category.children)) {
        addCategoryIds(category.children);
      }
    }
  };
  addCategoryIds(categories);

  return Array.from(ids, (id) => ({ id }));
}

export default async function CategoryPage({ params }) {
  const { id } = await params;
  return <CategoryClientView categoryId={id} />;
}
