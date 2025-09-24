import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Building2, Menu, X, User, LogOut, ShoppingCart } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut, isAdmin, isBusinessOwner } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="bg-gradient-primary p-2 rounded-lg">
              <Building2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">WholesalePro</span>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/products" className="text-foreground hover:text-accent transition-colors">
              Categories
            </Link>
            <Link to="/products" className="text-foreground hover:text-accent transition-colors">
              Products
            </Link>
            <a href="/#pricing" className="text-foreground hover:text-accent transition-colors">
              Pricing
            </a>
          </nav>
          
          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {isBusinessOwner && (
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/cart">
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Cart
                    </Link>
                  </Button>
                )}
                <Button variant="outline" size="sm" asChild>
                  <Link to="/dashboard">
                    <User className="w-4 h-4 mr-2" />
                    Dashboard
                  </Link>
                </Button>
                <Button variant="outline" size="sm" onClick={signOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="ghost">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button>
                    Register Business
                  </Button>
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
            )}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col gap-4">
              <Link to="/products" className="text-foreground hover:text-accent transition-colors">
                Categories
              </Link>
              <Link to="/products" className="text-foreground hover:text-accent transition-colors">
                Products
              </Link>
              <div className="flex flex-col gap-2 pt-2">
                {user ? (
                  <>
                    {isBusinessOwner && (
                      <Link to="/cart">
                        <Button variant="outline" className="justify-start w-full">
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Cart
                        </Button>
                      </Link>
                    )}
                    <Link to="/dashboard">
                      <Button variant="outline" className="justify-start w-full">
                        <User className="w-4 h-4 mr-2" />
                        Dashboard
                      </Button>
                    </Link>
                    <Button variant="outline" className="justify-start w-full" onClick={signOut}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/auth">
                      <Button variant="ghost" className="justify-start w-full">
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/signup">
                      <Button className="justify-start w-full">
                        Register Business
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;