import React, {useEffect, useRef, useState} from 'react';
import {Text} from 'react-native-paper';

/**
 * AnimatedMetric — animates a numeric value from 0 to target on mount or value change.
 * For non-numeric values (currency strings, percentages with special chars), set isNumeric=false.
 */
const AnimatedMetric = ({
  value,
  prefix = '',
  suffix = '',
  style,
  isNumeric = true,
  duration = 900,
  decimals = 0,
}) => {
  const numeric = parseFloat(String(value).replace(/[^0-9.]/g, '')) || 0;
  const [displayed, setDisplayed] = useState(isNumeric ? 0 : value);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!isNumeric) {
      setDisplayed(value);
      return;
    }

    const start = Date.now();
    const animate = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = numeric * eased;
      setDisplayed(decimals > 0 ? current.toFixed(decimals) : Math.round(current));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(rafRef.current);
  }, [numeric, isNumeric, duration, decimals, value]);

  return (
    <Text style={style}>
      {prefix}
      {isNumeric ? displayed : value}
      {suffix}
    </Text>
  );
};

export default AnimatedMetric;
