import React from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Share,
  Alert,
} from 'react-native';
import { COLORS } from '../theme/colors';
import { formatCurrency } from '../services/api';
import { Sale } from '../types/sale';
import { X, Printer, Share2, Receipt, CheckCircle, Sparkles } from 'lucide-react-native';
import { OttomanTughraLogo } from './OttomanGraphics';
import { showToast } from '../services/toast';

interface SaleReceiptModalProps {
  visible: boolean;
  sale: Sale;
  onClose: () => void;
}

export const SaleReceiptModal: React.FC<SaleReceiptModalProps> = ({
  visible,
  sale,
  onClose,
}) => {
  if (!sale) return null;

  const cariTitle =
    sale.currentAccountId?.title || sale.currentAccountSnapshot?.title || 'Genel Müşteri';

  const saleDateFormatted = new Date(sale.createdAt || sale.date).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const generateReceiptText = () => {
    let text = `================================\n`;
    text += `       ÖZYURT ZAHİRE       \n`;
    text += `       SATIŞ BİLGİ FİŞİ     \n`;
    text += `================================\n`;
    text += `Fiş No: ${sale.saleNumber}\n`;
    text += `Tarih : ${saleDateFormatted}\n`;
    text += `Müşteri: ${cariTitle}\n`;
    text += `--------------------------------\n`;
    text += `ÜRÜN                MİKTAR  TUTAR\n`;
    text += `--------------------------------\n`;

    sale.items?.forEach((item) => {
      const name = item.productName.padEnd(16).slice(0, 16);
      const qty = `${item.quantity} ${item.unitName || 'Adet'}`.padEnd(8);
      const total = formatCurrency(item.netTotal);
      text += `${name} ${qty} ${total}\n`;
      if (item.discountAmount > 0) {
        text += `  (İndirim: -${formatCurrency(item.discountAmount)})\n`;
      }
    });

    text += `--------------------------------\n`;
    text += `Ara Toplam (Brüt) : ${formatCurrency(sale.totalGross)}\n`;
    if (sale.totalDiscount > 0) {
      text += `Toplam İndirim    : -${formatCurrency(sale.totalDiscount)}\n`;
    }
    text += `Toplam KDV        : +${formatCurrency(sale.totalVat)}\n`;
    text += `================================\n`;
    text += `ÖDENECEK TUTAR    : ${formatCurrency(sale.grandTotal)}\n`;
    text += `================================\n`;
    text += `      Bizi Tercih Ettiğiniz     \n`;
    text += `       İçin Teşekkür Ederiz     \n`;
    text += `================================\n`;
    return text;
  };

  const handleShare = async () => {
    try {
      const content = generateReceiptText();
      await Share.share({
        message: content,
        title: `Satış Fişi - ${sale.saleNumber}`,
      });
    } catch (err: any) {
      showToast.error('Hata', 'Paylaşım yapılamadı.');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.backdropTouchable} activeOpacity={1} onPress={onClose} />

        <View style={styles.bottomSheetContainer}>
          {/* Tutamaç (Drag Handle Indicator) */}
          <View style={styles.handleBarContainer}>
            <View style={styles.handleBar} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Receipt size={22} color={COLORS.primary} />
              <View>
                <Text style={styles.headerTitle}>Satış Fişi</Text>
                <Text style={styles.headerSubtitle}>Önizleme ve Paylaşım</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <X size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Fiş İçerik Alanı (Kağıt Fiş Tasarımı) */}
          <ScrollView
            contentContainerStyle={styles.receiptScroll}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.paperReceipt}>
              {/* Fiş Başlığı */}
              <View style={styles.receiptHeader}>
                <OttomanTughraLogo size={34} />
                <Text style={styles.companyName}>ÖZYURT ZAHİRE</Text>
                <Text style={styles.receiptTagline}>Toptan & Perakende Zahirecilik</Text>
              </View>

              <View style={styles.dashedLine} />

              {/* Fiş Üst Bilgileri */}
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Fiş No:</Text>
                <Text style={styles.metaValue}>{sale.saleNumber}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Tarih:</Text>
                <Text style={styles.metaValue}>{saleDateFormatted}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Müşteri:</Text>
                <Text style={[styles.metaValue, { fontWeight: '800' }]}>{cariTitle}</Text>
              </View>

              <View style={styles.dashedLine} />

              {/* Kalemler Tablosu */}
              <View style={styles.itemsHeaderRow}>
                <Text style={[styles.itemColHeader, { flex: 2 }]}>Kalem</Text>
                <Text style={[styles.itemColHeader, { flex: 1, textAlign: 'center' }]}>Miktar</Text>
                <Text style={[styles.itemColHeader, { flex: 1, textAlign: 'right' }]}>Tutar</Text>
              </View>

              {sale.items?.map((item, idx) => (
                <View key={item._id || idx} style={styles.itemRow}>
                  <View style={{ flex: 2 }}>
                    <Text style={styles.itemName}>{item.productName}</Text>
                    {item.discountAmount > 0 && (
                      <Text style={styles.itemDiscountText}>
                        (-{formatCurrency(item.discountAmount)} ind.)
                      </Text>
                    )}
                  </View>
                  <Text style={[styles.itemQty, { flex: 1, textAlign: 'center' }]}>
                    {item.quantity} {item.unitName || 'Adet'}
                  </Text>
                  <Text style={[styles.itemPrice, { flex: 1, textAlign: 'right' }]}>
                    {formatCurrency(item.netTotal)}
                  </Text>
                </View>
              ))}

              <View style={styles.dashedLine} />

              {/* Alt Toplamlar */}
              <View style={styles.summaryLine}>
                <Text style={styles.summaryText}>Ara Toplam:</Text>
                <Text style={styles.summaryValue}>{formatCurrency(sale.totalGross)}</Text>
              </View>

              {sale.totalDiscount > 0 && (
                <View style={styles.summaryLine}>
                  <Text style={[styles.summaryText, { color: COLORS.error }]}>Toplam İndirim:</Text>
                  <Text style={[styles.summaryValue, { color: COLORS.error }]}>
                    -{formatCurrency(sale.totalDiscount)}
                  </Text>
                </View>
              )}

              <View style={styles.summaryLine}>
                <Text style={styles.summaryText}>Toplam KDV:</Text>
                <Text style={styles.summaryValue}>+{formatCurrency(sale.totalVat)}</Text>
              </View>

              <View style={styles.solidLine} />

              {/* Ödenecek Tutar */}
              <View style={styles.grandTotalLine}>
                <Text style={styles.grandTotalLabel}>ÖDENECEK:</Text>
                <Text style={styles.grandTotalValue}>{formatCurrency(sale.grandTotal)}</Text>
              </View>

              <View style={styles.dashedLine} />

              {/* Fiş Altı Teşekkür Mesajı */}
              <View style={styles.receiptFooter}>
                <Text style={styles.receiptFooterText}>Bizi tercih ettiğiniz için teşekkür ederiz!</Text>
                <Text style={styles.receiptFooterSub}>İyi günlerde kullanınız.</Text>
              </View>
            </View>
          </ScrollView>

          {/* Aksiyon Butonları (Paylaş & Kapat) */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.shareBtn} onPress={handleShare} activeOpacity={0.8}>
              <Share2 size={18} color="#FFFFFF" />
              <Text style={styles.shareBtnText}>Fişi Paylaş / Gönder</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  backdropTouchable: {
    flex: 1,
  },
  bottomSheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    maxHeight: '92%',
    paddingBottom: Platform.OS === 'ios' ? 32 : 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 24,
  },
  handleBarContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  handleBar: {
    width: 44,
    height: 4.5,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  receiptScroll: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  paperReceipt: {
    backgroundColor: '#FFFDF9',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  receiptHeader: {
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  companyName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0B4F6C',
    letterSpacing: 1,
  },
  receiptTagline: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '600',
  },
  dashedLine: {
    borderStyle: 'dashed',
    borderWidth: 0.75,
    borderColor: '#CBD5E1',
    marginVertical: 10,
  },
  solidLine: {
    borderWidth: 0.75,
    borderColor: '#0F172A',
    marginVertical: 8,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  metaLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  metaValue: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '600',
  },
  itemsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 6,
  },
  itemColHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 5,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  itemDiscountText: {
    fontSize: 11,
    color: COLORS.error,
    fontWeight: '500',
  },
  itemQty: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  summaryLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 12.5,
    color: '#64748B',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  grandTotalLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0B4F6C',
  },
  grandTotalValue: {
    fontSize: 19,
    fontWeight: '900',
    color: COLORS.positive,
  },
  receiptFooter: {
    alignItems: 'center',
    gap: 2,
    marginTop: 4,
  },
  receiptFooterText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0B4F6C',
  },
  receiptFooterSub: {
    fontSize: 11,
    color: '#94A3B8',
  },
  actionRow: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0B4F6C',
    borderRadius: 14,
    paddingVertical: 14,
    shadowColor: '#0B4F6C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  shareBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
