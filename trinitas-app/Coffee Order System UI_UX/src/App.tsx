import { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { Button } from './components/ui/button';
import { MenuGrid, type Product } from './components/MenuGrid';
import { OrderForm } from './components/OrderForm';
import { OrderConfirmation } from './components/OrderConfirmation';
import { StaffLogin } from './components/StaffLogin';
import { OrderBoard, type Order, type OrderStatus } from './components/OrderBoard';
import logo from 'figma:asset/abede0c4245362e992f822c58b8427f4d02eb41a.png';

type Page = 'menu' | 'order' | 'confirmation' | 'staff-login' | 'staff-dashboard';

const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Espresso',
    nameZh: '濃縮咖啡',
    category: '基本咖啡',
    image: 'https://images.unsplash.com/photo-1624515385619-f6a54f233413?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlc3ByZXNzbyUyMGNvZmZlZSUyMGN1cHxlbnwxfHx8fDE3NjAzNTQ0Nzl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    description: '經典義式濃縮，濃郁醇厚的咖啡精華'
  },
  {
    id: '2',
    name: 'Americano',
    nameZh: '美式咖啡',
    category: '基本咖啡',
    image: 'https://images.unsplash.com/photo-1669872484166-e11b9638b50e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbWVyaWNhbm8lMjBjb2ZmZWUlMjBibGFja3xlbnwxfHx8fDE3NjAzODYzMzR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    description: '濃縮咖啡加熱水，順口回甘'
  },
  {
    id: '3',
    name: 'Ice Americano',
    nameZh: '冰美式',
    category: '冰飲系列',
    image: 'https://images.unsplash.com/photo-1643944498338-40c69f40bfaa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpY2VkJTIwYW1lcmljYW5vJTIwY29mZmVlfGVufDF8fHx8MTc2MDQxNzM2OXww&ixlib=rb-4.1.0&q=80&w=1080',
    description: '清爽冰涼的美式咖啡，夏日首選'
  },
  {
    id: '4',
    name: 'Iced Cappuccino',
    nameZh: '冰卡布奇諾',
    category: '冰飲系列',
    image: 'https://images.unsplash.com/photo-1735485462651-9e00c8969174?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpY2VkJTIwY2FwcHVjY2lubyUyMGZvYW18ZW58MXx8fHwxNzYwNDE3MzY5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: '綿密奶泡與冰咖啡的完美結合'
  },
  {
    id: '5',
    name: 'Iced Latte',
    nameZh: '冰拿鐵',
    category: '冰飲系列',
    image: 'https://images.unsplash.com/photo-1565600587185-6883f2725f73?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpY2VkJTIwbGF0dGUlMjBjb2ZmZWV8ZW58MXx8fHwxNzYwMzUwMTQ5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: '冰涼牛奶與濃縮咖啡的絲滑口感'
  },
  {
    id: '6',
    name: 'Cappuccino',
    nameZh: '卡布奇諾',
    category: '奶咖系列',
    image: 'https://images.unsplash.com/photo-1659553653381-d98d2a831b8c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXBwdWNjaW5vJTIwZm9hbSUyMGhlYXJ0fGVufDF8fHx8MTc2MDQxNzM3MHww&ixlib=rb-4.1.0&q=80&w=1080',
    description: '濃縮咖啡、蒸奶與奶泡的經典比例'
  },
  {
    id: '7',
    name: 'Latte',
    nameZh: '拿鐵',
    category: '奶咖系列',
    image: 'https://images.unsplash.com/photo-1667388363683-a07bbf0c84b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXR0ZSUyMGFydCUyMGNvZmZlZXxlbnwxfHx8fDE3NjAzMjAwMzl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    description: '香醇牛奶與濃縮咖啡的完美融合'
  },
  {
    id: '8',
    name: 'Green Tea Latte',
    nameZh: '抹茶拿鐵',
    category: '特色飲品',
    image: 'https://images.unsplash.com/photo-1708572727896-117b5ea25a86?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXRjaGElMjBncmVlbiUyMHRlYSUyMGxhdHRlfGVufDF8fHx8MTc2MDM0MDgxNXww&ixlib=rb-4.1.0&q=80&w=1080',
    description: '日式抹茶與牛奶的和風滋味'
  },
  {
    id: '9',
    name: 'Dirty',
    nameZh: '髒髒咖啡',
    category: '特色飲品',
    image: 'https://images.unsplash.com/photo-1588711172606-42090983293c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaXJ0eSUyMGNvZmZlZSUyMGRyaW5rfGVufDF8fHx8MTc2MDQxNzM3MXww&ixlib=rb-4.1.0&q=80&w=1080',
    description: '濃縮咖啡流入冰牛奶的視覺饗宴'
  },
  {
    id: '10',
    name: 'Espresso Tonic',
    nameZh: '氣泡咖啡',
    category: '特色飲品',
    image: 'https://images.unsplash.com/photo-1638540124113-bdbf2a326c34?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlc3ByZXNzbyUyMHRvbmljJTIwc3BhcmtsaW5nfGVufDF8fHx8MTc2MDQxNzM3MXww&ixlib=rb-4.1.0&q=80&w=1080',
    description: '清爽氣泡水與濃縮咖啡的創意碰撞'
  },
  {
    id: '11',
    name: 'Coconut Latte',
    nameZh: '椰子拿鐵',
    category: '特色飲品',
    image: 'https://images.unsplash.com/photo-1595000453467-15d064f058c8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2NvbnV0JTIwbGF0dGUlMjBjb2ZmZWV8ZW58MXx8fHwxNzYwMzM2NjExfDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: '椰奶與咖啡的熱帶風情'
  }
];

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('menu');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [lastOrder, setLastOrder] = useState<{ orderNumber: string; customerName: string } | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isStaffAuthenticated, setIsStaffAuthenticated] = useState(false);

  // Auto-refresh orders every 2 seconds when on staff dashboard
  useEffect(() => {
    if (currentPage === 'staff-dashboard' && isStaffAuthenticated) {
      const interval = setInterval(() => {
        // In a real app, this would fetch from API
        console.log('🔄 Auto-refreshing orders...');
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [currentPage, isStaffAuthenticated]);

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setCurrentPage('order');
  };

  const handleSubmitOrder = (orderData: { product: Product; name: string; note: string }) => {
    const orderNumber = `${Date.now().toString().slice(-6)}`;
    const newOrder: Order = {
      id: Date.now().toString(),
      orderNumber,
      product: {
        nameZh: orderData.product.nameZh,
        name: orderData.product.name
      },
      customerName: orderData.name,
      note: orderData.note,
      status: 'pending',
      createdAt: new Date()
    };

    setOrders(prev => [newOrder, ...prev]);
    setLastOrder({ orderNumber, customerName: orderData.name });
    setCurrentPage('confirmation');
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  const handleStaffLogin = () => {
    setIsStaffAuthenticated(true);
    setCurrentPage('staff-dashboard');
  };

  const handleStaffLogout = () => {
    setIsStaffAuthenticated(false);
    setCurrentPage('menu');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'menu':
        return (
          <div className="min-h-screen">
            <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
              <div className="container mx-auto px-4 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 flex items-center justify-center">
                      <img src={logo} alt="Trinitas Logo" className="w-12 h-12 object-contain" />
                    </div>
                    <div>
                      <h1>Trinitas 三一光隅</h1>
                      <p className="text-muted-foreground">精品咖啡 · 自由奉獻</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage('staff-login')}
                  >
                    <User className="mr-2 h-4 w-4" />
                    同工登入
                  </Button>
                </div>
              </div>
            </header>

            <main className="container mx-auto px-4 py-8">
              <div className="mb-8 text-center">
                <h2 className="mb-2">精選咖啡菜單</h2>
                <p className="text-muted-foreground">
                  用心烘焙，以愛調製
                </p>
              </div>
              <MenuGrid products={PRODUCTS} onSelectProduct={handleSelectProduct} />
            </main>

            <footer className="mt-16 py-8 border-t border-border">
              <div className="container mx-auto px-4 text-center text-muted-foreground">
                <p>© 2025 Trinitas 三一光隅 · 所有飲品採用「自由奉獻」定價模式</p>
              </div>
            </footer>
          </div>
        );

      case 'order':
        return (
          <div className="min-h-screen">
            <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
              <div className="container mx-auto px-4 py-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 flex items-center justify-center">
                    <img src={logo} alt="Trinitas Logo" className="w-12 h-12 object-contain" />
                  </div>
                  <div>
                    <h1>Trinitas 三一光隅</h1>
                  </div>
                </div>
              </div>
            </header>

            <main className="container mx-auto px-4 py-8">
              {selectedProduct && (
                <OrderForm
                  product={selectedProduct}
                  onSubmit={handleSubmitOrder}
                  onBack={() => setCurrentPage('menu')}
                />
              )}
            </main>
          </div>
        );

      case 'confirmation':
        return (
          <div className="min-h-screen">
            <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
              <div className="container mx-auto px-4 py-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 flex items-center justify-center">
                    <img src={logo} alt="Trinitas Logo" className="w-12 h-12 object-contain" />
                  </div>
                  <div>
                    <h1>Trinitas 三一光隅</h1>
                  </div>
                </div>
              </div>
            </header>

            <main className="container mx-auto px-4 py-16">
              {lastOrder && (
                <OrderConfirmation
                  orderNumber={lastOrder.orderNumber}
                  customerName={lastOrder.customerName}
                  onBackToMenu={() => setCurrentPage('menu')}
                />
              )}
            </main>
          </div>
        );

      case 'staff-login':
        return <StaffLogin onLogin={handleStaffLogin} />;

      case 'staff-dashboard':
        if (!isStaffAuthenticated) {
          setCurrentPage('staff-login');
          return null;
        }
        return (
          <OrderBoard
            orders={orders}
            onUpdateStatus={handleUpdateOrderStatus}
            onLogout={handleStaffLogout}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {renderPage()}
    </div>
  );
}
