/**
 * Variantes de entrada padrão do Hermeneuta, usadas com `motion.div`
 * (`initial="hidden" animate="visible"` ou passando `initial`/`animate`
 * diretamente). Substituem as antigas classes `animate-in`/`fade-in`/
 * `slide-in-from-*`/`zoom-in-*` do tailwindcss-animate, que nunca existiu
 * como dependência do projeto e portanto não tinham efeito nenhum.
 *
 * Uso:
 * ```tsx
 * <motion.div {...fade(0.7)}>...</motion.div>
 * <motion.div {...fadeZoom(0.2)} style={{ transformOrigin: 'top right' }}>...</motion.div>
 * ```
 *
 * Ver skill `padrao-design`, seção "Resolvido em 2026-08-17 — animações via
 * framer-motion" para a duração recomendada por contexto.
 */

import type { TargetAndTransition } from 'framer-motion';

interface EntranceVariant {
  initial: TargetAndTransition;
  animate: TargetAndTransition;
}

function withTransition(variant: EntranceVariant, duration: number) {
  return {
    initial: variant.initial,
    animate: variant.animate,
    transition: { duration, ease: 'easeOut' as const },
  };
}

const fadeVariant: EntranceVariant = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
};

const fadeSlideRightVariant: EntranceVariant = {
  initial: { opacity: 0, x: 16 },
  animate: { opacity: 1, x: 0 },
};

const fadeSlideBottomVariant: EntranceVariant = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

const fadeSlideTopVariant: EntranceVariant = {
  initial: { opacity: 0, y: -8 },
  animate: { opacity: 1, y: 0 },
};

const fadeZoomVariant: EntranceVariant = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
};

/** Wrapper de página, alerta simples. Duração usual: 0.5s–0.7s. */
export const fade = (duration: number) => withTransition(fadeVariant, duration);

/** Troca de etapa/toolbar entrando pela direita. Duração usual: 0.3s–0.5s. */
export const fadeSlideRight = (duration: number) => withTransition(fadeSlideRightVariant, duration);

/** Conteúdo principal/card entrando de baixo. Duração usual: 0.5s. */
export const fadeSlideBottom = (duration: number) => withTransition(fadeSlideBottomVariant, duration);

/** Alerta inline pequeno entrando de cima. Duração usual: 0.15s. */
export const fadeSlideTop = (duration: number) => withTransition(fadeSlideTopVariant, duration);

/** Modal central/dropdown. Duração usual: 0.2s–0.5s. Ancorar com `style={{ transformOrigin }}` quando aplicável. */
export const fadeZoom = (duration: number) => withTransition(fadeZoomVariant, duration);
