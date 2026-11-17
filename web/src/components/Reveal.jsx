import { motion, useReducedMotion } from 'framer-motion';

const variants = {
  hidden: { opacity: 0, y: 38 },
  visible: { opacity: 1, y: 0 },
};

export function Reveal({ as = 'div', delay = 0, children, ...rest }) {
  const M = motion[as] || motion.div;
  const reduced = useReducedMotion();
  return (
    <M
      initial={reduced ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, margin: '0px 0px -8% 0px' }}
      variants={variants}
      transition={{ duration: reduced ? 0 : 0.9, delay: reduced ? 0 : delay, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </M>
  );
}
