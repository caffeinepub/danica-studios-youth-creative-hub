import { ReactNode } from 'react';
import AppNav from './AppNav';
import { SiFacebook, SiInstagram, SiX } from 'react-icons/si';
import { Heart } from 'lucide-react';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const currentYear = new Date().getFullYear();
  const appIdentifier = encodeURIComponent(window.location.hostname || 'danica-studios');

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppNav />
      <main className="flex-1 container py-8">
        {children}
      </main>
      <footer className="border-t bg-card mt-auto">
        <div className="container py-8">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <h3 className="font-bold text-lg mb-3">Danica Studios Youth Creative Hub</h3>
              <p className="text-sm text-muted-foreground">
                A signature of Excellence - Empowering youth creativity through professional recording, podcast, and photo/video studios.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-3">Our Studios</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Recording Studio</li>
                <li>Podcast Studio</li>
                <li>Photo/Video Studio</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-3">Connect With Us</h3>
              <div className="flex gap-4">
                <a 
                  href="https://www.facebook.com/danicastudios/" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Visit Danica Studios on Facebook"
                >
                  <SiFacebook className="h-5 w-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <SiInstagram className="h-5 w-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <SiX className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>
              © {currentYear} Danica Studios. All rights reserved.
            </p>
            <p className="mt-2 flex items-center justify-center gap-1">
              Built with <Heart className="h-4 w-4 text-red-500 fill-red-500" /> using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appIdentifier}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground transition-colors"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
