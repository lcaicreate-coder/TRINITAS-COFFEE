import { Button } from './ui/button';
import { Card } from './ui/card';
import { CheckCircle2, Coffee } from 'lucide-react';

interface OrderConfirmationProps {
  orderNumber: string;
  customerName: string;
  onBackToMenu: () => void;
}

export function OrderConfirmation({ orderNumber, customerName, onBackToMenu }: OrderConfirmationProps) {
  return (
    <div className="max-w-lg mx-auto text-center">
      <div className="mb-8 inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
        <CheckCircle2 className="w-12 h-12 text-primary" />
      </div>

      <h1 className="mb-4">訂單已確認！</h1>
      <p className="text-muted-foreground mb-8">
        {customerName}，感謝您的訂購
      </p>

      <Card className="p-8 mb-8 border-border">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Coffee className="w-6 h-6 text-primary" />
          <h2>訂單編號</h2>
        </div>
        <p className="text-primary">{orderNumber}</p>
        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-muted-foreground">
            我們正在用心為您準備咖啡
          </p>
          <p className="text-muted-foreground mt-2">
            請稍候片刻，我們會盡快為您送上
          </p>
        </div>
      </Card>

      <Button
        onClick={onBackToMenu}
        size="lg"
        variant="outline"
        className="w-full max-w-xs"
      >
        返回菜單
      </Button>
    </div>
  );
}
