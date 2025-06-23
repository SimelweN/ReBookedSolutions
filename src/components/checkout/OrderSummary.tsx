import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Book } from "@/types/book";

interface OrderSummaryProps {
  isCartCheckout: boolean;
  book?: Book | null;
  cartData?: Array<{
    id: string;
    imageUrl: string;
    title: string;
    author: string;
    price: number;
  }>;
  selectedDelivery?: {
    serviceName: string;
    price: number;
  } | null;
  itemsTotal: number;
  totalAmount: number;
}

const OrderSummary = ({
  isCartCheckout,
  book,
  cartData = [],
  selectedDelivery,
  itemsTotal,
  totalAmount,
}: OrderSummaryProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {isCartCheckout ? (
            cartData.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 border rounded-lg"
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-12 h-16 md:w-16 md:h-20 object-cover rounded flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm md:text-base truncate">
                    {item.title}
                  </h4>
                  <p className="text-xs md:text-sm text-gray-600 truncate">
                    by {item.author}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-semibold text-sm md:text-base">
                    R{item.price.toFixed(2)}
                  </p>
                </div>
              </div>
            ))
          ) : book ? (
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <img
                src={book.frontCover || book.imageUrl}
                alt={book.title}
                className="w-12 h-16 md:w-16 md:h-20 object-cover rounded flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm md:text-base truncate">
                  {book.title}
                </h4>
                <p className="text-xs md:text-sm text-gray-600 truncate">
                  by {book.author}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-semibold text-sm md:text-base">
                  R{book.price}
                </p>
              </div>
            </div>
          ) : null}
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm">Items Subtotal</span>
            <span className="text-sm">R{itemsTotal.toFixed(2)}</span>
          </div>
          {selectedDelivery && (
            <div className="flex justify-between items-center">
              <span className="text-sm">
                Delivery ({selectedDelivery.serviceName})
              </span>
              <span className="text-sm">
                R{selectedDelivery.price.toFixed(2)}
              </span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-base md:text-lg font-bold">Total</span>
            <span className="text-base md:text-lg font-bold">
              R{totalAmount.toFixed(2)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderSummary;
