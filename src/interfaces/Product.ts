export default interface Product {
  id: number;
  name: string;
  slug: string;
  price$: number;
  quantity: number;
  description: string;
  categories: string[];
}
