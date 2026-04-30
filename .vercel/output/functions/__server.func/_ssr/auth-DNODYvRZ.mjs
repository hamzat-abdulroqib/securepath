import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { s as supabase, T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent, B as Button, d as cn } from "./tabs-CBqX4d81.mjs";
import { R as Root } from "../_libs/radix-ui__react-label.mjs";
import { c as cva } from "../_libs/class-variance-authority.mjs";
import { T as Toaster, t as toast } from "../_libs/sonner.mjs";
import { A as ArrowLeft, S as ShieldCheck } from "../_libs/lucide-react.mjs";
import { o as objectType, s as stringType } from "../_libs/zod.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/radix-ui__react-tabs.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-roving-focus.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
const Input = reactExports.forwardRef(
  ({ className, type, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        type,
        className: cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Input.displayName = "Input";
const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);
const Label = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(Root, { ref, className: cn(labelVariants(), className), ...props }));
Label.displayName = Root.displayName;
const credSchema = objectType({
  email: stringType().trim().email("Enter a valid email").max(255),
  password: stringType().min(6, "Password must be at least 6 characters").max(72)
});
function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = reactExports.useState(false);
  const [email, setEmail] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [displayName, setDisplayName] = reactExports.useState("");
  reactExports.useEffect(() => {
    supabase.auth.getSession().then(({
      data
    }) => {
      if (data.session && !data.session.user.is_anonymous) {
        navigate({
          to: "/"
        });
      }
    });
  }, [navigate]);
  const signIn = async (e) => {
    e.preventDefault();
    const parsed = credSchema.safeParse({
      email,
      password
    });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setLoading(true);
    const {
      error
    } = await supabase.auth.signInWithPassword(parsed.data);
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back");
    navigate({
      to: "/"
    });
  };
  const signUp = async (e) => {
    e.preventDefault();
    const parsed = credSchema.safeParse({
      email,
      password
    });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setLoading(true);
    const {
      data: sessionData
    } = await supabase.auth.getSession();
    const isAnon = sessionData.session?.user.is_anonymous;
    const {
      error
    } = isAnon ? await supabase.auth.updateUser({
      email: parsed.data.email,
      password: parsed.data.password,
      data: {
        display_name: displayName || parsed.data.email.split("@")[0]
      }
    }) : await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          display_name: displayName || parsed.data.email.split("@")[0]
        }
      }
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success(isAnon ? "Account created — your reports are saved" : "Account created");
    navigate({
      to: "/"
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-[100dvh] bg-gradient-to-br from-background via-background to-accent/30 flex flex-col items-center justify-center p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Toaster, { position: "top-center", richColors: true }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", className: "self-start text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
      " Back to map"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-md bg-card rounded-3xl border border-border shadow-[var(--shadow-soft)] p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-6 w-6 text-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-black", children: "Nigeria Safety" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mb-6", children: "Sign in to save your reports and confirm community alerts." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "signin", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "grid grid-cols-2 w-full", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "signin", children: "Sign in" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "signup", children: "Create account" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "signin", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: signIn, className: "space-y-3 mt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { id: "si-email", label: "Email", type: "email", value: email, onChange: setEmail, autoComplete: "email" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { id: "si-pass", label: "Password", type: "password", value: password, onChange: setPassword, autoComplete: "current-password" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: loading, className: "w-full h-11 rounded-xl", children: loading ? "Signing in…" : "Sign in" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "signup", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: signUp, className: "space-y-3 mt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { id: "su-name", label: "Display name (optional)", value: displayName, onChange: setDisplayName, autoComplete: "nickname" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { id: "su-email", label: "Email", type: "email", value: email, onChange: setEmail, autoComplete: "email" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { id: "su-pass", label: "Password", type: "password", value: password, onChange: setPassword, autoComplete: "new-password" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: loading, className: "w-full h-11 rounded-xl", children: loading ? "Creating account…" : "Create account" })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground text-center mt-6", children: "You can also browse the map and report anonymously without an account." })
    ] })
  ] });
}
function Field({
  id,
  label,
  type = "text",
  value,
  onChange,
  autoComplete
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: id, className: "text-sm", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id, type, value, onChange: (e) => onChange(e.target.value), autoComplete, className: "mt-1 rounded-xl h-11" })
  ] });
}
export {
  AuthPage as component
};
