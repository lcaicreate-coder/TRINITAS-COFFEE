import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Lock } from 'lucide-react';
import logo from 'figma:asset/abede0c4245362e992f822c58b8427f4d02eb41a.png';

interface StaffLoginProps {
  onLogin: (password: string) => void;
}

export function StaffLogin({ onLogin }: StaffLoginProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '4778337') {
      onLogin(password);
      setError('');
    } else {
      setError('密碼錯誤，請重試');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
            <img src={logo} alt="Trinitas Logo" className="w-16 h-16 object-contain" />
          </div>
          <h1 className="mb-2">同工登入</h1>
          <p className="text-muted-foreground">請輸入密碼以訪問訂單管理系統</p>
        </div>

        <Card className="p-8 border-border">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password">密碼</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="請輸入密碼"
                  className="pl-10 bg-input-background"
                  required
                />
              </div>
              {error && (
                <p className="text-destructive">{error}</p>
              )}
            </div>

            <Button type="submit" className="w-full" size="lg">
              登入
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
