import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";

const signInSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(6, "Min 6 characters").max(72),
});

const signUpSchema = signInSchema.extend({
  full_name: z.string().trim().min(2).max(100),
});

const AuthPage = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get("redirect") || "/";
  const [loading, setLoading] = useState(false);

  const signInForm = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });
  const signUpForm = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: "", password: "", full_name: "" },
  });

  const onSignIn = async (v: z.infer<typeof signInSchema>) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: v.email, password: v.password });
    setLoading(false);
    if (error) return toast.error("Sign in failed", { description: error.message });
    toast.success("Welcome back");
    navigate(redirect);
  };

  const onSignUp = async (v: z.infer<typeof signUpSchema>) => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: v.email,
      password: v.password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { full_name: v.full_name },
      },
    });
    setLoading(false);
    if (error) return toast.error("Sign up failed", { description: error.message });
    toast.success("Account created", { description: "You can now sign in." });
  };

  const onGoogle = async () => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}${redirect}`,
    });
    if (result.error) {
      setLoading(false);
      return toast.error("Google sign-in failed", { description: result.error.message });
    }
    if (result.redirected) return;
    setLoading(false);
    toast.success("Welcome");
    navigate(redirect);
  };

  return (
    <div className="container-narrow py-20 max-w-md">
      <div className="text-center mb-10">
        <Link to="/" className="font-display text-3xl gold-text">Saveur</Link>
        <p className="text-muted-foreground mt-3 text-sm">Sign in to manage reservations and orders.</p>
      </div>

      <div className="bg-card border border-border/60 p-8 shadow-elegant">
        <Tabs defaultValue="signin">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="signin">Sign in</TabsTrigger>
            <TabsTrigger value="signup">Create account</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <Form {...signInForm}>
              <form onSubmit={signInForm.handleSubmit(onSignIn)} className="space-y-4">
                <FormField control={signInForm.control} name="email" render={({ field }) => (
                  <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={signInForm.control} name="password" render={({ field }) => (
                  <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Sign in
                </Button>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="signup">
            <Form {...signUpForm}>
              <form onSubmit={signUpForm.handleSubmit(onSignUp)} className="space-y-4">
                <FormField control={signUpForm.control} name="full_name" render={({ field }) => (
                  <FormItem><FormLabel>Full name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={signUpForm.control} name="email" render={({ field }) => (
                  <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={signUpForm.control} name="password" render={({ field }) => (
                  <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create account
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AuthPage;
