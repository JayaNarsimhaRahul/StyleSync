import { useState } from 'react';

export default function PaymentModal({ isOpen, onClose, booking, onSuccess, isPending }) {
  const [payMethod, setPayMethod] = useState('card');
  const [processing, setProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [formData, setFormData] = useState({
    cardNumber: '4111 2222 3333 4444',
    expiry: '12/28',
    cvv: '123',
    name: 'John Doe',
    upiId: 'customer@okaxis',
  });

  if (!isOpen || !booking) return null;

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setProcessing(true);

    const steps = [
      'Initializing secure handshake...',
      'Validating payment details...',
      'Simulating transaction clearance...',
      'Completing payment verification...',
    ];

    let currentStep = 0;
    setProgressMsg(steps[0]);

    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < steps.length) {
        setProgressMsg(steps[currentStep]);
      } else {
        clearInterval(interval);
        onSuccess(payMethod);
        setProcessing(false);
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      {/* Backdrop click blocker during process */}
      <div className="absolute inset-0" onClick={() => !processing && onClose()} />

      <div className="relative w-full max-w-md glass-card border border-white/10 p-6 sm:p-8 rounded-2xl shadow-brand-lg bg-surface-950/95 overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-violet-600/20 rounded-full blur-2xl" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-gold-600/10 rounded-full blur-2xl" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <div>
            <h3 className="text-white font-bold text-lg font-display">StyleSync Payment Sandbox</h3>
            <span className="text-xs text-gold-400 font-semibold uppercase tracking-wider">Test Mode Simulator</span>
          </div>
          {!processing && (
            <button
              onClick={onClose}
              className="text-white/40 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-all"
            >
              ✕
            </button>
          )}
        </div>

        {processing ? (
          /* Processing State */
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="relative w-16 h-16 mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-violet-500/20" />
              <div className="absolute inset-0 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
            </div>
            <p className="text-white font-medium text-base mb-1">Processing simulated payment...</p>
            <p className="text-white/40 text-xs animate-pulse h-4">{progressMsg}</p>
          </div>
        ) : (
          /* Payment Form */
          <div>
            {/* Summary */}
            <div className="bg-white/5 border border-white/5 rounded-xl p-4 mb-6 flex justify-between items-center text-sm">
              <div>
                <div className="text-white/50 text-xs">Amount Due</div>
                <div className="text-white font-bold text-lg">₹{booking.amount}</div>
              </div>
              <div className="text-right">
                <div className="text-white font-medium">{booking.serviceId?.name || 'Service'}</div>
                <div className="text-white/40 text-xs">with {booking.staffId?.name || 'Stylist'}</div>
              </div>
            </div>

            {/* Pay Method Tabs */}
            <div className="flex bg-white/5 p-1 rounded-xl mb-6">
              <button
                type="button"
                onClick={() => setPayMethod('card')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  payMethod === 'card'
                    ? 'bg-violet-600 text-white shadow-brand'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                💳 Credit / Debit Card
              </button>
              <button
                type="button"
                onClick={() => setPayMethod('upi')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  payMethod === 'upi'
                    ? 'bg-violet-600 text-white shadow-brand'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                📱 UPI
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {payMethod === 'card' ? (
                /* Card Input Panel */
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-white/50 tracking-wider mb-1 block">Card Number</label>
                    <input
                      required
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      className="input-field py-2.5 text-sm bg-white/5 border-white/10"
                      placeholder="4111 2222 3333 4444"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-white/50 tracking-wider mb-1 block">Expiry</label>
                      <input
                        required
                        type="text"
                        name="expiry"
                        value={formData.expiry}
                        onChange={handleInputChange}
                        className="input-field py-2.5 text-sm bg-white/5 border-white/10"
                        placeholder="MM/YY"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-white/50 tracking-wider mb-1 block">CVV</label>
                      <input
                        required
                        type="password"
                        name="cvv"
                        maxLength="3"
                        value={formData.cvv}
                        onChange={handleInputChange}
                        className="input-field py-2.5 text-sm bg-white/5 border-white/10"
                        placeholder="123"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-white/50 tracking-wider mb-1 block">Cardholder Name</label>
                    <input
                      required
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="input-field py-2.5 text-sm bg-white/5 border-white/10"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
              ) : (
                /* UPI Input Panel */
                <div>
                  <label className="text-[10px] uppercase font-bold text-white/50 tracking-wider mb-1 block">UPI Address ID</label>
                  <input
                    required
                    type="text"
                    name="upiId"
                    value={formData.upiId}
                    onChange={handleInputChange}
                    className="input-field py-2.5 text-sm bg-white/5 border-white/10"
                    placeholder="name@okaxis"
                  />
                  <span className="text-[10px] text-white/30 mt-1 block">Simulation accepts any dummy format.</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-white/10 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary flex-1 py-3 text-xs"
                >
                  Cancel / Fail ✕
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="btn-primary flex-1 py-3 text-xs bg-emerald-600 hover:bg-emerald-500 hover:shadow-emerald-500/20 font-bold"
                >
                  Authorize Pay ✓
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
