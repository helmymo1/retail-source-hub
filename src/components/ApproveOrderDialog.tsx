import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Check } from 'lucide-react';

interface ApproveOrderDialogProps {
  orderId: string;
  onApprove: (orderId: string, deliveryEstimate: string) => void;
}

export const ApproveOrderDialog = ({ orderId, onApprove }: ApproveOrderDialogProps) => {
  const [deliveryEstimate, setDeliveryEstimate] = useState('');
  const [open, setOpen] = useState(false);

  const handleApprove = () => {
    onApprove(orderId, deliveryEstimate);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="default">
          <Check className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Approve Order</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor={`delivery_estimate_${orderId}`}>Delivery Estimate</Label>
            <Textarea
              id={`delivery_estimate_${orderId}`}
              value={deliveryEstimate}
              onChange={(e) => setDeliveryEstimate(e.target.value)}
              placeholder="e.g., 3-5 business days"
              rows={2}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleApprove} className="flex-1">
              Approve Order
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
