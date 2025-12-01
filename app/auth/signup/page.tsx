"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PasswordInput } from "@/components/ui/PasswordInput";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { COUNTRIES } from "@/lib/utils/countries";
import { getTimezoneFromCountry } from "@/lib/utils/timezone";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState<string>("");
  const [countryOpen, setCountryOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate country is selected
    if (!country) {
      setError("Please select your country");
      return;
    }
    
    setLoading(true);

    try {
      const supabase = createClient();
      
      // Store country in user metadata (this is more reliable than URL params)
      const userMetadata: { name?: string; country?: string } = {
        name,
      };
      
      if (country && country !== "unknown") {
        userMetadata.country = country.toUpperCase().trim();
      }
      
      console.log("📝 Signing up with country:", country, "Metadata:", userMetadata);
      
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard&country=${encodeURIComponent(country)}`,
          data: userMetadata,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      // Note: Country will be saved in callback route after email verification
      // when user is authenticated

      // Log signup event if user was created
      if (signUpData.user) {
        try {
          // Normalize country - ensure it's a valid 2-character code
          let countryToLog = country;
          if (countryToLog && countryToLog !== "unknown" && countryToLog !== null && countryToLog !== "") {
            countryToLog = countryToLog.toUpperCase().trim();
            if (countryToLog.length !== 2) {
              console.warn("⚠️ Invalid country code, not logging:", countryToLog);
              countryToLog = undefined;
            }
          } else {
            countryToLog = undefined;
          }
          
          console.log("📝 Logging signup with country:", countryToLog);
          
          const logResponse = await fetch("/api/analytics/log-signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: signUpData.user.id,
              email: signUpData.user.email || email,
              country: countryToLog,
            }),
          });
          
          const logResult = await logResponse.json();
          if (logResult.success) {
            console.log("✅ Signup logged from signup page with country:", countryToLog);
          } else {
            console.warn("⚠️ Signup logging returned:", logResult);
          }
        } catch (logError) {
          // Don't block signup if logging fails
          console.error("❌ Failed to call log-signup API:", logError);
        }
      }

      // Redirect to email verification page
      router.push("/auth/verify");
    } catch (err) {
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-md items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full border-border/40 shadow-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-semibold">Create an account</CardTitle>
          <CardDescription>
            Get started with DayFlow to track your day and understand your patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <PasswordInput
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
                className="rounded-xl"
              />
              <p className="text-xs text-muted-foreground">
                Password must be at least 6 characters
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country <span className="text-destructive">*</span></Label>
              <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id="country"
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={countryOpen}
                    className={cn(
                      "w-full justify-between rounded-xl font-normal",
                      !country && "border-destructive"
                    )}
                    disabled={loading}
                  >
                    {country
                      ? (() => {
                          const selected = COUNTRIES.find((c) => c.code === country);
                          return selected ? `${selected.flag} ${selected.name}` : "Select country...";
                        })()
                      : "Select your country..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                  <Command shouldFilter={true}>
                    <CommandInput placeholder="Search country..." />
                    <CommandList>
                      <CommandEmpty>No country found.</CommandEmpty>
                      <CommandGroup>
                        {COUNTRIES.map((countryOption) => (
                          <CommandItem
                            key={countryOption.code}
                            value={`${countryOption.name} ${countryOption.code}`}
                            onSelect={() => {
                              setCountry(countryOption.code);
                              setCountryOpen(false);
                            }}
                            className="cursor-pointer"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4 shrink-0",
                                country === countryOption.code ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <span className="mr-2 text-lg">{countryOption.flag}</span>
                            <span>{countryOption.name}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <p className="text-xs text-muted-foreground">
                This helps us set your timezone and generate summaries at the right time
              </p>
            </div>
            {error && (
              <div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <Button
              type="submit"
              className="w-full rounded-xl"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Sign up"}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-medium text-foreground hover:underline"
            >
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

