import React, { useRef, useEffect } from 'react';

/**
 * LiquidGlassPanel - A clean, white-theme compatible card.
 * Uses LiquidGL CDN if `liquidGL` prop is explicitly set to true.
 */
export default function LiquidGlassPanel({
  children,
  className = '',
  variant = 'default',
  hover = true,
  liquidGL = false,
  as: Component = 'div',
  style = {},
  ...rest
}) {
  const panelRef = useRef(null);

  useEffect(() => {
    // Only init if liquidGL prop is true and the library is loaded
    if (!liquidGL || !panelRef.current || !window.liquidGL) return;

    // We generate a unique class precisely for this target
    const targetClass = `lgl-target-${Math.random().toString(36).substring(2, 9)}`;
    panelRef.current.classList.add(targetClass);

    try {
      const instance = window.liquidGL({
        target: `.${targetClass}`,
        snapshot: "body",
        resolution: 1.5,
        reveal: "fade",
        refraction: 0.05,
        bevelDepth: 0.02,
        bevelWidth: 0.05,
        frost: 8,
        shadow: false,
        specular: true,
        magnify: 1.05,
      });

      return () => {
        if (instance && typeof instance.destroy === 'function') {
          instance.destroy();
        }
      };
    } catch (e) {
      console.warn("LiquidGL Init failed:", e);
    }
  }, [liquidGL]);

  const variantClass = variant === 'strong'
    ? 'liquid-glass--strong'
    : variant === 'subtle'
      ? 'liquid-glass--subtle'
      : '';

  const hoverClass = hover ? '' : 'liquid-glass--no-hover';

  return (
    <Component
      ref={panelRef}
      className={`liquid-glass ${variantClass} ${hoverClass} ${className}`.trim()}
      style={style}
      {...rest}
    >
      <div style={{ position: 'relative', zIndex: 10 }}>
        {children}
      </div>
    </Component>
  );
}
