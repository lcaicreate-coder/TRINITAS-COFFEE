import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';
import { ArrowLeft } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { Product } from './MenuGrid';

interface OrderFormProps {
  product: Product;
  onSubmit: (order: { product: Product; name: string; note: string }) => void;
  onBack: () => void;
}

export function OrderForm({ product, onSubmit, onBack }: OrderFormProps) {
  const [name, setName] = useState('');
  const [note, setNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit({ product, name: name.trim(), note: note.trim() });
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Button
        variant="ghost"
        onClick={onBack}
        className="mb-6 -ml-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        返回菜單
      </Button>

      <Card className="overflow-hidden border-border">
        <div className="aspect-video relative overflow-hidden bg-muted">
          <ImageWithFallback
            src={product.image}
            alt={product.name}
            className="object-cover w-full h-full"
          />
        </div>

        <div className="p-6 md:p-8">
          <div className="mb-8">
            <h1 className="mb-2">{product.nameZh}</h1>
            <p className="text-muted-foreground">{product.name}</p>
            {product.description && (
              <p className="mt-4 text-foreground/80">{product.description}</p>
            )}
            <div className="mt-4 inline-block bg-secondary px-4 py-2 rounded-lg">
              <p className="text-accent-foreground">自由奉獻</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">您的稱呼 *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="請輸入您的稱呼"
                required
                className="bg-input-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">訂單備註</Label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="例如：不加糖、少冰、畫笑臉..."
                rows={4}
                className="bg-input-background resize-none"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={!name.trim()}
            >
              確認訂購
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
