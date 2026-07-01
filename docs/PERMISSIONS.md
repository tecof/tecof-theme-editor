# Tecof Studio — İzinler ve Migration

Bu belge, node bazlı özellik izinlerinin (`Permissions`) nasıl çözümlendiğini ve
kayıtlı sayfa verisinin (`TecofDocument`) şema değişikliklerinde nasıl güvenle
yükseltileceğini (`MigrationConfig`) anlatır.

---

## 1. İzin modeli

İzinler **varsayılan olarak açıktır** (permissive-by-default); host'lar kısıtlamalara
bayrağı `false` yaparak **opt-in** olur:

```ts
interface Permissions {
  drag: boolean;      // Canvas + katmanlarda taşınabilir mi?
  delete: boolean;     // Tekli/toplu silme ve kesme
  duplicate: boolean;  // Çoğaltma ve yeni id ile yapıştırma
  edit: boolean;       // Inspector alanlarının düzenlenebilirliği
  [key: string]: boolean; // Host-özel ek izinler
}
```

Bir node'un efektif izinleri **dört katmanın** birleştirilmesiyle hesaplanır
(sonraki katman öncekini ezer):

```
DEFAULT_PERMISSIONS < config.permissions (global) < component.permissions < component.resolvePermissions(props)
```

```ts
const config = {
  permissions: { delete: false },        // global: hiçbir şey silinemez
  components: {
    Hero: {
      permissions: { delete: true },     // Hero için yeniden izin ver
      resolvePermissions: (props, ctx) => ({
        // Kilitli bölümlerde sürüklemeyi de kapat
        drag: !props.locked,
      }),
    },
  },
};
```

Bu kısıtlar **motor seviyesinde** uygulanır — yani yalnızca UI'da buton
gizlemekle kalmaz, klavye kısayolları (`⌘/Ctrl+D`, `Delete`) ve clipboard
işlemleri de aynı kurala uyar. Her çağrı noktası otomatik olarak
`getNodePermissions` üzerinden geçer.

**Önemli:** Eksik anahtarlar veya `resolvePermissions`'ın fırlattığı bir hata
izinleri **asla sıkılaştırmaz** — eksik/hatalı katman bir alttaki katmandan
devralınır. Bu, hatalı bir dinamik resolver'ın kullanıcıyı kilitlememesi için
bilinçli bir tasarım kararıdır.

## 2. Dinamik izinler — `resolvePermissions`

```ts
resolvePermissions?: (props: any, ctx: ResolveContext) => Partial<Permissions>;

interface ResolveContext {
  changed: Record<string, boolean>;     // Son resolve'dan beri değişen prop'lar
  lastProps: Record<string, any> | null; // Önceki prop anlık görüntüsü (ilk çalıştırmada null)
}
```

`ctx.changed` ve `ctx.lastProps`, yalnızca değişen alanlara göre hesap yapmak
isteyen resolver'lar için sağlanır (ör. sadece `status` değiştiğinde yeniden
hesapla).

## 3. Veri migration'ı — `MigrationConfig`

Registry'deki bir component type'ının adı veya prop şeması değiştiğinde,
**önceden kaydedilmiş** sayfa JSON'ları eski şemada kalır. `migrations`,
belge her yüklendiğinde/render edildiğinde (hem `TecofStudio` hem
`TecofRender` yolunda) bu belgeyi otomatik yükseltir:

```ts
interface MigrationConfig {
  version?: number;                                  // Hedef şema sürümü
  renameComponents?: Record<string, string>;         // { eskiType: yeniType }
  transformProps?: Record<string, (props: any) => any>; // Yeni type adına göre
  migrate?: (doc: TecofDocument) => TecofDocument;    // Son, serbest geçiş
}
```

```ts
const config = {
  migrations: {
    version: 2,
    renameComponents: {
      OldHero: "Hero", // "OldHero" tipi artık "Hero" olarak kaydedilecek
    },
    transformProps: {
      // Rename SONRASI tipe göre bakılır — yani burada "Hero" anahtarı kullanılır
      Hero: (props) => ({ ...props, title: props.headline ?? props.title }),
    },
    migrate: (doc) => {
      // Belge genelinde serbest bir son geçiş (ör. kök prop taşıma)
      return doc;
    },
  },
};
```

### Çalışma sırası

1. `renameComponents` ile her node'un `type` alanı değiştirilir.
2. **Yeni** (rename sonrası) type adına göre `transformProps[type]` çalışır —
   node `id`'si her zaman korunur.
3. Varsa tüm belgeye uygulanan özel `migrate(doc)` fonksiyonu çalışır.
4. `version` tanımlıysa, hedef sürüm `root.props._schemaVersion`'a yazılır.

### İdempotentlik

`version` verildiyse, `root.props._schemaVersion`'ı zaten o sürümde veya
üzerinde olan bir belge **dokunulmadan** döner — yani migration her
yüklemede tekrar tekrar çalışmaz. `version` verilmezse migration her seferinde
çalışır; bu durumda `transformProps`/`migrate` fonksiyonlarınızın kendi
başlarına idempotent olması gerekir (aynı belgeye ikinci kez uygulandığında
veri bozmamalı).

Bir `transformProps` veya `migrate` fonksiyonu **hata fırlatırsa**, o node/belge
değişmeden bırakılır — bir migration hatası tüm sayfayı kilitlemez.

> Zone anahtarları node **id**'sine göre tutulur (`nodeId:slotAdı`), type'a göre
> değil — bu yüzden bir `renameComponents` asla zone anahtarlarının yeniden
> yazılmasını gerektirmez.

---

İlgili kaynaklar: [`src/engine/permissions.ts`](../src/engine/permissions.ts) ·
[`src/engine/migrate.ts`](../src/engine/migrate.ts) ·
[ARCHITECTURE.md](../ARCHITECTURE.md)
