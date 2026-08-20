/* @ds-bundle: {"format":4,"namespace":"OHermeneutaDesignSystem_375223","components":[{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Badge","sourcePath":"components/feedback/Badge.jsx"},{"name":"Modal","sourcePath":"components/feedback/Modal.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Select","sourcePath":"components/forms/Input.jsx"},{"name":"StepTabs","sourcePath":"components/navigation/StepTabs.jsx"},{"name":"Card","sourcePath":"components/surfaces/Card.jsx"}],"sourceHashes":{"components/core/Button.jsx":"d33a7f07371d","components/feedback/Badge.jsx":"9ff91ce7ea6d","components/feedback/Modal.jsx":"2f131eb5f94b","components/forms/Input.jsx":"17629a976669","components/navigation/StepTabs.jsx":"ae68e0761b62","components/surfaces/Card.jsx":"772f53982a02","ui_kits/hermeneuta-app/AcademyScreen.jsx":"f763959450de","ui_kits/hermeneuta-app/BibleSelectionScreen.jsx":"d4c86bbe407f","ui_kits/hermeneuta-app/DashboardScreen.jsx":"10367f3f2722","ui_kits/hermeneuta-app/GroupsScreen.jsx":"f457c1d1a6ad","ui_kits/hermeneuta-app/LandingScreen.jsx":"05d7ed6b608c","ui_kits/hermeneuta-app/Shared.jsx":"f7cb31025f5e","ui_kits/hermeneuta-app/StudyStepScreen.jsx":"95255e9e736e","ui_kits/hermeneuta-app/image-slot.js":"fff26d081c8d"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.OHermeneutaDesignSystem_375223 = window.OHermeneutaDesignSystem_375223 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Button.jsx
try { (() => {
const VARIANTS = {
  primary: {
    background: 'var(--color-brand-primary)',
    color: 'var(--text-on-brand)',
    border: '1px solid transparent',
    boxShadow: 'var(--shadow-sm)'
  },
  secondary: {
    background: 'var(--surface-card)',
    color: 'var(--color-brand-primary)',
    border: '1px solid var(--color-brand-primary)'
  },
  outline: {
    background: 'var(--surface-card)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-default)'
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-secondary)',
    border: '1px solid transparent'
  },
  danger: {
    background: 'var(--red-600)',
    color: '#fff',
    border: '1px solid transparent',
    boxShadow: 'var(--shadow-sm)'
  }
};
const SIZES = {
  sm: {
    padding: '6px 12px',
    fontSize: 'var(--text-xs)'
  },
  md: {
    padding: '8px 16px',
    fontSize: 'var(--text-sm)'
  },
  lg: {
    padding: '12px 24px',
    fontSize: 'var(--text-base)'
  }
};
const HOVER_BG = {
  primary: 'var(--color-brand-primary-hover)',
  secondary: 'var(--color-brand-secondary)',
  outline: 'var(--surface-sunken)',
  ghost: 'var(--surface-sunken)',
  danger: 'var(--red-700)'
};
function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  children,
  style,
  onClick,
  type = 'button',
  title
}) {
  const [hover, setHover] = React.useState(false);
  const isDisabled = disabled || loading;
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    fontFamily: 'var(--font-sans)',
    fontWeight: 500,
    borderRadius: 'var(--radius-md)',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    transition: 'all var(--duration-fast) ease',
    opacity: isDisabled ? 0.5 : 1,
    ...VARIANTS[variant],
    ...SIZES[size]
  };
  if (hover && !isDisabled) base.background = HOVER_BG[variant] || base.background;
  return React.createElement('button', {
    type,
    title,
    disabled: isDisabled,
    onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      ...base,
      ...style
    }
  }, loading && React.createElement('span', {
    style: {
      display: 'inline-block',
      animation: 'ds-spin 1s linear infinite'
    }
  }, '◌'), children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Badge.jsx
try { (() => {
const TONES = {
  professor: {
    background: 'var(--state-info-bg)',
    color: 'var(--state-info-text)'
  },
  admin: {
    background: 'var(--state-danger-bg)',
    color: 'var(--state-danger-text)'
  },
  success: {
    background: 'var(--state-success-bg)',
    color: 'var(--state-success-text)'
  },
  warning: {
    background: 'var(--state-warning-bg)',
    color: 'var(--state-warning-text)'
  },
  danger: {
    background: 'var(--state-danger-bg)',
    color: 'var(--state-danger-text)'
  },
  neutral: {
    background: 'var(--surface-sunken)',
    color: 'var(--text-secondary)'
  }
};
function Badge({
  tone = 'neutral',
  children
}) {
  return React.createElement('span', {
    style: {
      display: 'inline-block',
      padding: '2px 8px',
      fontSize: '9px',
      fontWeight: 700,
      textTransform: 'uppercase',
      borderRadius: 'var(--radius-sm)',
      ...TONES[tone]
    }
  }, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Badge.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Modal.jsx
try { (() => {
function Modal({
  open,
  onClose,
  title,
  children,
  footer
}) {
  if (!open) return null;
  return React.createElement('div', {
    onClick: onClose,
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      background: 'rgba(2,6,23,0.6)',
      backdropFilter: 'blur(4px)'
    }
  }, React.createElement('div', {
    onClick: e => e.stopPropagation(),
    style: {
      background: 'var(--surface-card)',
      borderRadius: 'var(--radius-3xl)',
      maxWidth: 420,
      width: '100%',
      padding: 32,
      boxShadow: 'var(--shadow-xl)',
      display: 'flex',
      flexDirection: 'column',
      gap: 24
    }
  }, title && React.createElement('h3', {
    style: {
      fontFamily: 'var(--font-serif)',
      fontSize: 'var(--text-2xl)',
      fontWeight: 700,
      color: 'var(--text-primary)',
      margin: 0
    }
  }, title), children, footer && React.createElement('div', {
    style: {
      display: 'flex',
      gap: 16
    }
  }, footer)));
}
Object.assign(__ds_scope, { Modal });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Modal.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function Input({
  label,
  error,
  style,
  ...props
}) {
  const [focus, setFocus] = React.useState(false);
  return React.createElement('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, label && React.createElement('label', {
    style: {
      fontSize: 'var(--text-xs)',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-wide)',
      color: 'var(--text-tertiary)'
    }
  }, label), React.createElement('input', {
    ...props,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      width: '100%',
      padding: '12px 16px',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-sm)',
      color: 'var(--text-primary)',
      background: 'var(--surface-sunken)',
      border: `1px solid ${error ? 'var(--red-500)' : 'var(--border-subtle)'}`,
      borderRadius: 'var(--radius-lg)',
      outline: 'none',
      boxShadow: focus ? 'var(--ring-brand)' : 'none',
      transition: 'box-shadow var(--duration-fast) ease',
      ...style
    }
  }), error && React.createElement('p', {
    style: {
      fontSize: 'var(--text-xs)',
      color: 'var(--red-600)',
      background: 'var(--red-050)',
      padding: '8px 12px',
      borderRadius: 'var(--radius-md)'
    }
  }, error));
}
function Select({
  label,
  options,
  style,
  ...props
}) {
  return React.createElement('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, label && React.createElement('label', {
    style: {
      fontSize: 'var(--text-xs)',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-wide)',
      color: 'var(--text-tertiary)'
    }
  }, label), React.createElement('select', {
    ...props,
    style: {
      width: '100%',
      padding: '12px 16px',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-sm)',
      color: 'var(--text-primary)',
      background: 'var(--surface-sunken)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      outline: 'none',
      ...style
    }
  }, options.map(o => React.createElement('option', {
    key: o,
    value: o
  }, o))));
}
Object.assign(__ds_scope, { Input, Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/navigation/StepTabs.jsx
try { (() => {
function StepTabs({
  steps,
  activeIndex,
  onSelect
}) {
  return React.createElement('div', {
    style: {
      display: 'flex',
      gap: 4,
      overflowX: 'auto'
    }
  }, steps.map((step, idx) => {
    const isActive = idx === activeIndex,
      isDone = idx < activeIndex;
    return React.createElement('button', {
      key: step,
      onClick: () => onSelect && onSelect(idx),
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        padding: '8px 12px',
        minWidth: 80,
        borderRadius: 'var(--radius-lg)',
        border: 'none',
        cursor: 'pointer',
        fontFamily: 'var(--font-sans)',
        transition: 'all var(--duration-fast) ease',
        background: isActive ? 'var(--color-brand-primary)' : isDone ? 'color-mix(in oklch,var(--color-brand-primary) 10%,transparent)' : 'transparent',
        color: isActive ? '#fff' : isDone ? 'var(--color-brand-primary)' : 'var(--text-tertiary)',
        transform: isActive ? 'scale(1.05)' : 'none',
        boxShadow: isActive ? 'var(--shadow-md)' : 'none'
      }
    }, React.createElement('span', {
      style: {
        fontSize: 9,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: 'var(--tracking-wide)'
      }
    }, step));
  }));
}
Object.assign(__ds_scope, { StepTabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/StepTabs.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/Card.jsx
try { (() => {
function Card({
  variant = 'solid',
  children,
  style,
  ...props
}) {
  const base = variant === 'glass' ? {
    background: 'rgba(255,255,255,0.8)',
    backdropFilter: 'blur(var(--blur-glass))',
    border: '1px solid rgba(255,255,255,0.2)',
    boxShadow: 'var(--shadow-sm)'
  } : {
    background: 'var(--surface-card)',
    border: '1px solid var(--border-subtle)',
    boxShadow: 'var(--shadow-md)'
  };
  return React.createElement('div', {
    ...props,
    style: {
      borderRadius: 'var(--radius-2xl)',
      padding: 'var(--space-6)',
      ...base,
      ...style
    }
  }, children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/Card.jsx", error: String((e && e.message) || e) }); }

// ui_kits/hermeneuta-app/AcademyScreen.jsx
try { (() => {
const MODULES = [{
  order: 1,
  title: 'Módulo 1: O Alicerce',
  desc: 'A base espiritual e o coração do estudioso da Bíblia.',
  lessons: [{
    id: 'l1',
    title: 'O Coração do Pregador',
    order: 1
  }]
}, {
  order: 2,
  title: 'Módulo 2: Cavar (Observação)',
  desc: 'Aprendendo a olhar antes de concluir.',
  lessons: [{
    id: 'l2',
    title: 'A Arte de Observar',
    order: 1
  }]
}, {
  order: 3,
  title: 'Módulo 3: Entender (Interpretação)',
  desc: 'O que o texto significava para os leitores originais?',
  lessons: [{
    id: 'l3',
    title: 'A Ponte entre Mundos',
    order: 1
  }]
}];
function AcademyScreen() {
  const {
    Button
  } = window.OHermeneutaDesignSystem_375223;
  const {
    Icon
  } = window;
  const [lesson, setLesson] = React.useState(null);
  const [quiz, setQuiz] = React.useState(null);
  if (lesson) return React.createElement('div', {
    style: {
      maxWidth: 900,
      margin: '0 auto',
      padding: '32px 20px 80px'
    }
  }, React.createElement('button', {
    onClick: () => {
      setLesson(null);
      setQuiz(null);
    },
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      background: 'none',
      border: 'none',
      color: 'var(--text-tertiary)',
      fontWeight: 700,
      fontSize: 11,
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      cursor: 'pointer',
      marginBottom: 24
    }
  }, React.createElement(Icon, {
    name: 'arrow-left',
    size: 16
  }), 'Voltar à Trilha'), React.createElement('div', {
    style: {
      background: '#fff',
      padding: 40,
      borderRadius: 32,
      border: '1px solid var(--border-subtle)',
      marginBottom: 24
    }
  }, React.createElement('h1', {
    style: {
      fontFamily: 'var(--font-serif)',
      fontSize: 28,
      fontWeight: 700,
      margin: '0 0 16px'
    }
  }, lesson.title), React.createElement('p', {
    style: {
      lineHeight: 1.7,
      color: 'var(--text-primary)'
    }
  }, 'O estudo da Bíblia não é apenas um exercício intelectual, mas uma jornada espiritual. Antes de "cavar" o texto, precisamos preparar o terreno do nosso coração.'), React.createElement('p', {
    style: {
      fontStyle: 'italic',
      color: 'var(--text-secondary)'
    }
  }, '"Abre os meus olhos para que eu veja as maravilhas da tua lei." (Salmo 119:18)')), !quiz ? React.createElement('div', {
    style: {
      padding: 48,
      borderRadius: 32,
      background: 'var(--color-brand-primary)',
      color: '#fff',
      textAlign: 'center'
    }
  }, React.createElement('h3', {
    style: {
      fontFamily: 'var(--font-serif)',
      fontStyle: 'italic',
      fontSize: 26,
      margin: '0 0 12px'
    }
  }, 'Hora do Desafio!'), React.createElement('p', {
    style: {
      opacity: 0.9,
      margin: '0 0 20px'
    }
  }, 'Vamos testar seus conhecimentos sobre esta lição.'), React.createElement(Button, {
    style: {
      background: '#fff',
      color: 'var(--color-brand-primary)'
    },
    onClick: () => setQuiz('open')
  }, 'Começar Exercício')) : React.createElement('div', {
    style: {
      background: '#fff',
      padding: 40,
      borderRadius: 32,
      border: '1px solid var(--border-subtle)',
      textAlign: 'center'
    }
  }, React.createElement('div', {
    style: {
      width: 80,
      height: 80,
      borderRadius: 999,
      background: 'var(--state-success-bg)',
      color: 'var(--state-success-text)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 16px'
    }
  }, React.createElement(Icon, {
    name: 'check-circle-2',
    size: 40
  })), React.createElement('h3', {
    style: {
      fontFamily: 'var(--font-serif)',
      fontSize: 24,
      fontWeight: 700,
      margin: '0 0 8px'
    }
  }, 'Excelente Trabalho!'), React.createElement('p', {
    style: {
      color: 'var(--text-secondary)',
      margin: '0 0 20px'
    }
  }, 'Lição concluída com sucesso.'), React.createElement(Button, {
    onClick: () => {
      setLesson(null);
      setQuiz(null);
    }
  }, 'Voltar à Trilha')));
  return React.createElement('div', {
    style: {
      maxWidth: 900,
      margin: '0 auto',
      padding: '32px 20px 80px'
    }
  }, React.createElement('div', {
    style: {
      textAlign: 'center',
      marginBottom: 40
    }
  }, React.createElement('div', {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '6px 14px',
      borderRadius: 999,
      background: 'color-mix(in oklch,var(--color-brand-primary) 10%,transparent)',
      color: 'var(--color-brand-primary)',
      fontSize: 11,
      fontWeight: 700,
      textTransform: 'uppercase',
      marginBottom: 16
    }
  }, React.createElement(Icon, {
    name: 'sparkles',
    size: 14
  }), 'Academia do Método'), React.createElement('h1', {
    style: {
      fontFamily: 'var(--font-serif)',
      fontStyle: 'italic',
      fontSize: 36,
      fontWeight: 700,
      margin: 0
    }
  }, 'Trilha O Hermeneuta'), React.createElement('p', {
    style: {
      color: 'var(--text-secondary)',
      maxWidth: 520,
      margin: '12px auto 0'
    }
  }, 'Domine as ferramentas da hermenêutica bíblica através de um guia passo a passo.')), MODULES.map(mod => React.createElement('div', {
    key: mod.order,
    style: {
      display: 'flex',
      gap: 24,
      marginBottom: 32
    }
  }, React.createElement('div', {
    style: {
      width: 56,
      height: 56,
      borderRadius: 16,
      background: 'var(--color-brand-primary)',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 700,
      fontSize: 18,
      flexShrink: 0
    }
  }, mod.order), React.createElement('div', {
    style: {
      flex: 1
    }
  }, React.createElement('h2', {
    style: {
      fontFamily: 'var(--font-serif)',
      fontSize: 20,
      fontWeight: 700,
      margin: '0 0 4px'
    }
  }, mod.title), React.createElement('p', {
    style: {
      fontSize: 13,
      color: 'var(--text-secondary)',
      margin: '0 0 16px'
    }
  }, mod.desc), React.createElement('div', {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))',
      gap: 12
    }
  }, mod.lessons.map(l => React.createElement('button', {
    key: l.id,
    onClick: () => setLesson(l),
    style: {
      textAlign: 'left',
      padding: 20,
      borderRadius: 16,
      border: '1px solid var(--border-subtle)',
      background: '#fff',
      cursor: 'pointer'
    }
  }, React.createElement('div', {
    style: {
      width: 36,
      height: 36,
      borderRadius: 10,
      background: 'var(--surface-sunken)',
      color: 'var(--text-tertiary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12
    }
  }, React.createElement(Icon, {
    name: 'book-open',
    size: 18
  })), React.createElement('h3', {
    style: {
      fontWeight: 700,
      fontSize: 14,
      margin: '0 0 4px'
    }
  }, l.title), React.createElement('span', {
    style: {
      fontSize: 11,
      color: 'var(--text-tertiary)'
    }
  }, 'Lição ', l.order, ' • ~10 min'))))))));
}
window.AcademyScreen = AcademyScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/hermeneuta-app/AcademyScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/hermeneuta-app/BibleSelectionScreen.jsx
try { (() => {
function BibleSelectionScreen({
  onConfirm
}) {
  const {
    Button,
    Input,
    Select
  } = window.OHermeneutaDesignSystem_375223;
  const {
    Icon
  } = window;
  const [book, setBook] = React.useState('João');
  const [chapter, setChapter] = React.useState(1);
  const BOOKS = ['Gênesis', 'Salmos', 'Isaías', 'Mateus', 'João', 'Romanos', 'Efésios', 'Apocalipse'];
  return React.createElement('div', {
    style: {
      maxWidth: 640,
      margin: '0 auto',
      padding: '48px 20px'
    }
  }, React.createElement('div', {
    style: {
      textAlign: 'center',
      marginBottom: 32
    }
  }, React.createElement('h2', {
    style: {
      fontFamily: 'var(--font-serif)',
      fontSize: 28,
      fontWeight: 700,
      margin: 0
    }
  }, 'Escolha o Texto Bíblico'), React.createElement('p', {
    style: {
      color: 'var(--text-secondary)',
      margin: '8px 0 0'
    }
  }, 'Selecione o trecho que você deseja cavar e descobrir.')), React.createElement('div', {
    className: 'glass-card',
    style: {
      padding: 32,
      borderRadius: 28,
      display: 'flex',
      flexDirection: 'column',
      gap: 24
    }
  }, React.createElement('div', {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 20
    }
  }, React.createElement(Select, {
    label: 'Livro',
    options: BOOKS,
    value: book,
    onChange: e => setBook(e.target.value)
  }), React.createElement(Input, {
    label: 'Capítulo',
    type: 'number',
    value: chapter,
    onChange: e => setChapter(e.target.value)
  })), React.createElement('div', {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: 20
    }
  }, React.createElement(Input, {
    label: 'Versículo Inicial',
    type: 'number',
    defaultValue: 1
  }), React.createElement(Input, {
    label: 'Versículo Final',
    type: 'number',
    defaultValue: 18
  }), React.createElement(Select, {
    label: 'Tradução',
    options: ['ARA', 'NVI', 'NVT', 'ARC', 'NAA']
  })), React.createElement(Button, {
    style: {
      width: '100%',
      height: 56,
      fontSize: 17
    },
    onClick: () => onConfirm(`${book} ${chapter}:1-18`)
  }, 'Confirmar Seleção e Iniciar', React.createElement(Icon, {
    name: 'chevron-right',
    size: 20,
    color: '#fff'
  }))), React.createElement('div', {
    style: {
      marginTop: 24,
      padding: 20,
      background: 'color-mix(in oklch,var(--color-brand-primary) 5%,transparent)',
      borderRadius: 16,
      border: '1px solid color-mix(in oklch,var(--color-brand-primary) 10%,transparent)'
    }
  }, React.createElement('p', {
    style: {
      fontSize: 12,
      fontStyle: 'italic',
      color: 'var(--color-brand-primary)',
      textAlign: 'center',
      margin: 0
    }
  }, '"A erva seca, e a flor cai, mas a palavra do nosso Deus permanece para sempre." — Isaías 40:8')));
}
window.BibleSelectionScreen = BibleSelectionScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/hermeneuta-app/BibleSelectionScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/hermeneuta-app/DashboardScreen.jsx
try { (() => {
function DashboardScreen({
  studies,
  onOpenStudy,
  onNewStudy
}) {
  const {
    Button,
    Input
  } = window.OHermeneutaDesignSystem_375223;
  const {
    Icon
  } = window;
  const [query, setQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const filtered = studies.filter(s => {
    const matchesQuery = !query.trim() || s.title.toLowerCase().includes(query.toLowerCase()) || (s.ref || '').toLowerCase().includes(query.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesQuery && matchesStatus;
  });
  const FILTERS = [{
    id: 'all',
    label: 'Todos'
  }, {
    id: 'draft',
    label: 'Em andamento'
  }, {
    id: 'completed',
    label: 'Concluídos'
  }];
  return React.createElement('div', {
    style: {
      maxWidth: 1100,
      margin: '0 auto',
      padding: '0 0 80px'
    }
  }, React.createElement('div', {
    style: {
      position: 'relative',
      height: 220,
      margin: '0 0 32px',
      overflow: 'hidden'
    }
  }, React.createElement('image-slot', {
    id: 'dashboard-library-bg',
    shape: 'rect',
    placeholder: 'Foto de uma biblioteca / estante de livros',
    style: {
      position: 'absolute',
      inset: 0
    }
  }), React.createElement('div', {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(to top,rgba(2,6,23,0.75),rgba(2,6,23,0.25))',
      pointerEvents: 'none'
    }
  }), React.createElement('div', {
    style: {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      padding: '0 32px 24px'
    }
  }, React.createElement('h2', {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 30,
      fontWeight: 800,
      color: '#fff',
      margin: 0
    }
  }, 'Seus Estudos'), React.createElement('p', {
    style: {
      fontSize: 14,
      color: 'rgba(255,255,255,0.85)',
      margin: '4px 0 0'
    }
  }, 'Seu acervo de sermões e estudos — gerencie, pesquise e retome de onde parou.'))), React.createElement('div', {
    style: {
      padding: '0 20px'
    }
  }, React.createElement('div', {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      marginBottom: 20,
      flexWrap: 'wrap',
      gap: 16
    }
  }, React.createElement('div', {
    style: {
      display: 'flex',
      gap: 12,
      alignItems: 'flex-end',
      flexWrap: 'wrap'
    }
  }, React.createElement('div', {
    style: {
      width: 260
    }
  }, React.createElement(Input, {
    placeholder: 'Pesquisar por título ou referência...',
    value: query,
    onChange: e => setQuery(e.target.value)
  })), React.createElement('div', {
    style: {
      display: 'flex',
      gap: 6
    }
  }, FILTERS.map(f => React.createElement('button', {
    key: f.id,
    onClick: () => setStatusFilter(f.id),
    style: {
      padding: '10px 14px',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--border-default)',
      fontSize: 12,
      fontWeight: 600,
      cursor: 'pointer',
      background: statusFilter === f.id ? 'var(--color-brand-primary)' : '#fff',
      color: statusFilter === f.id ? '#fff' : 'var(--text-secondary)'
    }
  }, f.label)))), React.createElement(Button, {
    variant: 'outline',
    size: 'sm',
    onClick: onNewStudy
  }, React.createElement(Icon, {
    name: 'plus',
    size: 16
  }), 'Novo Estudo')), React.createElement('div', {
    style: {
      padding: 16,
      background: 'var(--amber-050)',
      border: '1px solid var(--amber-100)',
      borderRadius: 16,
      color: '#92400e',
      fontSize: 13,
      display: 'flex',
      gap: 12,
      alignItems: 'center',
      marginBottom: 24
    }
  }, React.createElement(Icon, {
    name: 'book-open',
    size: 20
  }), React.createElement('p', {
    style: {
      margin: 0
    }
  }, React.createElement('strong', null, 'Modo Convidado.'), ' Seus estudos não serão salvos permanentemente. ', React.createElement('span', {
    style: {
      textDecoration: 'underline',
      fontWeight: 700,
      cursor: 'pointer'
    }
  }, 'Faça login com Google'), ' para salvar seu progresso.')), filtered.length === 0 ? React.createElement('div', {
    style: {
      padding: 60,
      textAlign: 'center',
      color: 'var(--text-tertiary)'
    }
  }, React.createElement(Icon, {
    name: 'search-x',
    size: 32
  }), React.createElement('p', {
    style: {
      marginTop: 12,
      fontSize: 14
    }
  }, 'Nenhum estudo encontrado para "', query, '".')) : React.createElement('div', {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))',
      gap: 20
    }
  }, filtered.map(s => React.createElement('div', {
    key: s.id,
    onClick: () => onOpenStudy(s),
    className: 'glass-card',
    style: {
      padding: 24,
      borderRadius: 20,
      cursor: 'pointer',
      position: 'relative'
    }
  }, React.createElement('div', {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: 16
    }
  }, React.createElement('div', {
    style: {
      padding: 8,
      borderRadius: 10,
      background: s.status === 'completed' ? 'var(--state-success-bg)' : 'color-mix(in oklch,var(--color-brand-primary) 10%,transparent)',
      color: s.status === 'completed' ? 'var(--state-success-text)' : 'var(--color-brand-primary)'
    }
  }, React.createElement(Icon, {
    name: s.status === 'completed' ? 'check-circle-2' : 'clock',
    size: 20
  })), React.createElement(Icon, {
    name: 'more-vertical',
    size: 18,
    color: '#94a3b8'
  })), React.createElement('h3', {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 18,
      fontWeight: 700,
      color: 'var(--text-primary)',
      margin: '0 0 8px'
    }
  }, s.title), s.ref ? React.createElement('p', {
    style: {
      fontSize: 12,
      fontWeight: 600,
      color: 'var(--color-brand-primary)',
      margin: '0 0 16px'
    }
  }, s.ref) : React.createElement('p', {
    style: {
      fontSize: 12,
      color: 'var(--text-tertiary)',
      fontStyle: 'italic',
      margin: '0 0 16px'
    }
  }, 'Texto não selecionado'), React.createElement('div', {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: 10,
      color: 'var(--text-tertiary)'
    }
  }, React.createElement('span', null, 'Última atualização: ', s.updated), React.createElement(Icon, {
    name: 'chevron-right',
    size: 14
  })))))));
}
window.DashboardScreen = DashboardScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/hermeneuta-app/DashboardScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/hermeneuta-app/GroupsScreen.jsx
try { (() => {
function GroupsScreen() {
  const {
    Button
  } = window.OHermeneutaDesignSystem_375223;
  const {
    Icon
  } = window;
  const AI = {
    id: 'ai',
    name: 'Instrutor de IA (Global)'
  };
  const ROOM = {
    id: 'r1',
    name: 'Turma de Homilética - 2026'
  };
  const [selected, setSelected] = React.useState(AI);
  const [messages, setMessages] = React.useState([{
    id: 1,
    who: 'ai',
    text: 'Olá! Eu sou o Instrutor de IA. Como posso ajudar você a "Cavar & Descobrir" hoje?'
  }]);
  const [text, setText] = React.useState('');
  const send = () => {
    if (!text.trim()) return;
    const um = {
      id: Date.now(),
      who: 'me',
      text
    };
    setMessages(m => [...m, um]);
    setText('');
    if (selected.id === 'ai') setTimeout(() => setMessages(m => [...m, {
      id: Date.now() + 1,
      who: 'ai',
      text: 'Boa pergunta — releia o versículo 14 e note o conector "e": ele liga a encarnação diretamente à revelação da glória de Deus.'
    }]), 600);
  };
  return React.createElement('div', {
    style: {
      maxWidth: 1100,
      margin: '0 auto',
      padding: '32px 20px 80px',
      height: 'calc(100vh - 200px)'
    }
  }, React.createElement('div', {
    style: {
      display: 'flex',
      height: '100%',
      background: '#fff',
      borderRadius: 24,
      overflow: 'hidden',
      border: '1px solid var(--border-default)',
      boxShadow: 'var(--shadow-sm)'
    }
  }, React.createElement('div', {
    style: {
      width: 280,
      borderRight: '1px solid var(--border-default)',
      background: 'var(--surface-sunken)',
      display: 'flex',
      flexDirection: 'column'
    }
  }, React.createElement('div', {
    style: {
      padding: 20,
      borderBottom: '1px solid var(--border-default)',
      fontWeight: 700,
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, React.createElement(Icon, {
    name: 'users',
    size: 18,
    color: '#3F6B4F'
  }), 'Salas Virtuais'), React.createElement('div', {
    style: {
      padding: 12,
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, [AI, ROOM].map(g => React.createElement('button', {
    key: g.id,
    onClick: () => {
      setSelected(g);
      setMessages(g.id === 'ai' ? [{
        id: 1,
        who: 'ai',
        text: 'Olá! Eu sou o Instrutor de IA. Como posso ajudar você a "Cavar & Descobrir" hoje?'
      }] : [{
        id: 1,
        who: 'them',
        name: 'Prof. Ana',
        text: 'Bom dia turma! Não esqueçam de enviar o esboço até sexta.'
      }]);
    },
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: 12,
      borderRadius: 12,
      border: 'none',
      cursor: 'pointer',
      textAlign: 'left',
      background: selected.id === g.id ? 'var(--color-brand-primary)' : 'transparent',
      color: selected.id === g.id ? '#fff' : 'var(--text-secondary)'
    }
  }, React.createElement('div', {
    style: {
      width: 36,
      height: 36,
      borderRadius: 999,
      background: selected.id === g.id ? 'rgba(255,255,255,0.2)' : 'var(--slate-200)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 700,
      fontSize: 13
    }
  }, g.name[0]), React.createElement('span', {
    style: {
      fontWeight: 700,
      fontSize: 13
    }
  }, g.name))))), React.createElement('div', {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column'
    }
  }, React.createElement('div', {
    style: {
      padding: 20,
      borderBottom: '1px solid var(--border-default)',
      fontWeight: 700
    }
  }, selected.name), React.createElement('div', {
    style: {
      flex: 1,
      overflowY: 'auto',
      padding: 24,
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      background: 'var(--surface-sunken)'
    }
  }, messages.map(m => React.createElement('div', {
    key: m.id,
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: m.who === 'me' ? 'flex-end' : 'flex-start'
    }
  }, React.createElement('span', {
    style: {
      fontSize: 10,
      fontWeight: 700,
      textTransform: 'uppercase',
      color: m.who === 'ai' ? 'var(--amber-600)' : 'var(--text-tertiary)',
      marginBottom: 4
    }
  }, m.who === 'me' ? 'Você' : m.who === 'ai' ? 'Instrutor de IA' : m.name), React.createElement('div', {
    style: {
      maxWidth: '70%',
      padding: 14,
      borderRadius: 16,
      fontSize: 14,
      lineHeight: 1.5,
      background: m.who === 'me' ? 'var(--color-brand-primary)' : m.who === 'ai' ? 'var(--amber-050)' : '#fff',
      color: m.who === 'me' ? '#fff' : 'var(--text-primary)',
      border: m.who !== 'me' ? '1px solid var(--border-subtle)' : 'none'
    }
  }, m.text)))), React.createElement('div', {
    style: {
      padding: 20,
      borderTop: '1px solid var(--border-default)',
      display: 'flex',
      gap: 12
    }
  }, React.createElement('input', {
    value: text,
    onChange: e => setText(e.target.value),
    onKeyDown: e => e.key === 'Enter' && send(),
    placeholder: 'Escreva sua mensagem...',
    style: {
      flex: 1,
      padding: '14px 20px',
      borderRadius: 16,
      border: '1px solid var(--border-default)',
      background: 'var(--surface-sunken)',
      outline: 'none',
      fontSize: 14
    }
  }), React.createElement(Button, {
    onClick: send
  }, React.createElement(Icon, {
    name: 'send',
    size: 18,
    color: '#fff'
  }), 'Enviar')))));
}
window.GroupsScreen = GroupsScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/hermeneuta-app/GroupsScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/hermeneuta-app/LandingScreen.jsx
try { (() => {
function LandingScreen({
  onEnter
}) {
  const {
    Button
  } = window.OHermeneutaDesignSystem_375223;
  const {
    Icon
  } = window;
  const features = [{
    title: 'Método Estruturado',
    desc: 'Um guia passo a passo da observação à aplicação prática do texto bíblico.',
    icon: 'search'
  }, {
    title: 'Instrutor de IA',
    desc: 'Feedback imediato e pedagógico para aprofundar suas análises hermenêuticas.',
    icon: 'sparkles'
  }, {
    title: 'Fidelidade Textual',
    desc: 'Foco total na mensagem original e intenção do autor bíblico.',
    icon: 'shield-check'
  }];
  return React.createElement('div', {
    style: {
      minHeight: '100%',
      position: 'relative',
      background: 'var(--slate-950)',
      overflow: 'hidden'
    }
  }, React.createElement('img', {
    src: '../../assets/hero-mentorship.png',
    style: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      opacity: 0.95
    }
  }), React.createElement('div', {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(to bottom,rgba(2,6,23,0.45),rgba(2,6,23,0.2),rgba(2,6,23,0.8))'
    }
  }), React.createElement('div', {
    style: {
      position: 'relative',
      zIndex: 1,
      padding: '24px 48px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, React.createElement('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, React.createElement('div', {
    style: {
      width: 40,
      height: 40,
      background: '#fff',
      borderRadius: 12,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, React.createElement(Icon, {
    name: 'book-open',
    size: 22,
    color: 'var(--color-brand-primary)',
    style: {
      filter: 'none'
    }
  })), React.createElement('h1', {
    style: {
      fontFamily: 'var(--font-serif)',
      fontSize: 20,
      fontWeight: 700,
      color: '#fff',
      margin: 0
    }
  }, 'O Hermeneuta')), React.createElement(Button, {
    variant: 'ghost',
    style: {
      color: '#e2e8f0'
    },
    onClick: onEnter
  }, 'Entrar')), React.createElement('main', {
    style: {
      position: 'relative',
      zIndex: 1,
      maxWidth: 900,
      margin: '0 auto',
      textAlign: 'center',
      padding: '40px 24px 80px'
    }
  }, React.createElement('div', {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '6px 16px',
      borderRadius: 999,
      background: 'rgba(255,255,255,0.1)',
      color: 'var(--color-brand-primary)',
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.15em',
      textTransform: 'uppercase',
      marginBottom: 24
    }
  }, React.createElement(Icon, {
    name: 'sparkles',
    size: 14,
    color: '#fff'
  }), 'Um método que transforma sua pregação'), React.createElement('h2', {
    style: {
      fontFamily: 'var(--font-serif)',
      fontSize: 56,
      fontWeight: 900,
      lineHeight: 0.95,
      color: '#fff',
      letterSpacing: '-0.02em',
      margin: '0 0 24px'
    }
  }, 'Trabalhe o Texto.', React.createElement('br'), React.createElement('span', {
    style: {
      fontStyle: 'italic',
      color: 'var(--amber-300)'
    }
  }, 'Pregue com Vida.')), React.createElement('p', {
    style: {
      fontSize: 19,
      color: '#cbd5e1',
      maxWidth: 560,
      margin: '0 auto 32px',
      lineHeight: 1.6,
      fontWeight: 300
    }
  }, 'O ambiente de treinamento prático que guia você através da observação, exegese e aplicação bíblica profunda.'), React.createElement('div', {
    style: {
      display: 'flex',
      gap: 20,
      justifyContent: 'center',
      flexWrap: 'wrap'
    }
  }, React.createElement(Button, {
    size: 'lg',
    style: {
      fontSize: 16,
      padding: '16px 40px',
      borderRadius: 16
    },
    onClick: onEnter
  }, 'Começar Estudo Grátis'), React.createElement('button', {
    onClick: onEnter,
    style: {
      background: 'none',
      border: 'none',
      color: '#cbd5e1',
      fontWeight: 600,
      fontSize: 15,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      cursor: 'pointer'
    }
  }, 'Salvar com Google', React.createElement(Icon, {
    name: 'chevron-right',
    size: 18,
    color: '#fff'
  }))), React.createElement('div', {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3,1fr)',
      gap: 20,
      marginTop: 80,
      textAlign: 'left'
    }
  }, features.map(f => React.createElement('div', {
    key: f.title,
    style: {
      padding: 28,
      borderRadius: 24,
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)'
    }
  }, React.createElement('div', {
    style: {
      width: 48,
      height: 48,
      borderRadius: 14,
      background: 'rgba(63,107,79,0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20
    }
  }, React.createElement(Icon, {
    name: f.icon,
    size: 22,
    color: '#fff'
  })), React.createElement('h3', {
    style: {
      fontFamily: 'var(--font-serif)',
      fontSize: 18,
      fontWeight: 700,
      color: '#fff',
      textTransform: 'uppercase',
      margin: '0 0 10px'
    }
  }, f.title), React.createElement('p', {
    style: {
      fontSize: 14,
      color: '#94a3b8',
      lineHeight: 1.6,
      margin: 0
    }
  }, f.desc))))));
}
window.LandingScreen = LandingScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/hermeneuta-app/LandingScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/hermeneuta-app/Shared.jsx
try { (() => {
function Icon({
  name,
  size = 18,
  color = 'currentColor',
  style
}) {
  return React.createElement('img', {
    src: `https://unpkg.com/lucide-static@latest/icons/${name}.svg`,
    style: {
      width: size,
      height: size,
      filter: color === '#fff' ? 'invert(1)' : 'none',
      ...style
    },
    alt: ''
  });
}
function Topbar({
  active,
  onNav,
  role
}) {
  const {
    Button
  } = window.OHermeneutaDesignSystem_375223;
  const items = [{
    id: 'dashboard',
    label: 'Meus Estudos',
    icon: 'layout-dashboard'
  }, {
    id: 'academy',
    label: 'Academia',
    icon: 'graduation-cap'
  }, {
    id: 'bible',
    label: 'Novo Estudo',
    icon: 'book-open'
  }, {
    id: 'groups',
    label: 'Salas Virtuais',
    icon: 'message-square'
  }];
  return React.createElement('header', {
    style: {
      height: 64,
      borderBottom: '1px solid var(--border-default)',
      background: 'rgba(255,255,255,0.5)',
      backdropFilter: 'blur(8px)',
      position: 'sticky',
      top: 0,
      zIndex: 40
    }
  }, React.createElement('div', {
    style: {
      maxWidth: 1100,
      margin: '0 auto',
      padding: '0 20px',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, React.createElement('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 36
    }
  }, React.createElement('h1', {
    onClick: () => onNav('dashboard'),
    style: {
      fontFamily: 'var(--font-serif)',
      fontWeight: 700,
      fontSize: 20,
      color: 'var(--color-brand-primary)',
      cursor: 'pointer',
      margin: 0
    }
  }, 'O Hermeneuta'), React.createElement('nav', {
    style: {
      display: 'flex',
      gap: 24
    }
  }, items.map(it => React.createElement('button', {
    key: it.id,
    onClick: () => onNav(it.id),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      fontSize: 14,
      fontWeight: 500,
      color: active === it.id ? 'var(--color-brand-primary)' : 'var(--text-secondary)',
      background: 'none',
      border: 'none',
      cursor: 'pointer'
    }
  }, React.createElement(Icon, {
    name: it.icon,
    size: 18
  }), it.label)))), React.createElement('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, React.createElement('div', {
    style: {
      textAlign: 'right'
    }
  }, React.createElement('div', {
    style: {
      fontSize: 12,
      fontWeight: 600,
      color: 'var(--text-primary)'
    }
  }, 'Convidado(a)'), React.createElement('div', {
    style: {
      fontSize: 10,
      color: 'var(--text-tertiary)'
    }
  }, 'modo visitante')), React.createElement('button', {
    onClick: () => onNav('landing'),
    style: {
      padding: 8,
      border: 'none',
      background: 'none',
      color: 'var(--text-secondary)',
      cursor: 'pointer'
    }
  }, React.createElement(Icon, {
    name: 'log-out',
    size: 20
  })))));
}
window.Icon = Icon;
window.Topbar = Topbar;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/hermeneuta-app/Shared.jsx", error: String((e && e.message) || e) }); }

// ui_kits/hermeneuta-app/StudyStepScreen.jsx
try { (() => {
const STUDY_STEPS = [{
  id: 'observation',
  label: 'Observação',
  desc: 'O que o texto diz? Note repetições, contrastes e conectivos.',
  placeholder: 'Ex: Repetição da palavra "Verbo" (v.1, 14)...',
  tip: 'Mantenha-se na LINHA. Liste fatos objetivos que seus olhos vêem. Não tente interpretar ou aplicar ainda.'
}, {
  id: 'questions',
  label: 'Perguntas',
  desc: 'O que você quer perguntar ao texto? O que não está claro?',
  placeholder: 'Ex: Por que João chama Jesus de "O Verbo"?',
  tip: 'Vá além das perguntas básicas. Faça perguntas VIGOROSAS que buscam a racionalidade e o intento do autor.'
}, {
  id: 'genre',
  label: 'Gênero',
  desc: 'Identifique o gênero literário e como o autor organiza as ideias.',
  placeholder: 'Gênero: Narrativa/Poesia/Epístola...',
  tip: 'Identifique o TOM (atitude do autor) e o HUMOR (estado de espírito pretendido no leitor).'
}, {
  id: 'context',
  label: 'Contexto',
  desc: 'Explore o pano de fundo histórico, cultural e literário.',
  placeholder: 'Contexto Histórico: Escrito por volta de...',
  tip: 'NÃO pegue o atalho da aplicação imediata. Entenda a situação do público original.'
}, {
  id: 'main_idea',
  label: 'Ideia Principal',
  desc: 'Sintetize a mensagem central do texto em uma frase concisa.',
  placeholder: 'A ideia principal deste texto é...',
  tip: 'Síntese fiel: o que o autor diz + o TOM dele.'
}, {
  id: 'intent',
  label: 'Intento',
  desc: 'Qual é o propósito prático e transformador para os ouvintes?',
  placeholder: 'Este texto visa transformar a vida do crente ao...',
  tip: 'Por que o autor diz isso? Qual a mudança que Deus busca no coração do ouvinte?'
}, {
  id: 'outline',
  label: 'Esboço',
  desc: 'Organize os pontos principais do sermão.',
  placeholder: 'I. Introdução\nII. Ponto 1...',
  tip: 'A estrutura do sermão deve fluir da estrutura do texto.'
}, {
  id: 'sermon',
  label: 'Sermão',
  desc: 'Elabore o conteúdo completo, ilustrações e aplicações.',
  placeholder: 'Texto final do sermão...',
  tip: 'O TEXTO É REI. Aplique o texto pastoreando com aplicações que fluem da nova aliança em Jesus.'
}];
function StudyStepScreen({
  bibleRef,
  onFinish
}) {
  const {
    Button,
    StepTabs
  } = window.OHermeneutaDesignSystem_375223;
  const {
    Icon
  } = window;
  const [idx, setIdx] = React.useState(0);
  const [content, setContent] = React.useState('');
  const [aiOpen, setAiOpen] = React.useState(false);
  const step = STUDY_STEPS[idx];
  const tabLabels = [...STUDY_STEPS.map(s => s.label), 'Finalização'];
  const next = () => {
    setContent('');
    setAiOpen(false);
    if (idx < STUDY_STEPS.length - 1) setIdx(idx + 1);else onFinish();
  };
  return React.createElement('div', {
    style: {
      maxWidth: 1100,
      margin: '0 auto',
      padding: '32px 20px 80px'
    }
  }, React.createElement('div', {
    style: {
      borderBottom: '1px solid var(--border-default)',
      paddingBottom: 20,
      marginBottom: 24
    }
  }, React.createElement('h1', {
    style: {
      fontSize: 19,
      fontWeight: 700,
      margin: 0
    }
  }, 'Estudo: ', bibleRef), React.createElement('p', {
    style: {
      fontSize: 11,
      color: 'var(--text-secondary)',
      fontWeight: 600,
      margin: '4px 0 12px'
    }
  }, 'Progresso: ', Math.round(idx / STUDY_STEPS.length * 100), '%'), React.createElement(StepTabs, {
    steps: tabLabels,
    activeIndex: idx,
    onSelect: setIdx
  })), React.createElement('div', {
    style: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gap: 32
    }
  }, React.createElement('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 20
    }
  }, React.createElement('div', null, React.createElement('h2', {
    style: {
      fontFamily: 'var(--font-serif)',
      fontSize: 24,
      fontWeight: 700,
      margin: 0
    }
  }, step.label), React.createElement('p', {
    style: {
      color: 'var(--text-secondary)',
      fontSize: 13,
      margin: '4px 0 0'
    }
  }, step.desc)), React.createElement('div', {
    style: {
      padding: 24,
      background: '#fff',
      border: '1px solid var(--border-subtle)',
      borderRadius: 16
    }
  }, React.createElement('h4', {
    style: {
      fontSize: 11,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      color: 'color-mix(in oklch,var(--color-brand-primary) 60%,transparent)',
      margin: '0 0 8px'
    }
  }, 'Texto de Referência'), React.createElement('p', {
    style: {
      fontFamily: 'var(--font-serif)',
      fontSize: 17,
      fontStyle: 'italic',
      color: 'var(--text-primary)',
      lineHeight: 1.6,
      margin: 0
    }
  }, '"No princípio era o Verbo, e o Verbo estava com Deus, e o Verbo era Deus." ', React.createElement('span', {
    style: {
      fontFamily: 'var(--font-sans)',
      fontStyle: 'normal',
      fontWeight: 700,
      color: 'var(--color-brand-primary)'
    }
  }, '— ', bibleRef))), React.createElement('textarea', {
    value: content,
    onChange: e => setContent(e.target.value),
    placeholder: step.placeholder,
    style: {
      width: '100%',
      minHeight: 220,
      padding: 20,
      borderRadius: 16,
      border: '1px solid rgba(255,255,255,0.2)',
      background: 'rgba(255,255,255,0.8)',
      backdropFilter: 'blur(8px)',
      fontFamily: 'var(--font-sans)',
      fontSize: 14,
      lineHeight: 1.6,
      outline: 'none',
      resize: 'vertical'
    }
  }), React.createElement('div', {
    style: {
      display: 'flex',
      justifyContent: 'space-between'
    }
  }, React.createElement(Button, {
    variant: 'ghost',
    size: 'sm'
  }, React.createElement(Icon, {
    name: 'save',
    size: 16
  }), 'Salvar rascunho'), React.createElement('div', {
    style: {
      display: 'flex',
      gap: 12
    }
  }, React.createElement(Button, {
    variant: 'outline',
    onClick: () => setIdx(Math.max(0, idx - 1))
  }, React.createElement(Icon, {
    name: 'chevron-left',
    size: 18
  }), 'Voltar'), React.createElement(Button, {
    onClick: next
  }, idx === STUDY_STEPS.length - 1 ? 'Finalizar' : 'Próximo Passo', React.createElement(Icon, {
    name: 'chevron-right',
    size: 18,
    color: '#fff'
  }))))), React.createElement('div', null, React.createElement('div', {
    className: 'glass-card',
    style: {
      padding: 24,
      borderRadius: 16
    }
  }, React.createElement('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      marginBottom: 16
    }
  }, React.createElement('div', {
    style: {
      width: 40,
      height: 40,
      borderRadius: 999,
      background: 'var(--color-brand-primary)',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, React.createElement(Icon, {
    name: 'sparkles',
    size: 20,
    color: '#fff'
  })), React.createElement('div', null, React.createElement('h3', {
    style: {
      fontWeight: 700,
      fontSize: 14,
      margin: 0
    }
  }, 'Instrutor de IA'), React.createElement('p', {
    style: {
      fontSize: 9,
      color: 'var(--text-tertiary)',
      fontWeight: 700,
      textTransform: 'uppercase',
      margin: 0
    }
  }, 'O Hermeneuta'))), !aiOpen ? React.createElement(React.Fragment, null, React.createElement('p', {
    style: {
      fontSize: 13,
      color: 'var(--text-secondary)',
      fontStyle: 'italic',
      lineHeight: 1.6
    }
  }, 'Precisa de ajuda para aprofundar sua análise nesta etapa? Peça uma revisão pedagógica baseada no seu texto.'), React.createElement(Button, {
    style: {
      width: '100%',
      background: 'var(--slate-900)'
    },
    onClick: () => setAiOpen(true)
  }, React.createElement(Icon, {
    name: 'sparkles',
    size: 16,
    color: '#fff'
  }), 'Revisar com IA')) : React.createElement(React.Fragment, null, React.createElement('p', {
    style: {
      fontSize: 13,
      color: 'var(--text-secondary)',
      lineHeight: 1.6
    }
  }, 'Ótima observação sobre as repetições! Considere também investigar o contraste entre luz e trevas nos versículos seguintes — isso reforça o tema central do autor.'), React.createElement(Button, {
    variant: 'outline',
    size: 'sm',
    style: {
      width: '100%'
    },
    onClick: () => setAiOpen(false)
  }, 'Entendi, obrigado!'))), React.createElement('div', {
    style: {
      marginTop: 20,
      padding: 24,
      background: 'var(--amber-050)',
      borderRadius: 16,
      border: '1px solid var(--amber-100)'
    }
  }, React.createElement('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8,
      color: 'var(--amber-700)'
    }
  }, React.createElement(Icon, {
    name: 'sparkles',
    size: 14
  }), React.createElement('span', {
    style: {
      fontSize: 9,
      fontWeight: 900,
      textTransform: 'uppercase',
      letterSpacing: '0.15em'
    }
  }, 'Dica de Ouro do Método')), React.createElement('p', {
    style: {
      fontSize: 13,
      color: '#78350f',
      fontWeight: 500,
      lineHeight: 1.6,
      margin: 0
    }
  }, step.tip)))));
}
window.StudyStepScreen = StudyStepScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/hermeneuta-app/StudyStepScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/hermeneuta-app/image-slot.js
try { (() => {
// @ds-adherence-ignore -- omelette starter scaffold (raw elements/hex/px by design)
// Copied omelette starter. Re-running copy_starter_component with this kind overwrites this file with the latest version (page content is unaffected).
/* BEGIN USAGE */
/**
 * <image-slot> — user-fillable image placeholder.
 *
 * Drop this into a deck, mockup, or page wherever a design needs an image.
 * You control the slot's shape; it sizes to its container by default. When the search_stock_photos tool
 * is available, prefill the slot by default — write the photo's URL into
 * src (with credit/credit-href); the user can still fill or replace it
 * by dragging an image file onto it (or clicking to browse). The dropped
 * image persists across reloads via a .image-slots.state.json sidecar —
 * same read-via-fetch / write-via-window.omelette pattern as
 * design_canvas.jsx, so the filled slot shows on share links, downloaded
 * zips, and PPTX export. Outside the omelette runtime the slot is read-only.
 *
 * The sidecar is a SIBLING of the HTML file that uses this component: the
 * read is a document-relative fetch, and the host resolves the bridge's
 * sidecar writes into the previewed file's directory to match (same
 * contract as design_canvas.jsx). Pages in the same directory share one
 * sidecar; keep slot ids distinct across them.
 *
 * Attributes:
 *   id           Persistence key. REQUIRED for the drop to survive reload —
 *                every slot on the page needs a distinct id.
 *   shape        'rect' | 'rounded' | 'circle' | 'pill'   (default 'rounded')
 *                'circle' applies 50% border-radius; on a non-square slot
 *                that's an ellipse — set equal width and height for a true
 *                circle.
 *   radius       Corner radius in px for 'rounded'.       (default 12)
 *   mask         Any CSS clip-path value. Overrides `shape` — use this for
 *                hexagons, blobs, arbitrary polygons.
 *   fit          Initial framing baseline: cover | contain.   (default 'cover')
 *                cover starts the image filling the frame (overflow cropped);
 *                contain starts it fully visible (letterboxed). Either way the
 *                user can always pan/scale from there — double-click, or the
 *                Edit control, enters reframe mode (drag to move, scroll or
 *                corner-handles to scale; Escape / click-out commits). The
 *                crop persists alongside the image in the sidecar.
 *   placeholder  Empty-state caption.                      (default 'Drop an image')
 *   src          Optional initial/fallback image URL. Prefill it with a real
 *                photo via search_stock_photos when that tool is available
 *                (set credit/credit-href from the result). A user drop
 *                overrides it; clearing the drop reveals src again.
 *   credit       Attribution text shown as a small overlay at the
 *                bottom-left of the filled slot. REQUIRED whenever src
 *                points at any Unsplash host (images.unsplash.com,
 *                plus.unsplash.com, …): an Unsplash src with no credit
 *                renders an error tile INSTEAD of the photo (Unsplash
 *                terms forbid showing their photos unattributed). Use the
 *                exact form 'Photo by {photographer name} on Unsplash' —
 *                the overlay then links the name to credit-href and
 *                'Unsplash' to the Unsplash homepage, and links back to
 *                unsplash.com automatically get the required utm referral
 *                params appended at render time. The credit belongs to
 *                the src image, so it only shows while src is what's
 *                displayed — a user-dropped image hides it.
 *   credit-href  Link for the photographer's name in the credit overlay
 *                (their Unsplash profile URL from the stock-photo search
 *                results). http(s) URLs only — anything else renders the
 *                name as plain text.
 *
 * Sizing: the slot fills its container by default (width/height 100%).
 * Put it in a sized wrapper — absolutely positioned, a grid cell, a fixed
 * frame — and it takes exactly that box. When the parent's height is
 * indefinite (ordinary flow), it falls back to full width at a 3:2 aspect
 * ratio instead of collapsing. In a shrink-to-fit parent (a float,
 * width:max-content, an unsized absolute wrapper), percentages have
 * nothing to resolve against — size the slot or its wrapper explicitly
 * there. For a fixed-size slot, set
 * width/height on the element itself (inline style), which overrides the
 * default. When
 * layering content above a slot (full-bleed layouts), make the overlay
 * click-through — pointer-events: none on scrims/text plates, re-enabled
 * on interactive children — so the slot's hover controls stay reachable.
 * Keep the slot's bottom-left corner visually clear as well: the credit
 * overlay renders there, and a dark fade or text plate covering it hides
 * the attribution Unsplash's terms require — end the fade above that
 * corner, or keep it nearly transparent where the credit sits.
 *
 * Usage:
 *   <div style="position:relative;width:100%;height:100%">      <!-- full-bleed: -->
 *     <image-slot id="bg" shape="rect"></image-slot>            <!-- fills the wrapper -->
 *   </div>
 *   <image-slot id="hero"   style="width:800px;height:450px" shape="rounded" radius="20"
 *               placeholder="Drop a hero image"></image-slot>
 *   <image-slot id="avatar" style="width:120px;height:120px" shape="circle"></image-slot>
 *   <image-slot id="kite"   style="width:300px;height:300px"
 *               mask="polygon(50% 0, 100% 50%, 50% 100%, 0 50%)"></image-slot>
 */
