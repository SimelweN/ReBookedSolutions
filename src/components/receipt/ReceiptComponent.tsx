import React, { forwardRef } from "react";
import { format } from "date-fns";

interface ReceiptProps {
  reference: string;
  amount: number;
  timestamp?: string;
  items: Array<{
    id: string;
    title: string;
    author?: string;
    price: number;
  }>;
  buyer?: {
    name: string;
    email: string;
  };
  seller?: {
    name: string;
    email: string;
  };
  deliveryMethod?: string;
  deliveryFee?: number;
  deliveryAddress?: any;
}

const ReceiptComponent = forwardRef<HTMLDivElement, ReceiptProps>(
  (
    {
      reference,
      amount,
      timestamp,
      items,
      buyer,
      seller,
      deliveryMethod = "Standard Delivery",
      deliveryFee = 0,
      deliveryAddress,
    },
    ref,
  ) => {
    const receiptDate = timestamp ? new Date(timestamp) : new Date();
    const formattedDate = format(receiptDate, "PPP 'at' p");
    const receiptNumber = `REC-${reference.slice(-8).toUpperCase()}`;

    return (
      <div
        ref={ref}
        className="max-w-md mx-auto bg-white p-6 font-mono text-sm border border-gray-200"
        style={{
          minHeight: "600px",
          fontFamily: "Courier New, monospace",
        }}
      >
        {/* Header with Logo */}
        <div className="text-center mb-6 border-b-2 border-dashed border-gray-300 pb-4">
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2Fef85af1e41f14f778f4071914fae82c9%2Ff062f09a57c443dca02ea9a99908e49c?format=webp&width=800"
            alt="Logo"
            className="mx-auto mb-3"
            style={{ height: "80px", width: "auto" }}
          />
          <h1 className="text-lg font-bold">PAYMENT RECEIPT</h1>
          <p className="text-gray-600">RebookedSolutions.co.za</p>
        </div>

        {/* Receipt Info */}
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <span>Receipt #:</span>
            <span className="font-bold">{receiptNumber}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span>Date:</span>
            <span>{formattedDate}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span>Payment Ref:</span>
            <span className="font-bold">{reference}</span>
          </div>
        </div>

        {/* Buyer Information */}
        {buyer && (
          <div className="mb-4 border-t border-dashed border-gray-300 pt-3">
            <h3 className="font-bold mb-2">BUYER INFORMATION</h3>
            <div className="text-xs">
              <p>{buyer.name}</p>
              <p>{buyer.email}</p>
            </div>
          </div>
        )}

        {/* Seller Information */}
        {seller && (
          <div className="mb-4">
            <h3 className="font-bold mb-2">SELLER INFORMATION</h3>
            <div className="text-xs">
              <p>{seller.name}</p>
              <p>{seller.email}</p>
            </div>
          </div>
        )}

        {/* Items */}
        <div className="mb-4 border-t border-dashed border-gray-300 pt-3">
          <h3 className="font-bold mb-2">ITEMS PURCHASED</h3>
          {items.map((item, index) => (
            <div key={item.id} className="mb-3">
              <div className="flex justify-between">
                <span className="flex-1 pr-2">{item.title}</span>
                <span className="font-bold">R{item.price.toFixed(2)}</span>
              </div>
              {item.author && (
                <div className="text-xs text-gray-600">by {item.author}</div>
              )}
              {index < items.length - 1 && (
                <div className="border-b border-dotted border-gray-300 mt-2"></div>
              )}
            </div>
          ))}
        </div>

        {/* Delivery Information */}
        <div className="mb-4 border-t border-dashed border-gray-300 pt-3">
          <h3 className="font-bold mb-2">DELIVERY DETAILS</h3>
          <div className="flex justify-between mb-1">
            <span>Method:</span>
            <span>{deliveryMethod}</span>
          </div>
          {deliveryFee > 0 && (
            <div className="flex justify-between mb-1">
              <span>Delivery Fee:</span>
              <span>R{deliveryFee.toFixed(2)}</span>
            </div>
          )}
          {deliveryAddress && (
            <div className="text-xs text-gray-600 mt-2">
              <p>{deliveryAddress.street_address}</p>
              {deliveryAddress.city && <p>{deliveryAddress.city}</p>}
              {deliveryAddress.postal_code && (
                <p>{deliveryAddress.postal_code}</p>
              )}
              {deliveryAddress.province && <p>{deliveryAddress.province}</p>}
            </div>
          )}
        </div>

        {/* Total */}
        <div className="border-t-2 border-dashed border-gray-300 pt-3">
          <div className="flex justify-between text-lg font-bold">
            <span>TOTAL PAID:</span>
            <span>R{amount.toFixed(2)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 pt-4 border-t border-dashed border-gray-300 text-xs text-gray-600">
          <p>Thank you for your purchase!</p>
          <p>Visit us at www.rebookedsolutions.co.za</p>
          <p>This is a computer-generated receipt.</p>
        </div>
      </div>
    );
  },
);

ReceiptComponent.displayName = "ReceiptComponent";

export default ReceiptComponent;
