import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { api } from '../api/client.js';
import { Reveal } from './Reveal.jsx';
import { socials } from '../config/contacts.js';
import {
  TelegramIcon, DiscordIcon, PhoneIcon, MailIcon,
} from './SocialIcons.jsx';

const ICONS = {
  telegram: TelegramIcon,
  discord:  DiscordIcon,
  phone:    PhoneIcon,
  email:    MailIcon,
};

const schema = z.object({
  name:    z.string().trim().min(2, 'Минимум 2 символа').max(80, 'Максимум 80 символов'),
  email:   z.string().trim().email('Некорректный email').max(254, 'Максимум 254 символа'),
  message: z.string().trim().min(10, 'Минимум 10 символов').max(2000, 'Максимум 2000 символов'),
  trap:    z.string().max(0).optional().or(z.literal('')),
});

export function Contact() {
  const [done, setDone] = useState(null);
  const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: { name: '', email: '', message: '', trap: '' },
  });

  const onSubmit = async (values) => {
    try {
      const result = await api.contacts.submit(values);
      toast.success(result.delivered ? 'Заявка отправлена' : 'Заявка принята в тестовом режиме');
      reset();
      setDone(result);
    } catch (err) {
      Object.entries(err.details || {}).forEach(([key, message]) => { if (['name', 'email', 'message'].includes(key)) setError(key, { type: 'server', message }); });
      toast.error(err.message || 'Не удалось отправить');
    }
  };

  const fields = [
    { name: 'name',  label: 'Имя',   placeholder: 'Как к вам обращаться', type: 'text' },
    { name: 'email', label: 'Email', placeholder: 'you@company.com',      type: 'email' },
  ];

  return (
    <section className="contact" id="contact">
      <div className="wrap">
        <Reveal as="h2">Давайте<br /><em>поговорим</em></Reveal>
        <Reveal as="p" className="contact-lead" delay={0.1}>
          Расскажите о задаче или напишите напрямую в любой из каналов.
        </Reveal>

        <Reveal className="socials" delay={0.15}>
          {socials.map((s, i) => {
            const Icon = ICONS[s.kind];
            return (
              <a
                key={s.kind}
                className={`social-card social-card--${s.kind}`}
                href={s.href}
                target={s.kind === 'phone' || s.kind === 'email' ? undefined : '_blank'}
                rel="noreferrer"
                style={{ '--i': i }}
              >
                <span className="social-icon"><Icon /></span>
                <span className="social-body">
                  <span className="social-label">{s.label}</span>
                  <span className="social-value">{s.value}</span>
                </span>
                <span className="social-arrow" aria-hidden="true">↗</span>
              </a>
            );
          })}
        </Reveal>

        {done ? (
          <div className="success-block" role="status">
            <div className="success-mark" aria-hidden="true">✓</div>
            <h3>{done.delivered ? 'Заявка отправлена' : 'Заявка принята'}</h3>
            <p>{done.delivered ? 'Спасибо! Скоро свяжемся.' : 'Форма работает в тестовом режиме. Для связи используйте контакты выше.'}</p>
            <button className="btn" onClick={() => setDone(null)}>Отправить ещё одну</button>
          </div>
        ) : (
          <form className="contact-form" onSubmit={handleSubmit(onSubmit)} noValidate>
            {fields.map((f) => (
              <div className={`field${errors[f.name] ? ' has-error' : ''}`} key={f.name}>
                <label htmlFor={f.name}>{f.label}</label>
                <input
                  id={f.name}
                  type={f.type}
                  autoComplete={f.name}
                  placeholder={f.placeholder}
                  maxLength={f.name === 'name' ? 80 : 254}
                  aria-describedby={errors[f.name] ? `${f.name}-error` : undefined}
                  aria-invalid={!!errors[f.name]}
                  {...register(f.name)}
                />
                {errors[f.name] && <span className="error" id={`${f.name}-error`} role="alert">{errors[f.name].message}</span>}
              </div>
            ))}

            <div className={`field${errors.message ? ' has-error' : ''}`}>
              <label htmlFor="message">О проекте</label>
              <textarea
                id="message"
                rows={5}
                maxLength={2000}
                aria-describedby={errors.message ? 'message-error' : undefined}
                placeholder="Пара слов о задаче и сроках"
                aria-invalid={!!errors.message}
                {...register('message')}
              />
              {errors.message && <span className="error" id="message-error" role="alert">{errors.message.message}</span>}
            </div>

            <input type="text" tabIndex={-1} autoComplete="off" style={{ display: 'none' }}
                   aria-hidden="true" {...register('trap')} />

            <button type="submit" className="btn btn-solid" disabled={isSubmitting}>
              {isSubmitting ? 'Отправляем…' : 'Отправить заявку'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}