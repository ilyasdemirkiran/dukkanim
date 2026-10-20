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
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../theme/colors';
import { formatCurrency } from '../services/api';
import { Sale } from '../types/sale';
import { X, Printer, Share2, Receipt, CheckCircle, Sparkles, FileText } from 'lucide-react-native';
import { OttomanTughraLogo } from './OttomanGraphics';
import { showToast } from '../services/toast';

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';

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
  const [isGeneratingPdf, setIsGeneratingPdf] = React.useState(false);

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

  const generateReceiptHtml = () => {
    const itemsHtml = (sale.items || [])
      .map(
        (item) => `
        <tr>
          <td style="padding: 8px 4px; border-bottom: 1px dashed #e2e8f0; font-size: 13px; color: #1e293b;">
            <strong>${item.productName}</strong>
            ${
              item.discountAmount > 0
                ? `<div style="font-size: 11px; color: #ef4444; margin-top: 2px;">(-${formatCurrency(item.discountAmount)} ind.)</div>`
                : ''
            }
          </td>
          <td style="padding: 8px 4px; border-bottom: 1px dashed #e2e8f0; text-align: center; font-size: 13px; color: #475569;">
            ${item.quantity} ${item.unitName || 'Adet'}
          </td>
          <td style="padding: 8px 4px; border-bottom: 1px dashed #e2e8f0; text-align: right; font-size: 13px; font-weight: 700; color: #0b4f6c;">
            ${formatCurrency(item.netTotal)}
          </td>
        </tr>
      `
      )
      .join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Satış Fişi - ${sale.saleNumber}</title>
          <style>
            @page {
              margin: 15mm;
              size: A4 portrait;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              color: #0f172a;
              background-color: #ffffff;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 580px;
              margin: 0 auto;
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 24px;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #0b4f6c;
              padding-bottom: 16px;
              margin-bottom: 16px;
            }
            .logo-circle {
              width: 54px;
              height: 54px;
              border-radius: 27px;
              background-color: #f0f9ff;
              border: 2px solid #0b4f6c;
              color: #0b4f6c;
              font-weight: 900;
              font-size: 22px;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 8px auto;
              line-height: 54px;
            }
            .company-name {
              font-size: 20px;
              font-weight: 900;
              color: #0b4f6c;
              letter-spacing: 1.5px;
              margin: 0;
            }
            .tagline {
              font-size: 12px;
              color: #64748b;
              margin-top: 4px;
              font-weight: 500;
            }
            .meta-section {
              margin-bottom: 16px;
              font-size: 13px;
              background-color: #f8fafc;
              padding: 12px 14px;
              border-radius: 8px;
            }
            .meta-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 6px;
            }
            .meta-row:last-child {
              margin-bottom: 0;
            }
            .meta-label {
              color: #64748b;
              font-weight: 500;
            }
            .meta-val {
              font-weight: 700;
              color: #0f172a;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 8px;
              margin-bottom: 16px;
            }
            th {
              font-size: 12px;
              text-transform: uppercase;
              color: #64748b;
              padding: 8px 4px;
              border-bottom: 1.5px solid #cbd5e1;
              text-align: left;
            }
            .totals {
              border-top: 2px dashed #cbd5e1;
              padding-top: 12px;
              margin-top: 12px;
            }
            .tot-row {
              display: flex;
              justify-content: space-between;
              font-size: 13px;
              margin-bottom: 6px;
              color: #475569;
            }
            .tot-grand {
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 18px;
              font-weight: 900;
              color: #0b4f6c;
              border-top: 2px solid #0b4f6c;
              padding-top: 10px;
              margin-top: 10px;
            }
            .grand-amount {
              color: #10b981;
            }
            .footer-msg {
              text-align: center;
              margin-top: 28px;
              padding-top: 16px;
              border-top: 1px dashed #cbd5e1;
              color: #64748b;
              font-size: 12px;
            }
            .footer-msg strong {
              color: #0b4f6c;
              display: block;
              margin-bottom: 4px;
              font-size: 13px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo-circle">ÖZ</div>
              <h1 class="company-name">ÖZYURT ZAHİRE</h1>
              <div class="tagline">Toptan & Perakende Zahirecilik - Satış Fişi</div>
            </div>

            <div class="meta-section">
              <div class="meta-row">
                <span class="meta-label">Fiş Numarası:</span>
                <span class="meta-val">${sale.saleNumber}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">Düzenleme Tarihi:</span>
                <span class="meta-val">${saleDateFormatted}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">Müşteri / Cari:</span>
                <span class="meta-val">${cariTitle}</span>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th style="width: 50%;">Kalem</th>
                  <th style="width: 25%; text-align: center;">Miktar</th>
                  <th style="width: 25%; text-align: right;">Tutar</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div class="totals">
              <div class="tot-row">
                <span>Ara Toplam (Brüt):</span>
                <span>${formatCurrency(sale.totalGross)}</span>
              </div>
              ${
                sale.totalDiscount > 0
                  ? `<div class="tot-row" style="color: #ef4444;">
                      <span>Toplam İndirim:</span>
                      <span>-${formatCurrency(sale.totalDiscount)}</span>
                    </div>`
                  : ''
              }
              <div class="tot-row">
                <span>Toplam KDV:</span>
                <span>+${formatCurrency(sale.totalVat)}</span>
              </div>
              <div class="tot-grand">
                <span>ÖDENECEK TUTAR:</span>
                <span class="grand-amount">${formatCurrency(sale.grandTotal)}</span>
              </div>
            </div>

            <div class="footer-msg">
              <strong>Bizi tercih ettiğiniz için teşekkür ederiz!</strong>
              İyi günlerde kullanınız.
            </div>
          </div>
        </body>
      </html>
    `;
  };

  const handleSharePdf = async () => {
    try {
      setIsGeneratingPdf(true);
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        showToast.warning('Uyarı', 'Bu cihazda dosya paylaşımı desteklenmiyor.');
        return;
      }

      const html = generateReceiptHtml();
      
      // Android Expo Go ortamında Print.printToFileAsync geçici dosya okuma izin hatasını
      // aşmak için base64: true olarak üretip doğrudan kendi dosya dizinimize yazıyoruz.
      const file = await Print.printToFileAsync({
        html,
        base64: true,
      });

      const safeFileName = `Satis_Fisi_${sale.saleNumber || Date.now()}.pdf`.replace(/[^a-zA-Z0-9._-]/g, '_');
      const targetDirectory = FileSystem.documentDirectory || FileSystem.cacheDirectory;
      const targetUri = `${targetDirectory}${safeFileName}`;

      if (file.base64) {
        await FileSystem.writeAsStringAsync(targetUri, file.base64, {
          encoding: FileSystem.EncodingType.Base64,
        });
      }

      await Sharing.shareAsync(targetUri, {
        mimeType: 'application/pdf',
        dialogTitle: `Satış Fişi - ${sale.saleNumber}`,
        UTI: 'com.adobe.pdf',
      });
      showToast.success('Başarılı', 'PDF fişi hazırlandı.');
    } catch (err: any) {
      console.error('PDF paylaşım hatası:', err);
      showToast.error('Hata', 'PDF oluşturulurken veya paylaşılırken hata meydana geldi.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

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

  const handleShareText = async () => {
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

          {/* Aksiyon Butonları (PDF Gönder & Metin Paylaş) */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.pdfBtn, isGeneratingPdf && styles.btnDisabled]}
              onPress={handleSharePdf}
              disabled={isGeneratingPdf}
              activeOpacity={0.8}
            >
              {isGeneratingPdf ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <FileText size={18} color="#FFFFFF" />
              )}
              <Text style={styles.pdfBtnText}>
                {isGeneratingPdf ? 'PDF Hazırlanıyor...' : 'PDF Olarak Gönder'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.textShareBtn}
              onPress={handleShareText}
              activeOpacity={0.8}
            >
              <Share2 size={18} color={COLORS.primary} />
              <Text style={styles.textShareBtnText}>Metin Paylaş</Text>
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
    flexDirection: 'row',
    gap: 10,
  },
  pdfBtn: {
    flex: 1.6,
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
  pdfBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  textShareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    paddingVertical: 14,
  },
  textShareBtnText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  btnDisabled: {
    opacity: 0.7,
  },
});

