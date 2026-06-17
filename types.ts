
export interface Restaurant {
  id: string;
  name: string;
  description?: string;
  address?: string;
  rating?: string;
  googleMapsUrl?: string;
  source: 'generic' | 'gemini' | 'manual';
}

export interface CustomList {
  id: string;
  name: string;
  items: Restaurant[];
}

export interface CityData {
  name: string;
  districts: string[];
}

export type FetchMode = 'NEARBY' | 'REGION' | 'FAVORITES' | 'GENERIC' | 'CUSTOM' | 'PRESET';

export const PRESET_CATEGORIES: Record<string, { label: string; items: Restaurant[] }> = {
  breakfast: {
    label: '早餐',
    items: [
      { id: 'brk-1', name: '蛋餅', source: 'generic', description: '酥脆或古早味粉漿蛋餅，台式早餐經典' },
      { id: 'brk-2', name: '燒餅油條', source: 'generic', description: '炭烤燒餅夾現炸油條，香氣四溢、極致酥脆' },
      { id: 'brk-3', name: '飯糰', source: 'generic', description: '香Ｑ糯米包酸菜、肉鬆與香酥油條' },
      { id: 'brk-4', name: '鐵板麵', source: 'generic', description: '黑胡椒或蘑菇醬鐵板麵，搭嫩豬排與半熟蛋' },
      { id: 'brk-5', name: '小籠包', source: 'generic', description: '薄皮多汁、鮮甜豬肉餡，配薑絲超對味' },
      { id: 'brk-6', name: '蘿蔔糕', source: 'generic', description: '煎至金黃焦香、外酥內嫩，沾上特製蒜蓉沾醬' },
      { id: 'brk-7', name: '肉包配豆漿', source: 'generic', description: '香甜濃郁熱豆漿，搭熱騰騰綿密的鮮肉包' },
      { id: 'brk-8', name: '咔啦雞腿堡', source: 'generic', description: '香脆咔啦雞腿排配嫩煎蛋與生菜，飽足感滿分' },
    ]
  },
  lunch: {
    label: '午餐',
    items: [
      { id: 'lun-1', name: '紅燒牛肉麵', source: 'generic', description: '濃郁紅燒大骨湯頭，配Ｑ彈手工麵與鮮嫩牛腱肉' },
      { id: 'lun-2', name: '經典滷肉飯', source: 'generic', description: '肥而不膩、膠質滿滿的北港經典滷汁，配半熟魯蛋' },
      { id: 'lun-3', name: '古早味排骨飯', source: 'generic', description: '厚切古早味炸排骨，香脆多汁，配三樣精緻小菜' },
      { id: 'lun-4', name: '嘉義雞肉飯', source: 'generic', description: '鮮嫩火雞肉絲淋上豬油、雞油與黃金紅蔥頭酥' },
      { id: 'lun-5', name: '乾意麵配餛飩湯', source: 'generic', description: '福州乾意麵，搭配皮薄餡多、湯頭清甜的餛飩湯' },
      { id: 'lun-6', name: '金黃脆皮鍋貼', source: 'generic', description: '酥脆金黃底皮、內餡肉汁飽滿的手工鮮肉韭菜鍋貼' },
      { id: 'lun-7', name: '皮蛋瘦肉粥', source: 'generic', description: '熬煮至綿密無米粒感的港式粥底，配油條、蔥花' },
      { id: 'lun-8', name: '招牌芝麻涼麵', source: 'generic', description: '香濃純芝麻醬冷麵伴脆口小黃瓜絲，夏日清爽首選' },
    ]
  },
  dinner: {
    label: '晚餐',
    items: [
      { id: 'din-1', name: '麻辣火鍋', source: 'generic', description: '暖胃麻辣鴨血豆腐，搭頂級雪花牛與現拉手工麵' },
      { id: 'din-2', name: '無骨雞腿鐵板燒', source: 'generic', description: '主廚現炒蜜汁香煎雞腿排，蒜香十足、配爆炒高麗菜' },
      { id: 'din-3', name: '濃郁豚骨拉麵', source: 'generic', description: '熬煮12小時的白濁豚骨高湯，特製溏心蛋與炙燒叉燒' },
      { id: 'din-4', name: '韓式部隊鍋', source: 'generic', description: '濃郁起司泡麵、午餐肉與小熱狗，微辣暖和聚餐首選' },
      { id: 'din-5', name: '握壽司刺身盛合', source: 'generic', description: '當季現撈鮮鮭、鮪魚刺身，搭配手工握壽司與烤鯖魚' },
      { id: 'din-6', name: '塩燒雞肉串居酒屋', source: 'generic', description: '炭火慢烤香嫩雞肉蔥串、醬烤手羽先，小酌放鬆首選' },
      { id: 'din-7', name: '家常熱炒海鮮', source: 'generic', description: '蔥爆牛肉、鳳梨蝦球、塔香蛤蜊大火快炒，最台的美味' },
      { id: 'din-8', name: '奶油培根義大利麵', source: 'generic', description: '濃郁白醬現炒義大利麵，撒上滿滿帕瑪森起司與焦香培根' },
    ]
  },
  snack: {
    label: '點心',
    items: [
      { id: 'snk-1', name: '紅豆餅', source: 'generic', description: '熱騰騰經典爆漿紅豆與黃金奶油車輪餅' },
      { id: 'snk-2', name: '鬆餅', source: 'generic', description: '現烤外酥內軟 Waffle 鬆餅，淋上蜂蜜或鮮奶油' },
      { id: 'snk-3', name: '刨冰', source: 'generic', description: '沁涼消暑刨冰，堆疊滿滿配料與香甜煉乳' },
      { id: 'snk-4', name: '豆花', source: 'generic', description: '綿密滑嫩傳統手工豆花，搭配柴燒香甜糖水' },
      { id: 'snk-5', name: '地瓜球', source: 'generic', description: '現炸金黃Ｑ彈地瓜球，外酥內軟、超療癒唰嘴' },
      { id: 'snk-6', name: '雞蛋糕', source: 'generic', description: '現烤香甜雞蛋糕，口感扎實、散發濃郁蛋香' },
      { id: 'snk-7', name: '湯圓', source: 'generic', description: '軟Q手工小湯圓或香甜爆漿芝麻花生大湯圓' },
      { id: 'snk-8', name: '麻糬', source: 'generic', description: '軟糯Q彈手工麻糬，沾裹滿滿香濃花生粉或芝麻粉' },
    ]
  },
  drink: {
    label: '飲料',
    items: [
      { id: 'drk-1', name: '蜂蜜綠茶', source: 'generic', description: '清新茉莉綠茶融入香甜天然蜂蜜，甜而不膩' },
      { id: 'drk-2', name: '甘蔗青茶', source: 'generic', description: '新鮮甘蔗原汁完美搭配高山青茶，清甜回甘' },
      { id: 'drk-3', name: '金萱青茶', source: 'generic', description: '自帶淡雅奶香的金萱茶葉，茶氣溫潤順口' },
      { id: 'drk-4', name: '蜜香紅茶拿鐵', source: 'generic', description: '莊園紅茶融入香甜鮮乳，尾韻帶有獨特清雅蜜香' },
      { id: 'drk-5', name: '冬瓜青茶', source: 'generic', description: '手工熬煮冬瓜露配上清新爽口的高山青茶' },
      { id: 'drk-6', name: '四季春茶', source: 'generic', description: '香氣高雅、茶湯金黃的經典台灣單品春茶，解膩首選' },
      { id: 'drk-7', name: '柳橙綠茶', source: 'generic', description: '現榨飽滿柳橙原汁搭配清新綠茶，果香酸甜怡人' },
      { id: 'drk-8', name: '冰淇淋紅茶', source: 'generic', description: '醇厚紅茶搭配一整顆香草冰淇淋，雙重滿足' },
      { id: 'drk-9', name: '決明子大麥', source: 'generic', description: '慢火烘焙大麥與香氣醇厚的決明子，爽口解渴、無咖啡因' },
      { id: 'drk-10', name: '炭焙烏龍茶', source: 'generic', description: '炭火深焙、茶韻濃厚甘醇的頂級高山烏龍' },
    ]
  },
  drink_shop: {
    label: '飲料店',
    items: [
      { id: 'shp-1', name: '麻古茶坊', source: 'generic', description: '芝芝系列、楊枝甘露果粒茶創始，新鮮鮮果茶王者' },
      { id: 'shp-2', name: '烏弄', source: 'generic', description: '高品質單品台灣茶，無糖也極其甘甜順口' },
      { id: 'shp-3', name: '五十嵐', source: 'generic', description: '台式手搖常青樹，1號四季春珍波椰是永恆經典' },
      { id: 'shp-4', name: '迷客夏', source: 'generic', description: '自家牧場產地直送鮮奶，招牌大甲芋頭鮮奶濃郁綿密' },
      { id: 'shp-5', name: '得正', source: 'generic', description: '主打高質感烏龍茶系列，獨特焙烏龍茶香細緻悠長' },
      { id: 'shp-6', name: '鶴茶樓', source: 'generic', description: '復古英倫風，紅茶紅茶專賣，招牌綺夢紅茶香氣濃郁' },
      { id: 'shp-7', name: '青山', source: 'generic', description: '質感文青風單品茶，選用優質在地茶葉細加焙製' },
      { id: 'shp-8', name: '大茗', source: 'generic', description: '酪梨奶蓋震撼登場，烤糖蕎麥茶清爽回甘人氣爆棚' },
      { id: 'shp-9', name: '白巷子', source: 'generic', description: '純白簡約設計，滿杯水果茶與芝士奶蓋真材實料' },
      { id: 'shp-10', name: '茶湯會', source: 'generic', description: '春水堂旗下品牌，主打觀音拿鐵與功夫碳焙茶' },
      { id: 'shp-11', name: '八曜和茶', source: 'generic', description: '極上和風穀物自然茶，無咖啡因柚香覺醒大暢銷' },
      { id: 'shp-12', name: '綠豆沙', source: 'generic', description: '綿密消暑古早味綠豆沙，搭配醇厚牛奶，夏日最佳聖品' },
    ]
  }
};

