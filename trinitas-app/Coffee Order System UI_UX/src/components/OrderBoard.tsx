import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { LogOut, Bell, BellOff, Clock, User, StickyNote } from 'lucide-react';
import logo from 'figma:asset/abede0c4245362e992f822c58b8427f4d02eb41a.png';

export type OrderStatus = 'pending' | 'preparing' | 'completed';

export interface Order {
  id: string;
  orderNumber: string;
  product: {
    nameZh: string;
    name: string;
  };
  customerName: string;
  note: string;
  status: OrderStatus;
  createdAt: Date;
}

interface OrderBoardProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
  onLogout: () => void;
}

export function OrderBoard({ orders, onUpdateStatus, onLogout }: OrderBoardProps) {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [prevOrderCount, setPrevOrderCount] = useState(orders.length);

  useEffect(() => {
    if (soundEnabled && orders.length > prevOrderCount) {
      // Play notification sound (simplified - just console log)
      console.log('🔔 新訂單通知！');
    }
    setPrevOrderCount(orders.length);
  }, [orders.length, prevOrderCount, soundEnabled]);

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const preparingOrders = orders.filter(o => o.status === 'preparing');
  const completedOrders = orders.filter(o => o.status === 'completed');

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'preparing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return '待處理';
      case 'preparing':
        return '製作中';
      case 'completed':
        return '已完成';
    }
  };

  const OrderCard = ({ order }: { order: Order }) => (
    <Card className="p-4 border-border bg-card">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className={getStatusColor(order.status)}>
              {getStatusText(order.status)}
            </Badge>
            <span className="text-muted-foreground">#{order.orderNumber}</span>
          </div>
          <h3 className="mb-1">{order.product.nameZh}</h3>
          <p className="text-muted-foreground">{order.product.name}</p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-foreground/80">
          <User className="w-4 h-4 text-muted-foreground" />
          <span>{order.customerName}</span>
        </div>
        {order.note && (
          <div className="flex items-start gap-2 text-foreground/80">
            <StickyNote className="w-4 h-4 text-muted-foreground mt-0.5" />
            <span className="flex-1">{order.note}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>{new Date(order.createdAt).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      <div className="flex gap-2">
        {order.status === 'pending' && (
          <Button
            onClick={() => onUpdateStatus(order.id, 'preparing')}
            className="flex-1"
            size="sm"
          >
            開始製作
          </Button>
        )}
        {order.status === 'preparing' && (
          <Button
            onClick={() => onUpdateStatus(order.id, 'completed')}
            className="flex-1"
            size="sm"
          >
            完成訂單
          </Button>
        )}
        {order.status === 'completed' && (
          <Button
            variant="outline"
            disabled
            className="flex-1"
            size="sm"
          >
            已完成
          </Button>
        )}
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center">
                <img src={logo} alt="Trinitas Logo" className="w-10 h-10 object-contain" />
              </div>
              <div>
                <h1>訂單管理看板</h1>
                <p className="text-muted-foreground">Trinitas 三一光隅</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {soundEnabled ? (
                  <Bell className="w-4 h-4 text-primary" />
                ) : (
                  <BellOff className="w-4 h-4 text-muted-foreground" />
                )}
                <Label htmlFor="sound-toggle" className="cursor-pointer">
                  音效提醒
                </Label>
                <Switch
                  id="sound-toggle"
                  checked={soundEnabled}
                  onCheckedChange={setSoundEnabled}
                />
              </div>

              <Button variant="outline" onClick={onLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                登出
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2>待處理</h2>
              <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                {pendingOrders.length}
              </Badge>
            </div>
            <div className="space-y-4">
              {pendingOrders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
              {pendingOrders.length === 0 && (
                <Card className="p-8 text-center border-dashed border-border bg-muted/30">
                  <p className="text-muted-foreground">暫無待處理訂單</p>
                </Card>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2>製作中</h2>
              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                {preparingOrders.length}
              </Badge>
            </div>
            <div className="space-y-4">
              {preparingOrders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
              {preparingOrders.length === 0 && (
                <Card className="p-8 text-center border-dashed border-border bg-muted/30">
                  <p className="text-muted-foreground">暫無製作中訂單</p>
                </Card>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2>已完成</h2>
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                {completedOrders.length}
              </Badge>
            </div>
            <div className="space-y-4">
              {completedOrders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
              {completedOrders.length === 0 && (
                <Card className="p-8 text-center border-dashed border-border bg-muted/30">
                  <p className="text-muted-foreground">暫無已完成訂單</p>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
