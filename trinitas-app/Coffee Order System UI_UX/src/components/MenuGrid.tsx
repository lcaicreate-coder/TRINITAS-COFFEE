import { ImageWithFallback } from './figma/ImageWithFallback';
import { Card } from './ui/card';

export interface Product {
  id: string;
  name: string;
  nameZh: string;
  category: string;
  image: string;
  description?: string;
}

interface MenuGridProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export function MenuGrid({ products, onSelectProduct }: MenuGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {products.map((product) => (
        <Card
          key={product.id}
          className="overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border bg-card"
          onClick={() => onSelectProduct(product)}
        >
          <div className="aspect-square relative overflow-hidden bg-muted">
            <ImageWithFallback
              src={product.image}
              alt={product.name}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="p-4">
            <h3 className="text-foreground">{product.nameZh}</h3>
            <p className="text-muted-foreground mt-1">{product.name}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}
