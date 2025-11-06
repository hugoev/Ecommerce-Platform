
import { loginUser } from "@/app/features/auth/authSlice";
import type { AppDispatch, RootState } from "@/app/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const { status, isAuthenticated, error } = useSelector((state: RootState) => state.auth);

  const handleLogin = () => {
    if (username && password) {
      dispatch(loginUser({ username, password }));
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="flex justify-center items-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Welcome back! Please login to your account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" type="text" placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          
          {/* Demo Credentials */}
          <div className="border-t pt-4 mt-4">
            <p className="text-sm font-medium text-text-muted mb-2">Demo Credentials:</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    setUsername('admin');
                    setPassword('admin123');
                  }}
                >
                  Use Admin
                </Button>
                <span className="text-xs text-text-muted">admin / admin123</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    setUsername('john_doe');
                    setPassword('password123');
                  }}
                >
                  Use User
                </Button>
                <span className="text-xs text-text-muted">john_doe / password123</span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button className="w-full" onClick={handleLogin} disabled={status === 'loading'}>
            {status === 'loading' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Login"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Don't have an account? <a href="/register" className="underline">Register here</a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
