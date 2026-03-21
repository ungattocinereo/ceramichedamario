import { useState } from 'react';
import { PaperPlaneTilt, WhatsappLogo, CheckCircle } from '@phosphor-icons/react';

interface Props {
  prefilledProduct?: string;
  whatsappUrl?: string;
}

export default function ContactForm({ prefilledProduct, whatsappUrl }: Props) {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (form: FormData): Record<string, string> => {
    const errs: Record<string, string> = {};
    const email = form.get('email') as string;
    const phone = form.get('phone') as string;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Please enter a valid email address';
    }
    if (!phone || phone.trim().length < 5) {
      errs.phone = 'Please enter a valid phone number';
    }
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    // Honeypot check
    if (form.get('_gotcha')) return;

    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setStatus('submitting');

    try {
      const res = await fetch(e.currentTarget.action, {
        method: 'POST',
        body: form,
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} weight="fill" className="text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Message Sent!</h3>
        <p className="text-[#7a7a7a] mb-6">
          Thank you for reaching out. We'll get back to you as soon as possible.
        </p>
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] text-white font-bold px-6 py-3 rounded-lg hover:bg-[#20bd5a] transition-colors text-sm"
          >
            <WhatsappLogo size={20} weight="fill" />
            Also message us on WhatsApp
          </a>
        )}
      </div>
    );
  }

  const inputBase =
    'w-full border rounded-lg px-4 py-3 text-sm bg-white transition-all focus:outline-none focus:ring-2 focus:ring-[#1440e0]/20 focus:border-[#1440e0]';
  const inputNormal = `${inputBase} border-gray-200`;
  const inputError = `${inputBase} border-red-300`;

  return (
    <form
      onSubmit={handleSubmit}
      action="https://formspree.io/f/placeholder"
      method="POST"
      className="space-y-5"
      noValidate
    >
      {/* Honeypot */}
      <input type="text" name="_gotcha" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-1.5">
          Your Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          placeholder="Mario Rossi"
          className={inputNormal}
        />
      </div>

      {/* Email + Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-1.5">
            Email <span className="text-red-400">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            placeholder="your@email.com"
            className={errors.email ? inputError : inputNormal}
          />
          {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email}</p>}
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-bold text-gray-700 mb-1.5">
            Phone / WhatsApp <span className="text-red-400">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            required
            placeholder="+39 xxx xxx xxxx"
            className={errors.phone ? inputError : inputNormal}
          />
          {errors.phone && <p className="text-red-500 text-xs mt-1.5">{errors.phone}</p>}
        </div>
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="block text-sm font-bold text-gray-700 mb-1.5">
          Your Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={6}
          maxLength={2000}
          placeholder="Tell us what you're looking for — a specific piece, a custom order, or just say hello..."
          className={`${inputNormal} resize-none`}
          defaultValue={prefilledProduct ? `I'm interested in: ${prefilledProduct}\n\n` : ''}
        />
      </div>

      {/* Submit */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-1">
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="btn bg-[#1440e0] text-white rounded-lg px-8 py-3.5 text-sm font-bold hover:bg-[#1035c0] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:-translate-y-0.5"
        >
          {status === 'submitting' ? (
            'Sending...'
          ) : (
            <>
              <PaperPlaneTilt size={18} className="inline mr-2 -mt-0.5" />
              Send Message
            </>
          )}
        </button>

        {status === 'error' && (
          <p className="text-red-500 text-sm">
            Something went wrong. Please try again or contact us directly.
          </p>
        )}
      </div>
    </form>
  );
}
