import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Share, Plus, MoreVertical, Download } from 'lucide-react';

interface InstallPWADialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isIOS: boolean;
  onInstallClick?: () => void;
}

const InstallPWADialog = ({ open, onOpenChange, isIOS, onInstallClick }: InstallPWADialogProps) => {
  if (isIOS) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-primary" />
              Install StudyHub
            </DialogTitle>
            <DialogDescription>
              Add this app to your home screen for quick access
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-start gap-4 p-3 rounded-lg bg-secondary/50">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 shrink-0">
                <span className="text-lg font-bold text-primary">1</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Tap the Share button</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Look for the <Share className="w-4 h-4 inline text-primary" /> icon at the bottom of your Safari browser
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-3 rounded-lg bg-secondary/50">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 shrink-0">
                <span className="text-lg font-bold text-primary">2</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Select "Add to Home Screen"</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Scroll down and tap <Plus className="w-4 h-4 inline text-primary" /> Add to Home Screen
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-3 rounded-lg bg-secondary/50">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 shrink-0">
                <span className="text-lg font-bold text-primary">3</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Tap "Add"</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Confirm by tapping Add in the top right corner
                </p>
              </div>
            </div>
          </div>
          
          <Button onClick={() => onOpenChange(false)} className="w-full">
            Got it!
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  // Android / Desktop Chrome
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" />
            Install StudyHub
          </DialogTitle>
          <DialogDescription>
            Add this app to your home screen for quick access
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-start gap-4 p-3 rounded-lg bg-secondary/50">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 shrink-0">
              <span className="text-lg font-bold text-primary">1</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">Tap the menu button</p>
              <p className="text-sm text-muted-foreground mt-1">
                Look for the <MoreVertical className="w-4 h-4 inline text-primary" /> icon in your browser
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-4 p-3 rounded-lg bg-secondary/50">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 shrink-0">
              <span className="text-lg font-bold text-primary">2</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">Select "Install app" or "Add to Home screen"</p>
              <p className="text-sm text-muted-foreground mt-1">
                Tap <Download className="w-4 h-4 inline text-primary" /> Install app
              </p>
            </div>
          </div>
        </div>
        
        {onInstallClick && (
          <Button onClick={onInstallClick} className="w-full gradient-purple">
            Install Now
          </Button>
        )}
        
        <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
          Maybe Later
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default InstallPWADialog;
