import { useState } from 'react';
import { PaperPlaneTilt, WhatsappLogo, CheckCircle } from '@phosphor-icons/react';

interface FormLabels {
  yourName: string;
  namePlaceholder: string;
  email: string;
  emailPlaceholder: string;
  emailError: string;
  phone: string;
  phonePlaceholder: string;
  phoneError: string;
  yourMessage: string;
  messagePlaceholder: string;
  sendMessage: string;
  sending: string;
  messageSent: string;
  thankYou: string;
  alsoWhatsapp: string;
  error: string;
  interestedIn: string;
}

interface Props {
  prefilledProduct?: string;
  whatsappUrl?: string;
  labels?: FormLabels;
}

const defaultLabels: FormLabels = {
  yourName: 'Your Name',
  namePlaceholder: 'Mario Rossi',
  email: 'Email',
  emailPlaceholder: 'your@email.com',
  emailError: 'Please enter a valid email address',
  phone: 'Phone / WhatsApp',
  phonePlaceholder: '+39 xxx xxx xxxx',
  phoneError: 'Please enter a valid phone number',
  yourMessage: 'Your Message',
  messagePlaceholder: "Tell us what you\u2019re looking for \u2014 a specific piece, a custom order, or just say hello...",
  sendMessage: 'Send Message',
  sending: 'Sending...',
  messageSent: 'Message Sent!',
  thankYou: "Thank you for reaching out. We\u2019ll get back to you as soon as possible.",
  alsoWhatsapp: 'Also message us on WhatsApp',
  error: 'Something went wrong. Please try again or contact us directly.',
  interestedIn: "I'm interested in: {product}",
};

export default function ContactForm({ prefilledProduct, whatsappUrl, labels: labelsProp }: Props) {
  const l = { ...defaultLabels, ...labelsProp };
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (form: FormData): Record<string, string> => {
    const errs: Record<string, string> = {};
    const email = form.get('email') as string;
    const phone = form.get('phone') as string;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = l.emailError;
    }
    if (!phone || phone.trim().length < 5) {
      errs.phone = l.phoneError;
    }
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    if (form.get('_gotcha')) return;

    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setStatus('submitting');

    try {
      const data: Record<string, string> = {};
      form.forEach((val, key) => { data[key] = val as string; });

      const res = await fetch('/api/contact', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
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
        <h3 className="text-xl font-bold text-gray-800 mb-2">{l.messageSent}</h3>
        <p className="text-[#7a7a7a] mb-6">{l.thankYou}</p>
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] text-white font-bold px-6 py-3 rounded-lg hover:bg-[#20bd5a] transition-colors text-sm"
          >
            <WhatsappLogo size={20} weight="fill" />
            {l.alsoWhatsapp}
          </a>
        )}
      </div>
    );
  }

  const inputBase =
    'w-full border rounded-lg px-4 py-3 text-sm bg-white transition-all focus:outline-none focus:ring-2 focus:ring-[#1440e0]/20 focus:border-[#1440e0]';
  const inputNormal = `${inputBase} border-gray-200`;
  const inputError = `${inputBase} border-red-300`;

  const defaultValue = prefilledProduct ? l.interestedIn.replace('{product}', prefilledProduct) + '\n\n' : '';

  return (
    <form
      onSubmit={handleSubmit}
      action="/api/contact"
      method="POST"
      className="space-y-5"
      noValidate
    >
      <input type="text" name="_gotcha" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

      <div>
        <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-1.5">
          {l.yourName}
        </label>
        <input type="text" id="name" name="name" placeholder={l.namePlaceholder} className={inputNormal} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-1.5">
            {l.email} <span className="text-red-400">*</span>
          </label>
          <input type="email" id="email" name="email" required placeholder={l.emailPlaceholder} className={errors.email ? inputError : inputNormal} />
          {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email}</p>}
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-bold text-gray-700 mb-1.5">
            {l.phone} <span className="text-red-400">*</span>
          </label>
          <input type="tel" id="phone" name="phone" required placeholder={l.phonePlaceholder} className={errors.phone ? inputError : inputNormal} />
          {errors.phone && <p className="text-red-500 text-xs mt-1.5">{errors.phone}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-bold text-gray-700 mb-1.5">
          {l.yourMessage}
        </label>
        <textarea id="message" name="message" rows={6} maxLength={2000} placeholder={l.messagePlaceholder} className={`${inputNormal} resize-none`} defaultValue={defaultValue} />
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-1">
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="btn bg-[#1440e0] text-white rounded-lg px-8 py-3.5 text-sm font-bold hover:bg-[#1035c0] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:-translate-y-0.5"
        >
          {status === 'submitting' ? (
            l.sending
          ) : (
            <>
              <PaperPlaneTilt size={18} className="inline mr-2 -mt-0.5" />
              {l.sendMessage}
            </>
          )}
        </button>

        {status === 'error' && (
          <p className="text-red-500 text-sm">{l.error}</p>
        )}
      </div>
    </form>
  );
}
