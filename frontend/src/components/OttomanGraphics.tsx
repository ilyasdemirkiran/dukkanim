import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path, Defs, Pattern, Rect, Circle, Text as SvgText } from 'react-native-svg';
import { COLORS } from '../theme/colors';

export const OttomanBackground: React.FC<{ opacity?: number }> = ({ opacity = 0.04 }) => {
  return (
    <View style={[StyleSheet.absoluteFill, { pointerEvents: 'none', zIndex: -1 }]} aria-hidden>
      <Svg height="100%" width="100%">
        <Defs>
          {/* Karadeniz Mavisi ve Doğa Yeşili ile zenginleştirilmiş geometrik Selçuklu/Osmanlı motifi */}
          <Pattern id="karadeniz-pattern" width="80" height="80" patternUnits="userSpaceOnUse">
            <Path
              d="M40 0 L48 24 L72 24 L52 38 L60 62 L40 48 L20 62 L28 38 L8 24 L32 24 Z"
              fill="none"
              stroke={COLORS.primary}
              strokeWidth="1.2"
              opacity={opacity}
            />
            <Path
              d="M40 10 C35 25, 25 30, 25 45 C25 55, 35 60, 40 60 C45 60, 55 55, 55 45 C55 30, 45 25, 40 10 Z"
              fill="none"
              stroke={COLORS.hover}
              strokeWidth="1"
              opacity={opacity * 1.5}
            />
            <Circle cx="0" cy="0" r="10" fill="none" stroke={COLORS.olive} strokeWidth="0.8" opacity={opacity} />
            <Circle cx="80" cy="0" r="10" fill="none" stroke={COLORS.olive} strokeWidth="0.8" opacity={opacity} />
            <Circle cx="0" cy="80" r="10" fill="none" stroke={COLORS.olive} strokeWidth="0.8" opacity={opacity} />
            <Circle cx="80" cy="80" r="10" fill="none" stroke={COLORS.olive} strokeWidth="0.8" opacity={opacity} />
          </Pattern>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#karadeniz-pattern)" />
      </Svg>
    </View>
  );
};

// ÖZYURT ZAHİRE için 'ÖZ' Monogram Logo
export const OttomanTughraLogo: React.FC<{ size?: number }> = ({ size = 70 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {/* Arka plan dolgusu */}
      <Circle cx="50" cy="50" r="48" fill="#F0F9FF" />

      {/* Dış Çember Karadeniz Mavisi & Açık Mavi İnce Çerçeve */}
      <Circle cx="50" cy="50" r="46" stroke={COLORS.primary} strokeWidth="3.5" />
      <Circle cx="50" cy="50" r="40" stroke="#BAE6FD" strokeWidth="1.5" strokeDasharray="3 3" />

      {/* 'ÖZ' Monogram Harfleri */}
      <SvgText
        x="50"
        y="62"
        fontSize="36"
        fontWeight="900"
        fill={COLORS.primary}
        textAnchor="middle"
        letterSpacing="1.5"
      >
        ÖZ
      </SvgText>
    </Svg>
  );
};
