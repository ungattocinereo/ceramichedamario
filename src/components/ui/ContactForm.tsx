import { useState } from 'react';
import { PaperPlaneTilt } from '@phosphor-icons/react';

interface Props {
  prefilledProduct?: string;
}

export default function ContactForm({ prefilledProduct }: Props) {
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
      // For now, submit to Formspree or Netlify Forms
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
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <p className="text-green-800 font-medium text-lg mb-1">Thank you!</p>
        <p className="text-green-600 text-sm">Your message has been sent. We'll get back to you soon.</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      action="https://formspree.io/f/placeholder"
      method="POST"
      className="space-y-4"
      noValidate
    >
      {/* Honeypot */}
      <input type="text" name="_gotcha" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">Your name</label>
          <input
            type="text"
            id="name"
            name="name"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary ${
              errors.email ? 'border-red-400' : 'border-gray-300'
            }`}
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-1">
            Phone <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            required
            className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary ${
              errors.phone ? 'border-red-400' : 'border-gray-300'
            }`}
          />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium mb-1">Your message</label>
        <textarea
          id="message"
          name="message"
          rows={10}
          maxLength={2000}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          defaultValue={prefilledProduct ? `I'm interested in: ${prefilledProduct}\n\n` : ''}
        />
      </div>

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="btn bg-[#1440e0] text-white rounded px-8 py-3 text-sm font-medium hover:bg-[#1035c0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === 'submitting' ? 'Sending...' : <><PaperPlaneTilt size={16} className="inline mr-1 -mt-0.5" /> Send your request</>}
      </button>

      {status === 'error' && (
        <p className="text-red-500 text-sm">Something went wrong. Please try again or email us directly.</p>
      )}
    </form>
  );
}
