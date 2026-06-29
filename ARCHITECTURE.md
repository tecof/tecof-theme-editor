# Tecof Studio - Mimari ve Tasarım Belgesi (ARCHITECTURE.md)

Bu belge, `tecof-theme-editor` paketinde Puck editörünün yerine geçecek olan **Tecof Studio** (headless editör motoru + UI) için teknik mimari kararları, state yönetimini, entegrasyon noktalarını ve Puck'ın nasıl çıkartılacağını detaylandırmaktadır.

## 1. State Yönetimi ve Motor (EditorEngine)

Editör, tamamen headless (UI'dan bağımsız) ve test edilebilir bir mimariyle tasarlanacaktır. React UI sadece bu motorun yayınladığı veriyi tüketip olaylarını tetikleyecektir.

- **Kütüphane:** `zustand` + `immer` middleware.
  - *Neden?* `zustand` hafif, React dışında da erişilebilir ve re-render optimizasyonlarına açık bir yapı sunar. `immer` ile mutation gibi görünen kodlar yazılarak karmaşık ağaç güncellemeleri kolayca halledilir.
- **State Ağacı:**
  ```ts
  interface EditorState {
    document: TecofDocument;       // O anki aktif veri modeli
    history: {
      past: TecofDocument[];
      future: TecofDocument[];
    };
    selection: {
      selectedId: string | null;   // Seçili node
      hoveredId: string | null;    // Hover olan node
    };
    viewport: "desktop" | "tablet" | "mobile";
    // Metodlar (Immer aracılığıyla state güncelleyen)
    insertNode: (node: TecofNode, targetZone: string, index?: number) => void;
    removeNode: (id: string) => void;
    moveNode: (id: string, targetZone: string, index: number) => void;
    updateProps: (id: string, patch: any) => void;
    undo: () => void;
    redo: () => void;
    // ...
  }
  ```
- **Zone Modeli:** Puck ile tam uyumluluk için, `zones` nesnesi `[parentId]:[zoneName]` formatını koruyacaktır. Root içerikler ise doğrudan `content` dizisinde yaşayacaktır. Bir node silinirse, o node'a ait zone'lar ve altındaki tüm içerikler recursive olarak temizlenecektir (memory leak olmaması ve data integrity için).

## 2. Drag & Drop Stratejisi

- **Kütüphane:** `@dnd-kit/core` ve `@dnd-kit/sortable`
  - *Neden?* Modern, erişilebilir ve en önemlisi iframe sınırlarında çalışacak kadar esnek.
- **Uygulama:** 
  - Sol paneldeki bloklar draggable item (`useDraggable`) olarak işaretlenecektir.
  - Canvas üzerindeki drop zone'lar ve root alan droppable container (`useDroppable` / `SortableContext`) olacaktır.
  - Dnd-kit'in sensörleri iframe içinden dışarıya event fırlatırken özel bir konfigürasyona veya pointer transformasyonuna ihtiyaç duyabilir.

## 3. Canvas (iframe) Stratejisi

Canvas, stillerin izolasyonu ve responsive viewport testlerinin (Desktop/Tablet/Mobile) doğru yapılabilmesi için bir iframe içerisinde render edilmelidir.

- **Kütüphane:** Custom iframe wrapper + `ReactDOM.createPortal`.
- **Uygulama:** 
  - Host'taki bir div'in içine `<iframe>` yerleştirilecek.
  - iframe'in `contentDocument.body`'sine bir `createPortal` ile render işlemi yapılacak.
  - Host css'leri (özellikle tailwind tarzı global sıfırlayıcılar veya fontlar) iframe'in head kısmına bir `<style>` tagı ile basılacaktır (veya host uygulamanın styles.css dosyası link edilecektir).
  - Web component (Shadow DOM) kullanmamamızın nedeni, third-party kütüphanelerin popover/portal yapıları ile uyumsuzluk yaşamamak. iframe bu konuda daha güvenilir bir "kum havuzu" (sandbox) sunar.

## 4. Field Bağlantıları (Host Entegrasyonu)

Puck'ın `FieldLabel` bileşenine bağımlı olan Custom Field'lar (LanguageField, EditorField vb.), Puck silindiğinde kırılacaktır.

- **Plan:** `src/studio/fields-host/` altında `FieldLabel` ve `FieldRenderer` yazılacak. 
- Puck arayüzü ile uyumlu prop tiplerini (örn: `{ field, name, id, value, onChange, readOnly }`) birebir karşılayacak. Bu sayede host tarafındaki `create*Field` fonksiyonları hiçbir değişiklik gerektirmeden çalışmaya devam edecek. (Geriye Dönük Uyumluluk)

## 5. Puck'ın Çıkarılma Planı (Fazlandırma)

Geçiş güvenli olmak zorundadır.

1. **Paralel Geliştirme (Faz 1-9):** Yeni editör (`TecofStudio`) Puck'ın yerine değil, yanına `src/index.ts`'te ikinci bir export olarak eklenecek. Arayüz ve parite testleri `playground` üzerinde `TecofStudio` kullanılarak yapılacak.
2. **PostMessage Uyumluluğu:** TecofStudio, tıpkı `TecofEditor` gibi iframe eventlerini dinleyecek ve host'a `puck:save` vb. eventleri ateşleyecek (ismini aynı tutacağız, böylece host değişmeyecek).
3. **Puck'ın Silinmesi (Faz 10):** TecofStudio eksiksiz çalıştığı onaylandığında:
   - `TecofEditor`'ün içi tamamen silinip `TecofStudio` referansına yönlendirilecek.
   - `@puckeditor/core` dependency'si package.json'dan kaldırılacak.
   - Tüm field'lar yeni in-house `FieldLabel` üzerinden render edilmeye ayarlanacak.

## 6. Riskler ve Açık Sorular

- **Risk: Dnd-kit Iframe Çapraz Sürükleme:** Sol panel (host DOM) üzerinden sürüklenen bir bloğun, iframe içerisindeki (child DOM) dropzone'a bırakılması teknik zorluklar yaratabilir.
  - *Çözüm:* İhtiyaç halinde sürükleme başladığında iframe'in üzerine transparent bir overlay koyup koordinatları host üzerinden hesaplayıp state güncelleyebiliriz (Puck'ın yaptığı overlay taktiği).
- **Risk: Inline Editing (TipTap):** TipTap, focus ve blur işlemlerini iframe içinde ve dışında ayrı context'lerde yürütür. 
- **Açık Soru:** PostMessage protokolünde "Puck" prefix'ini ilelebet korumalı mıyız? (Evet, host değişmemesi için şimdilik tutulacak, içerde `Bridge` modülünde soyutlanacak.)

---
*Hazırlayan: Tecof Core Team (AI Architect)*
