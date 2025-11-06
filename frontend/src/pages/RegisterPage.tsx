import { registerUser } from "@/app/features/auth/authSlice";
import type { AppDispatch, RootState } from "@/app/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const { status, isAuthenticated, error } = useSelector((state: RootState) => state.auth);

  const handleRegister = () => {
    if (username && password) {
      dispatch(registerUser({ username, password }));
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
          <CardTitle>Register</CardTitle>
          <CardDescription>Create your account to start shopping.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="mb-4 flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const demoUsers = [
                  { username: 'demo_user', password: 'demo123' },
                  { username: 'test_user', password: 'test123' },
                  { username: 'john_doe', password: 'password123' },
                ];
                const randomUser = demoUsers[Math.floor(Math.random() * demoUsers.length)];
                setUsername(randomUser.username);
                setPassword(randomUser.password);
              }}
            >
              🎯 Fill Demo Data
            </Button>
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" type="text" placeholder="Choose a username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="Choose a password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleRegister} disabled={status === 'loading'}>
            {status === 'loading' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Account"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
