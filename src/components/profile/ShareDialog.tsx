import { Copy, Facebook, Twitter, Linkedin, Mail, MessageCircle, Check } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SHARE_URL = 'https://data-science-hub-snowy.vercel.app/';

const ShareDialog = ({ open, onOpenChange }: ShareDialogProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(SHARE_URL);
      setCopied(true);
      toast({
        title: 'Link Copied!',
        description: 'The link has been copied to your clipboard.',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: 'Failed to copy',
        description: 'Please copy the link manually.',
        variant: 'destructive',
      });
    }
  };

  const shareLinks = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      href: `https://wa.me/?text=Check out DS Portal - Data Science Resources: ${encodeURIComponent(SHARE_URL)}`,
      color: 'hover:bg-green-500/10 hover:text-green-500',
    },
    {
      name: 'Twitter',
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(SHARE_URL)}&text=Check out DS Portal - Data Science Resources`,
      color: 'hover:bg-blue-400/10 hover:text-blue-400',
    },
    {
      name: 'Facebook',
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SHARE_URL)}`,
      color: 'hover:bg-blue-600/10 hover:text-blue-600',
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(SHARE_URL)}`,
      color: 'hover:bg-blue-700/10 hover:text-blue-700',
    },
    {
      name: 'Email',
      icon: Mail,
      href: `mailto:?subject=Check out DS Portal&body=I found this great resource for Data Science students: ${encodeURIComponent(SHARE_URL)}`,
      color: 'hover:bg-red-500/10 hover:text-red-500',
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-center">Share DS Portal</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Social Share Icons */}
          <div className="flex items-center justify-center gap-3">
            {shareLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-center w-12 h-12 rounded-full border border-border transition-colors ${link.color}`}
                title={`Share on ${link.name}`}
              >
                <link.icon className="h-5 w-5" />
              </a>
            ))}
          </div>

          {/* Copy Link Section */}
          <div className="flex items-center gap-2">
            <Input
              value={SHARE_URL}
              readOnly
              className="flex-1 bg-muted/50 text-sm"
            />
            <Button
              onClick={handleCopy}
              variant="outline"
              size="icon"
              className="shrink-0"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Share this portal with your classmates and help them access study materials!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;
