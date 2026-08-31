import { MessageSquare, Phone } from "lucide-react";
import Button from "@/components/ui/Button";
import { contactPhone } from "@/config/site";

/**
 * The two actions a phone keeps under the thumb.
 *
 * Both of them are how a buyer out here actually starts: a call to the number
 * on the sign, or a message about one address. Reaching either through the bar
 * costs a scroll back to the top of whatever listing they are reading, and the
 * listing is the reason they are calling.
 */
export default function ThumbRail() {
  return (
    <div className="thumb-rail fixed inset-x-0 bottom-0 z-rail border-t border-surface-line bg-surface lg:hidden">
      <div className="page-shell flex gap-2 py-2">
        <Button
          href={`tel:${contactPhone}`}
          variant="outline"
          size="md"
          className="flex-1"
        >
          <Phone className="h-4 w-4" aria-hidden="true" />
          Call
        </Button>
        <Button to="/contact" size="md" className="flex-1">
          <MessageSquare className="h-4 w-4" aria-hidden="true" />
          Get in Touch
        </Button>
      </div>
    </div>
  );
}
