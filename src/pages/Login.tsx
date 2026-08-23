import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api, setAuthToken } from "@/api/client";
import { API_ENDPOINTS } from "@/config/endpoints";
import { sha256 } from "@/lib/crypto";

type LoginResponse = {
  token: string;
  user: { id: string; userName: string; role: string };
};

export default function LoginPage() {
  const navigate = useNavigate();

  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const passwordHash = await sha256(password);

      const payload = { userName, passwordHash };


      // login api call  paylaod 
      // console.log("Login payload:", payload);



      const data = await api.post<LoginResponse>(API_ENDPOINTS.LOGIN, payload);

      setAuthToken(data.token);
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      // Extract message from any error shape — ApiError, network, etc.
      const msg =
        (err as { message?: string }).message ||
        "Something went wrong. Please try again.";
      setError(msg);
      setPassword("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Brand */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Building2 className="size-6" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">HRMS</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to your account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label
              htmlFor="userName"
              className="text-sm font-medium leading-none"
            >
              Username
            </label>
            <Input
              id="userName"
              type="text"
              placeholder="Enter your username"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
              autoComplete="username"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium leading-none"
            >
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={loading || !userName || !password}
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
