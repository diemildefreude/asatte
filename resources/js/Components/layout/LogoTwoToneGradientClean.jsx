import React, { useId } from 'react';

/**
 * LogoTwoToneGradientClean
 * 
 * Clean version of TwoToneGradient logo (without asatte.io text).
 * 1. Primary shapes (outer circle ring & doorway frame): Controlled by CSS `color` (fill="currentColor") or `color` prop.
 * 2. Secondary shapes (inner semi-circle & doorway gradient): Controlled by `secondaryColor` prop, or CSS variable `--logo-secondary-color`.
 */
export default function LogoTwoToneGradientClean({
  color,
  secondaryColor,
  className = '',
  ...props
}) {
  const rawId = useId();
  const uniqueId = rawId.replace(/:/g, '_');
  const gradientId = `linearGradient125_${uniqueId}`;
  const clipPathId = `clipPath22-4_${uniqueId}`;

  const primaryFill = color || 'currentColor';
  const secondaryFill = secondaryColor || 'var(--logo-secondary-color, #000080)';

  return (
    <svg
      className={className}
      viewBox="0 0 582.58978 529.39947"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      {...props}
    >
      <defs id="defs1">
        <clipPath clipPathUnits="userSpaceOnUse" id={clipPathId}>
          <path
            d="M 535.832,517.27067 317.72533,660.292 l 310.088,-81.18267 26.45067,-65.34266 -8.44933,-116.276 -98.72934,-0.024 z"
            id="path22-8-6"
          />
        </clipPath>
        <linearGradient
          id={gradientId}
          gradientUnits="userSpaceOnUse"
          gradientTransform="matrix(0,197.11951,197.11951,0,364.49603,346.67065)"
          x1="0"
          y1="0"
          x2="1"
          y2="0"
          spreadMethod="pad"
        >
          <stop stopColor={secondaryFill} stopOpacity="0" offset="0" />
          <stop stopColor={secondaryFill} stopOpacity="0.65" offset="0.35765961" />
          <stop stopColor={secondaryFill} stopOpacity="0.9" offset="0.56201202" />
          <stop stopColor={secondaryFill} stopOpacity="1" offset="0.65000927" />
          <stop stopColor={secondaryFill} stopOpacity="1" offset="1" />
        </linearGradient>
      </defs>
      <g id="layer-MC1" transform="translate(-90.794984,-22.710987)">
        {/* Primary Shapes (Outer Circle Ring & Doorway Frame) */}
        <path
          id="path10-7-3"
          d="m 388.81365,238.65986 c -37.65333,0 -68.176,-30.524 -68.176,-68.176 0,-37.65333 30.52267,-68.17733 68.176,-68.17733 37.652,0 68.176,30.524 68.176,68.17733 0,37.652 -30.524,68.176 -68.176,68.176 m 0,-153.05199 c -46.876,0 -84.876,37.99999 -84.876,84.87599 0,46.87467 38,84.87467 84.876,84.87467 46.876,0 84.876,-38 84.876,-84.87467 0,-46.876 -38,-84.87599 -84.876,-84.87599"
          fill={primaryFill}
          fillOpacity={1}
          fillRule="nonzero"
          stroke="none"
          strokeWidth={1.33333}
        />
        <path
          id="path12-1-7"
          d="m 536.43678,289.82298 23.856,-253.991993 74.99733,-0.596 18.24533,251.083993 -94.31866,232.99861 c -1.79467,4.2707 -2.64533,4.1094 -4.212,-0.252 l -10.34267,-35.2719 c -1.216,-4.0827 -5.572,-6.348 -9.61333,-4.9974 l -0.616,0.2054 c -4.912,1.6413 -7.55867,6.9573 -5.90933,11.8666 l 18.65733,56.384 c 2.44,6.3507 14.86933,6.5147 17.54267,0.2587 L 673.38478,289.00298 649.82744,23.009647 H 544.56345 v -0.29866 l -26.76534,257.494663 -361.93865,236.17334 -50.992,-26.836 -3.204,-0.832 c -2.092002,-0.5453 -4.328012,-0.1613 -6.094672,1.0853 -2.216,1.564 -3.81734,3.8587 -4.528,6.46 -0.70534,2.576 0.144,5.3334 2.07866,7.176 l 2.39734,2.2813 61.685332,32.7881 z"
          fill={primaryFill}
          fillOpacity={1}
          fillRule="nonzero"
          stroke="none"
          strokeWidth={1.33333}
        />

        {/* Secondary Shapes (Inner Semi-circle & Doorway Gradient) */}
        <path
          id="path11-6-8"
          d="m 320.63005,170.48333 c -10e-4,0.14933 -0.012,0.29733 -0.012,0.44667 0,37.65333 30.524,68.17733 68.17733,68.17733 37.652,0 68.176,-30.524 68.176,-68.17733 0,-0.14934 -0.0107,-0.29734 -0.0107,-0.44667 z"
          fill={secondaryFill}
          fillOpacity={1}
          fillRule="nonzero"
          stroke="none"
          strokeWidth={1.33333}
        />
        <g
          id="g21-8-4"
          clipPath={`url(#${clipPathId})`}
          transform="translate(-0.2104216,-226.90582)"
        >
          <path
            d="m 401.874,453.937 -163.58,-107.266 232.566,60.887 19.838,49.007 -6.337,87.207 -74.047,0.018 z"
            fill={`url(#${gradientId})`}
            stroke="none"
            id="path21-9-2"
            transform="matrix(1.3333333,0,0,-1.3333333,0,1122.52)"
          />
        </g>
      </g>
    </svg>
  );
}
