import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { Building2, User, MapPin, Phone, Mail, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Signup = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    shopName: '',
    ownerName: '',
    phone: '',
    email: '',
    password: '',
    shopLocation: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Step 1: Sign up the user
      const { data: authData, error: authError } = await signUp(formData.email, formData.password, {
        full_name: formData.ownerName,
        phone: formData.phone
      });

      if (authError) {
        throw authError;
      }

      if (authData.user) {
        // Step 2: Call the RPC to create the shop and assign the role
        const { error: rpcError } = await supabase.rpc('create_new_shop', {
          shop_name: formData.shopName,
          shop_location: formData.shopLocation,
        });

        if (rpcError) {
          throw rpcError;
        }

        toast({
          title: "Signup Successful",
          description: "Your account and shop have been created.",
        });
        navigate('/products');
      }
    } catch (error: any) {
      toast({
        title: "Signup Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Building2 className="mx-auto h-12 w-12 text-primary mb-4" />
          <h1 className="text-3xl font-bold text-foreground">Register Your Business</h1>
          <p className="text-muted-foreground mt-2">
            Create an account to start managing your wholesale orders
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Business Signup</CardTitle>
            <CardDescription>Fill out the form below to create your business account.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="shopName">Shop Name</Label>
                <Input
                  id="shopName"
                  name="shopName"
                  value={formData.shopName}
                  onChange={handleChange}
                  required
                  placeholder="e.g. City Grocers"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ownerName">Owner Name</Label>
                <Input
                  id="ownerName"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleChange}
                  required
                  placeholder="e.g. John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="+1234567890"
                />
              </div>
               <div className="space-y-2">
                <Label htmlFor="shopLocation">Shop Location</Label>
                <Input
                  id="shopLocation"
                  name="shopLocation"
                  value={formData.shopLocation}
                  onChange={handleChange}
                  required
                  placeholder="123 Main St, Anytown, USA"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="owner@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  placeholder="••••••••"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Signing Up..." : "Sign Up"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
