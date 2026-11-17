export const contactSchema = {
  name: { required: true, min: 2, max: 80 },
  email: { required: true, max: 254, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, message: 'Некорректный email' },
  message: { required: true, min: 10, max: 2000 },
  trap: { max: 200 },
};
