import React, { useMemo, useState } from 'react';
import { SafeAreaView, View, Text, TextInput, ScrollView, Pressable, Alert, StatusBar } from 'react-native';

const GREEN = '#176B45';
const initialShops = [
  { id: 's1', name: 'بقالة أبو علي', area: 'حي الرشيدية', open: '07:00', close: '23:00', active: true, approved: true, delivery: true, products: [
    { id: 'p1', name: 'ماء معدني 1.5 لتر', price: 500, stock: true },
    { id: 'p2', name: 'خبز صمون', price: 250, stock: true },
    { id: 'p3', name: 'حليب', price: 1000, stock: true }
  ]},
  { id: 's2', name: 'أسواق الرشيدية', area: 'حي الرشيدية', open: '08:00', close: '22:00', active: true, approved: true, delivery: false, products: [
    { id: 'p4', name: 'رز 1 كغم', price: 2000, stock: true },
    { id: 'p5', name: 'بيض', price: 3000, stock: false }
  ]}
];
const money = n => `${n.toLocaleString('en-US')} د.ع`;
const addOneMonth = dateString => { const d = new Date(`${dateString}T12:00:00`); if (Number.isNaN(d.getTime())) return ''; d.setMonth(d.getMonth()+1); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
const todayString = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
const dateIsFuture = dateString => Boolean(dateString) && dateString >= todayString();

function Btn({ title, onPress, secondary=false, danger=false, small=false }) {
  return <Pressable onPress={onPress} style={{backgroundColor: danger ? '#FCE8E8' : secondary ? '#EAF2ED' : GREEN, paddingVertical: small ? 8 : 12, paddingHorizontal: 13, borderRadius: 12, alignItems:'center', marginTop: 7}}><Text style={{color: danger ? '#B42318' : secondary ? GREEN : 'white', fontWeight:'700', fontSize: small ? 12 : 14}}>{title}</Text></Pressable>;
}
function Field({ value, onChangeText, placeholder, keyboardType }) {
  return <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} keyboardType={keyboardType || 'default'} placeholderTextColor="#8A948D" style={{backgroundColor:'#F6F8F6', borderWidth:1, borderColor:'#E1E8E2', borderRadius:12, padding:12, textAlign:'right', marginTop:8, color:'#17251D'}}/>;
}
function Section({ title, children }) { return <View style={{backgroundColor:'white', borderRadius:18, padding:15, marginBottom:12, borderWidth:1, borderColor:'#E7ECE8'}}><Text style={{fontSize:17, fontWeight:'800', color:'#183526', textAlign:'right', marginBottom:8}}>{title}</Text>{children}</View>; }

