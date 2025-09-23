import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Building, MapPin, Phone, User, Check, X, Plus } from 'lucide-react';

interface Shop {
  id: string;
  name: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  status: string;
  created_at: string;
  profiles: {
    full_name: string;
    phone: string;
    user_id: string;
  };
}

const AdminShops = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .order('created_at', { ascending: false });

      // Get profile data separately
      const shopsWithProfiles = await Promise.all(
        (data || []).map(async (shop) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, phone, user_id')
            .eq('user_id', shop.owner_id)
            .single();
          
          return {
            ...shop,
            profiles: profile || { full_name: '', phone: '', user_id: shop.owner_id }
          };
        })
      );

      if (error) throw error;
      setShops(shopsWithProfiles);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateShopStatus = async (shopId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('shops')
        .update({ status })
        .eq('id', shopId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Shop ${status} successfully`,
      });

      fetchShops();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "outline",
      approved: "default", 
      rejected: "destructive"
    };

    return (
      <Badge variant={variants[status] || "outline"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-6">
          <Button variant="outline" asChild className="mb-4">
            <Link to="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Manage Shops</h1>
              <p className="text-muted-foreground mt-2">
                Review and manage registered business shops
              </p>
            </div>
            <Button asChild>
              <Link to="/register">
                <Plus className="w-4 h-4 mr-2" />
                Register New Shop
              </Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Registered Shops ({shops.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {shops.map((shop) => (
                <div key={shop.id} className="border border-border rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Building className="w-5 h-5 text-primary" />
                        <h3 className="text-xl font-semibold">{shop.name}</h3>
                        {getStatusBadge(shop.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <User className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="font-medium">{shop.profiles.full_name}</p>
                              <p className="text-sm text-muted-foreground">Shop Owner</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-3">
                            <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="font-medium">{shop.profiles.phone}</p>
                              <p className="text-sm text-muted-foreground">Contact Number</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="font-medium">{shop.location}</p>
                              <p className="text-sm text-muted-foreground">Shop Address</p>
                              {shop.latitude && shop.longitude && (
                                <p className="text-xs text-muted-foreground">
                                  Coordinates: {shop.latitude}, {shop.longitude}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Registered: {new Date(shop.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-6">
                      {shop.status === 'pending' && (
                        <>
                          <Button 
                            size="sm"
                            onClick={() => updateShopStatus(shop.id, 'approved')}
                            className="w-24"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => updateShopStatus(shop.id, 'rejected')}
                            className="w-24"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      
                      {shop.status === 'rejected' && (
                        <Button 
                          size="sm"
                          variant="outline"
                          onClick={() => updateShopStatus(shop.id, 'approved')}
                          className="w-24"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                      )}
                      
                      {shop.status === 'approved' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateShopStatus(shop.id, 'rejected')}
                          className="w-24"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Suspend
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-accent/10 rounded-lg p-4 mt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Shop Status: <span className="font-medium">{shop.status}</span>
                      </span>
                      <span className="text-muted-foreground">
                        ID: <span className="font-mono text-xs">{shop.id.slice(0, 8)}...</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              
              {shops.length === 0 && (
                <div className="text-center py-12">
                  <Building className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No shops registered yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Start by registering the first business shop to get started.
                  </p>
                  <Button asChild>
                    <Link to="/register">
                      <Plus className="w-4 h-4 mr-2" />
                      Register First Shop
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminShops;