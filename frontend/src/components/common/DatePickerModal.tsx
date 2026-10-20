import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday as checkIsToday,
  parseISO,
  isValid,
  subDays,
} from 'date-fns';
import { tr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from 'lucide-react-native';
import { COLORS } from '../../theme/colors';

interface DatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  selectedDate: string; // 'yyyy-MM-dd'
  onSelectDate: (dateStr: string) => void;
  title?: string;
}

export const DatePickerModal: React.FC<DatePickerModalProps> = ({
  visible,
  onClose,
  selectedDate,
  onSelectDate,
  title = 'Tarih Seçin',
}) => {
  // Parsed initial date for the calendar view month
  const initialDateObj = (() => {
    if (selectedDate && /^\d{4}-\d{2}-\d{2}$/.test(selectedDate)) {
      const parsed = parseISO(selectedDate);
      if (isValid(parsed)) return parsed;
    }
    return new Date();
  })();

  const [currentMonth, setCurrentMonth] = useState<Date>(initialDateObj);

  // Synchronize month view when modal opens with a selectedDate
  React.useEffect(() => {
    if (visible) {
      if (selectedDate && /^\d{4}-\d{2}-\d{2}$/.test(selectedDate)) {
        const parsed = parseISO(selectedDate);
        if (isValid(parsed)) {
          setCurrentMonth(parsed);
          return;
        }
      }
      setCurrentMonth(new Date());
    }
  }, [visible, selectedDate]);

  const activeSelectedObj = (() => {
    if (selectedDate && /^\d{4}-\d{2}-\d{2}$/.test(selectedDate)) {
      const parsed = parseISO(selectedDate);
      if (isValid(parsed)) return parsed;
    }
    return new Date();
  })();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Pazartesi ile başla
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'];

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, 1));
  };

  const handleSelectDay = (day: Date) => {
    const formatted = format(day, 'yyyy-MM-dd');
    onSelectDate(formatted);
    onClose();
  };

  const handleQuickSelectToday = () => {
    const today = new Date();
    handleSelectDay(today);
  };

  const handleQuickSelectYesterday = () => {
    const yesterday = subDays(new Date(), 1);
    handleSelectDay(yesterday);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <CalendarIcon size={18} color={COLORS.primary} />
              </View>
              <Text style={styles.title}>{title}</Text>
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={20} color={COLORS.textDark} />
            </TouchableOpacity>
          </View>

          {/* Quick Shortcuts */}
          <View style={styles.quickShortcuts}>
            <TouchableOpacity
              style={[
                styles.shortcutBtn,
                isSameDay(activeSelectedObj, new Date()) && styles.shortcutBtnActive,
              ]}
              onPress={handleQuickSelectToday}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.shortcutBtnText,
                  isSameDay(activeSelectedObj, new Date()) && styles.shortcutBtnTextActive,
                ]}
              >
                Bugün
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.shortcutBtn,
                isSameDay(activeSelectedObj, subDays(new Date(), 1)) && styles.shortcutBtnActive,
              ]}
              onPress={handleQuickSelectYesterday}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.shortcutBtnText,
                  isSameDay(activeSelectedObj, subDays(new Date(), 1)) && styles.shortcutBtnTextActive,
                ]}
              >
                Dün
              </Text>
            </TouchableOpacity>
          </View>

          {/* Month / Year Navigator */}
          <View style={styles.monthNav}>
            <TouchableOpacity
              style={styles.navBtn}
              onPress={handlePrevMonth}
              activeOpacity={0.7}
            >
              <ChevronLeft size={20} color={COLORS.primary} />
            </TouchableOpacity>

            <Text style={styles.monthText}>
              {format(currentMonth, 'MMMM yyyy', { locale: tr })}
            </Text>

            <TouchableOpacity
              style={styles.navBtn}
              onPress={handleNextMonth}
              activeOpacity={0.7}
            >
              <ChevronRight size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {/* Weekday Names */}
          <View style={styles.weekDaysRow}>
            {weekDays.map((name, index) => (
              <Text
                key={index}
                style={[
                  styles.weekDayText,
                  (index === 5 || index === 6) && styles.weekendText,
                ]}
              >
                {name}
              </Text>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={styles.daysGrid}>
            {calendarDays.map((day, idx) => {
              const isSelected = isSameDay(day, activeSelectedObj);
              const isCurrentM = isSameMonth(day, currentMonth);
              const isDayToday = checkIsToday(day);

              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.dayCell,
                    isSelected && styles.dayCellSelected,
                    !isSelected && isDayToday && styles.dayCellToday,
                  ]}
                  onPress={() => handleSelectDay(day)}
                  activeOpacity={0.6}
                >
                  <Text
                    style={[
                      styles.dayText,
                      !isCurrentM && styles.dayTextDisabled,
                      isDayToday && !isSelected && styles.dayTextToday,
                      isSelected && styles.dayTextSelected,
                    ]}
                  >
                    {format(day, 'd')}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Selected Date Summary Footer */}
          <View style={styles.footer}>
            <Text style={styles.selectedDateInfo}>
              Seçilen: {format(activeSelectedObj, 'd MMMM yyyy, EEEE', { locale: tr })}
            </Text>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 360,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EBF4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  closeBtn: {
    padding: 4,
  },
  quickShortcuts: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  shortcutBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutBtnActive: {
    backgroundColor: '#EBF4F6',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  shortcutBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  shortcutBtnTextActive: {
    color: COLORS.primary,
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  navBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  monthText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
    textTransform: 'capitalize',
  },
  weekDaysRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  weekendText: {
    color: '#D97706',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginVertical: 2,
  },
  dayCellSelected: {
    backgroundColor: COLORS.primary,
  },
  dayCellToday: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  dayText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textDark,
  },
  dayTextDisabled: {
    color: '#D1D5DB',
  },
  dayTextToday: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  dayTextSelected: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  footer: {
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    alignItems: 'center',
  },
  selectedDateInfo: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
});
