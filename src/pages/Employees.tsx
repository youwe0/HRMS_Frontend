import { useState, type FormEvent } from "react";
import { Loader2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/api/client";
import { API_ENDPOINTS } from "@/config/endpoints";

type RegisterResponse = {
  id: string;
  userName: string;
};

export default function EmployeesPage() {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const data = await api.post<RegisterResponse>(API_ENDPOINTS.REGISTER, {
        userName,
        password,
      });
      setSuccess(`Employee "${data.userName}" registered successfully.`);
      setUserName("");
      setPassword("");
    } catch (err: unknown) {
      const msg =
        (err as { message?: string }).message ||
        "Something went wrong. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Employees</h1>
        <p className="text-sm text-muted-foreground">
          Register new employees into the system.
        </p>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="size-5" />
            Register Employee
          </CardTitle>
          <CardDescription>
            Create a new user account for an employee.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-lg border border-green-500/50 bg-green-500/10 px-3 py-2 text-sm text-green-700 dark:text-green-400">
                {success}
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
                placeholder="Enter employee username"
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
                placeholder="Enter password (min 8 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !userName || !password}
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Registering…
                </>
              ) : (
                "Register Employee"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
