export const projectsSeed = [
  {
    id: 'neon-bank', title: 'Neon Bank', category: 'Fintech', year: 2025,
    description: 'Редизайн мобильного банка и дизайн-система на 400+ компонентов.',
    details: 'Полный редизайн iOS и Android приложений: от исследования до продакшена за 6 месяцев.\n\nСобрали дизайн-систему на 400+ компонентов с тёмной и светлой темами, добавили motion-гайд и документацию в Storybook. Конверсия онбординга выросла на 42%, время до первого платежа сократилось втрое.\n\nСтек: React Native, Figma, Storybook, Rive.',
    tags: ['UX/UI', 'Design System'], palette: 'purple', metric: '−42% на онбординг',
    repoUrl: 'https://github.com/studio/neon-bank',
  },
  {
    id: 'orbit', title: 'Orbit', category: 'E-commerce', year: 2024,
    description: 'Магазин уличной оптики с 3D-конфигуратором и чекаутом в один шаг.',
    details: 'Задача — превратить выбор оправы в удовольствие. Сделали 3D-конфигуратор на Three.js: пользователь крутит модель, примеряет на виртуальное лицо и сразу переходит к оплате.\n\nЧекаут сократили до одного экрана, добавили Apple Pay и BNPL. Конверсия выросла на 38% за первый квартал.\n\nСтек: Next.js, Three.js, Stripe, Sanity CMS.',
    tags: ['E-commerce', '3D'], palette: 'magenta', metric: '+38% конверсия',
    repoUrl: 'https://github.com/studio/orbit',
  },
  {
    id: 'signal', title: 'Signal', category: 'SaaS', year: 2024,
    description: 'Аналитический дашборд для продуктовых команд: от хаоса к ясности.',
    details: 'B2B-дашборд для продуктовых аналитиков. Проблема была в перегруженности: десятки метрик, никто не понимал, что важнее.\n\nРазбили на три уровня: «здоровье продукта» (5 метрик), «воронки» и «кастомные отчёты». Добавили data-viz на D3 с фокусом и контекстом. Скорость принятия решений выросла вдвое.\n\nСтек: React, D3.js, ClickHouse, FastAPI.',
    tags: ['Product', 'Data Viz'], palette: 'indigo', metric: '2× скорость решений',
    repoUrl: 'https://github.com/studio/signal',
  },
  {
    id: 'khroma', title: 'Khroma', category: 'Branding', year: 2023,
    description: 'Айдентика и сайт для студии света — от логотипа до motion-гайда.',
    details: 'Студия света искала визуальный язык, который передал бы «тёплое свечение» — без шума и неона.\n\nСделали айдентику с градиентной системой, логотип-каплю, типографику на базе GT Alpina и полноценный motion-гайд. Сайт на Astro с интерактивной палитрой света — меняешь время суток, меняется весь визуал.\n\nСтек: Astro, Figma, After Effects, Lottie. Awwwards Honorable Mention.',
    tags: ['Branding', 'Motion'], palette: 'cyan', metric: 'Awwwards Honorable',
    repoUrl: 'https://github.com/studio/khroma',
  },
];