/* END USAGE */

(() => {
  const STATE_FILE = '.image-slots.state.json';

  // Unsplash terms require visible attribution wherever their photos
  // display, and every link back to unsplash.com must carry utm referral
  // params. Two render-time rules enforce that here:
  //  - an Unsplash-src slot with NO credit attribute renders an error
  //    tile INSTEAD of the photo (an uncredited Unsplash photo on screen
  //    is itself the terms violation, so it never renders bare);
  //  - rendered credit links pointing at unsplash.com get the referral
  //    params appended when absent (credit-href values live in page
  //    content that can't be edited after the fact).
  // Keep the utm_source value in sync with UTM_SOURCE in
  // platform/web-agent/unsplash.ts — this file is a project-local
  // artifact and cannot import it (equality is pinned by tests).
  const UNSPLASH_HOMEPAGE_HREF = 'https://unsplash.com/?utm_source=claude_design&utm_medium=referral';
  // Host rule mirrors the hotlink validator that admits Unsplash srcs into
  // pages in the first place (cdn$ in unsplash.ts: apex or any subdomain)
  // — Unsplash+ results serve from plus.unsplash.com, not just images.*,
  // and an admitted-but-uncredited photo must error whatever unsplash
  // host it rides on.
  // Trailing-dot FQDNs (images.unsplash.com.) are the same host to the
  // browser but would miss the regex — strip one dot so the check fails
  // CLOSED (unrecognized-but-real Unsplash srcs must error, not render).
  const isUnsplashHost = u => {
    try {
      return /(^|\.)unsplash\.com$/.test(new URL(u, document.baseURI).hostname.replace(/\.$/, ''));
    } catch {
      return false;
    }
  };
  // Render-time referral normalization for links back to Unsplash:
  // appends utm_source/utm_medium when absent, preserves every existing
  // query param, never overwrites an existing utm_source, and passes
  // non-Unsplash URLs through untouched. Input is an ABSOLUTE validated
  // http(s) URL (the credit render funnel resolves + validates first).
  const withReferral = href => {
    try {
      const u = new URL(href);
      if (!/(^|\.)unsplash\.com$/.test(u.hostname.replace(/\.$/, ''))) {
        return href;
      }
      if (!u.searchParams.has('utm_source')) {
        u.searchParams.set('utm_source', 'claude_design');
      }
      if (!u.searchParams.has('utm_medium')) {
        u.searchParams.set('utm_medium', 'referral');
      }
      return u.toString();
    } catch (e) {
      return href;
    }
  };
  // 2× a ~600px slot in a 1920-wide deck — retina-sharp without making the
  // sidecar enormous. A 1200px WebP at q=0.85 is ~150-300KB.
  const MAX_DIM = 1200;
  // Raster formats only. SVG is excluded (can carry script; createImageBitmap
  // on SVG blobs is inconsistent). GIF is excluded because the canvas
  // re-encode keeps only the first frame, so an animated GIF would silently
  // go still — better to reject than surprise.
  const ACCEPT = ['image/png', 'image/jpeg', 'image/webp', 'image/avif'];

  // ── Shared sidecar store ────────────────────────────────────────────────
  // One fetch + immediate write-on-change for every <image-slot> on the
  // page. Reads via fetch() so viewing works anywhere the HTML and sidecar
  // are served together; writes go through window.omelette.writeFile, which
  // the host allowlists to *.state.json basenames only.
  const subs = new Set();
  let slots = {};
  // ids explicitly cleared before the sidecar fetch resolved — otherwise
  // the merge below can't tell "never set" from "just deleted" and would
  // resurrect the sidecar's stale value.
  const tombstones = new Set();
  let loaded = false;
  let loadP = null;
  function load() {
    if (loadP) return loadP;
    loadP = fetch(STATE_FILE).then(r => r.ok ? r.json() : null).then(j => {
      // Merge: sidecar loses to any in-memory change that raced ahead of
      // the fetch (drop or clear) so neither is clobbered by hydration.
      if (j && typeof j === 'object') {
        const merged = Object.assign({}, j, slots);
        // A framing-only write that raced ahead of hydration must not
        // drop a user image that's only on disk — inherit u from the
        // sidecar for any in-memory entry that lacks one.
        for (const k in slots) {
          if (merged[k] && !merged[k].u && j[k]) {
            merged[k].u = typeof j[k] === 'string' ? j[k] : j[k].u;
          }
        }
        for (const id of tombstones) delete merged[id];
        slots = merged;
      }
      tombstones.clear();
    }).catch(() => {}).then(() => {
      loaded = true;
      subs.forEach(fn => fn());
    });
    return loadP;
  }

  // Serialize writes so two near-simultaneous drops on different slots
  // can't reorder at the backend and leave the sidecar with only the
  // first. A save requested mid-flight just marks dirty and re-fires on
  // completion with the then-current slots.
  let saving = false;
  let saveDirty = false;
  // Unload-time flush: save()'s serialization defers a mid-RTT re-fire to a
  // .then that never runs in an unloading document, silently dropping a
  // pagehide commit. Post the current slots immediately instead — content
  // is a superset snapshot of any in-flight save's, the write is a
  // whole-file last-writer-wins replace, and postMessage FIFO delivers it
  // to the host after the in-flight one, so a backend-side reorder at
  // worst reproduces the dropped-commit outcome this flush improves on.
  // Guarded on the initial sidecar read: pre-hydration slots can miss
  // other slots' persisted entries, and flushing it would clobber them —
  // that narrow case stays best-effort (the in-memory merge in load()
  // cannot happen in an unloading document anyway).
  function flushNow() {
    if (!loaded) return;
    const w = window.omelette && window.omelette.writeFile;
    if (!w) return;
    try {
      Promise.resolve(w(STATE_FILE, JSON.stringify(slots))).catch(() => {});
    } catch (e) {}
  }
  function save() {
    if (saving) {
      saveDirty = true;
      return;
    }
    const w = window.omelette && window.omelette.writeFile;
    if (!w) return;
    saving = true;
    Promise.resolve(w(STATE_FILE, JSON.stringify(slots))).catch(() => {}).then(() => {
      saving = false;
      if (saveDirty) {
        saveDirty = false;
        save();
      }
    });
  }
  const S_MAX = 5;
  const clampS = s => Math.max(1, Math.min(S_MAX, s));

  // Normalize a stored slot value. Pre-reframe sidecars stored a bare
  // data-URL string; newer ones store {u, s, x, y}. Either shape is valid.
  function getSlot(id) {
    const v = slots[id];
    if (!v) return null;
    return typeof v === 'string' ? {
      u: v,
      s: 1,
      x: 0,
      y: 0
    } : v;
  }
  function setSlot(id, val) {
    if (!id) return;
    if (val) {
      slots[id] = val;
      tombstones.delete(id);
    } else {
      delete slots[id];
      if (!loaded) tombstones.add(id);
    }
    subs.forEach(fn => fn());
    // A drop is rare + high-value — write immediately so nav-away can't lose
    // it. Gate on the initial read so we don't overwrite a sidecar we haven't
    // merged yet; the merge in load() keeps this change once the read lands.
    if (loaded) save();else load().then(save);
  }

  // ── Image downscale ─────────────────────────────────────────────────────
  // Encode through a canvas so the sidecar carries resized bytes, not the
  // raw upload. Longest side is capped at 2× the slot's rendered width
  // (retina) and at MAX_DIM. WebP keeps alpha and is ~10× smaller than PNG
  // for photos, so there's no need for per-image format picking.
  async function toDataUrl(file, targetW) {
    const bitmap = await createImageBitmap(file);
    try {
      const cap = Math.min(MAX_DIM, Math.max(1, Math.round(targetW * 2)) || MAX_DIM);
      const scale = Math.min(1, cap / Math.max(bitmap.width, bitmap.height));
      const w = Math.max(1, Math.round(bitmap.width * scale));
      const h = Math.max(1, Math.round(bitmap.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d').drawImage(bitmap, 0, 0, w, h);
      return canvas.toDataURL('image/webp', 0.85);
    } finally {
      bitmap.close && bitmap.close();
    }
  }

  // ── Custom element ──────────────────────────────────────────────────────
  const stylesheet =
  // Fill the container by default: slots are usually placed inside a
  // sized wrapper (a hero frame, a grid cell, an inset:0 layer) and are
  // expected to take that box — a fixed intrinsic size would render as
  // a small tile in the corner of a full-bleed wrapper instead.
  // aspect-ratio is the companion fallback that keeps a bare slot
  // visible when the parent's height is indefinite: height:100%
  // resolves to auto there, and the ratio then derives height from
  // width instead of letting the slot collapse to zero height.
  // Explicit width/height on the element override all of this.
  // color:inherit (not a fixed near-black): the placeholder chrome —
  // empty-state icon/caption (currentColor) and the dashed ring — must
  // read on dark decks too, and the slide's own text color is the one
  // color guaranteed to contrast with the slide background. The soft
  // look comes from opacity on those parts, not from a baked-in alpha.
  ':host{display:block;position:relative;' + '  font:13px/1.3 system-ui,-apple-system,sans-serif;' + '  width:100%;height:100%;aspect-ratio:3/2}' + '.empty .cap,.empty .sub{opacity:.75}' + '.frame{position:absolute;inset:0;overflow:hidden;background:rgba(127,127,127,.08)}' +
  // .frame img (clipped) and .spill (unclipped ghost + handles) share the
  // same left/top/width/height in frame-%, computed by _applyView(), so the
  // inside-mask crop and the outside-mask spill stay pixel-aligned.
  '.frame img{position:absolute;max-width:none;transform:translate(-50%,-50%);' + '  -webkit-user-drag:none;user-select:none;touch-action:none}' +
  // Reframe mode (double-click): the full image spills past the mask. The
  // spill layer is sized to the IMAGE bounds so its corners are where the
  // resize handles belong. The ghost <img> inside is translucent; the real
  // clipped <img> underneath shows the opaque in-mask crop.
  // popover=manual promotes the spill to the top layer on reframe, so it is
  // not clipped by any overflow:hidden / clip-path / scroll-container
  // ancestor (a plain z-index can't escape overflow clipping). UA popover
  // defaults (inset:0;margin:auto) are reset; _applyView sets viewport px.
  '.spill{position:fixed;margin:0;inset:auto;border:0;padding:0;background:transparent;' + '  overflow:visible;transform:translate(-50%,-50%);z-index:1;cursor:grab;touch-action:none}' + ':host([data-panning]) .spill{cursor:grabbing}' + '.spill .ghost{position:absolute;inset:0;width:100%;height:100%;opacity:.35;' + '  pointer-events:none;-webkit-user-drag:none;user-select:none;' + '  box-shadow:0 0 0 1px rgba(0,0,0,.2),0 12px 32px rgba(0,0,0,.2)}' + '.spill .handle{position:absolute;width:12px;height:12px;border-radius:50%;' + '  background:#fff;box-shadow:0 0 0 1.5px #c96442,0 1px 3px rgba(0,0,0,.3);' + '  transform:translate(-50%,-50%)}' + '.spill .handle[data-c=nw]{left:0;top:0;cursor:nwse-resize}' + '.spill .handle[data-c=ne]{left:100%;top:0;cursor:nesw-resize}' + '.spill .handle[data-c=sw]{left:0;top:100%;cursor:nesw-resize}' + '.spill .handle[data-c=se]{left:100%;top:100%;cursor:nwse-resize}' + ':host([data-reframe]){z-index:10}' + ':host([data-reframe]) .frame{box-shadow:0 0 0 2px #c96442}' + '.empty{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;' + '  justify-content:center;gap:6px;text-align:center;padding:12px;box-sizing:border-box;' + '  cursor:pointer;user-select:none}' + '.empty svg{opacity:.45}' + '.empty .cap{max-width:90%;font-weight:500;letter-spacing:.01em}' + '.empty .sub{font-size:11px}' + '.empty .sub u{text-underline-offset:2px}' + '.empty:hover .sub{opacity:1}' + ':host([data-over]) .frame{outline:2px solid #c96442;outline-offset:-2px;' + '  background:rgba(201,100,66,.10)}' + '.ring{position:absolute;inset:0;pointer-events:none;border:1.5px dashed currentColor;' + '  opacity:.35;transition:border-color .12s,opacity .12s}' + ':host([data-over]) .ring{border-color:#c96442;opacity:1}' + ':host([data-filled]) .ring{display:none}' +
  // Controls overlay INSIDE the frame, pinned to the top-right corner, so
  // a full-bleed slot in an overflow:hidden container still shows them
  // (the old below-mask placement got clipped). Credit sits bottom-left,
  // so top-right avoids collision. The blurred pill background keeps them
  // legible over the image.
  // The UA [popover] base rule styles the element in EVERY state (only
  // display:none is gated on :not(:popover-open), and the display:flex
  // below overrides that) — so the UA resets live HERE, like .spill's,
  // or the ordinary hover-state strip renders as a bordered Canvas box
  // centered by margin:auto. inset:auto precedes top/right (shorthand).
  '.ctl{position:absolute;inset:auto;top:8px;right:8px;margin:0;border:0;padding:0;' + '  background:transparent;overflow:visible;' + '  display:flex;gap:6px;opacity:0;pointer-events:none;transition:opacity .12s;z-index:2;' + '  white-space:nowrap}' +
  // While reframing, the spill owns the top layer and would swallow every
  // click on the in-frame controls. Promoting .ctl into the top layer
  // ABOVE the spill (shown after it — later popovers stack higher) keeps
  // Edit-as-toggle and Replace clickable mid-reframe. _applyView pins it
  // to the frame's top-right in viewport px (translateX(-100%)
  // right-aligns against the computed left edge); inset:auto clears the
  // base rule's top/right so the inline left/top position it alone.
  '.ctl:popover-open{position:fixed;inset:auto;transform:translateX(-100%)}' + ':host([data-filled][data-editable]:hover) .ctl,:host([data-reframe]) .ctl' + '  {opacity:1;pointer-events:auto}' + '.ctl button{appearance:none;border:0;border-radius:6px;padding:5px 10px;cursor:pointer;' + '  background:rgba(0,0,0,.65);color:#fff;font:11px/1 system-ui,-apple-system,sans-serif;' + '  backdrop-filter:blur(6px)}' + '.ctl button:hover{background:rgba(0,0,0,.8)}' + '.err{position:absolute;left:8px;bottom:8px;right:8px;color:#b3261e;font-size:11px;' + '  background:rgba(255,255,255,.85);padding:4px 6px;border-radius:5px;pointer-events:none}' +
  // Replacement in flight: after a src swap the browser keeps painting
  // the PREVIOUS image until the new one decodes, so a Replace would
  // flash the old photo and then pop. Hide the stale frame (visibility,
  // not display — _applyView geometry still applies) and spin until the
  // new image reports in (load/error clears data-swapping).
  ':host([data-swapping]) .frame img{visibility:hidden}' + '.loading{position:absolute;inset:0;display:none;align-items:center;' + '  justify-content:center;pointer-events:none}' + ':host([data-swapping]) .loading{display:flex}' + '.loading::after{content:"";width:22px;height:22px;border-radius:50%;' + '  border:2px solid rgba(127,127,127,.25);border-top-color:currentColor;' + '  animation:om-slot-spin .7s linear infinite}' + '@keyframes om-slot-spin{to{transform:rotate(360deg)}}' +
  // Reduced motion: the static two-tone ring still reads as "working".
  '@media (prefers-reduced-motion:reduce){.loading::after{animation:none}}' + '.credit{position:absolute;left:6px;bottom:6px;max-width:calc(100% - 12px);display:none;' + '  padding:3px 7px;border-radius:5px;background:rgba(0,0,0,.55);color:#fff;' + '  font:10px/1.2 system-ui,-apple-system,sans-serif;text-decoration:none;' + '  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;backdrop-filter:blur(6px)}' +
  // The credit is a SPAN holding one or two <a>s (Unsplash's prescribed
  // form links the photographer AND Unsplash) — anchors style inline so
  // the overlay reads as one line of text.
  '.credit a{color:inherit;text-decoration:none}' + '.credit a:hover,.credit a:focus-visible{text-decoration:underline}' + ':host([data-filled][data-credit]) .credit{display:block}' +
  // Exports must ship JUST the image — no hover controls, no credit chip
  // (the host marks <html data-om-exporting> for the capture window; the
  // page-level hide script can't reach shadow DOM, this rule can).
  ':host-context([data-om-exporting]) .ctl,' + ':host-context([data-om-exporting]) .credit{display:none !important}' +
  // Print must ship just the image too: the hover-gated controls can be
  // mid-hover when print() fires, and the credit chip is screen chrome —
  // the same rule the capture window gets, keyed on print media instead
  // of the host's data-om-exporting mark (the print path sets no mark).
  '@media print{.ctl,.credit{display:none !important}}' +
  // No export-window mask rules here on purpose: the export capture
  // releases the replacement mask by REMOVING data-swapping (the
  // shadow-root pass in pages/export/shared.ts HIDE_EXPORT_CHROME_SCRIPT)
  // — attribute removal works in every engine (:host-context is
  // Chromium-only), is scoped by construction to slots actually
  // mid-swap, and hides the spinner through the same gate. A masked img
  // would otherwise be silently dropped from PPTX decks (the capture
  // walk skips visibility:hidden imgs).
  // Attribution error tile: REPLACES the photo when an Unsplash src has
  // no credit attribute — rendering the photo uncredited is the terms
  // violation, so the photo must not appear at all.
  // Calm and neutral on purpose (review feedback): the tile informs the
  // user; the fix instructions are machine-facing (usage docblock, tool
  // description, and the turn-end scan's bounce copy name the attributes
  // for the agent).
  '.attr-error{position:absolute;inset:0;display:none;flex-direction:column;align-items:center;' + '  justify-content:center;gap:6px;text-align:center;padding:12px;box-sizing:border-box;' + '  background:#f2f1ef;color:#6e6c66;user-select:none;' + '  font:13px/1.45 system-ui,-apple-system,sans-serif}' + '.attr-error svg{opacity:.55}' + '.attr-error .cap{max-width:92%;font-weight:500;letter-spacing:.01em}' + ':host([data-attribution-error]) .attr-error{display:flex}' + ':host([data-attribution-error]) .ring{display:none}';
  const icon = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' + 'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>' + '<path d="m21 15-5-5L5 21"/></svg>';
  const warnIcon = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' + 'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + '<path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/>' + '<path d="M12 9v4"/><path d="M12 17h.01"/></svg>';
  class ImageSlot extends HTMLElement {
    static get observedAttributes() {
      return ['shape', 'radius', 'mask', 'fit', 'placeholder', 'src', 'id', 'credit', 'credit-href'];
    }

    /** Duplicate-slide hook (called by deck-stage, see its
     *  _remintDuplicateIds): copy this id's stored image, if any, under a
     *  freshly minted key and return that key — so a duplicated slide's
     *  slot keeps its dropped photo instead of reverting to the
     *  placeholder. 'isFree' is the caller's uniqueness check (document
     *  ids); candidates must ALSO be unused in the sidecar, which can
     *  hold keys from other pages sharing the project root. (An EMPTY
     *  slot on another page leaves no sidecar entry, so its id is not
     *  detectable here — a minted key can collide with it and that slot
     *  would show this photo. Same blast radius as two pages reusing an
     *  id by hand, which the shared sidecar already permits.) Returns null
     *  when no id could be minted (caller strips the id, today's
     *  behavior). */
    static cloneSlot(fromId, isFree) {
      if (typeof fromId !== 'string' || !fromId) return null;
      // Pre-hydration the store can't veto candidates or source the copy
      // — degrade to the strip (today's behavior) rather than mint
      // against keys we can't see yet. Any rendered (= droppable) slot
      // means load() has already settled.
      if (!loaded) return null;
      const stem = fromId.replace(/-\d+$/, '') || fromId;
      for (let n = 2; n < 100; n++) {
        const toId = stem + '-' + n;
        if (toId === fromId) continue;
        if (slots[toId] !== undefined) {
          // Reuse a key holding this exact value (bytes AND crop) if no
          // live element here owns it — a duplicate op the host refused
          // after minting leaves such a key behind, and reusing keeps
          // refused retries from accumulating one orphaned copy per
          // attempt. Full equality (not just bytes) so a byte-identical
          // key another PAGE owns with its own crop is stepped past, not
          // adopted or rewritten. (Entries without .u never match.)
          const prev = getSlot(toId);
          const cur = getSlot(fromId);
          if (!(prev && cur && prev.u && prev.u === cur.u && prev.s === cur.s && prev.x === cur.x && prev.y === cur.y && (typeof isFree !== 'function' || isFree(toId)))) continue;
          return toId;
        }
        if (typeof isFree === 'function' && !isFree(toId)) continue;
        const v = getSlot(fromId);
        if (v) setSlot(toId, Object.assign({}, v));
        return toId;
      }
      return null;
    }
    constructor() {
      super();
      // clonable: rail thumbnails deep-clone slides and carry this shadow
      // along; reuse an already-cloned root so upgrade-after-clone works.
      // (Deliberately NOT serializable — a getHTML consumer would embed
      // multi-MB sidecar data-URLs into serialized page HTML.)
      const root = this.shadowRoot || this.attachShadow({
        mode: 'open',
        clonable: true
      });
      // .spill and .ctl sit OUTSIDE .frame so overflow:hidden + border-radius
      // on the frame (circle, pill, rounded) can't clip them.
      root.innerHTML = '<style>' + stylesheet + '</style>' + '<div class="frame" part="frame">' + '  <img part="image" alt="" draggable="false" style="display:none">' + '  <div class="empty" part="empty">' + icon + '    <div class="cap"></div>' + '    <div class="sub">or <u>browse files</u></div></div>' + '  <div class="attr-error" part="attribution-error">' + warnIcon + '    <div class="cap">This photo needs attribution</div></div>' + '  <div class="loading" part="loading"></div>' + '  <div class="ring" part="ring"></div>' + '</div>' +
      // Outside .frame, like .spill/.ctl — the frame's overflow:hidden +
      // border-radius/clip-path would cut the credit off on circle/pill/mask.
      // A SPAN, not an <a>: the prescribed Unsplash credit holds two links
      // (photographer + Unsplash), built per-render in _render().
      '<span class="credit" part="credit"></span>' + '<div class="spill" popover="manual" data-dc-edit-transparent>' + '  <img class="ghost" alt="" draggable="false">' + '  <div class="handle" data-c="nw"></div><div class="handle" data-c="ne"></div>' + '  <div class="handle" data-c="sw"></div><div class="handle" data-c="se"></div>' + '</div>' +
      // data-dc-edit-transparent: the DC editor's edit-mode picker lets
      // clicks through for chrome marked with it (EDIT_TRANSPARENT_SEL)
      // — without it, Replace/Edit clicks in Edit mode are swallowed by
      // element selection and the controls look dead.
      '<div class="ctl" popover="manual" data-dc-edit-transparent><button data-act="replace" title="Replace image">Replace</button>' + '  <button data-act="edit" title="Reframe image">Edit</button></div>' + '<input type="file" accept="' + ACCEPT.join(',') + '" hidden>';
      this._frame = root.querySelector('.frame');
      this._ring = root.querySelector('.ring');
      this._img = root.querySelector('.frame img');
      this._empty = root.querySelector('.empty');
      this._cap = root.querySelector('.cap');
      this._sub = root.querySelector('.sub');
      this._spill = root.querySelector('.spill');
      this._ctl = root.querySelector('.ctl');
      this._credit = root.querySelector('.credit');
      this._attrError = root.querySelector('.attr-error');
      // Credit clicks open the link, not browse/reframe.
      this._credit.addEventListener('click', e => e.stopPropagation());
      this._credit.addEventListener('dblclick', e => e.stopPropagation());
      this._ghost = root.querySelector('.ghost');
      this._err = null;
      this._input = root.querySelector('input');
      this._depth = 0;
      this._gen = 0;
      // Encode-in-flight marker (the owning _ingest generation): while set,
      // the same-src "nothing in flight" clear in _render must not fire —
      // the stored value still points at the OLD image until the encode
      // lands, so that clear would unmask the stale image mid-replace.
      this._swapGen = 0;
      // Render-owned swap in flight: set when _render assigns a new src,
      // cleared only by the img's own load/error (or the empty branch).
      // img.complete CANNOT stand in for this — setting src only QUEUES
      // the current-request swap (a microtask), so synchronously after an
      // assignment, complete still reports the OLD settled request. The
      // pick path does exactly that: the host sets src, credit, and
      // credit-href back-to-back in one task, and renders #2/#3 would
      // read the stale complete === true and drop the mask one render
      // after it was set.
      this._loadPending = false;
      // See _render's empty branch: a transient attribution-error wipe of a
      // showing image must make the follow-up render a replacement (spinner),
      // not a first fill (blank frame).
      this._hidShowing = false;
      this._view = {
        s: 1,
        x: 0,
        y: 0
      };
      this._subFn = () => this._render();
      // Shadow-DOM listeners live with the shadow DOM — bound once here so
      // disconnect/reconnect (e.g. React remount) doesn't stack handlers.
      this._empty.addEventListener('click', () => this._input.click());
      root.addEventListener('click', e => {
        const act = e.target && e.target.getAttribute && e.target.getAttribute('data-act');
        if (!act) return;
        // The hidden controls are opacity-0 but still tabbable — without
        // this gate a keyboard user could drive them on a read-only share
        // link (mirrors the dblclick handler's editable gate).
        if (!this.hasAttribute('data-editable')) return;
        if (act === 'replace') {
          this._exitReframe(true);
          // Host-owned picker (Unsplash modal; it also offers local import).
          this.dispatchEvent(new CustomEvent('image-slot:pick', {
            bubbles: true,
            composed: true,
            detail: {
              id: this.id || null
            }
          }));
        }
        if (act === 'edit') {
          if (!this._reframes()) return;
          if (this.hasAttribute('data-reframe')) this._exitReframe(true);else this._enterReframe();
        }
      });
      this._input.addEventListener('change', () => {
        const f = this._input.files && this._input.files[0];
        if (f) this._ingest(f);
        this._input.value = '';
      });
      // naturalWidth/Height aren't known until load — re-apply so the cover
      // baseline is computed from real dimensions, not the 100%×100% fallback.
      // load/error also release the replacement-in-flight mask (via the
      // single discipline in _releaseMask): the swap is only revealed once
      // the new image can actually paint (on error the frame shows its
      // background, same as a fresh slot with a broken src).
      this._img.addEventListener('load', () => {
        this._loadPending = false;
        this._releaseMask(true);
        this._applyView();
      });
      this._img.addEventListener('error', () => {
        this._loadPending = false;
        this._releaseMask(true);
      });
      // Gated only on editable — any filled slot can be repositioned/scaled,
      // regardless of fit. Share links (no writeFile) stay static.
      this.addEventListener('dblclick', e => {
        if (!this.hasAttribute('data-editable') || !this._reframes()) return;
        e.preventDefault();
        if (this.hasAttribute('data-reframe')) this._exitReframe(true);else this._enterReframe();
      });
      // Pan + resize both originate on the spill layer. A handle pointerdown
      // drives an aspect-locked resize anchored at the opposite corner; any
      // other pointerdown on the spill pans. Offsets are frame-% so a
      // reframed slot survives responsive resize / PPTX export.
      this._spill.addEventListener('pointerdown', e => {
        if (e.button !== 0 || !this.hasAttribute('data-reframe')) return;
        e.preventDefault();
        e.stopPropagation();
        this._spill.setPointerCapture(e.pointerId);
        const rect = this.getBoundingClientRect();
        const fw = rect.width || 1,
          fh = rect.height || 1;
        const corner = e.target.getAttribute && e.target.getAttribute('data-c');
        let move;
        if (corner) {
          // Resize about the OPPOSITE corner. Viewport-px throughout (rect
          // fw/fh, not clientWidth) so the math survives a transform:scale()
          // ancestor — deck_stage renders slides scaled-to-fit.
          const iw = this._img.naturalWidth || 1,
            ih = this._img.naturalHeight || 1;
          const contain = (this.getAttribute('fit') || 'cover').toLowerCase() === 'contain';
          const base = contain ? Math.min(fw / iw, fh / ih) : Math.max(fw / iw, fh / ih);
          const sx = corner.includes('e') ? 1 : -1;
          const sy = corner.includes('s') ? 1 : -1;
          const s0 = this._view.s;
          const w0 = iw * base * s0,
            h0 = ih * base * s0;
          const cx0 = (50 + this._view.x) / 100 * fw;
          const cy0 = (50 + this._view.y) / 100 * fh;
          const ox = cx0 - sx * w0 / 2,
            oy = cy0 - sy * h0 / 2;
          const diag0 = Math.hypot(w0, h0);
          const ux = sx * w0 / diag0,
            uy = sy * h0 / diag0;
          move = ev => {
            const proj = (ev.clientX - rect.left - ox) * ux + (ev.clientY - rect.top - oy) * uy;
            const s = clampS(s0 * proj / diag0);
            const d = diag0 * s / s0;
            this._view.s = s;
            this._view.x = (ox + ux * d / 2) / fw * 100 - 50;
            this._view.y = (oy + uy * d / 2) / fh * 100 - 50;
            this._clampView();
            this._applyView();
          };
        } else {
          this.setAttribute('data-panning', '');
          const start = {
            px: e.clientX,
            py: e.clientY,
            x: this._view.x,
            y: this._view.y
          };
          move = ev => {
            this._view.x = start.x + (ev.clientX - start.px) / fw * 100;
            this._view.y = start.y + (ev.clientY - start.py) / fh * 100;
            this._clampView();
            this._applyView();
          };
        }
        const up = () => {
          try {
            this._spill.releasePointerCapture(e.pointerId);
          } catch {}
          this._spill.removeEventListener('pointermove', move);
          this._spill.removeEventListener('pointerup', up);
          this._spill.removeEventListener('pointercancel', up);
          this.removeAttribute('data-panning');
          this._dragUp = null;
        };
        // Stashed so _exitReframe (Escape / outside-click mid-drag) can
        // tear the capture + listeners down synchronously.
        this._dragUp = up;
        this._spill.addEventListener('pointermove', move);
        this._spill.addEventListener('pointerup', up);
        this._spill.addEventListener('pointercancel', up);
      });
      // Wheel zoom stays available inside reframe mode as a trackpad nicety —
      // zooms toward the cursor (offset' = cursor·(1-k) + offset·k).
      this.addEventListener('wheel', e => {
        if (!this.hasAttribute('data-reframe')) return;
        e.preventDefault();
        const r = this.getBoundingClientRect();
        const cx = (e.clientX - r.left) / r.width * 100 - 50;
        const cy = (e.clientY - r.top) / r.height * 100 - 50;
        const prev = this._view.s;
        const next = clampS(prev * Math.pow(1.0015, -e.deltaY));
        if (next === prev) return;
        const k = next / prev;
        this._view.s = next;
        this._view.x = cx * (1 - k) + this._view.x * k;
        this._view.y = cy * (1 - k) + this._view.y * k;
        this._clampView();
        this._applyView();
      }, {
        passive: false
      });
    }
    connectedCallback() {
      // Warn once per page — an id-less slot works for the session but
      // cannot persist, and two id-less slots would share nothing.
      if (!this.id && !ImageSlot._warned) {
        ImageSlot._warned = true;
        console.warn('<image-slot> without an id will not persist its dropped image.');
      }
      this.addEventListener('dragenter', this);
      this.addEventListener('dragover', this);
      this.addEventListener('dragleave', this);
      this.addEventListener('drop', this);
      subs.add(this._subFn);
      // The host may inject window.omelette.writeFile AFTER the first render;
      // re-render on hover so the editable-gated controls reliably appear.
      this.addEventListener('pointerenter', this._subFn);
      // width%/height% in _applyView encode the frame aspect at call time —
      // a host resize (responsive grid, pane divider) would stretch the
      // image until the next _render. Re-render on size change: _render()
      // re-seeds _view from stored before clamp/apply, so a shrink→grow
      // cycle round-trips instead of ratcheting x/y toward the narrower
      // frame's clamp range.
      this._ro = new ResizeObserver(() => this._render());
      this._ro.observe(this);
      load();
      this._render();
    }
    disconnectedCallback() {
      subs.delete(this._subFn);
      this.removeEventListener('pointerenter', this._subFn);
      this.removeEventListener('dragenter', this);
      this.removeEventListener('dragover', this);
      this.removeEventListener('dragleave', this);
      this.removeEventListener('drop', this);
      if (this._ro) {
        this._ro.disconnect();
        this._ro = null;
      }
      // commit=false: a disconnect is not a user intent — committing here
      // would persist whatever half-finished drag a React remount or DOM
      // splice happened to interrupt. Deliberate exits commit on their own
      // paths (Escape/click-out/toggle), and unloads commit via pagehide.
      this._exitReframe(false);
    }
    _enterReframe() {
      if (this.hasAttribute('data-reframe')) return;
      this.setAttribute('data-reframe', '');
      this._signalReframe(true);
      // Best-effort commit when the document unloads mid-reframe (a host
      // navigation racing the enter signal, a manual reload, tab close):
      // the sidecar write rides the host bridge, which outlives this
      // document, so the crop survives even though the mode dies with the
      // DOM. Held on the instance so _exitReframe detaches exactly what
      // was attached.
      this._pagehide = () => {
        this._exitReframe(true);
        flushNow();
      };
      window.addEventListener('pagehide', this._pagehide);
      // Promote spill to the top layer, then keep it pinned over the frame:
      // scroll/resize cover the common cases, and a per-frame rect check
      // catches layout shifts that fire neither (an image above finishing
      // load, streamed DOM pushing the slot down, an ancestor transform
      // change) so the overlay can't detach from the frame.
      try {
        this._spill.showPopover();
      } catch {}
      // After the spill, so the controls stack above it in the top layer.
      try {
        this._ctl.showPopover();
      } catch {}
      this._reposition = () => {
        if (this.hasAttribute('data-reframe')) this._applyView();
      };
      window.addEventListener('scroll', this._reposition, true);
      window.addEventListener('resize', this._reposition);
      this._lastRect = '';
      this._watch = () => {
        if (!this.hasAttribute('data-reframe')) return;
        const r = this.getBoundingClientRect();
        const key = r.left + ',' + r.top + ',' + r.width + ',' + r.height;
        if (key !== this._lastRect) {
          this._lastRect = key;
          this._applyView();
        }
        this._watchId = requestAnimationFrame(this._watch);
      };
      this._watchId = requestAnimationFrame(this._watch);
      this._applyView();
      // Close on click outside (the spill handler stopPropagation()s so
      // in-image drags don't reach this) and on Escape. Listeners are held
      // on the instance so _exitReframe / disconnectedCallback can detach
      // exactly what was attached.
      this._outside = e => {
        if (e.composedPath && e.composedPath().includes(this)) return;
        this._exitReframe(true);
      };
      this._esc = e => {
        if (e.key === 'Escape') this._exitReframe(true);
      };
      document.addEventListener('pointerdown', this._outside, true);
      document.addEventListener('keydown', this._esc, true);
    }
    _exitReframe(commit) {
      if (!this.hasAttribute('data-reframe')) return;
      if (this._dragUp) this._dragUp();
      this.removeAttribute('data-reframe');
      this.removeAttribute('data-panning');
      if (this._outside) document.removeEventListener('pointerdown', this._outside, true);
      if (this._esc) document.removeEventListener('keydown', this._esc, true);
      this._outside = this._esc = null;
      if (this._reposition) {
        window.removeEventListener('scroll', this._reposition, true);
        window.removeEventListener('resize', this._reposition);
        this._reposition = null;
      }
      if (this._watchId) {
        cancelAnimationFrame(this._watchId);
        this._watchId = 0;
      }
      if (this._pagehide) {
        window.removeEventListener('pagehide', this._pagehide);
        this._pagehide = null;
      }
      try {
        this._spill.hidePopover();
      } catch {}
      try {
        this._ctl.hidePopover();
      } catch {}
      this._ctl.style.left = '';
      this._ctl.style.top = '';
      if (commit) this._commitView();
      this._signalReframe(false);
    }

    // Reframe state lives only in this DOM until commit, invisible to the
    // host's dirty signals — announce enter/exit so the host can hold
    // auto-reloads for exactly the gesture (the guest bundle forwards
    // image-slot:reframe to the host as imageSlotReframe). Dispatched on
    // the element (composed, so it escapes shadow roots) while connected;
    // a disconnected exit (disconnectedCallback) falls back to document so
    // the host still hears it.
    _signalReframe(active) {
      const target = this.isConnected ? this : document;
      target.dispatchEvent(new CustomEvent('image-slot:reframe', {
        bubbles: true,
        composed: true,
        detail: {
          active: active,
          id: this.id || null
        }
      }));
    }

    // Public: host's "Import from computer" calls this to run local browse.
    openFilePicker() {
      this._exitReframe(true);
      this._input.click();
    }

    // A src write is a newer intent for this slot's content — the host
    // pick path (setImageSlotImage) or an agent edit — so it must win
    // over any encode still in flight from an earlier drop: left live,
    // that encode lands later, passes _ingest's gen guard, and its
    // setSlot silently overwrites the pick (the stored value shadows
    // src in _render). Bumping _gen kills the encode before its own
    // _swapGen clear runs, so clear the dead claim here too — otherwise
    // _releaseMask (gated on !_swapGen) never fires and the pick's
    // spinner is stranded. src ONLY: the pick sets credit/credit-href
    // in the same task, and clearing _swapGen on those would let the
    // same-src branch unmask the old image mid-encode.
    attributeChangedCallback(name, oldVal, newVal) {
      if (name === 'src' && oldVal !== newVal) {
        this._gen++;
        this._swapGen = 0;
      }
      if (this.shadowRoot) this._render();
    }

    // handleEvent — one listener object for all four drag events keeps the
    // add/remove symmetric and the depth counter correct.
    handleEvent(e) {
      if (e.type === 'dragenter' || e.type === 'dragover') {
        // Without preventDefault the browser never fires 'drop'.
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
        if (e.type === 'dragenter') this._depth++;
        this.setAttribute('data-over', '');
      } else if (e.type === 'dragleave') {
        // dragenter/leave fire for every descendant crossing — count depth
        // so hovering the icon inside the empty state doesn't flicker.
        if (--this._depth <= 0) {
          this._depth = 0;
          this.removeAttribute('data-over');
        }
      } else if (e.type === 'drop') {
        e.preventDefault();
        e.stopPropagation();
        this._depth = 0;
        this.removeAttribute('data-over');
        const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        if (f) this._ingest(f);
      }
    }
    async _ingest(file) {
      this._setError(null);
      if (!file || ACCEPT.indexOf(file.type) < 0) {
        this._setError('Drop a PNG, JPEG, WebP, or AVIF image.');
        return;
      }
      // toDataUrl can take hundreds of ms on a large photo. A Clear or a
      // newer drop during that window would be clobbered when this await
      // resumes — bump + capture a generation so stale encodes bail.
      const gen = ++this._gen;
      // Replacing a shown image: surface the swap through the encode too,
      // not just the decode — otherwise the old photo sits there with no
      // feedback while the canvas re-encode runs. An empty slot keeps its
      // placeholder (no spinner) until the encode lands, as before.
      // _swapGen guards the mask against re-renders DURING the encode
      // (pointerenter, ResizeObserver, another slot's store write): the
      // stored value still resolves to the old image there, so _render's
      // same-src clear would otherwise unmask it mid-replace.
      if (this.hasAttribute('data-filled')) {
        this.setAttribute('data-swapping', '');
        this._swapGen = gen;
      }
      try {
        const w = this.clientWidth || this.offsetWidth || MAX_DIM;
        const url = await toDataUrl(file, w);
        if (gen !== this._gen) return;
        // Only exit reframe once the new image is in hand — a rejected type
        // or decode failure leaves the in-progress crop untouched.
        this._exitReframe(false);
        // Clear BEFORE setSlot: its synchronous re-render must see no
        // pending encode, so a byte-identical re-upload (same data URL, no
        // load event coming) still clears the mask via the complete branch.
        this._swapGen = 0;
        const val = {
          u: url,
          s: 1,
          x: 0,
          y: 0
        };
        setSlot(this.id || '', val);
        // Keep a session-local copy for id-less slots so the drop still
        // shows, even though it cannot persist.
        if (!this.id) {
          this._local = val;
          this._render();
        }
      } catch (err) {
        if (gen !== this._gen) return;
        this._swapGen = 0;
        // Reveal the kept old image — unless another replacement (a
        // remote pick's src swap) is still in flight, in which case the
        // mask stays until THAT image settles (its load/error releases).
        this._releaseMask();
        this._setError('Could not read that image.');
        console.warn('<image-slot> ingest failed:', err);
      }
    }
    _setError(msg) {
      if (this._err) {
        this._err.remove();
        this._err = null;
      }
      if (!msg) return;
      const d = document.createElement('div');
      d.className = 'err';
      d.textContent = msg;
      this.shadowRoot.appendChild(d);
      this._err = d;
      setTimeout(() => {
        if (this._err === d) {
          d.remove();
          this._err = null;
        }
      }, 3000);
    }

    // Reframing (pan/resize) is available on any filled slot — the user can
    // always reposition/scale. `fit` only sets the initial baseline (see
    // _geom): contain starts fully-visible, cover starts frame-filling.
    _reframes() {
      return this.hasAttribute('data-filled');
    }

    // The single release discipline for the replacement-in-flight mask
    // (data-swapping). The mask comes off only when BOTH hold:
    //  - no encode is pending (_swapGen) — mid-encode the stored value
    //    still resolves to the old image, so any reveal paints it;
    //  - the frame img has settled on its current src — an unsettled src
    //    means some replacement is still in flight (e.g. a remote pick),
    //    whoever started it, and revealing would paint the previous
    //    frame. The load/error listeners pass settled=true (the event IS
    //    the settlement signal, per spec complete is true by then);
    //    other callers rely on the complete flag (covers loaded AND
    //    failed).
    // Every release path funnels through here EXCEPT _render's empty
    // branch (the img is being cleared — nothing will ever settle).
    _releaseMask(settled) {
      if (!this._swapGen && !this._loadPending && (settled || this._img.complete)) {
        this.removeAttribute('data-swapping');
      }
    }

    // Baseline geometry, shared by clamp/apply/resize. `base` is the scale at
    // view-scale s=1: cover = fill the frame (overflow on the looser axis),
    // contain = fit fully inside (letterboxed). Zooming a contain image past
    // s where it overflows naturally becomes a crop. Null until the img has
    // loaded (naturalWidth is 0 before that) or when the slot has no layout
    // box — ResizeObserver fires with a 0×0 rect under display:none, and
    // clamping against a degenerate 1×1 frame would silently pull the stored
    // pan toward zero.
    _geom() {
      const iw = this._img.naturalWidth,
        ih = this._img.naturalHeight;
      const fw = this.clientWidth,
        fh = this.clientHeight;
      if (!iw || !ih || !fw || !fh) return null;
      const contain = (this.getAttribute('fit') || 'cover').toLowerCase() === 'contain';
      const base = contain ? Math.min(fw / iw, fh / ih) : Math.max(fw / iw, fh / ih);
      return {
        iw,
        ih,
        fw,
        fh,
        base
      };
    }
    _clampView() {
      // Pan range on each axis is half the overflow past the frame edge.
      const g = this._geom();
      if (!g) return;
      const mx = Math.max(0, (g.iw * g.base * this._view.s / g.fw - 1) * 50);
      const my = Math.max(0, (g.ih * g.base * this._view.s / g.fh - 1) * 50);
      this._view.x = Math.max(-mx, Math.min(mx, this._view.x));
      this._view.y = Math.max(-my, Math.min(my, this._view.y));
    }
    _applyView() {
      const g = this._geom();
      // Top-layer controls: pin to the frame's top-right in viewport px
      // (the same 8px inset as the in-frame layout; unscaled — top-layer UI
      // reads as chrome, not page content). BEFORE the geometry branch:
      // placement needs only the frame rect, and a not-yet-loaded or broken
      // src must not leave the promoted strip floating unpositioned. Gated
      // on the popover actually being open: without the Popover API,
      // showPopover() threw (swallowed in _enterReframe), .ctl stays in
      // its in-frame absolute layout, and viewport-px coordinates would
      // shove it off-frame — and matches(':popover-open') itself throws
      // there (unknown pseudo-class), hence the try/catch.
      if (this.hasAttribute('data-reframe')) {
        let onTop = false;
        try {
          onTop = this._ctl.matches(':popover-open');
        } catch {}
        if (onTop) {
          const r = this.getBoundingClientRect();
          this._ctl.style.left = r.right - 8 + 'px';
          this._ctl.style.top = r.top + 8 + 'px';
        }
      }
      if (!g) {
        // Dimensions not known yet (before img load) — centered fit so there
        // is no flash of an unpositioned image before the geometry lands.
        const contain = (this.getAttribute('fit') || 'cover').toLowerCase() === 'contain';
        this._img.style.width = '100%';
        this._img.style.height = '100%';
        this._img.style.left = '50%';
        this._img.style.top = '50%';
        this._img.style.objectFit = contain ? 'contain' : 'cover';
        return;
      }
      // Baseline (cover-fill or contain-fit) × view scale. Width/height and
      // left/top are all frame-% — depends only on the frame aspect ratio, so
      // a responsive resize keeps the same crop. The spill layer mirrors the
      // same box so its corners = image corners.
      const k = g.base * this._view.s;
      const w = g.iw * k / g.fw * 100 + '%';
      const h = g.ih * k / g.fh * 100 + '%';
      const l = 50 + this._view.x + '%';
      const t = 50 + this._view.y + '%';
      this._img.style.width = w;
      this._img.style.height = h;
      this._img.style.left = l;
      this._img.style.top = t;
      this._img.style.objectFit = '';
      if (this.hasAttribute('data-reframe')) {
        // Top-layer spill: position in viewport px over the frame. The top
        // layer escapes ancestor transforms entirely, so EVERY term must be
        // in viewport units: getBoundingClientRect gives the frame's scaled
        // origin AND size, and the rect/layout ratio rescales the ghost —
        // sizing from layout px alone renders it 1/scale too large under a
        // scaled deck slide. Inner ghost + handles stay box-relative.
        const r = this.getBoundingClientRect();
        const sx = g.fw ? r.width / g.fw : 1;
        const sy = g.fh ? r.height / g.fh : 1;
        this._spill.style.width = g.iw * k * sx + 'px';
        this._spill.style.height = g.ih * k * sy + 'px';
        this._spill.style.left = r.left + (50 + this._view.x) / 100 * r.width + 'px';
        this._spill.style.top = r.top + (50 + this._view.y) / 100 * r.height + 'px';
      }
    }
    _commitView() {
      const v = {
        s: this._view.s,
        x: this._view.x,
        y: this._view.y
      };
      if (this._userUrl) v.u = this._userUrl;
      // Framing-only (no u) persists too so an author-src slot remembers its
      // crop; clearing the sidecar still falls through to src=.
      if (this.id) setSlot(this.id, v);else {
        this._local = v;
      }
    }
    _render() {
      // Shape / mask. Presets use border-radius so the dashed ring can
      // follow the rounded outline; clip-path is only applied for an
      // explicit `mask` (the ring is hidden there since a rectangle
      // dashed border chopped by an arbitrary polygon looks broken).
      const mask = this.getAttribute('mask');
      const shape = (this.getAttribute('shape') || 'rounded').toLowerCase();
      let radius = '';
      if (shape === 'circle') radius = '50%';else if (shape === 'pill') radius = '9999px';else if (shape === 'rounded') {
        const n = parseFloat(this.getAttribute('radius'));
        radius = (Number.isFinite(n) ? n : 12) + 'px';
      }
      this._frame.style.borderRadius = mask ? '' : radius;
      this._frame.style.clipPath = mask || '';
      this._ring.style.borderRadius = mask ? '' : radius;
      this._ring.style.display = mask ? 'none' : '';

      // Controls and reframe entry gate on this so share links stay read-only.
      const editable = !!(window.omelette && window.omelette.writeFile);
      this.toggleAttribute('data-editable', editable);
      this._sub.style.display = editable ? '' : 'none';

      // Content. The sidecar is also writable by the agent's write_file
      // tool, so its value isn't guaranteed canvas-originated — only accept
      // data:image/ URLs from it. The `src` attribute is author-controlled
      // (Claude wrote it into the HTML) so it passes through unchanged.
      let stored = this.id ? getSlot(this.id) : this._local;
      if (stored && stored.u && !/^data:image\//i.test(stored.u)) stored = null;
      const srcAttr = this.getAttribute('src') || '';
      this._userUrl = stored && stored.u || null;
      const url = this._userUrl || srcAttr;
      // Don't clobber an in-flight reframe with a store-triggered re-render.
      if (!this.hasAttribute('data-reframe')) {
        this._view = {
          s: stored && Number.isFinite(stored.s) ? clampS(stored.s) : 1,
          x: stored && Number.isFinite(stored.x) ? stored.x : 0,
          y: stored && Number.isFinite(stored.y) ? stored.y : 0
        };
      }
      this._cap.textContent = this.getAttribute('placeholder') || 'Drop an image';
      // Toggle via style.display — the [hidden] attribute alone loses to
      // the display:flex / display:block rules in the stylesheet above.
      // An Unsplash src with no credit attribute must NOT render — showing
      // the photo uncredited is the Unsplash-terms violation itself. The
      // error tile replaces the photo until the credit is written. A
      // user-dropped image is the user's own content and always renders.
      // Trimmed: credit is agent/user-editable content, and a whitespace-
      // only value must count as missing — otherwise it would suppress the
      // error tile AND render an empty credit box (no text, no links),
      // exactly the unattributed state this gate exists to prevent.
      const credit = (this.getAttribute('credit') || '').trim();
      const attrError = !!(!credit && !this._userUrl && srcAttr && isUnsplashHost(srcAttr));
      this.toggleAttribute('data-attribution-error', attrError);
      if (url && !attrError) {
        const prev = this._img.getAttribute('src');
        if (prev !== url) {
          // Replacing an already-shown image: mark the swap BEFORE setting
          // src so the stale frame is never revealed (see the data-swapping
          // stylesheet rules). First fill (prev empty) keeps the existing
          // placeholder-until-load behavior — no spinner. _hidShowing
          // covers the pick path's transient attribution-error wipe: prev
          // is gone, but an image WAS showing, so this is a replacement.
          if (prev || this._hidShowing) this.setAttribute('data-swapping', '');
          // Mark the swap BEFORE assigning src: complete keeps reporting
          // the old settled request until the browser's
          // update-the-image-data microtask runs, so same-task re-renders
          // (the pick path's credit/credit-href setAttributes) need this
          // flag, not complete, to know a load is in flight.
          this._loadPending = true;
          this._img.src = url;
          this._ghost.src = url;
        } else {
          // Same-src re-render — release if settled, so an ingest-set
          // spinner can't stick after a byte-identical re-upload (same
          // data URL, no further load event ever fires).
          this._releaseMask();
        }
        this._hidShowing = false;
        this._img.style.display = 'block';
        this._empty.style.display = 'none';
        this.setAttribute('data-filled', '');
        this._clampView();
        this._applyView();
      } else {
        this.removeAttribute('data-swapping');
        // The src is being removed — no load/error will ever fire for it.
        this._loadPending = false;
        // A transient attribution-error wipe of a showing image happens on
        // the pick path: the host sets src one setAttribute before credit,
        // so render N hides the old image (attrError) and render N+1
        // restores a URL. Remember the wipe so that restore renders as a
        // replacement (spinner), not a first fill (blank frame).
        this._hidShowing = attrError && !!this._img.getAttribute('src');
        this._img.style.display = 'none';
        this._img.removeAttribute('src');
        this._ghost.removeAttribute('src');
        // The error tile owns the blocked-photo state; .empty stays for
        // the genuinely-empty slot.
        this._empty.style.display = attrError ? 'none' : 'flex';
        this.removeAttribute('data-filled');
      }

      // Credit belongs to the author src, so a user drop hides it.
      // textContent + the http(s)-only funnel keep external strings inert.
      const showCredit = !!(url && credit && !this._userUrl && !attrError);
      this._credit.textContent = '';
      if (showCredit) {
        // Validate once (resolved against the document, http(s) only),
        // then append the terms-required utm referral params to links
        // that point back at unsplash.com.
        let href = '';
        const rawHref = this.getAttribute('credit-href') || '';
        if (rawHref) {
          try {
            const u = new URL(rawHref, document.baseURI);
            if (u.protocol === 'http:' || u.protocol === 'https:') {
              href = withReferral(u.href);
            }
          } catch {}
        }
        const mkLink = (text, linkHref) => {
          const a = document.createElement('a');
          a.setAttribute('target', '_blank');
          a.setAttribute('rel', 'noopener noreferrer');
          a.setAttribute('href', linkHref);
          a.textContent = text;
          return a;
        };
        // Unsplash's prescribed credit is TWO links — the photographer's
        // name to their profile (credit-href) and 'Unsplash' to the
        // homepage. Render that split whenever the text has the canonical
        // shape; other text keeps the legacy single-link rendering.
        const m = /^Photo by (.+) on Unsplash$/.exec(credit);
        if (m) {
          this._credit.appendChild(document.createTextNode('Photo by '));
          this._credit.appendChild(href ? mkLink(m[1], href) : document.createTextNode(m[1]));
          this._credit.appendChild(document.createTextNode(' on '));
          this._credit.appendChild(mkLink('Unsplash', UNSPLASH_HOMEPAGE_HREF));
        } else if (href) {
          this._credit.appendChild(mkLink(credit, href));
        } else {
          this._credit.textContent = credit;
        }
      }
      this.toggleAttribute('data-credit', showCredit);
    }
  }
  if (!customElements.get('image-slot')) {
    customElements.define('image-slot', ImageSlot);
  }
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/hermeneuta-app/image-slot.js", error: String((e && e.message) || e) }); }

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Modal = __ds_scope.Modal;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.StepTabs = __ds_scope.StepTabs;

__ds_ns.Card = __ds_scope.Card;

})();