export default function App() {
  const [tab, setTab] = useState('shops');
  const [shops, setShops] = useState(initialShops.map(s => ({...s, subscriptionUntil:'', payments:[]})));
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [orderType, setOrderType] = useState('delivery');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [newShopName, setNewShopName] = useState('');
  const [newProductShop, setNewProductShop] = useState('s1');
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newOpen, setNewOpen] = useState('07:00');
  const [newClose, setNewClose] = useState('23:00');
  const [feeNotice, setFeeNotice] = useState(true);
  const [launchDate, setLaunchDate] = useState('');
  const [launchDateDraft, setLaunchDateDraft] = useState('');
  const [paymentShopId, setPaymentShopId] = useState('s1');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentAmount, setPaymentAmount] = useState('1000');
  const [paymentNote, setPaymentNote] = useState('');

  const trialEndDate = launchDate ? addOneMonth(launchDate) : '';
  const trialIsActive = Boolean(trialEndDate) && todayString() >= launchDate && todayString() < trialEndDate;
  const shopSubscriptionValid = shop => !launchDate || todayString() < launchDate || trialIsActive || dateIsFuture(shop.subscriptionUntil);
  const visibleShops = useMemo(() => shops.filter(s => s.active && s.approved && shopSubscriptionValid(s) && (s.name.includes(query.trim()) || s.products.some(p => p.name.includes(query.trim())))), [shops, query, launchDate]);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const updateShop = (id, updater) => setShops(old => old.map(s => s.id === id ? updater(s) : s));
  const addToCart = (shop, product) => {
    setCart(old => {
      const found = old.find(x => x.productId === product.id);
      if (found) return old.map(x => x.productId === product.id ? {...x, qty:x.qty+1} : x);
      return [...old, {productId:product.id, shopId:shop.id, shopName:shop.name, name:product.name, price:product.price, qty:1}];
    });
    Alert.alert('انضاف للسلة', `${product.name} — ${money(product.price)}`);
  };
  const submitOrder = () => {
    if (!cart.length) return Alert.alert('السلة فارغة', 'أضف منتجات قبل تأكيد الطلب.');
    if (!customerName.trim() || !customerPhone.trim() || (orderType === 'delivery' && !customerAddress.trim())) return Alert.alert('أكمل البيانات', 'اكتب الاسم ورقم الهاتف' + (orderType === 'delivery' ? ' والعنوان.' : '.'));
    Alert.alert('نموذج الطلب جاهز', `المجموع: ${money(cartTotal)}\nالطريقة: ${orderType === 'delivery' ? 'توصيل' : 'استلام من المحل'}\nالدفع: نقداً عند الاستلام\n\nهذه نسخة تجريبية؛ الطلب لا يُرسل فعلياً إلى البقال بعد.`);
  };
  const addShop = () => {
    if (!newShopName.trim()) return Alert.alert('اكتب اسم المحل');
    setShops(old => [...old, {id:`s${Date.now()}`, name:newShopName.trim(), area:'حي الرشيدية', open:newOpen, close:newClose, active:true, approved:false, delivery:true, subscriptionUntil:'', payments:[], products:[]}]);
    setNewShopName('');
    Alert.alert('تم تسجيل المحل', 'تمت إضافته بحالة بانتظار موافقة المدير.');
  };
  const addProduct = () => {
    const price = Number(newProductPrice);
    if (!newProductName.trim() || !Number.isFinite(price) || price <= 0) return Alert.alert('تحقق من البيانات', 'اكتب اسم المنتج وسعراً صحيحاً.');
    updateShop(newProductShop, s => ({...s, products:[...s.products, {id:`p${Date.now()}`, name:newProductName.trim(), price, stock:true}]}));
    setNewProductName(''); setNewProductPrice('');
    Alert.alert('تمت الإضافة', 'أضيف المنتج محلياً في هذه النسخة التجريبية.');
  };
  const saveLaunchDate = () => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(launchDateDraft) || Number.isNaN(new Date(`${launchDateDraft}T12:00:00`).getTime())) return Alert.alert('تاريخ غير صحيح', 'اكتب التاريخ بصيغة YYYY-MM-DD، مثال 2026-11-01.');
    setLaunchDate(launchDateDraft);
    Alert.alert('تم حفظ تاريخ الإطلاق', `الشهر المجاني محسوب من ${launchDateDraft} إلى ${addOneMonth(launchDateDraft)}.`);
  };
  const recordPayment = () => {
    const amount = Number(paymentAmount);
    const shop = shops.find(s => s.id === paymentShopId);
    if (!shop) return Alert.alert('اختَر المحل أولاً');
    if (amount !== 1000) return Alert.alert('تحقق من المبلغ', 'رسوم الاشتراك المحددة هي 1000 دينار عراقي لكل شهر.');
    const baseDate = dateIsFuture(shop.subscriptionUntil) ? shop.subscriptionUntil : todayString();
    const newExpiry = addOneMonth(baseDate);
    if (!newExpiry) return Alert.alert('تعذّر حساب تاريخ التجديد');
    updateShop(shop.id, s => ({...s, subscriptionUntil:newExpiry, payments:[...(s.payments || []), {id:`pay${Date.now()}`, amount, method:paymentMethod, date:todayString(), expiresAt:newExpiry, note:paymentNote.trim()}]}));
    setPaymentNote('');
    Alert.alert('تم تسجيل الدفع', `المحل: ${shop.name}\nالمبلغ: ${money(amount)}\nطريقة الدفع: ${paymentMethod === 'cash' ? 'نقداً' : 'زين كاش'}\nينتهي الاشتراك: ${newExpiry}`);
  };
  const askDelete = shop => Alert.alert('حذف المحل نهائياً؟', `سيُزال ${shop.name} من قائمة النسخة التجريبية.`, [{text:'إلغاء', style:'cancel'}, {text:'حذف', style:'destructive', onPress:()=>setShops(old=>old.filter(s=>s.id!==shop.id))}]);

  return <SafeAreaView style={{flex:1, backgroundColor:'#F5F7F4'}}><StatusBar barStyle="dark-content" backgroundColor="#F5F7F4"/>
    <View style={{paddingHorizontal:18, paddingTop:12, paddingBottom:8, flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
      <View><Text style={{fontSize:27, fontWeight:'900', color:GREEN, textAlign:'right'}}>دكّان 🛒</Text><Text style={{fontSize:12, color:'#68776D', textAlign:'right'}}>بقالين حي الرشيدية — الموصل</Text></View>
      <View style={{backgroundColor:'#E3EFE7', padding:10, borderRadius:14}}><Text style={{fontSize:12, color:GREEN, fontWeight:'800'}}>نسخة تجريبية</Text></View>
    </View>
    <View style={{flexDirection:'row', paddingHorizontal:12, gap:6, marginBottom:8}}>
      {[['shops','المحلات'],['cart','السلة'],['merchant','للبقال'],['admin','الإدارة']].map(([id,label])=><Pressable key={id} onPress={()=>setTab(id)} style={{flex:1, paddingVertical:10, borderRadius:12, backgroundColor:tab===id?GREEN:'white', borderWidth:1, borderColor:tab===id?GREEN:'#E1E8E2'}}><Text style={{textAlign:'center', color:tab===id?'white':'#42554A', fontWeight:'700', fontSize:12}}>{label}{id==='cart' && cart.length ? ` (${cart.length})`:''}</Text></Pressable>)}
    </View>
    <ScrollView contentContainerStyle={{padding:14, paddingBottom:35}} keyboardShouldPersistTaps="handled">
      {tab==='shops' && <>
        <Section title="تسوّق من بقالين منطقتك"><Text style={{textAlign:'right', color:'#637168', lineHeight:21}}>تصفح المنتجات والأسعار، واختر التوصيل أو الاستلام من المحل.</Text><Field value={query} onChangeText={setQuery} placeholder="ابحث عن محل أو منتج..."/></Section>
        {visibleShops.length===0 && <Section title="ماكو نتائج"><Text style={{textAlign:'right'}}>جرّب كلمة بحث ثانية.</Text></Section>}
        {visibleShops.map(shop=><Section key={shop.id} title={shop.name}>
          <Text style={{textAlign:'right', color:'#68776D'}}>📍 {shop.area}  •  🕒 {shop.open} – {shop.close}</Text>
          <Text style={{textAlign:'right', color:shop.active?'#20754A':'#B42318', fontWeight:'700', marginTop:6}}>{shop.active?'● المحل متاح':'● المحل معطّل'}</Text>
          {shop.products.map(p=><View key={p.id} style={{paddingVertical:10, borderBottomWidth:1, borderBottomColor:'#EEF1EE', flexDirection:'row', alignItems:'center', justifyContent:'space-between', gap:10}}><View style={{flex:1}}><Text style={{textAlign:'right', color:'#24382C', fontWeight:'700'}}>{p.name}</Text><Text style={{textAlign:'right', color:GREEN, marginTop:4}}>{money(p.price)}{!p.stock?'  •  غير متوفر':''}</Text></View><Btn small title={p.stock?'أضف +':'غير متوفر'} secondary onPress={()=>p.stock&&addToCart(shop,p)}/></View>)}
          {shop.products.length===0 && <Text style={{textAlign:'right', color:'#68776D'}}>ماكو منتجات مضافة حالياً.</Text>}
        </Section>)}
      </>}
      {tab==='cart' && <>
        <Section title="سلة المشتريات">{cart.length===0?<Text style={{textAlign:'right', color:'#68776D'}}>السلة فارغة. أضف منتجات من صفحة المحلات.</Text>:cart.map(item=><View key={item.productId} style={{paddingVertical:9, borderBottomWidth:1, borderBottomColor:'#EEF1EE'}}><Text style={{textAlign:'right', fontWeight:'700'}}>{item.name} × {item.qty}</Text><Text style={{textAlign:'right', color:GREEN}}>{money(item.price*item.qty)}</Text><Btn title="إزالة المنتج" danger small onPress={()=>setCart(old=>old.filter(x=>x.productId!==item.productId))}/></View>)}<Text style={{textAlign:'right', fontSize:18, fontWeight:'900', marginTop:12}}>المجموع: {money(cartTotal)}</Text></Section>
        <Section title="طريقة الاستلام"><View style={{flexDirection:'row', gap:8}}><View style={{flex:1}}><Btn title="توصيل" secondary={orderType!=='delivery'} onPress={()=>setOrderType('delivery')}/></View><View style={{flex:1}}><Btn title="استلام من المحل" secondary={orderType!=='pickup'} onPress={()=>setOrderType('pickup')}/></View></View><Text style={{textAlign:'right', marginTop:12, color:'#68776D'}}>الدفع: نقداً عند الاستلام. الدفع الإلكتروني يمكن إضافته لاحقاً.</Text></Section>
        <Section title="بيانات الطلب"><Field value={customerName} onChangeText={setCustomerName} placeholder="الاسم"/><Field value={customerPhone} onChangeText={setCustomerPhone} placeholder="رقم الهاتف" keyboardType="phone-pad"/>{orderType==='delivery'&&<Field value={customerAddress} onChangeText={setCustomerAddress} placeholder="العنوان داخل حي الرشيدية"/>}<Btn title="تأكيد الطلب التجريبي" onPress={submitOrder}/></Section>
      </>}
      {tab==='merchant' && <>
        <Section title="تسجيل محل جديد"><Text style={{textAlign:'right', color:'#68776D', lineHeight:21}}>التسجيل يحتاج موافقة المدير قبل ظهور المحل للزبائن.</Text><Field value={newShopName} onChangeText={setNewShopName} placeholder="اسم البقالة"/><Field value={newOpen} onChangeText={setNewOpen} placeholder="وقت الفتح (مثال 07:00)"/><Field value={newClose} onChangeText={setNewClose} placeholder="وقت الإغلاق (مثال 23:00)"/><Btn title="إرسال المحل للموافقة" onPress={addShop}/></Section>
        <Section title="إضافة منتج إلى محل"><Text style={{textAlign:'right', color:'#68776D'}}>اختر المحل ثم اكتب اسم المنتج وسعره بالدينار.</Text>{shops.map(s=><Pressable key={s.id} onPress={()=>setNewProductShop(s.id)} style={{padding:10, marginTop:6, borderRadius:10, borderWidth:1, borderColor:newProductShop===s.id?GREEN:'#E1E8E2', backgroundColor:newProductShop===s.id?'#EAF2ED':'white'}}><Text style={{textAlign:'right', color:newProductShop===s.id?GREEN:'#34473A'}}>{newProductShop===s.id?'✓ ':''}{s.name}</Text></Pressable>)}<Field value={newProductName} onChangeText={setNewProductName} placeholder="اسم المنتج"/><Field value={newProductPrice} onChangeText={setNewProductPrice} placeholder="السعر بالدينار" keyboardType="numeric"/><Btn title="إضافة المنتج" onPress={addProduct}/></Section>
      </>}
      {tab==='admin' && <>
        <Section title="لوحة إدارة دكّان"><Text style={{textAlign:'right', color:'#68776D'}}>هذه لوحة نموذجية. لا توجد بعد حسابات مدير محمية أو قاعدة بيانات مشتركة.</Text><Text style={{textAlign:'right', marginTop:10, fontWeight:'800'}}>المحلات المسجلة: {shops.length}</Text><Text style={{textAlign:'right', fontWeight:'800', marginTop:5}}>بانتظار الموافقة: {shops.filter(s=>!s.approved).length}</Text></Section>
        <Section title="إعداد الشهر المجاني"><Text style={{textAlign:'right', color:'#4A5A50', lineHeight:22}}>حدّد تاريخ الإطلاق الرسمي مرة واحدة. أول شهر من هذا التاريخ مجاني لكل المحلات، وبعده يلزم اشتراك 1000 دينار لكل محل شهرياً.</Text><Field value={launchDateDraft} onChangeText={setLaunchDateDraft} placeholder="تاريخ الإطلاق YYYY-MM-DD (مثال 2026-11-01)"/><Btn title="حفظ تاريخ الإطلاق" onPress={saveLaunchDate}/><Text style={{textAlign:'right', marginTop:8, color:'#68776D'}}>تاريخ الإطلاق المحفوظ: {launchDate || 'لم يُحدّد بعد'}{launchDate ? ` • نهاية الشهر المجاني: ${trialEndDate}` : ''}</Text><Text style={{textAlign:'right', marginTop:5, color:trialIsActive?'#20754A':'#68776D', fontWeight:'700'}}>{!launchDate?'حدّد تاريخ الإطلاق لتفعيل حساب المدة.':trialIsActive?'الشهر المجاني فعّال حالياً.':'انتهى الشهر المجاني أو لم يبدأ بعد؛ يلزم اشتراك ساري لإظهار المحل.'}</Text></Section>
        <Section title="تسجيل اشتراك / دفع يدوي"><Text style={{textAlign:'right', color:'#68776D', lineHeight:21}}>استلم المبلغ بنفسك نقداً أو تأكد من وصول تحويل زين كاش، ثم سجّل الدفع هنا. تسجيله يمدّد الاشتراك شهراً إضافياً.</Text>{shops.map(s=><Pressable key={s.id} onPress={()=>setPaymentShopId(s.id)} style={{padding:10, marginTop:6, borderRadius:10, borderWidth:1, borderColor:paymentShopId===s.id?GREEN:'#E1E8E2', backgroundColor:paymentShopId===s.id?'#EAF2ED':'white'}}><Text style={{textAlign:'right', color:paymentShopId===s.id?GREEN:'#34473A'}}>{paymentShopId===s.id?'✓ ':''}{s.name}</Text></Pressable>)}<Text style={{textAlign:'right', fontWeight:'700', marginTop:10}}>طريقة الدفع</Text><View style={{flexDirection:'row', gap:8}}><View style={{flex:1}}><Btn title="نقداً" secondary={paymentMethod!=='cash'} onPress={()=>setPaymentMethod('cash')}/></View><View style={{flex:1}}><Btn title="زين كاش" secondary={paymentMethod!=='zaincash'} onPress={()=>setPaymentMethod('zaincash')}/></View></View><Field value={paymentAmount} onChangeText={setPaymentAmount} placeholder="المبلغ بالدينار (1000)" keyboardType="numeric"/><Field value={paymentNote} onChangeText={setPaymentNote} placeholder="ملاحظة اختيارية / رقم العملية"/><Btn title="تأكيد الدفع وتجديد شهر" onPress={recordPayment}/></Section>
        {shops.map(shop=><Section key={shop.id} title={shop.name}><Text style={{textAlign:'right', color:'#68776D'}}>الحالة: {shop.approved?'موافق عليه':'بانتظار الموافقة'} • {shop.active?'مفعّل':'معطّل'}</Text><Text style={{textAlign:'right', marginTop:7, color:shopSubscriptionValid(shop)?'#20754A':'#B42318', fontWeight:'700'}}>الاشتراك: {!launchDate?'بانتظار تحديد تاريخ الإطلاق':trialIsActive?'مجاني خلال الشهر الأول':dateIsFuture(shop.subscriptionUntil)?`مدفوع لغاية ${shop.subscriptionUntil}`:'منتهي / غير مدفوع'}</Text><Text style={{textAlign:'right', marginTop:4, color:'#68776D'}}>عدد الدفعات المسجّلة: {(shop.payments || []).length}</Text>{(shop.payments || []).slice().reverse().slice(0,3).map(pay=><Text key={pay.id} style={{textAlign:'right', marginTop:4, color:'#68776D'}}>• {pay.date} — {money(pay.amount)} — {pay.method==='cash'?'نقداً':'زين كاش'} — صالح لغاية {pay.expiresAt}{pay.note?` — ${pay.note}`:''}</Text>)}{!shop.approved&&<Btn title="الموافقة على المحل" onPress={()=>updateShop(shop.id,s=>({...s,approved:true}))}/>}<Btn title={shop.active?'تعطيل المحل مؤقتاً':'إعادة تفعيل المحل'} secondary onPress={()=>updateShop(shop.id,s=>({...s,active:!s.active}))}/><Btn title="حذف نهائي" danger onPress={()=>askDelete(shop)}/></Section>)}
      </>}
      <Text style={{textAlign:'center', color:'#8A948D', fontSize:11, marginTop:5}}>دكّان — نموذج أولي للتجربة • البيانات حالياً محفوظة داخل جلسة التطبيق فقط</Text>
    </ScrollView>
  </SafeAreaView>;
}
