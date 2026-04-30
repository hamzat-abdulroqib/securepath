import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast, Toaster } from "sonner";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { z } from "zod";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Nigeria Safety Heatmap" },
      { name: "description", content: "Sign in or create an account to report incidents and confirm community alerts." },
    ],
  }),
  component: AuthPage,
});

const credSchema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(72),
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");

  // If already signed in (with a real account), bounce to home.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session && !data.session.user.is_anonymous) {
        navigate({ to: "/" });
      }
    });
  }, [navigate]);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = credSchema.safeParse({ email, password });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back");
    navigate({ to: "/" });
  };

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = credSchema.safeParse({ email, password });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setLoading(true);
    // If currently anonymous, upgrade the existing session to a permanent one.
    const { data: sessionData } = await supabase.auth.getSession();
    const isAnon = sessionData.session?.user.is_anonymous;

    const { error } = isAnon
      ? await supabase.auth.updateUser({
          email: parsed.data.email,
          password: parsed.data.password,
          data: { display_name: displayName || parsed.data.email.split("@")[0] },
        })
      : await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { display_name: displayName || parsed.data.email.split("@")[0] },
          },
        });

    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success(isAnon ? "Account created — your reports are saved" : "Account created");
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-background via-background to-accent/30 flex flex-col items-center justify-center p-4">
      <Toaster position="top-center" richColors />
      <Link to="/" className="self-start text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to map
      </Link>
      <div className="w-full max-w-md bg-card rounded-3xl border border-border shadow-[var(--shadow-soft)] p-6">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-black">Nigeria Safety</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Sign in to save your reports and confirm community alerts.
        </p>

        <Tabs defaultValue="signin">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="signin">Sign in</TabsTrigger>
            <TabsTrigger value="signup">Create account</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <form onSubmit={signIn} className="space-y-3 mt-4">
              <Field id="si-email" label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" />
              <Field id="si-pass" label="Password" type="password" value={password} onChange={setPassword} autoComplete="current-password" />
              <Button type="submit" disabled={loading} className="w-full h-11 rounded-xl">
                {loading ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={signUp} className="space-y-3 mt-4">
              <Field id="su-name" label="Display name (optional)" value={displayName} onChange={setDisplayName} autoComplete="nickname" />
              <Field id="su-email" label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" />
              <Field id="su-pass" label="Password" type="password" value={password} onChange={setPassword} autoComplete="new-password" />
              <Button type="submit" disabled={loading} className="w-full h-11 rounded-xl">
                {loading ? "Creating account…" : "Create account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <p className="text-xs text-muted-foreground text-center mt-6">
          You can also browse the map and report anonymously without an account.
        </p>
      </div>
    </div>
  );
}

function Field({
  id, label, type = "text", value, onChange, autoComplete,
}: { id: string; label: string; type?: string; value: string; onChange: (v: string) => void; autoComplete?: string }) {
  return (
    <div>
      <Label htmlFor={id} className="text-sm">{label}</Label>
      <Input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} autoComplete={autoComplete} className="mt-1 rounded-xl h-11" />
    </div>
  );
}
