import React from 'react';
import { BookOpen, MousePointerClick, PlusCircle, Type, LayoutGrid, Palette, Keyboard } from 'lucide-react';
import { useUiStore } from '../uiStore';
import { StudioDrawer } from '../ui/StudioDrawer';

/**
 * "Editör nasıl kullanılır?" kılavuzu — TopBar'daki ⓘ butonundan açılır
 * (StudioDrawer 'lg').
 *
 * Desen: NodeSettingsModal ile birebir (uiStore bayrağı + TecofStudio'da
 * koşulsuz mount; ESC/dış tıklama vaul'dan). İçerik statiktir ve editörün
 * GERÇEK davranışlarını anlatır; bir özellik değişirse burası da
 * güncellenmelidir (kısayollar TecofStudio.tsx'teki handler'la eşleşmeli).
 */

const SECTIONS: Array<{
  icon: React.ReactNode;
  title: string;
  items: string[];
}> = [
  {
    icon: <MousePointerClick size={15} />,
    title: 'Seçme ve düzenleme',
    items: [
      'Bir elemente tıklayın — doğrudan o element seçilir ve sağ panel alanına kaydırılır.',
      'Bölümün tamamını seçmek için bölümün boş bir alanına (elementlerin dışına) tıklayın; sağ panel içindeki tüm elementleri birlikte listeler.',
      'Üst öğeye çıkmak için: alt durum çubuğundaki yol (breadcrumb), sağ paneldeki "Üst Öğe" ya da soldaki Katmanlar.',
      'Cmd/Ctrl+tık ile birden çok öğe seçilir; Esc bir üst öğeye çıkar, kökteyken seçimi kaldırır.',
    ],
  },
  {
    icon: <PlusCircle size={15} />,
    title: 'Bölüm ve element ekleme',
    items: [
      'İki bölümün arasına gelince beliren çizgi + "Bölüm Ekle" piline tıklayın.',
      'Bir bölüm seçiliyken altında kalıcı "Bölüm Ekle" düğmesi görünür.',
      'Slot içindeki küçük yuvarlak "+" o alana element ekler; boş alanlar "Bileşen Ekle" ipucu gösterir.',
      'Bölüm Ekle penceresindeki "Sayfa Şablonları" sekmesi hazır tam sayfalar ekler — mevcut içerik silinmez, tek Geri Al ile kaldırılır.',
      'Kartlardaki renkli çipler tasarım varyantlarıdır: üzerine gelince önizleme değişir, tıklayınca o varyant eklenir.',
    ],
  },
  {
    icon: <Type size={15} />,
    title: 'Metin düzenleme',
    items: [
      'Metne çift tıklayın, yerinde yazın — Enter kaydeder, Esc iptal eder, dışarı tıklamak da kaydeder.',
      'Tekrarlı kartlarda (ör. hizmet listesi) karta tıklamak sağ panelde ilgili satırı açar; kart metnine çift tıklayıp o satırı yerinde düzenleyebilirsiniz.',
      'Zengin metinler (paragraflar) sağ paneldeki alanından biçimlendirilir.',
    ],
  },
  {
    icon: <LayoutGrid size={15} />,
    title: 'Taşıma ve yerleşim',
    items: [
      'Öğeleri sürükleyip bırakın — mavi çizgi nereye ineceğini gösterir.',
      'Üst bardaki boyutlandırma (R) seçili öğeye genişlik/yükseklik tutamaçları verir.',
      'Boşluk modu (B) padding/margin tutamaçlarını açar — kenarlardan sürükleyerek ayarlayın. Varsayılan kapalıdır.',
      'Izgara (G) hizalama kolonlarını gösterir.',
    ],
  },
  {
    icon: <Palette size={15} />,
    title: 'Stil ve tema',
    items: [
      'Sağ panel: İçerik (metin/görsel/bağlantı), Stil (boşluk, renk, yazı) ve Etkileşim sekmeleri.',
      'Hiçbir şey seçili değilken sağ panel Sayfa/Tema ayarlarını gösterir — tema renkleri tüm sitede geçerlidir ve kanvasta anlık izlenir.',
      'Sık kullanacağınız bir bölümü sağ tık → "Ortak bileşen olarak kaydet" ile kaydedin; bir kopyada yapılan düzenleme hepsine yayılır (mor çerçeve).',
    ],
  },
  {
    icon: <Keyboard size={15} />,
    title: 'Kısayollar',
    items: [
      '⌘Z / ⌘⇧Z — Geri al / Yinele · ⌘S — Taslağı kaydet',
      '⌘K — Komut paleti (ara: sayfalar, komutlar)',
      '⌘C / ⌘V / ⌘X — Öğeyi kopyala / yapıştır / kes (sayfalar arası çalışır) · ⌘D — Çoğalt',
      'G — Izgara · R — Boyutlandırma · B — Boşluk tutamaçları',
      'Ok tuşları — Seçili öğeyi kardeşleri arasında taşı',
      'Esc — Üst öğeye çık (kökte: seçimi kaldır) / pencereyi kapat · Delete — Seçili öğeyi sil',
    ],
  },
];

export const HelpModal: React.FC = () => {
  const open = useUiStore((s) => s.helpModalOpen);
  const setOpen = useUiStore((s) => s.setHelpModalOpen);

  return (
    <StudioDrawer
      open={open}
      onOpenChange={setOpen}
      size="lg"
      tone="primary"
      icon={<BookOpen size={22} />}
      title="Editör nasıl kullanılır?"
      description="Seçme, ekleme, taşıma, stil ve kısayollar — kısa kılavuz."
      className="tecof-help-drawer"
    >
      <div className="tecof-help-body">
        {SECTIONS.map((sec) => (
          <section key={sec.title} className="tecof-help-section">
            <h4 className="tecof-help-section-title">
              <span className="tecof-help-section-icon">{sec.icon}</span>
              {sec.title}
            </h4>
            <ul className="tecof-help-list">
              {sec.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </StudioDrawer>
  );
};

export default HelpModal;
