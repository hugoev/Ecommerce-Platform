import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { registerUser } from "@/app/features/auth/authSlice";
import type { RootState, AppDispatch } from "@/app/store";
import { Loader2 } from "lucide-react";

export function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const { status, isAuthenticated, error } = useSelector((state: RootState) => state.auth);

  const handleRegister = () => {
    if (name && email && password) {
      dispatch(registerUser({ name, email, password }));
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
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="m@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
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
