import React, { useState } from 'react';
import { Organization } from '@/lib/models/Organization';
import { Theme } from '@/lib/models/Theme';
import { isColorLight } from '@/lib/models/Theme';

interface CustomMembershipSheetProps {
  organization: Organization;
  theme?: Theme;
  isOpen: boolean;
  onClose: () => void;
}

type PaymentType = 'monthly' | 'oneTime';

const CustomMembershipSheet: React.FC<CustomMembershipSheetProps> = ({
  organization,
  theme,
  isOpen,
  onClose
}) => {
  const [amount, setAmount] = useState<string>('');
  const [paymentType, setPaymentType] = useState<PaymentType>('monthly');

  if (!isOpen) return null;

  // Theme colors with fallbacks
  const primaryColor = theme?.primaryColor ? `#${theme.primaryColor}` : '#ADD3FF';
  const textColor = theme?.primaryColor && theme?.textOnPrimaryColor 
    ? `#${theme.textOnPrimaryColor}` 
    : (isColorLight(theme?.primaryColor || 'ADD3FF') ? '#000000' : '#FFFFFF');

  return (
    <div className="fixed inset-0 z-50 bg-opacity-75 bg-black flex items-center justify-center">
      <div className="bg-[#1E1E20] rounded-xl max-w-md w-full p-6">
        {/* Amount input */}
        <div className="flex justify-center items-baseline mb-8">
          <span className="text-white font-marfa font-semibold text-6xl mr-1">$</span>
          <input
            type="text"
            className="bg-transparent text-white font-marfa font-semibold text-6xl w-32 text-center focus:outline-none"
            placeholder="25"
            value={amount}
            onChange={(e) => {
              // Only allow numbers and decimal point
              const value = e.target.value.replace(/[^0-9.]/g, '');
              setAmount(value);
            }}
          />
        </div>

        {/* Payment type selection */}
        <div className="flex space-x-4 mb-8">
          <button
            className={`flex-1 py-3 rounded-lg font-marfa font-medium text-base 
              ${paymentType === 'monthly' 
                ? 'bg-opacity-100' 
                : 'bg-opacity-20 text-white/60'}`}
            style={{
              backgroundColor: paymentType === 'monthly' ? primaryColor : '#FFFFFF20',
              color: paymentType === 'monthly' ? textColor : 'white'
            }}
            onClick={() => setPaymentType('monthly')}
          >
            Monthly
          </button>
          <button
            className={`flex-1 py-3 rounded-lg font-marfa font-medium text-base 
              ${paymentType === 'oneTime' 
                ? 'bg-opacity-100' 
                : 'bg-opacity-20 text-white/60'}`}
            style={{
              backgroundColor: paymentType === 'oneTime' ? primaryColor : '#FFFFFF20',
              color: paymentType === 'oneTime' ? textColor : 'white'
            }}
            onClick={() => setPaymentType('oneTime')}
          >
            One-Time
          </button>
        </div>

        {/* Continue button */}
        <button
          className="w-full py-3 rounded-lg font-marfa font-semibold text-base mb-4"
          style={{ 
            backgroundColor: primaryColor,
            color: textColor
          }}
        >
          Continue
        </button>

        {/* Cancel button */}
        <button
          className="w-full py-3 rounded-lg font-marfa font-medium text-base bg-[#2A2A2A] text-white"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default CustomMembershipSheet; 