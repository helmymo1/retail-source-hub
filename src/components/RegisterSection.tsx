import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, Building, User, Shield, CheckCircle } from "lucide-react";

const RegisterSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Benefits */}
            <div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-foreground">
                Ready to Join Our
                <span className="block text-accent">Wholesale Network?</span>
              </h2>
              
              <p className="text-xl text-muted-foreground mb-8">
                Get exclusive access to wholesale pricing and grow your business with our trusted supplier network.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-accent" />
                  <span className="text-foreground">Exclusive wholesale pricing</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-accent" />
                  <span className="text-foreground">Dedicated sales representative</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-accent" />
                  <span className="text-foreground">Priority customer support</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-accent" />
                  <span className="text-foreground">Flexible payment terms</span>
                </div>
              </div>
              
              <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-accent" />
                  <span className="font-semibold text-accent">Business Registration Required</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Our platform is exclusively for verified business owners. 
                  A sales representative will visit your shop to complete the registration process.
                </p>
              </div>
            </div>
            
            {/* Right Side - Registration Info */}
            <div>
              <Card className="shadow-elegant border-0">
                <CardHeader className="bg-gradient-primary text-primary-foreground rounded-t-lg">
                  <CardTitle className="text-2xl text-center">Business Registration</CardTitle>
                  <p className="text-center text-primary-foreground/90">
                    Schedule a visit from our sales team
                  </p>
                </CardHeader>
                
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {/* Registration Steps */}
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-accent/10 p-2 rounded-full mt-1">
                          <Building className="w-4 h-4 text-accent" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">Shop Details</h4>
                          <p className="text-sm text-muted-foreground">Provide your business name and information</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="bg-accent/10 p-2 rounded-full mt-1">
                          <User className="w-4 h-4 text-accent" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">Owner Information</h4>
                          <p className="text-sm text-muted-foreground">Your name and contact details</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="bg-accent/10 p-2 rounded-full mt-1">
                          <MapPin className="w-4 h-4 text-accent" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">Location Verification</h4>
                          <p className="text-sm text-muted-foreground">Shop address for delivery and verification</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="bg-accent/10 p-2 rounded-full mt-1">
                          <Phone className="w-4 h-4 text-accent" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">Representative Visit</h4>
                          <p className="text-sm text-muted-foreground">Complete registration with our sales team</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-border">
                      <Button variant="hero" size="lg" className="w-full mb-3">
                        Request Registration Visit
                      </Button>
                      <p className="text-xs text-muted-foreground text-center">
                        Our sales representative will contact you within 24 hours
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RegisterSection;