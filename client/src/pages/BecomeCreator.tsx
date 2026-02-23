import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCreatorSchema } from "@shared/schema";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Camera, Sparkles } from "lucide-react";

export default function BecomeCreator() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(insertCreatorSchema),
    defaultValues: {
      username: "",
      displayName: "",
      bio: "",
      socialHandle: "",
      socialPlatform: "twitter",
      price: 50,
      imageUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop",
      isVerified: false,
      availability: "Available for sessions",
    },
  });

  async function onSubmit(data: any) {
    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/creators", data);
      queryClient.invalidateQueries({ queryKey: ["/api/creators"] });
      toast({
        title: "Profile Created!",
        description: "Your creator profile has been set up successfully.",
      });
      setLocation("/creators");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-4">Become a Creator</h1>
          <p className="text-gray-400">Set up your profile and start connecting with your audience.</p>
        </div>

        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Profile Details</CardTitle>
            <CardDescription>This information will be visible to everyone on ProConnect.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Display Name</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-black border-white/10 text-white" placeholder="e.g. Alex Rivera" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Username</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-black border-white/10 text-white" placeholder="e.g. alex_tech" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Bio</FormLabel>
                      <FormControl>
                        <textarea 
                          {...field} 
                          className="w-full min-h-[100px] rounded-md border border-white/10 bg-black px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
                          placeholder="Tell us about yourself..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="socialPlatform"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Primary Platform</FormLabel>
                        <FormControl>
                          <select 
                            {...field}
                            className="w-full h-10 rounded-md border border-white/10 bg-black px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
                          >
                            <option value="twitter">X (Twitter)</option>
                            <option value="instagram">Instagram</option>
                            <option value="linkedin">LinkedIn</option>
                            <option value="github">GitHub</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="socialHandle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Social Handle</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-black border-white/10 text-white" placeholder="e.g. @alex_tech" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Session Price (USD)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={e => field.onChange(parseInt(e.target.value))}
                          className="bg-black border-white/10 text-white" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-primary text-black font-bold h-12 hover:bg-primary/90"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Sparkles className="w-5 h-5 mr-2" />}
                  Create My Page
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