export const DEFAULT_CATEGORIES: Restaurant[] = [
  { id: '1', name: '日式料理', source: 'generic', description: '壽司、拉麵、丼飯' },
  { id: '2', name: '火鍋', source: 'generic', description: '麻辣鍋、涮涮鍋' },
  { id: '3', name: '韓式料理', source: 'generic', description: '炸雞、烤肉、拌飯' },
  { id: '4', name: '美式快餐', source: 'generic', description: '漢堡、披薩、薯條' },
  { id: '5', name: '台灣小吃', source: 'generic', description: '滷肉飯、牛肉麵' },
  { id: '6', name: '泰式料理', source: 'generic', description: '打拋豬、月亮蝦餅' },
  { id: '7', name: '義大利麵', source: 'generic', description: '燉飯、披薩' },
  { id: '8', name: '早午餐', source: 'generic', description: '吐司、班尼迪克蛋' },
];

export const TAIWAN_CITIES: CityData[] = [
  { 
    name: '基隆市', 
    districts: ['仁愛區', '信義區', '中正區', '中山區', '安樂區', '暖暖區', '七堵區'] 
  },
  { 
    name: '台北市', 
    districts: ['中正區', '大同區', '中山區', '松山區', '大安區', '萬華區', '信義區', '士林區', '北投區', '內湖區', '南港區', '文山區'] 
  },
  { 
    name: '新北市', 
    districts: ['板橋區', '三重區', '中和區', '永和區', '新莊區', '新店區', '土城區', '蘆洲區', '樹林區', '汐止區', '鶯歌區', '三峽區', '淡水區', '瑞芳區', '五股區', '泰山區', '林口區', '深坑區', '石碇區', '坪林區', '三芝區', '石門區', '八里區', '平溪區', '雙溪區', '貢寮區', '金山區', '萬里區', '烏來區'] 
  },
  { 
    name: '桃園市', 
    districts: ['桃園區', '中壢區', '平鎮區', '八德區', '楊梅區', '蘆竹區', '大溪區', '龍潭區', '龜山區', '大園區', '觀音區', '新屋區', '復興區'] 
  },
  { 
    name: '新竹市', 
    districts: ['東區', '北區', '香山區'] 
  },
  { 
    name: '新竹縣', 
    districts: ['竹北市', '竹東鎮', '新埔鎮', '關西鎮', '湖口鄉', '新豐鄉', '芎林鄉', '橫山鄉', '北埔鄉', '寶山鄉', '峨眉鄉', '尖石鄉', '五峰鄉'] 
  },
  { 
    name: '苗栗縣', 
    districts: ['苗栗市', '頭份市', '竹南鎮', '後龍鎮', '通霄鎮', '苑裡鎮', '卓蘭鎮', '造橋鄉', '西湖鄉', '頭屋鄉', '公館鄉', '銅鑼鄉', '三義鄉', '大湖鄉', '獅潭鄉', '三灣鄉', '南庄鄉', '泰安鄉'] 
  },
  { 
    name: '台中市', 
    districts: ['中區', '東區', '南區', '西區', '北區', '北屯區', '西屯區', '南屯區', '太平區', '大里區', '霧峰區', '烏日區', '豐原區', '后里區', '石岡區', '東勢區', '和平區', '新社區', '潭子區', '大雅區', '神岡區', '大肚區', '沙鹿區', '龍井區', '梧棲區', '清水區', '大甲區', '外埔區', '大安區'] 
  },
  { 
    name: '彰化縣', 
    districts: ['彰化市', '員林市', '和美鎮', '鹿港鎮', '溪湖鎮', '二林鎮', '田中鎮', '北斗鎮', '花壇鄉', '芬園鄉', '大村鄉', '永靖鄉', '社頭鄉', '二水鄉', '田尾鄉', '埤頭鄉', '芳苑鄉', '大城鄉', '竹塘鄉', '溪州鄉', '秀水鄉', '伸港鄉', '線西鄉', '福興鄉', '埔鹽鄉', '埔心鄉'] 
  },
  { 
    name: '南投縣', 
    districts: ['南投市', '埔里鎮', '草屯鎮', '竹山鎮', '集集鎮', '名間鄉', '鹿谷鄉', '中寮鄉', '魚池鄉', '國姓鄉', '水里鄉', '信義鄉', '仁愛鄉'] 
  },
  { 
    name: '雲林縣', 
    districts: ['斗六市', '斗南鎮', '虎尾鎮', '西螺鎮', '土庫鎮', '北港鎮', '古坑鄉', '大埤鄉', '莿桐鄉', '林內鄉', '二崙鄉', '崙背鄉', '麥寮鄉', '東勢鄉', '褒忠鄉', '臺西鄉', '元長鄉', '四湖鄉', '口湖鄉', '水林鄉'] 
  },
  { 
    name: '嘉義市', 
    districts: ['東區', '西區'] 
  },
  { 
    name: '嘉義縣', 
    districts: ['太保市', '朴子市', '布袋鎮', '大林鎮', '民雄鄉', '溪口鄉', '新港鄉', '六腳鄉', '東石鄉', '義竹鄉', '鹿草鄉', '水上鄉', '中埔鄉', '竹崎鄉', '梅山鄉', '番路鄉', '大埔鄉', '阿里山鄉'] 
  },
  { 
    name: '台南市', 
    districts: ['中西區', '東區', '南區', '北區', '安平區', '安南區', '永康區', '歸仁區', '新化區', '左鎮區', '玉井區', '楠西區', '南化區', '仁德區', '關廟區', '龍崎區', '官田區', '麻豆區', '佳里區', '西港區', '七股區', '將軍區', '學甲區', '北門區', '新營區', '後壁區', '白河區', '東山區', '六甲區', '下營區', '柳營區', '鹽水區', '善化區', '大內區', '山上區', '新市區', '安定區'] 
  },
  { 
    name: '高雄市', 
    districts: ['楠梓區', '左營區', '鼓山區', '三民區', '鹽埕區', '前金區', '新興區', '苓雅區', '前鎮區', '旗津區', '小港區', '鳳山區', '林園區', '大寮區', '大樹區', '大社區', '仁武區', '鳥松區', '岡山區', '橋頭區', '燕巢區', '田寮區', '阿蓮區', '路竹區', '湖內區', '茄萣區', '永安區', '彌陀區', '梓官區', '旗山區', '美濃區', '六龜區', '甲仙區', '杉林區', '內門區', '茂林區', '桃源區', '那瑪夏區'] 
  },
  { 
    name: '屏東縣', 
    districts: ['屏東市', '潮州鎮', '東港鎮', '恆春鎮', '萬丹鄉', '長治鄉', '麟洛鄉', '九如鄉', '里港鄉', '鹽埔鄉', '高樹鄉', '萬巒鄉', '內埔鄉', '竹田鄉', '新埤鄉', '枋寮鄉', '新園鄉', '崁頂鄉', '林邊鄉', '南州鄉', '佳冬鄉', '琉球鄉', '車城鄉', '滿州鄉', '枋山鄉', '三地門鄉', '霧臺鄉', '瑪家鄉', '泰武鄉', '來義鄉', '春日鄉', '獅子鄉', '牡丹鄉'] 
  },
  { 
    name: '宜蘭縣', 
    districts: ['宜蘭市', '羅東鎮', '蘇澳鎮', '頭城鎮', '礁溪鄉', '壯圍鄉', '員山鄉', '冬山鄉', '五結鄉', '三星鄉', '大同鄉', '南澳鄉'] 
  },
  { 
    name: '花蓮縣', 
    districts: ['花蓮市', '鳳林鎮', '玉里鎮', '新城鄉', '吉安鄉', '壽豐鄉', '光復鄉', '豐濱鄉', '瑞穗鄉', '富里鄉', '秀林鄉', '萬榮鄉', '卓溪鄉'] 
  },
  { 
    name: '台東縣', 
    districts: ['台東市', '成功鎮', '關山鎮', '卑南鄉', '大武鄉', '太麻里鄉', '東河鄉', '長濱鄉', '鹿野鄉', '池上鄉', '綠島鄉', '延平鄉', '海端鄉', '達仁鄉', '金峰鄉', '蘭嶼鄉'] 
  },
  { 
    name: '澎湖縣', 
    districts: ['馬公市', '湖西鄉', '白沙鄉', '西嶼鄉', '望安鄉', '七美鄉'] 
  },
  { 
    name: '金門縣', 
    districts: ['金城鎮', '金湖鎮', '金沙鎮', '金寧鄉', '烈嶼鄉', '烏坵鄉'] 
  },
  { 
    name: '連江縣', 
    districts: ['南竿鄉', '北竿鄉', '莒光鄉', '東引鄉'] 
  }
];
