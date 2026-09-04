// ==UserScript==
// @name         斯皮奇养成 - 简体中文翻译
// @namespace    https://speakirpg.overture.io.kr/
// @version      0.2.9
// @description  为 Speaki RPG（斯皮奇养成）的菜单、任务、背包、商店、对话等动态界面提供简体中文翻译。
// @author       小奶茶
// @homepageURL  https://github.com/lchlzk/speakirpg-zh-cn
// @supportURL   https://github.com/lchlzk/speakirpg-zh-cn/issues
// @downloadURL  https://raw.githubusercontent.com/lchlzk/speakirpg-zh-cn/main/SpeakiRPG-zh-CN.user.js
// @updateURL    https://raw.githubusercontent.com/lchlzk/speakirpg-zh-cn/main/SpeakiRPG-zh-CN.user.js
// @match        https://speakirpg.overture.io.kr/*
// @run-at       document-start
// @sandbox      raw
// @noframes
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @grant        GM_addStyle
// @grant        unsafeWindow
// @license      MIT
// ==/UserScript==

(function () {
  "use strict";

  const SCRIPT_VERSION = "0.2.9";
  const SETTINGS_KEY = "speakirpg-zh-cn-settings-v1";
  const TRANSLATABLE_ATTRIBUTES = ["placeholder", "title", "aria-label", "alt"];
  const ATTRIBUTE_SELECTOR = TRANSLATABLE_ATTRIBUTES.map((name) => `[${name}]`).join(",");

  // 由游戏当前的韩/英/日语言包生成；每一项均为 [原文, 简体中文]。
  const LOCALIZED_ENTRIES = [
  [
    "You're all set! Leveling up and gearing up will make you stronger.\nCome find me anytime you need me — enjoy the adventure, Speaki!\nI'll still pop in with a tip now and then whenever you run into something new!\n\nInventory(bottom menu icon) · Equipment(bottom menu icon) · Quests(bottom menu icon) · Mailbox(bottom menu icon) · Ranking(bottom menu icon) · Attendance(bottom menu icon) · Chat(tap the input box) · Settings(bottom menu icon) · HP Potion(hotbar button) · Respawn(tap the revival prompt) · Jump(hotbar button) · Emote(hotbar button) · Reset camera(hotbar button) · top-right minimap · tap to talk · tap a nearby player to invite",
    "准备就绪！升级并穿戴装备，就能不断变强。\n需要帮助时随时来找我。祝你冒险愉快，斯皮奇！\n以后遇到新事物，我也会不时送上提示！\n\n背包（底部菜单图标） · 装备（底部菜单图标） · 任务（底部菜单图标） · 邮箱（底部菜单图标） · 排行榜（底部菜单图标） · 签到奖励（底部菜单图标） · 聊天（点按输入框） · 设置（底部菜单图标） · HP 药水（快捷栏按钮） · 复活（点按复活提示） · 跳跃（快捷栏按钮） · 表情动作（快捷栏按钮） · 重置镜头（快捷栏按钮） · 右上角小地图 · 点按进行对话 · 点按附近的玩家发送邀请"
  ],
  [
    "You're all set! Leveling up and gearing up will make you stronger.\nCome find me anytime you need me — enjoy the adventure, Speaki!\nI'll still pop in with a tip now and then whenever you run into something new!\n\n{legend_inventory} Inventory · {legend_equipment} Equipment · {legend_questlog} Quests · {legend_mailbox} Mailbox · {legend_ranking} Ranking · {legend_attendance} Attendance · {legend_chat} Chat · {legend_settings} Settings · {legend_potion} HP Potion · {legend_respawn} Respawn · {legend_jump} Jump · {legend_emote} Emote · {legend_cameraReset} Reset camera · top-right minimap · left-click to talk · right-click to invite",
    "准备就绪！升级并穿戴装备，就能不断变强。\n需要帮助时随时来找我。祝你冒险愉快，斯皮奇！\n以后遇到新事物，我也会不时送上提示！\n\n{legend_inventory} 背包 · {legend_equipment} 装备 · {legend_questlog} 任务 · {legend_mailbox} 邮箱 · {legend_ranking} 排行榜 · {legend_attendance} 签到奖励 · {legend_chat} 聊天 · {legend_settings} 设置 · {legend_potion} HP 药水 · {legend_respawn} 复活 · {legend_jump} 跳跃 · {legend_emote} 表情动作 · {legend_cameraReset} 重置镜头 · 右上角小地图 · 鼠标左键对话 · 鼠标右键邀请组队"
  ],
  [
    "Gearing Up for the Depths — So you're the one who answered the rescue call. Sent by the World Tree Temple, they said — you're in better shape than I expected. I'm Elena. Every scrap of Monatium's leftover work landed on me. Skip the introductions — you show up without a sound, just like a ghost, so that's what I'll call you. That's it for pleasantries. But here's where things change — were you really about to head out looking like that, ghost? Not a chance. Stop by the shop first and grab five. / {current}/{target}",
    "深入前的整备 — 你就是接到求救信后赶来的人吧。听说是世界树教团派来的，状态倒比我想象中好。我是艾琳娜，莫纳提姆的烂摊子全压在我身上。名字就免了；你出现时一点声音都没有，简直像个幽灵，我就这么叫你吧。寒暄到此为止。接下来可不一样——你该不会想就这副模样直接上路吧，幽灵？想都别想。先去商店买五件东西回来。 ｜ 进度：{current}/{target}"
  ],
  [
    "So you're the one who answered the rescue call. Sent by the World Tree Temple, they said — you're in better shape than I expected. I'm Elena. Every scrap of Monatium's leftover work landed on me. Skip the introductions — you show up without a sound, just like a ghost, so that's what I'll call you. That's it for pleasantries. But here's where things change — were you really about to head out looking like that, ghost? Not a chance. Stop by the shop first and grab five.",
    "你就是接到求救信后赶来的人吧。听说是世界树教团派来的，状态倒比我想象中好。我是艾琳娜，莫纳提姆的烂摊子全压在我身上。名字就免了；你出现时一点声音都没有，简直像个幽灵，我就这么叫你吧。寒暄到此为止。接下来可不一样——你该不会想就这副模样直接上路吧，幽灵？想都别想。先去商店买五件东西回来。"
  ],
  [
    "これで準備万端です!レベルを上げて装備を整えるともっと強くなれますよ。\n必要な時はいつでも私を訪ねてくださいね — 楽しい冒険を、スピキさん!\nこれからも新しいものに出会ったら、時々ヒントをお伝えしますね!\n\n{legend_inventory} インベントリ · {legend_equipment} 装備 · {legend_questlog} クエスト · {legend_mailbox} 郵便箱 · {legend_ranking} ランキング · {legend_attendance} ログインボーナス · {legend_chat} チャット · {legend_settings} 設定 · {legend_potion} HPポーション · {legend_respawn} 復活 · {legend_jump} ジャンプ · {legend_emote} エモート · {legend_cameraReset} カメラリセット · 右上のミニマップ · 左クリックで会話 · 右クリックで招待",
    "准备就绪！升级并穿戴装备，就能不断变强。\n需要帮助时随时来找我。祝你冒险愉快，斯皮奇！\n以后遇到新事物，我也会不时送上提示！\n\n{legend_inventory} 背包 · {legend_equipment} 装备 · {legend_questlog} 任务 · {legend_mailbox} 邮箱 · {legend_ranking} 排行榜 · {legend_attendance} 签到奖励 · {legend_chat} 聊天 · {legend_settings} 设置 · {legend_potion} HP 药水 · {legend_respawn} 复活 · {legend_jump} 跳跃 · {legend_emote} 表情动作 · {legend_cameraReset} 重置镜头 · 右上角小地图 · 鼠标左键对话 · 鼠标右键邀请组队"
  ],
  [
    "Wait, this is really important!\nThis is your account's recovery code — if your cookies get cleared or you sign in from another browser,\nthis code is the only way to recover your account.\nIt's effectively your account password — if you're streaming or sharing your screen, be careful not to show it!\nThat's why it's hidden for now. Press [{button}] to reveal it — and write it down now! (You can check it anytime from the Settings icon in the bottom menu)",
    "等一下，这件事非常重要！\n这是斯皮奇账号的恢复码。若 Cookie 被清除或改用其他浏览器，\n它将是找回账号的唯一凭证。\n恢复码和账号密码同样重要；直播或共享屏幕时，请务必避免泄露！\n恢复码目前处于隐藏状态。点击【{button}】查看后，请立即妥善保存。（之后也可从底部菜单的设置中再次查看。）"
  ],
  [
    "이제 준비 끝이에요! 레벨을 올리고 장비를 갖추시면 더 강해지실 거예요.\n필요하시면 언제든 저를 찾아와 주세요 — 즐거운 모험 되세요, 스피키씨!\n앞으로도 새로운 걸 만나시면 제가 가끔 팁을 알려드릴게요!\n\n{legend_inventory} 인벤토리 · {legend_equipment} 장비 · {legend_questlog} 퀘스트 · {legend_mailbox} 우편함 · {legend_ranking} 랭킹 · {legend_attendance} 출석 보상 · {legend_chat} 채팅 · {legend_settings} 설정 · {legend_potion} HP 포션 · {legend_respawn} 부활 · {legend_jump} 점프 · {legend_emote} 감정표현 · {legend_cameraReset} 카메라 리셋 · 우상단 미니맵 · 좌클릭 대화 · 우클릭 파티 초대",
    "准备就绪！升级并穿戴装备，就能不断变强。\n需要帮助时随时来找我。祝你冒险愉快，斯皮奇！\n以后遇到新事物，我也会不时送上提示！\n\n{legend_inventory} 背包 · {legend_equipment} 装备 · {legend_questlog} 任务 · {legend_mailbox} 邮箱 · {legend_ranking} 排行榜 · {legend_attendance} 签到奖励 · {legend_chat} 聊天 · {legend_settings} 设置 · {legend_potion} HP 药水 · {legend_respawn} 复活 · {legend_jump} 跳跃 · {legend_emote} 表情动作 · {legend_cameraReset} 重置镜头 · 右上角小地图 · 鼠标左键对话 · 鼠标右键邀请组队"
  ],
  [
    "Wait, this is really important!\nThis is your account's recovery code — if your cookies get cleared or you sign in from another browser,\nthis code is the only way to recover your account.\nIt's effectively your account password — if you're streaming or sharing your screen, be careful not to show it!\nThat's why it's hidden for now. Press [{button}] to reveal it — and write it down now! (You can check it anytime in Settings, key O)",
    "等一下，这件事非常重要！\n这是斯皮奇账号的恢复码。若 Cookie 被清除或改用其他浏览器，\n它将是找回账号的唯一凭证。\n恢复码和账号密码同样重要；直播或共享屏幕时，请务必避免泄露！\n恢复码目前处于隐藏状态。点击【{button}】查看后，请立即妥善保存。（之后也可在设置（O）中再次查看。）"
  ],
  [
    "これで準備万端です!レベルを上げて装備を整えるともっと強くなれますよ。\n必要な時はいつでも私を訪ねてくださいね — 楽しい冒険を、スピキさん!\nこれからも新しいものに出会ったら、時々ヒントをお伝えしますね!\n\nインベントリ(下部メニューアイコン) · 装備(下部メニューアイコン) · クエスト(下部メニューアイコン) · 郵便箱(下部メニューアイコン) · ランキング(下部メニューアイコン) · ログインボーナス(下部メニューアイコン) · チャット(入力欄をタップ) · 設定(下部メニューアイコン) · HPポーション(ホットバーボタン) · 復活(復活案内をタップ) · ジャンプ(ホットバーボタン) · エモート(ホットバーボタン) · カメラリセット(ホットバーボタン) · 右上のミニマップ · タップで会話 · 近くのプレイヤーをタップして招待",
    "准备就绪！升级并穿戴装备，就能不断变强。\n需要帮助时随时来找我。祝你冒险愉快，斯皮奇！\n以后遇到新事物，我也会不时送上提示！\n\n背包（底部菜单图标） · 装备（底部菜单图标） · 任务（底部菜单图标） · 邮箱（底部菜单图标） · 排行榜（底部菜单图标） · 签到奖励（底部菜单图标） · 聊天（点按输入框） · 设置（底部菜单图标） · HP 药水（快捷栏按钮） · 复活（点按复活提示） · 跳跃（快捷栏按钮） · 表情动作（快捷栏按钮） · 重置镜头（快捷栏按钮） · 右上角小地图 · 点按进行对话 · 点按附近的玩家发送邀请"
  ],
  [
    "이제 준비 끝이에요! 레벨을 올리고 장비를 갖추시면 더 강해지실 거예요.\n필요하시면 언제든 저를 찾아와 주세요 — 즐거운 모험 되세요, 스피키씨!\n앞으로도 새로운 걸 만나시면 제가 가끔 팁을 알려드릴게요!\n\n인벤토리(하단 메뉴 아이콘) · 장비(하단 메뉴 아이콘) · 퀘스트(하단 메뉴 아이콘) · 우편함(하단 메뉴 아이콘) · 랭킹(하단 메뉴 아이콘) · 출석 보상(하단 메뉴 아이콘) · 채팅(입력창 탭) · 설정(하단 메뉴 아이콘) · HP 포션(핫바 버튼) · 부활(부활 안내창 탭) · 점프(핫바 버튼) · 감정표현(핫바 버튼) · 카메라 리셋(핫바 버튼) · 우상단 미니맵 · 탭으로 대화 · 원격 플레이어 탭으로 초대",
    "准备就绪！升级并穿戴装备，就能不断变强。\n需要帮助时随时来找我。祝你冒险愉快，斯皮奇！\n以后遇到新事物，我也会不时送上提示！\n\n背包（底部菜单图标） · 装备（底部菜单图标） · 任务（底部菜单图标） · 邮箱（底部菜单图标） · 排行榜（底部菜单图标） · 签到奖励（底部菜单图标） · 聊天（点按输入框） · 设置（底部菜单图标） · HP 药水（快捷栏按钮） · 复活（点按复活提示） · 跳跃（快捷栏按钮） · 表情动作（快捷栏按钮） · 重置镜头（快捷栏按钮） · 右上角小地图 · 点按进行对话 · 点按附近的玩家发送邀请"
  ],
  [
    "The Dragonscale of the Sealed Altar — The dragonscale guardian sleeps beneath the Sealed Altar at the edge of the forest. You've warmed up a bit by now, haven't you? The sealed gate opens at level ten, so give it a knock. And if it's too much, don't force it — call in some companions first, Speaki. / {current}/{target}",
    "封印祭坛的龙鳞 — 龙鳞守卫沉睡在森林尽头的封印祭坛之下。你也差不多热好身了吧？达到十级后，封印门就会开启，不妨去敲敲看。若觉得吃力，千万别逞强，先召集同伴吧，斯皮奇。 ｜ 进度：{current}/{target}"
  ],
  [
    "What Sleeps Beneath the Statue — Beneath the graveyard altar, the gravekeeper statue wraith is still awake. Now that you've passed the great tomb-keeper spirit, it's that one's turn. The sealed gate opens at level twenty-eight, so… please go with companions this time, Speaki. / {current}/{target}",
    "沉睡于石像之下 — 墓园祭坛之下，守墓石像亡灵依然醒着。既然已经越过守墓大亡灵，接下来就轮到它了。达到二十八级后，封印门就会开启……这一次请务必与同伴同行，斯皮奇。 ｜ 进度：{current}/{target}"
  ],
  [
    "Equipped gear is excluded. Regardless of slot, all surplus gear is converted into tier-based points (pt) and consumed automatically starting from the lowest tier — the \"Materials: N pt\" cost below refers to this point total. Leftover points are banked and used first on your next enhancement.",
    "除已穿戴的装备外，其余装备都会按品级换算为材料点数（pt），并从最低品级开始自动消耗。下方的“材料 N pt”表示本次所需点数；多余点数会自动储存，供下次强化优先使用。"
  ],
  [
    "The Sealed Tyrant — The sealing altar deep in the valley has finally cracked open. Before the Ember Dragonscale Tyrant comes walking out… please gather companions and enter the altar. The sealed gate only opens at level thirty-seven. Never go alone, Speaki. / {current}/{target}",
    "被封印的暴君 — 山谷深处的封印祭坛终于破裂了。趁烬火龙鳞暴君还没走出来……请召集同伴进入祭坛。达到三十七级后，封印门才会开启。绝对不能独自前往，斯皮奇。 ｜ 进度：{current}/{target}"
  ],
  [
    "Into the Ironglow Chimney District — Next up is the Chimney District. Every chimney belches molten-iron smoke without a moment's pause. Get in there before you choke, ghost — dawdle, and the smoke will blot out the path ahead before anything else. / {current}/{target}",
    "前往铁辉烟囱区 — 接下来是铁辉烟囱区。每根烟囱都在不停喷出熔铁色的浓烟。趁窒息前赶紧进去，幽灵——再磨蹭，烟雾就要把前路遮得一干二净了。 ｜ 进度：{current}/{target}"
  ],
  [
    "Close the Watching Eyes — Every last one of these eyes is staring inward. Close just 200 of them, ghost. ...Do you feel that? Something's looking down over all of this, watching the depths. Let's shut the eyes before it looks straight at us. / {current}/{target}",
    "闭上监视之眼 — 这些眼珠全都盯着里面。让200只眼睛闭上吧，幽灵。……感觉到了吗？有什么东西正俯瞰着深处，操纵所有眼睛监视这里。趁它还没看向我们，先把这些眼睛关掉。 ｜ 进度：{current}/{target}"
  ],
  [
    "Furnace Core Golem — The Furnace Core Golem sits glowing red-hot in the middle of the district. Just standing near it, you can feel the heat rolling off in waves, ghost — mind your distance. Still, you have to get past it to reach the ridge. / {current}/{target}",
    "熔炉核心魔像 — 熔炉核心魔像正在区域中央烧得通红，光是站在旁边就能感到热浪扑面。幽灵，注意保持距离。可不越过它，就到不了山脊。 ｜ 进度：{current}/{target}"
  ],
  [
    "The dragonscale guardian sleeps beneath the Sealed Altar at the edge of the forest. You've warmed up a bit by now, haven't you? The sealed gate opens at level ten, so give it a knock. And if it's too much, don't force it — call in some companions first, Speaki.",
    "龙鳞守卫沉睡在森林尽头的封印祭坛之下。你也差不多热好身了吧？达到十级后，封印门就会开启，不妨去敲敲看。若觉得吃力，千万别逞强，先召集同伴吧，斯皮奇。"
  ],
  [
    "A unique item earned as a clear reward from the Sealed Prototype Gigant raid — a pumpkin-shaped attack drone called the Mecha Pumpkin that had lain dormant in the hangar, destined to one day be awakened as a drone companion (one per player, never consumed).",
    "通关封印原型巨像团队副本后获得的特殊道具。一架沉睡在机库中的南瓜形攻击无人机“机械南瓜”，未来可将其唤醒并收为伙伴。（每位玩家限持 1 个，使用后不会消耗。）"
  ],
  [
    "The Sealed Dragonscale — The dragonscale guardian lies sealed beneath the altar at the edge of the forest. The seal is shaking and the winds have turned wild, so please settle just ten gentle breeze spirits along the path to the altar. / {current}/{target}",
    "被封印的龙鳞 — 龙鳞守卫被封印在森林尽头的祭坛下。封印正在动摇，风势也变得狂暴了，请先平息祭坛路上的十只和风精灵。 ｜ 进度：{current}/{target}"
  ],
  [
    "Reaching the Derelict Railway — Gearing done? Then follow me, ghost. Ahead lies a derelict railway where only the signal lights still blink — wander off the rails and I couldn't tell you where you'd end up. Stay close and head inside. / {current}/{target}",
    "抵达旧信号铁路 — 整备完就跟上，幽灵。前面是只剩信号灯还在闪烁的旧信号铁路——偏离轨道会栽到哪里，连我也不知道。跟紧点，往里走。 ｜ 进度：{current}/{target}"
  ],
  [
    "Dismantle the Cutters — Cutters are running on every stretch of track. They'll sit still like they've stopped, then start right back up the moment you pass. Tear out just 155 of them, ghost — don't come whining to me if you botch it. / {current}/{target}",
    "拆除切割自动机 — 每条轨道上都有切割自动机在运转。它们会装作停下，等你经过时再突然启动。拆掉155台，幽灵——别笨手笨脚地弄伤自己，又跑来向我哭诉。 ｜ 进度：{current}/{target}"
  ],
  [
    "Wait, this is really important!\nThere's a recovery code that can restore your account — if your cookies get cleared or you sign in from another browser,\nthis code is the only way.\nBe sure to check it from the Settings icon in the bottom menu > Account!",
    "等一下，这件事非常重要！\n恢复码是找回斯皮奇账号的唯一凭证。若 Cookie 被清除或改用其他浏览器，没有恢复码就无法找回账号。\n请前往“底部菜单的设置 > 账号”查看并妥善保存！"
  ],
  [
    "Core Watchtower — This is the watchtower, ghost. It's the one that's been running every watching eye. Get past this and the power core is right there — a whole chapter rides on this one. If you can't handle it alone, say so now. / {current}/{target}",
    "深处监控塔 — 这就是那座监控塔，幽灵。所有监视之眼都受它操控。越过这里，动力核心就在眼前——整整一个章节都押在这一战上。一个人应付不了，就趁现在说。 ｜ 进度：{current}/{target}"
  ],
  [
    "Railway Conductor Ghost — The Railway Conductor holds the terminal station in an iron grip. Get past that old wreck, and the next zone's yours — say something if it's too much alone, ghost. ...Not that I'd help, or anything. / {current}/{target}",
    "旧铁路幽灵列车长 — 旧铁路幽灵列车长控制着终点站。越过那个破铜烂铁，就是下一个区域。一个人撑不住就说，幽灵。……我可没说会帮你。 ｜ 进度：{current}/{target}"
  ],
  [
    "Beneath the graveyard altar, the gravekeeper statue wraith is still awake. Now that you've passed the great tomb-keeper spirit, it's that one's turn. The sealed gate opens at level twenty-eight, so… please go with companions this time, Speaki.",
    "墓园祭坛之下，守墓石像亡灵依然醒着。既然已经越过守墓大亡灵，接下来就轮到它了。达到二十八级后，封印门就会开启……这一次请务必与同伴同行，斯皮奇。"
  ],
  [
    "Supplies for the Pilgrimage — Frostreach Pass is colder and farther than any road you've walked so far. Before you set out, please pick up just three things from my stall. Head out unprepared and you won't make it back. / {current}/{target}",
    "朝圣补给 — 霜星雪岭比你走过的任何道路都更加寒冷、遥远。出发前，请先在商店买好三样东西。毫无准备地上路，可就回不来了。 ｜ 进度：{current}/{target}"
  ],
  [
    "Climbing Thunder Pylon Ridge — This is Thunder Pylon Ridge. Current crackles just beneath your feet, so pick your steps carefully, ghost — plant a foot in the wrong spot and you'll regret it. Climb up onto the ridge. / {current}/{target}",
    "登上雷电塔岭 — 这里是雷电塔岭。电流就在脚下噼啪作响，每一步都要选好落脚点，幽灵——胡乱落脚可是会后悔的。登上山岭吧。 ｜ 进度：{current}/{target}"
  ],
  [
    "The sealing altar deep in the valley has finally cracked open. Before the Ember Dragonscale Tyrant comes walking out… please gather companions and enter the altar. The sealed gate only opens at level thirty-seven. Never go alone, Speaki.",
    "山谷深处的封印祭坛终于破裂了。趁烬火龙鳞暴君还没走出来……请召集同伴进入祭坛。达到三十七级后，封印门才会开启。绝对不能独自前往，斯皮奇。"
  ],
  [
    "The Molten Boundary — This is the Molten Boundary, ghost. The ground bubbles and melts underfoot here, so clear away just 190 of the things crossing past the line — cross it yourself, and don't count on coming back. / {current}/{target}",
    "熔融边界 — 这里是熔融边界，幽灵。脚下的大地正在咕嘟咕嘟地熔化。清除190只越过边界的家伙——你自己要是越线，就别指望能回来。 ｜ 进度：{current}/{target}"
  ],
  [
    "심부 진입 정비 — 네가 그 구조 요청 받고 왔다는 사람이군. 세계수 교단에서 보냈다더니, 생각보단 멀쩡하네. 난 엘레나 — 모나티엄 잔무는 죄다 내가 떠안고 있어. 이름은 됐고, 소리 없이 나타난 게 꼭 유령 같으니 그냥 그렇게 부를게. 인사는 여기까지야. 근데 여기서부턴 얘기가 달라 — 이 꼴로 그냥 나설 셈이었어, 유령? 어림도 없지. 상점부터 들러서 다섯 개는 챙겨 와. / 진행 {current}/{target}",
    "深入前的整备 — 你就是接到求救信后赶来的人吧。听说是世界树教团派来的，状态倒比我想象中好。我是艾琳娜，莫纳提姆的烂摊子全压在我身上。名字就免了；你出现时一点声音都没有，简直像个幽灵，我就这么叫你吧。寒暄到此为止。接下来可不一样——你该不会想就这副模样直接上路吧，幽灵？想都别想。先去商店买五件东西回来。 ｜ 进度：{current}/{target}"
  ],
  [
    "Into the Power Core Depths — This is the last stretch, ghost. The path down into the power core depths, its cooling long stopped, has opened. ...Well, I'm not worried. You've held on this far, after all. Head down. / {current}/{target}",
    "深入动力核心 — 这是最后一段路了，幽灵。通往动力核心深处的道路已经开启，那里的冷却系统早已停摆。……算了，我并不担心，毕竟你都撑到这里了。下去吧。 ｜ 进度：{current}/{target}"
  ],
  [
    "A Letter from Monatium — A distress call has come in from Monatium's city hall. They say you'll have to cross a forest of dusk blossoms along the old southern border road. (the southern edge of Sunbreeze Forest) / {current}/{target}",
    "来自莫纳提姆的信 — 莫纳提姆市政厅发来了求救信。要前往那里，必须沿南方旧边境道路，穿过开满晚霞花的森林。（晴风森林南端） ｜ 进度：{current}/{target}"
  ],
  [
    "잠깐만요, 아주 중요한 얘기예요!\n이건 스피키씨 계정의 복구 코드예요 — 쿠키가 지워지거나 다른 브라우저로 오시면\n이 코드만이 계정을 되찾을 유일한 방법이에요.\n이 코드는 계정 비밀번호나 다름없어요 — 방송이나 화면 공유 중이시라면 노출되지 않게 조심하세요!\n그래서 일단 가려뒀어요. [{button}]을 누르면 보여드릴게요 — 지금 꼭 메모해 두세요! (하단 메뉴의 설정 아이콘에서 언제든 다시 보실 수 있어요)",
    "等一下，这件事非常重要！\n这是斯皮奇账号的恢复码。若 Cookie 被清除或改用其他浏览器，\n它将是找回账号的唯一凭证。\n恢复码和账号密码同样重要；直播或共享屏幕时，请务必避免泄露！\n恢复码目前处于隐藏状态。点击【{button}】查看后，请立即妥善保存。（之后也可从底部菜单的设置中再次查看。）"
  ],
  [
    "ちょっと待って、とても大事な話です!\nこれはスピキさんのアカウントの復旧コードです — Cookieが消えたり別のブラウザでアクセスした場合、\nこのコードだけがアカウントを取り戻す唯一の方法です。\nこのコードはアカウントのパスワードに相当します — 配信や画面共有中なら、映り込まないよう気をつけてくださいね!\n今は隠してあるので、[{button}]を押せば表示されます — 今すぐメモしておいてくださいね!(下部メニューの設定アイコンでいつでも確認できます)",
    "等一下，这件事非常重要！\n这是斯皮奇账号的恢复码。若 Cookie 被清除或改用其他浏览器，\n它将是找回账号的唯一凭证。\n恢复码和账号密码同样重要；直播或共享屏幕时，请务必避免泄露！\n恢复码目前处于隐藏状态。点击【{button}】查看后，请立即妥善保存。（之后也可从底部菜单的设置中再次查看。）"
  ],
  [
    "Click the glowing skill slot to cast a spell! (Right now it's slot {slot}, {skillName}) The bar holds {slotCount} in total — the rest unlock at levels {unlockLevels}. Out of range is fine: you'll close in and cast automatically.",
    "点击发光的技能栏施放魔法吧！（当前是第 {slot} 栏的“{skillName}”。）技能栏共有 {slotCount} 个位置，其余技能会在 {unlockLevels} 级逐一解锁。即使距离过远也不用担心，角色会自动靠近目标后施放技能！"
  ],
  [
    "Factory Overseer Automaton — The Factory Overseer Automaton guards the last gate. Get past it, and Monatium is finally within reach, Speaki. ...From there on, it won't be me who greets you, but someone else. / {current}/{target}",
    "工业区监工自动机 — 工业区监工自动机守着最后一道门。只要越过它，就终于能抵达莫纳提姆了，斯皮奇。……从那里开始，迎接你的将不再是我，而是另一个人。 ｜ 进度：{current}/{target}"
  ],
  [
    "Threshold of the Root Hollow — Now it's the Root Hollow. Please break just a hundred and eighty of the root golems guarding the threshold. They're slow, but one twist of the ground shakes everything nearby. / {current}/{target}",
    "曙光根穴的入口 — 接下来是曙光根穴。请摧毁一百八十只把守入口的树根魔像。它们虽然迟缓，但只要扭动一次大地，四周都会震颤。 ｜ 进度：{current}/{target}"
  ],
  [
    "The Sealed Prototype Gigant — Deep in the factory, there's a sealing altar in the hangar. Hit level fifty and the gate'll probably open. Ghost, you're not planning to go alone, are you? Bring your friends. / {current}/{target}",
    "封印原型巨像 — 工业区深处的机库里有一座封印祭坛。到了50级，门应该就能打开。幽灵，你不会打算一个人去吧？先叫上同伴。 ｜ 进度：{current}/{target}"
  ],
  [
    "Wait, this is really important!\nThere's a recovery code that can restore your account — if your cookies get cleared or you sign in from another browser,\nthis code is the only way.\nBe sure to check it in Settings (O) > Account!",
    "等一下，这件事非常重要！\n恢复码是找回斯皮奇账号的唯一凭证。若 Cookie 被清除或改用其他浏览器，没有恢复码就无法找回账号。\n请前往“设置（O）> 账号”查看并妥善保存！"
  ],
  [
    "ちょっと待って、とても大事な話です!\nこれはスピキさんのアカウントの復旧コードです — Cookieが消えたり別のブラウザでアクセスした場合、\nこのコードだけがアカウントを取り戻す唯一の方法です。\nこのコードはアカウントのパスワードに相当します — 配信や画面共有中なら、映り込まないよう気をつけてくださいね!\n今は隠してあるので、[{button}]を押せば表示されます — 今すぐメモしておいてくださいね!(設定のOキーでいつでも確認できます)",
    "等一下，这件事非常重要！\n这是斯皮奇账号的恢复码。若 Cookie 被清除或改用其他浏览器，\n它将是找回账号的唯一凭证。\n恢复码和账号密码同样重要；直播或共享屏幕时，请务必避免泄露！\n恢复码目前处于隐藏状态。点击【{button}】查看后，请立即妥善保存。（之后也可在设置（O）中再次查看。）"
  ],
  [
    "To Frostreach Pass — I hear frost bear beastfolk have dug their dens at the mouth of the pass. Please drive off just a hundred and twenty. Once the snow catches your feet, there's no dodging those paws. / {current}/{target}",
    "前往霜星雪岭 — 听说冰霜熊人在雪岭入口筑了巢。请赶走一百二十只。一旦双脚陷进积雪，就躲不开它们的熊掌了。 ｜ 进度：{current}/{target}"
  ],
  [
    "잠깐만요, 아주 중요한 얘기예요!\n이건 스피키씨 계정의 복구 코드예요 — 쿠키가 지워지거나 다른 브라우저로 오시면\n이 코드만이 계정을 되찾을 유일한 방법이에요.\n이 코드는 계정 비밀번호나 다름없어요 — 방송이나 화면 공유 중이시라면 노출되지 않게 조심하세요!\n그래서 일단 가려뒀어요. [{button}]을 누르면 보여드릴게요 — 지금 꼭 메모해 두세요! (설정 O키에서 언제든 다시 보실 수 있어요)",
    "等一下，这件事非常重要！\n这是斯皮奇账号的恢复码。若 Cookie 被清除或改用其他浏览器，\n它将是找回账号的唯一凭证。\n恢复码和账号密码同样重要；直播或共享屏幕时，请务必避免泄露！\n恢复码目前处于隐藏状态。点击【{button}】查看后，请立即妥善保存。（之后也可在设置（O）中再次查看。）"
  ],
  [
    "The Furnace Core Golem sits glowing red-hot in the middle of the district. Just standing near it, you can feel the heat rolling off in waves, ghost — mind your distance. Still, you have to get past it to reach the ridge.",
    "熔炉核心魔像正在区域中央烧得通红，光是站在旁边就能感到热浪扑面。幽灵，注意保持距离。可不越过它，就到不了山脊。"
  ],
  [
    "深部進入の整備 — あんたがあの救援要請を受けて来た人か。世界樹教団から寄越されたって聞いたけど、思ったよりまともだね。私はエレナ——モナティウムの残務は全部私が被ってる。名乗りはいい、物音もなく現れるところがまるで幽霊みたいだから、そう呼ぶことにする。挨拶はここまでだよ。けど、ここから先は話が違う——その格好のまま出るつもりだった、幽霊? 甘いね。まずは商店に寄って五つは揃えてきな。 / 進行 {current}/{target}",
    "深入前的整备 — 你就是接到求救信后赶来的人吧。听说是世界树教团派来的，状态倒比我想象中好。我是艾琳娜，莫纳提姆的烂摊子全压在我身上。名字就免了；你出现时一点声音都没有，简直像个幽灵，我就这么叫你吧。寒暄到此为止。接下来可不一样——你该不会想就这副模样直接上路吧，幽灵？想都别想。先去商店买五件东西回来。 ｜ 进度：{current}/{target}"
  ],
  [
    "Every last one of these eyes is staring inward. Close just 200 of them, ghost. ...Do you feel that? Something's looking down over all of this, watching the depths. Let's shut the eyes before it looks straight at us.",
    "这些眼珠全都盯着里面。让200只眼睛闭上吧，幽灵。……感觉到了吗？有什么东西正俯瞰着深处，操纵所有眼睛监视这里。趁它还没看向我们，先把这些眼睛关掉。"
  ],
  [
    "Next up is the Chimney District. Every chimney belches molten-iron smoke without a moment's pause. Get in there before you choke, ghost — dawdle, and the smoke will blot out the path ahead before anything else.",
    "接下来是铁辉烟囱区。每根烟囱都在不停喷出熔铁色的浓烟。趁窒息前赶紧进去，幽灵——再磨蹭，烟雾就要把前路遮得一干二净了。"
  ],
  [
    "The dragonscale guardian lies sealed beneath the altar at the edge of the forest. The seal is shaking and the winds have turned wild, so please settle just ten gentle breeze spirits along the path to the altar.",
    "龙鳞守卫被封印在森林尽头的祭坛下。封印正在动摇，风势也变得狂暴了，请先平息祭坛路上的十只和风精灵。"
  ],
  [
    "This is the watchtower, ghost. It's the one that's been running every watching eye. Get past this and the power core is right there — a whole chapter rides on this one. If you can't handle it alone, say so now.",
    "这就是那座监控塔，幽灵。所有监视之眼都受它操控。越过这里，动力核心就在眼前——整整一个章节都押在这一战上。一个人应付不了，就趁现在说。"
  ],
  [
    "Cutters are running on every stretch of track. They'll sit still like they've stopped, then start right back up the moment you pass. Tear out just 155 of them, ghost — don't come whining to me if you botch it.",
    "每条轨道上都有切割自动机在运转。它们会装作停下，等你经过时再突然启动。拆掉155台，幽灵——别笨手笨脚地弄伤自己，又跑来向我哭诉。"
  ],
  [
    "To the Duskwood Border — The old southern border road has opened up. You'll need to cross the border forest, thick with dusk blossoms, to reach Monatium. Head to that forest first, Speaki. / {current}/{target}",
    "前往暮色森林边境 — 南方的旧边境道路已经开放。要前往莫纳提姆，就必须穿过开满晚霞花的边境森林。先去那片森林看看吧，斯皮奇。 ｜ 进度：{current}/{target}"
  ],
  [
    "You're all set! Leveling up and gearing up will make you stronger.\nCome find me anytime you need me — enjoy the adventure, Speaki!\nI'll still pop in with a tip now and then whenever you run into something new!",
    "准备就绪！升级并穿戴装备，就能不断变强。\n需要帮助时随时来找我。祝你冒险愉快，斯皮奇！\n以后遇到新事物，我也会不时送上提示！"
  ],
  [
    "The Lightning Rod Knights — The Lightning Rod Knights patrol between the towers. Take down just 185 of them, ghost. They carry lightning on their spear tips, so don't meet them head-on. / {current}/{target}",
    "避雷针骑士团 — 避雷针骑士自动机正在铁塔之间巡逻。击落185台，幽灵。它们的枪尖带着雷电，别从正面硬碰。 ｜ 进度：{current}/{target}"
  ],
  [
    "Dawnlight Guardian — The Dawnlight Guardian. That is a name the temple has waited on for a very long time. When you come back… I'll close up my stall and come out to meet you, Speaki. / {current}/{target}",
    "曙光守卫 — 曙光守卫——教团已经等待这个名字太久了。等你回来……我会关上店门，亲自去迎接你，斯皮奇。 ｜ 进度：{current}/{target}"
  ],
  [
    "What Runs Through the Twilight — When twilight falls, there are things that come dashing through the forest. Please catch just 110 of them — the night road will grow a little quieter. / {current}/{target}",
    "奔行于暮色之物 — 暮色降临后，有些家伙会在森林里狂奔。请抓住110只，夜路就能安静一些。 ｜ 进度：{current}/{target}"
  ],
  [
    "Gearing done? Then follow me, ghost. Ahead lies a derelict railway where only the signal lights still blink — wander off the rails and I couldn't tell you where you'd end up. Stay close and head inside.",
    "整备完就跟上，幽灵。前面是只剩信号灯还在闪烁的旧信号铁路——偏离轨道会栽到哪里，连我也不知道。跟紧点，往里走。"
  ],
  [
    "The Runaway Power Core — Now that you've beaten the Watchtower, the power core itself has finally shown its face. Don't even think about going alone this time, ghost — bring backup. / {current}/{target}",
    "暴走动力核心 — 既然连监控塔都越过了，动力核心本体终于现身了。幽灵，这一次可不能再单独行动——带上同伴。 ｜ 进度：{current}/{target}"
  ],
  [
    "네가 그 구조 요청 받고 왔다는 사람이군. 세계수 교단에서 보냈다더니, 생각보단 멀쩡하네. 난 엘레나 — 모나티엄 잔무는 죄다 내가 떠안고 있어. 이름은 됐고, 소리 없이 나타난 게 꼭 유령 같으니 그냥 그렇게 부를게. 인사는 여기까지야. 근데 여기서부턴 얘기가 달라 — 이 꼴로 그냥 나설 셈이었어, 유령? 어림도 없지. 상점부터 들러서 다섯 개는 챙겨 와.",
    "你就是接到求救信后赶来的人吧。听说是世界树教团派来的，状态倒比我想象中好。我是艾琳娜，莫纳提姆的烂摊子全压在我身上。名字就免了；你出现时一点声音都没有，简直像个幽灵，我就这么叫你吧。寒暄到此为止。接下来可不一样——你该不会想就这副模样直接上路吧，幽灵？想都别想。先去商店买五件东西回来。"
  ],
  [
    "The Railway Conductor holds the terminal station in an iron grip. Get past that old wreck, and the next zone's yours — say something if it's too much alone, ghost. ...Not that I'd help, or anything.",
    "旧铁路幽灵列车长控制着终点站。越过那个破铜烂铁，就是下一个区域。一个人撑不住就说，幽灵。……我可没说会帮你。"
  ],
  [
    "Press and hold on Speaki's head and give it a rub! A big smile builds affection — every affection level up earns you a Supreme Crayon. Check your affection progress anytime from the Upgrade screen.",
    "按住斯皮奇的头来回抚摸吧！当它露出灿烂笑容时，就会积累好感度。好感度每提升 1 级，即可获得 1 支金蜡笔；进度可随时在强化界面查看。"
  ],
  [
    "Putting the Gear to Use — What's the point of buying it if you never use it? Try it three times, right here, ghost — your body needs to remember before you're out on the rails. / {current}/{target}",
    "熟悉整备用品 — 买来却不用，那还有什么意义？现在就在这里亲手用三次，幽灵——到了轨道上，只有先让身体记住用法，才能活命。 ｜ 进度：{current}/{target}"
  ],
  [
    "A unique item earned as a clear reward from the Runaway Power Core raid — condensed power drawn from the core, destined to one day strengthen your drone companion (one per player, never consumed).",
    "通关暴走动力核心团队副本后获得的特殊道具。由动力核心提取而成的浓缩能量，未来可用于强化无人机伙伴。（每位玩家限持 1 个，使用后不会消耗。）"
  ],
  [
    "Wisps in the Blizzard — They say blue wisps drift through the blizzard. Please put out just a hundred and thirty. Stand too close and the ground under your feet freezes first. / {current}/{target}",
    "暴风雪中的鬼火 — 听说暴风雪中飘荡着冰霜鬼火。请熄灭一百三十只。靠得太近，脚下会先结冰。 ｜ 进度：{current}/{target}"
  ],
  [
    "Chieftain of the Duskwood — The Duskwood Chieftain holds the border in an iron grip. Get past this one, and you'll be able to reach Gearfield Moor. Please be careful, Speaki. / {current}/{target}",
    "暮色森林大酋长 — 暮色森林大酋长控制着边境。只要越过它，就能前往齿轮原野。请小心，斯皮奇。 ｜ 进度：{current}/{target}"
  ],
  [
    "Tap the {key} button once and auto-attack begins! It keeps going until the target falls, and tapping it again stops it. (Turn auto-repeat off in Settings and each tap lands a single hit instead.)",
    "点按一次 {key} 即可开启自动攻击！攻击会持续到目标倒下，再点按一次即可停止。（若在设置中关闭自动攻击，每次点按只会攻击一次。）"
  ],
  [
    "The Ember Valley — Past the pass lies a valley where embers flow. Please scatter just a hundred and fifty of the drifting lava wisps. They burst underfoot, so do be careful. / {current}/{target}",
    "烬火山谷 — 翻过山口，便是流淌着烬火的山谷。请驱散一百五十只游荡的熔岩鬼火。它们会在脚下爆炸，务必小心。 ｜ 进度：{current}/{target}"
  ],
  [
    "The Harvester That Won't Stop — Abandoned harvesters are still tearing up the fields. Please stop just 115 of them, before they plow up fields that never did anything wrong. / {current}/{target}",
    "永不停歇的收割机 — 齿刃收割机至今还在翻耕原野。请停下115台，别让无辜的田地全被翻个底朝天。 ｜ 进度：{current}/{target}"
  ],
  [
    "Press and hold on Speaki in town to give it a rub, or hold the affection emote ({key}) in the pumpkin patch — either way, affection builds up. Both paths have a daily cap that resets every day.",
    "在城镇中按住斯皮奇来回抚摸，或在南瓜田持续使用好感表情（{key}），均可积累好感度。两种方式各有每日上限，并会在每天重置。"
  ],
  [
    "This is the Molten Boundary, ghost. The ground bubbles and melts underfoot here, so clear away just 190 of the things crossing past the line — cross it yourself, and don't count on coming back.",
    "这里是熔融边界，幽灵。脚下的大地正在咕嘟咕嘟地熔化。清除190只越过边界的家伙——你自己要是越线，就别指望能回来。"
  ],
  [
    "Thunder Pylon Guardian — The Thunder Pylon Guardian sits atop the ridge. Get past it and the power core depths are next — the last door before the end. Stay sharp, ghost. / {current}/{target}",
    "雷电塔守护机 — 雷电塔守护机盘踞在山脊顶端。越过它就是动力核心深处——最后一道门就在眼前。打起精神，幽灵。 ｜ 进度：{current}/{target}"
  ],
  [
    "Frostreach Pass is colder and farther than any road you've walked so far. Before you set out, please pick up just three things from my stall. Head out unprepared and you won't make it back.",
    "霜星雪岭比你走过的任何道路都更加寒冷、遥远。出发前，请先在商店买好三样东西。毫无准备地上路，可就回不来了。"
  ],
  [
    "Press {key} once and auto-attack begins! It keeps going until the target falls, and pressing it again stops it. (Turn auto-repeat off in Settings and each press lands a single hit instead.)",
    "按一次 {key} 即可开启自动攻击！攻击会持续到目标倒下，再按一次即可停止。（若在设置中关闭自动攻击，每次按键只会攻击一次。）"
  ],
  [
    "When the Ash Settles — The ash is flying so thick you can't see a thing. Clear out just 170 of them, ghost — the ash needs to settle before you can see what's past it. / {current}/{target}",
    "当灰烬落定 — 灰尘精灵漫天飞舞，什么都看不清。清除170只，幽灵——只有等尘埃落定，才能看清深处。 ｜ 进度：{current}/{target}"
  ],
  [
    "A pouch of travel money Ner scraped together by taking Speaki's ripened pumpkins to market and selling them off (she can't stand pumpkins, yet shuts her eyes and sells them all the same).",
    "尼尔把斯皮奇种熟的南瓜拿到集市卖掉，才凑出这袋盘缠。（她虽然讨厌南瓜，做买卖时还是会闭着眼把事情办妥。）"
  ],
  [
    "Impbots That Devour Flame — Impbots are swallowing the factory row's streetlamps and snuffing out the light. Catch just 130 of them, and the road will light up again. / {current}/{target}",
    "吞噬火焰的小恶魔机器人 — 焊火小恶魔机器人吞噬工业区道路上的路灯，让灯光熄灭。抓住130只，道路就会再次亮起来。 ｜ 进度：{current}/{target}"
  ],
  [
    "A distress call has come in from Monatium's city hall. They say you'll have to cross a forest of dusk blossoms along the old southern border road. (the southern edge of Sunbreeze Forest)",
    "莫纳提姆市政厅发来了求救信。要前往那里，必须沿南方旧边境道路，穿过开满晚霞花的森林。（晴风森林南端）"
  ],
  [
    "Gatekeepers of the Dawn — The dawn dragonscale soldiers guard the innermost depths of the Root Hollow. Please get past two hundred of them. Beyond them lies the end. / {current}/{target}",
    "黎明守门人 — 黎明龙鳞兵守卫着曙光根穴最深处。击败两百名守卫吧，它们身后就是终点。 ｜ 进度：{current}/{target}"
  ],
  [
    "Your account is suspended until {date}. You will be able to reconnect after that time. If you wish to appeal, please create a new account and contact us via Settings > Developer Inquiry.",
    "账号封禁将持续至 {date}，届时可重新连接。如需申诉，请创建新账号并通过“设置 > 联系开发者”提交。"
  ],
  [
    "Frost-star Ancient Spirit — The Frost-star Ancient Spirit sits in an icy clearing at the end of the pass. You'll have to get past it once to reach the Ember Valley. / {current}/{target}",
    "霜星远古精灵 — 霜星远古精灵盘踞在雪岭尽头的冰原上。要前往烬火山谷，就必须先越过它。 ｜ 进度：{current}/{target}"
  ],
  [
    "This is the last stretch, ghost. The path down into the power core depths, its cooling long stopped, has opened. ...Well, I'm not worried. You've held on this far, after all. Head down.",
    "这是最后一段路了，幽灵。通往动力核心深处的道路已经开启，那里的冷却系统早已停摆。……算了，我并不担心，毕竟你都撑到这里了。下去吧。"
  ],
  [
    "This is Thunder Pylon Ridge. Current crackles just beneath your feet, so pick your steps carefully, ghost — plant a foot in the wrong spot and you'll regret it. Climb up onto the ridge.",
    "这里是雷电塔岭。电流就在脚下噼啪作响，每一步都要选好落脚点，幽灵——胡乱落脚可是会后悔的。登上山岭吧。"
  ],
  [
    "Let's head out to the hunting grounds! Tap the {key} button near the portal to reach the field. The {key} button interacts with whatever is close by — portals, Sealed Altars, anything.",
    "去狩猎场看看吧！靠近传送门后点按 {key}，即可前往野外。{key} 也能与附近的传送门、封印祭坛等物体互动。"
  ],
  [
    "あんたがあの救援要請を受けて来た人か。世界樹教団から寄越されたって聞いたけど、思ったよりまともだね。私はエレナ——モナティウムの残務は全部私が被ってる。名乗りはいい、物音もなく現れるところがまるで幽霊みたいだから、そう呼ぶことにする。挨拶はここまでだよ。けど、ここから先は話が違う——その格好のまま出るつもりだった、幽霊? 甘いね。まずは商店に寄って五つは揃えてきな。",
    "你就是接到求救信后赶来的人吧。听说是世界树教团派来的，状态倒比我想象中好。我是艾琳娜，莫纳提姆的烂摊子全压在我身上。名字就免了；你出现时一点声音都没有，简直像个幽灵，我就这么叫你吧。寒暄到此为止。接下来可不一样——你该不会想就这副模样直接上路吧，幽灵？想都别想。先去商店买五件东西回来。"
  ],
  [
    "Stop the Compactor — The compactor yard won't stop, and the whole factory rings with clanging iron. Please shut down just 140 of them — Monatium lies just beyond. / {current}/{target}",
    "停止压缩场 — 废料压缩魔像让压缩场一直运转不停，整座工业区都回荡着金属撞击声。请关停140台。越过那里就是莫纳提姆。 ｜ 进度：{current}/{target}"
  ],
  [
    "A pumpkin patch! Tap the {key} to show some love and stay a while — affection keeps building as long as you hold still. Check your affection progress anytime from the Upgrade screen.",
    "这里是南瓜田！点按并按住 {key} 表达好感，同时保持不动，即可持续积累好感度。进度可随时在强化界面查看。"
  ],
  [
    "Runaway Rail Golem — Rail cart golems are running wild all over the tracks. Smash just 145 of them, ghost — watch your back too, unless you want to get run over. / {current}/{target}",
    "失控的废弃轨道矿车魔像 — 废弃轨道矿车魔像正在轨道上横冲直撞。砸碎145台，幽灵——不想被碾过去，就连背后也盯紧点。 ｜ 进度：{current}/{target}"
  ],
  [
    "I hear frost bear beastfolk have dug their dens at the mouth of the pass. Please drive off just a hundred and twenty. Once the snow catches your feet, there's no dodging those paws.",
    "听说冰霜熊人在雪岭入口筑了巢。请赶走一百二十只。一旦双脚陷进积雪，就躲不开它们的熊掌了。"
  ],
  [
    "A pumpkin patch! Press {key} to show some love and stay a while — affection keeps building as long as you hold still. Check your affection progress anytime from the Upgrade screen.",
    "这里是南瓜田！按住 {key} 表达好感并保持不动，即可持续积累好感度。进度可随时在强化界面查看。"
  ],
  [
    "The Warden Spirits' Patrol — Dawn warden spirits circle the hollow, tracing beams of light. Settle just a hundred and ninety and their patrol lines will break. / {current}/{target}",
    "黎明守护精灵的巡逻 — 黎明守护精灵在洞穴中巡游，划出道道光束。平息一百九十只，巡逻路线便会中断。 ｜ 进度：{current}/{target}"
  ],
  [
    "The Blinding Shadows — Snowblind shadows will take your sight. Clear away just a hundred and forty, and the road will open all the way to the end of the pass. / {current}/{target}",
    "致盲的暗影 — 雪盲暗影会夺走你的视力。清除一百四十只后，通往雪岭尽头的道路便会显现。 ｜ 进度：{current}/{target}"
  ],
  [
    "The Factory Overseer Automaton guards the last gate. Get past it, and Monatium is finally within reach, Speaki. ...From there on, it won't be me who greets you, but someone else.",
    "工业区监工自动机守着最后一道门。只要越过它，就终于能抵达莫纳提姆了，斯皮奇。……从那里开始，迎接你的将不再是我，而是另一个人。"
  ],
  [
    "A special mount summon ticket shaped like a police car — while you hold it, press '=' to summon and ride the police car (same performance as the pumpkin cart, appearance only).",
    "警车造型的特殊坐骑召唤券。持有时按“=”键，即可召唤并乘坐警车；性能与南瓜马车相同，仅外观不同。"
  ],
  [
    "Snuffing the Oil Lamps — Oil lamps are burning on their own all across the moor. Put out just 125 of them, and we can worry a little less about a wildfire. / {current}/{target}",
    "熄灭油灯 — 油灯鬼火正在原野各处自行燃烧。熄灭125只，便能少些引发野火的担忧。 ｜ 进度：{current}/{target}"
  ],
  [
    "Deep in the factory, there's a sealing altar in the hangar. Hit level fifty and the gate'll probably open. Ghost, you're not planning to go alone, are you? Bring your friends.",
    "工业区深处的机库里有一座封印祭坛。到了50级，门应该就能打开。幽灵，你不会打算一个人去吧？先叫上同伴。"
  ],
  [
    "Now it's the Root Hollow. Please break just a hundred and eighty of the root golems guarding the threshold. They're slow, but one twist of the ground shakes everything nearby.",
    "接下来是曙光根穴。请摧毁一百八十只把守入口的树根魔像。它们虽然迟缓，但只要扭动一次大地，四周都会震颤。"
  ],
  [
    "Rusted Watch Gigant — The Rusted Watch Gigant blocks the far end of the moor. Old as it is, its fists are said to still hit hard — please don't get hurt. / {current}/{target}",
    "锈蚀守卫巨像 — 锈蚀守卫巨像挡住了原野尽头。听说它虽已老旧，拳头却依然沉重，请千万别受伤。 ｜ 进度：{current}/{target}"
  ],
  [
    "Web of Coils — The coils have webbed the ridge like a spider's nest. Cut just 175 of them, ghost — get caught, and the current runs straight through you. / {current}/{target}",
    "线圈蛛网 — 线圈蜘蛛机器人把山脊织成了蛛网。拆掉175台，幽灵——一旦被缠住，电流会直接贯穿你的身体。 ｜ 进度：{current}/{target}"
  ],
  [
    "A key item earned as a clear reward from the Ember Dragonscale Tyrant raid — while you hold it, press '=' to summon and ride the two-seat pumpkin cart (not consumed on use).",
    "通关烬火龙鳞暴君团队副本后获得的关键道具。持有时按“=”键，即可召唤并乘坐双人南瓜马车；使用后不会消耗。"
  ],
  [
    "Someone must have played a prank — bits of stone were mixed in here and there. Worried at first, Speaki declared it suited them perfectly and hopped around in delight.",
    "不知是谁恶作剧，里面零星混进了几块石头。本来还有些担心，斯皮奇却高喊这正适合自己，开心得蹦蹦跳跳。"
  ],
  [
    "To the Lamplit Factory Row — Now it's the factory row lined with streetlamps. The lights are said to be going out one by one. Head down that road. / {current}/{target}",
    "前往灯火工厂区 — 接下来是路灯林立的工业区道路。听说灯光正在一盏接一盏地熄灭。沿那条路进去吧。 ｜ 进度：{current}/{target}"
  ],
  [
    "Trial of the Border Scouts — Border scouts are guarding the edge of Duskwood. Please drive off just 100 of them, and the way should open, Speaki. / {current}/{target}",
    "边境精灵斥候的试炼 — 边境精灵斥候把守着暮色森林边境入口。请击退100只，道路应该就会开放，斯皮奇。 ｜ 进度：{current}/{target}"
  ],
  [
    "Let's head out to the hunting grounds! Press {key} near the portal to reach the field. {key} interacts with whatever is close by — portals, Sealed Altars, anything.",
    "去狩猎场看看吧！靠近传送门后按 {key}，即可前往野外。{key} 也能与附近的传送门、封印祭坛等物体互动。"
  ],
  [
    "Burn Scars — The scorched beastfolk of that valley wear their burns like medals. Drive off just a hundred and sixty and the road will open up. / {current}/{target}",
    "灼烧的伤痕 — 山谷里的焦灼兽人把满身灼痕当作勋章。赶走一百六十只，道路应该就会畅通。 ｜ 进度：{current}/{target}"
  ],
  [
    "The old southern border road has opened up. You'll need to cross the border forest, thick with dusk blossoms, to reach Monatium. Head to that forest first, Speaki.",
    "南方的旧边境道路已经开放。要前往莫纳提姆，就必须穿过开满晚霞花的边境森林。先去那片森林看看吧，斯皮奇。"
  ],
  [
    "Halt the Press — The presses are still slamming down out of nowhere. Stop just 160 of them, ghost. Miss your timing and you end up flattened. / {current}/{target}",
    "停止冲压机 — 冲压机魔像仍在不停砸向空处。关停160台，幽灵。错过时机，你就会变成一只压扁的铁罐头。 ｜ 进度：{current}/{target}"
  ],
  [
    "The Dawnlight Guardian. That is a name the temple has waited on for a very long time. When you come back… I'll close up my stall and come out to meet you, Speaki.",
    "曙光守卫——教团已经等待这个名字太久了。等你回来……我会关上店门，亲自去迎接你，斯皮奇。"
  ],
  [
    "Soothing the Young Dragon — I hear a young dragon deep in the forest has lost its temper. Please calm it down safely, without getting hurt. / {current}/{target}",
    "安抚幼龙 — 听说森林深处的幼龙正在发脾气。请安抚它，也千万别让自己受伤。 ｜ 进度：{current}/{target}"
  ],
  [
    "Your account is suspended — the connection has been closed. If you wish to appeal, please create a new account and contact us via Settings > Developer Inquiry.",
    "账号已被封禁，连接已断开。如需申诉，请创建新账号并通过“设置 > 联系开发者”提交。"
  ],
  [
    "Great Gravekeeper Spirit — At the far end of the graveyard, the great tomb-keeper spirit awaits. This is the final trial of this journey. / {current}/{target}",
    "守墓大亡灵 — 墓园尽头，守墓大亡灵正在等着你。这是本次旅程的最终试炼。 ｜ 进度：{current}/{target}"
  ],
  [
    "The Lightning Rod Knights patrol between the towers. Take down just 185 of them, ghost. They carry lightning on their spear tips, so don't meet them head-on.",
    "避雷针骑士自动机正在铁塔之间巡逻。击落185台，幽灵。它们的枪尖带着雷电，别从正面硬碰。"
  ],
  [
    "Entering Gearfield Moor — Past the forest lies the dim Gearfield Moor. They say abandoned machines roam the fields — step in carefully. / {current}/{target}",
    "踏入齿轮原野 — 离开森林，便是暮色笼罩的齿轮原野。听说废弃机械仍在田野间游荡，请小心踏入。 ｜ 进度：{current}/{target}"
  ],
  [
    "Now that you've beaten the Watchtower, the power core itself has finally shown its face. Don't even think about going alone this time, ghost — bring backup.",
    "既然连监控塔都越过了，动力核心本体终于现身了。幽灵，这一次可不能再单独行动——带上同伴。"
  ],
  [
    "Attached: {mail1_name} x{mail1_quantity}, {mail2_name} x{mail2_quantity}, {mail3_name} x{mail3_quantity}, {mail4_name} x{mail4_quantity}, EXP {mailExp_exp}",
    "附件：{mail1_name} x{mail1_quantity}, {mail2_name} x{mail2_quantity}, {mail3_name} x{mail3_quantity}, {mail4_name} x{mail4_quantity}, 经验值 {mailExp_exp}"
  ],
  [
    "Past the pass lies a valley where embers flow. Please scatter just a hundred and fifty of the drifting lava wisps. They burst underfoot, so do be careful.",
    "翻过山口，便是流淌着烬火的山谷。请驱散一百五十只游荡的熔岩鬼火。它们会在脚下爆炸，务必小心。"
  ],
  [
    "Lights of Moonring Marshdell — Moonlight will-o'-the-wisps are drifting through Moonring Marshdell. Please scatter just ten of them. / {current}/{target}",
    "月环泽谷的灯火 — 月环泽谷中飘荡着月光鬼火。请驱散十只。 ｜ 进度：{current}/{target}"
  ],
  [
    "They say blue wisps drift through the blizzard. Please put out just a hundred and thirty. Stand too close and the ground under your feet freezes first.",
    "听说暴风雪中飘荡着冰霜鬼火。请熄灭一百三十只。靠得太近，脚下会先结冰。"
  ],
  [
    "This account is suspended and cannot be recovered. If you wish to appeal, please create a new account and contact us via Settings > Developer Inquiry.",
    "此账号已被限制使用，无法恢复。如需申诉，请创建新账号并通过设置 > 联系开发者提交。"
  ],
  [
    "What's the point of buying it if you never use it? Try it three times, right here, ghost — your body needs to remember before you're out on the rails.",
    "买来却不用，那还有什么意义？现在就在这里亲手用三次，幽灵——到了轨道上，只有先让身体记住用法，才能活命。"
  ],
  [
    "When twilight falls, there are things that come dashing through the forest. Please catch just 110 of them — the night road will grow a little quieter.",
    "暮色降临后，有些家伙会在森林里狂奔。请抓住110只，夜路就能安静一些。"
  ],
  [
    "添付: {mail1_name} x{mail1_quantity}, {mail2_name} x{mail2_quantity}, {mail3_name} x{mail3_quantity}, {mail4_name} x{mail4_quantity}, 経験値 {mailExp_exp}",
    "附件：{mail1_name} x{mail1_quantity}, {mail2_name} x{mail2_quantity}, {mail3_name} x{mail3_quantity}, {mail4_name} x{mail4_quantity}, 经验值 {mailExp_exp}"
  ],
  [
    "첨부: {mail1_name} x{mail1_quantity}, {mail2_name} x{mail2_quantity}, {mail3_name} x{mail3_quantity}, {mail4_name} x{mail4_quantity}, 경험치 {mailExp_exp}",
    "附件：{mail1_name} x{mail1_quantity}, {mail2_name} x{mail2_quantity}, {mail3_name} x{mail3_quantity}, {mail4_name} x{mail4_quantity}, 经验值 {mailExp_exp}"
  ],
  [
    "Awakening in the Temple — You've come to, Speaki! Welcome to the World Tree Temple. Shall we start with just one step forward? / {current}/{target}",
    "在教团中醒来 — 你醒了，斯皮奇。欢迎来到世界树教团。先向前走几步吧。 ｜ 进度：{current}/{target}"
  ],
  [
    "{base_name} — Unlocks at Lv{base_level} (Hotkey {base_key}) Deals bonus damage when target HP is {mechanism_pct}% or below (up to {cap_n} targets)",
    "{base_name} — Lv.{base_level} 解锁（快捷键：{base_key}） 目标 HP 低于或等于 {mechanism_pct}% 时威力提升（最多 {cap_n} 个目标）"
  ],
  [
    "The Duskwood Chieftain holds the border in an iron grip. Get past this one, and you'll be able to reach Gearfield Moor. Please be careful, Speaki.",
    "暮色森林大酋长控制着边境。只要越过它，就能前往齿轮原野。请小心，斯皮奇。"
  ],
  [
    "The Thunder Pylon Guardian sits atop the ridge. Get past it and the power core depths are next — the last door before the end. Stay sharp, ghost.",
    "雷电塔守护机盘踞在山脊顶端。越过它就是动力核心深处——最后一道门就在眼前。打起精神，幽灵。"
  ],
  [
    "{base_name} — Unlocks at Lv{base_level} (Hotkey {base_key}) Inflicts burn (damage over time) for {mechanism_sec}s on hit (up to {cap_n} targets)",
    "{base_name} — Lv.{base_level} 解锁（快捷键：{base_key}） 命中时使目标灼烧 {mechanism_sec} 秒（持续伤害）（最多 {cap_n} 个目标）"
  ],
  [
    "The ash is flying so thick you can't see a thing. Clear out just 170 of them, ghost — the ash needs to settle before you can see what's past it.",
    "灰尘精灵漫天飞舞，什么都看不清。清除170只，幽灵——只有等尘埃落定，才能看清深处。"
  ],
  [
    "Hello.\n\nA reward that was previously granted has been cancelled.\n\nReason: {reason}\n\nIf you have any questions, please contact customer support.",
    "你好。\n\n先前发放的奖励已被取消。\n\n原因：{reason}\n\n如有疑问，请联系客服。"
  ],
  [
    "감시의 눈을 감겨라 — 이 눈깔들, 하나같이 안쪽을 노려보고 있어. 200개만 감겨, 유령. ...느껴져? 이걸 전부 지휘하는 뭔가가 심부를 내려다보며 감시하고 있어. 그놈이 우릴 똑바로 보기 전에, 눈부터 끄자. / 진행 {current}/{target}",
    "闭上监视之眼 — 这些眼珠全都盯着里面。让200只眼睛闭上吧，幽灵。……感觉到了吗？有什么东西正俯瞰着深处，操纵所有眼睛监视这里。趁它还没看向我们，先把这些眼睛关掉。 ｜ 进度：{current}/{target}"
  ],
  [
    "封印された暴君 — 谷の奥の封印の祭壇が、とうとう砕けてしまいました。燠火の竜鱗の暴君が歩み出てくる前に…どうか仲間を集めて祭壇へお入りください。レベル三十七にならないと封印の扉は開きませんよ。おひとりでは絶対にいけません、スピキさん。 / 進行 {current}/{target}",
    "被封印的暴君 — 山谷深处的封印祭坛终于破裂了。趁烬火龙鳞暴君还没走出来……请召集同伴进入祭坛。达到三十七级后，封印门才会开启。绝对不能独自前往，斯皮奇。 ｜ 进度：{current}/{target}"
  ],
  [
    "封印の祭壇の竜鱗 — 森の果ての封印の祭壇の下で、竜鱗の守護者が眠っているんです。もう少し体はほぐれましたか？レベル十で封印の扉が開きますから、一度叩いてみてください。手に負えなければ無理はせず、まず仲間を呼んでくださいね、スピキさん。 / 進行 {current}/{target}",
    "封印祭坛的龙鳞 — 龙鳞守卫沉睡在森林尽头的封印祭坛之下。你也差不多热好身了吧？达到十级后，封印门就会开启，不妨去敲敲看。若觉得吃力，千万别逞强，先召集同伴吧，斯皮奇。 ｜ 进度：{current}/{target}"
  ],
  [
    "{base_name} — Cooldown {base_sec}s (Hotkey {base_key}) Deals bonus damage when target HP is {mechanism_pct}% or below (up to {cap_n} targets)",
    "{base_name} — 冷却 {base_sec} 秒（快捷键：{base_key}） 目标 HP 低于或等于 {mechanism_pct}% 时威力提升（最多 {cap_n} 个目标）"
  ],
  [
    "{base_name} — Unlocks at Lv{base_level} (Hotkey {base_key}) Deals splash damage to enemies within {mechanism_radius}m (up to {cap_n} targets)",
    "{base_name} — Lv.{base_level} 解锁（快捷键：{base_key}） 对周围 {mechanism_radius}m 内的敌人造成范围伤害（最多 {cap_n} 个目标）"
  ],
  [
    "Abandoned harvesters are still tearing up the fields. Please stop just 115 of them, before they plow up fields that never did anything wrong.",
    "齿刃收割机至今还在翻耕原野。请停下115台，别让无辜的田地全被翻个底朝天。"
  ],
  [
    "Check on the Fairies — The forest fairies have gotten awfully noisy lately. Could you check on just five of them for me? / {current}/{target}",
    "森林妖精的异动 — 森林妖精最近格外吵闹。能帮我查看五只森林妖精的情况吗？ ｜ 进度：{current}/{target}"
  ],
  [
    "The Apprentice Witch's Experiment — An apprentice witch is running a dangerous experiment. Please stop just ten of them. / {current}/{target}",
    "见习湿地女巫的实验 — 见习湿地女巫们正在进行危险实验。请制止其中十名。 ｜ 进度：{current}/{target}"
  ],
  [
    "The compactor yard won't stop, and the whole factory rings with clanging iron. Please shut down just 140 of them — Monatium lies just beyond.",
    "废料压缩魔像让压缩场一直运转不停，整座工业区都回荡着金属撞击声。请关停140台。越过那里就是莫纳提姆。"
  ],
  [
    "봉인 제단의 용린 — 숲 끝 봉인 제단 아래 용린 수호자가 잠들어 있어요. 이제 몸이 좀 풀리셨죠? 열 레벨이면 봉인문이 열리니, 한번 두드려 보세요. 버거우면 억지 부리지 말고 동료부터 불러오세요, 스피키씨. / 진행 {current}/{target}",
    "封印祭坛的龙鳞 — 龙鳞守卫沉睡在森林尽头的封印祭坛之下。你也差不多热好身了吧？达到十级后，封印门就会开启，不妨去敲敲看。若觉得吃力，千万别逞强，先召集同伴吧，斯皮奇。 ｜ 进度：{current}/{target}"
  ],
  [
    "봉인된 폭군 — 골짜기 안쪽 봉인 제단이 끝내 깨졌어요. 잉걸 용린 폭군이 걸어 나오기 전에… 부디 동료를 모아 제단으로 드세요. 레벨 서른일곱은 되셔야 봉인문이 열린답니다. 혼자서는 절대 안 돼요, 스피키씨. / 진행 {current}/{target}",
    "被封印的暴君 — 山谷深处的封印祭坛终于破裂了。趁烬火龙鳞暴君还没走出来……请召集同伴进入祭坛。达到三十七级后，封印门才会开启。绝对不能独自前往，斯皮奇。 ｜ 进度：{current}/{target}"
  ],
  [
    "Rail cart golems are running wild all over the tracks. Smash just 145 of them, ghost — watch your back too, unless you want to get run over.",
    "废弃轨道矿车魔像正在轨道上横冲直撞。砸碎145台，幽灵——不想被碾过去，就连背后也盯紧点。"
  ],
  [
    "{base_name} — Cooldown {base_sec}s (Hotkey {base_key}) Inflicts burn (damage over time) for {mechanism_sec}s on hit (up to {cap_n} targets)",
    "{base_name} — 冷却 {base_sec} 秒（快捷键：{base_key}） 命中时使目标灼烧 {mechanism_sec} 秒（持续伤害）（最多 {cap_n} 个目标）"
  ],
  [
    "Descent of the Great Marsh Witch — The Great Marsh Witch has set her sights on the graveyard. Please stop her, Speaki. / {current}/{target}",
    "大沼泽女巫降临 — 大沼泽女巫盯上了墓园。请阻止她，斯皮奇。 ｜ 进度：{current}/{target}"
  ],
  [
    "The dawn dragonscale soldiers guard the innermost depths of the Root Hollow. Please get past two hundred of them. Beyond them lies the end.",
    "黎明龙鳞兵守卫着曙光根穴最深处。击败两百名守卫吧，它们身后就是终点。"
  ],
  [
    "A pouch of spirit dew gathered from the Moonmist Marsh. Held in the palm, it hardens into a shimmering crystal that becomes precious Elif.",
    "装着从月雾湿地收集而来的精灵露水。握在手中便会凝结成流光溢彩的水晶叶。"
  ],
  [
    "Impbots are swallowing the factory row's streetlamps and snuffing out the light. Catch just 130 of them, and the road will light up again.",
    "焊火小恶魔机器人吞噬工业区道路上的路灯，让灯光熄灭。抓住130只，道路就会再次亮起来。"
  ],
  [
    "The coils have webbed the ridge like a spider's nest. Cut just 175 of them, ghost — get caught, and the current runs straight through you.",
    "线圈蜘蛛机器人把山脊织成了蛛网。拆掉175台，幽灵——一旦被缠住，电流会直接贯穿你的身体。"
  ],
  [
    "{base_name} — Cooldown {base_sec}s (Hotkey {base_key}) Deals splash damage to enemies within {mechanism_radius}m (up to {cap_n} targets)",
    "{base_name} — 冷却 {base_sec} 秒（快捷键：{base_key}） 对周围 {mechanism_radius}m 内的敌人造成范围伤害（最多 {cap_n} 个目标）"
  ],
  [
    "石像の下で眠るもの — 墓地の祭壇の下で、墓守の石像亡霊がまだ目を覚ましているんです。大亡霊を越えられたのなら、次はそちらの番ですよ。レベル二十八で封印の扉が開きますから…今度はぜひ仲間と一緒に行ってくださいね、スピキさん。 / 進行 {current}/{target}",
    "沉睡于石像之下 — 墓园祭坛之下，守墓石像亡灵依然醒着。既然已经越过守墓大亡灵，接下来就轮到它了。达到二十八级后，封印门就会开启……这一次请务必与同伴同行，斯皮奇。 ｜ 进度：{current}/{target}"
  ],
  [
    "Attached: {mail1_name} x{mail1_quantity}, {mail2_name} x{mail2_quantity}, {mail3_name} x{mail3_quantity}, {mail4_name} x{mail4_quantity}",
    "附件：{mail1_name} x{mail1_quantity}, {mail2_name} x{mail2_quantity}, {mail3_name} x{mail3_quantity}, {mail4_name} x{mail4_quantity}"
  ],
  [
    "Catching the Wandering Wind — A wandering wind spirit keeps stirring up the road. Please settle just eight of them. / {current}/{target}",
    "捕捉游荡之风 — 游荡风精灵扰乱了道路。请平息八只。 ｜ 进度：{current}/{target}"
  ],
  [
    "The Frost-star Ancient Spirit sits in an icy clearing at the end of the pass. You'll have to get past it once to reach the Ember Valley.",
    "霜星远古精灵盘踞在雪岭尽头的冰原上。要前往烬火山谷，就必须先越过它。"
  ],
  [
    "The Warden's Trial — An elven forest warden wants to put you to the test. Please win eight times to prove yourself. / {current}/{target}",
    "守林人的试炼 — 精灵守林人想考验你。战胜它八次，证明自己吧。 ｜ 进度：{current}/{target}"
  ],
  [
    "⚠ The recovery code below is effectively your account password. If you are streaming or sharing your screen, make sure it stays hidden!",
    "⚠ 下方恢复码等同于你的账号密码。如果正在直播或共享屏幕，请务必避免泄露！"
  ],
  [
    "Snowblind shadows will take your sight. Clear away just a hundred and forty, and the road will open all the way to the end of the pass.",
    "雪盲暗影会夺走你的视力。清除一百四十只后，通往雪岭尽头的道路便会显现。"
  ],
  [
    "If cookies are cleared or you sign in from another browser, this code is the only way to recover your account. Keep it somewhere safe.",
    "若 Cookie 被清除或改用其他浏览器，此恢复码将是找回账号的唯一凭证，请务必妥善保存。"
  ],
  [
    "監視の目を閉じさせろ — この目玉ども、揃いも揃って内側を睨んでる。二百個だけ閉じさせな、幽霊。……感じる? これを全部指揮してる何かが深部を見下ろして監視してる。そいつが私たちをまともに見る前に、まず目から消そう。 / 進行 {current}/{target}",
    "闭上监视之眼 — 这些眼珠全都盯着里面。让200只眼睛闭上吧，幽灵。……感觉到了吗？有什么东西正俯瞰着深处，操纵所有眼睛监视这里。趁它还没看向我们，先把这些眼睛关掉。 ｜ 进度：{current}/{target}"
  ],
  [
    "This account has been suspended. If you wish to appeal, please create a new account and contact us via Settings > Developer Inquiry.",
    "此账号已被限制使用。如需申诉，请创建新账号，并通过设置 > 联系开发者提交申请。"
  ],
  [
    "The Rusted Watch Gigant blocks the far end of the moor. Old as it is, its fists are said to still hit hard — please don't get hurt.",
    "锈蚀守卫巨像挡住了原野尽头。听说它虽已老旧，拳头却依然沉重，请千万别受伤。"
  ],
  [
    "석상 아래 잠든 것 — 묘지 제단 아래, 석상망령이 아직 깨어 있어요. 무덤지기를 넘으셨다면 이제 그쪽 차례예요. 스물여덟 레벨이면 봉인문이 열리니… 이번엔 꼭 동료와 함께 가세요, 스피키씨. / 진행 {current}/{target}",
    "沉睡于石像之下 — 墓园祭坛之下，守墓石像亡灵依然醒着。既然已经越过守墓大亡灵，接下来就轮到它了。达到二十八级后，封印门就会开启……这一次请务必与同伴同行，斯皮奇。 ｜ 进度：{current}/{target}"
  ],
  [
    "光っているスキルスロットを押して魔法を使ってみてください!(今は{slot}番、{skillName})スロットは{slotCount}枠で、レベル{unlockLevels}で一つずつ増えていきます。射程の外でも勝手に近づいて唱えますから安心してくださいね!",
    "点击发光的技能栏施放魔法吧！（当前是第 {slot} 栏的“{skillName}”。）技能栏共有 {slotCount} 个位置，其余技能会在 {unlockLevels} 级逐一解锁。即使距离过远也不用担心，角色会自动靠近目标后施放技能！"
  ],
  [
    "添付: {mail1_name} x{mail1_quantity}, {mail2_name} x{mail2_quantity}, {mail3_name} x{mail3_quantity}, {mail4_name} x{mail4_quantity}",
    "附件：{mail1_name} x{mail1_quantity}, {mail2_name} x{mail2_quantity}, {mail3_name} x{mail3_quantity}, {mail4_name} x{mail4_quantity}"
  ],
  [
    "Dawn warden spirits circle the hollow, tracing beams of light. Settle just a hundred and ninety and their patrol lines will break.",
    "黎明守护精灵在洞穴中巡游，划出道道光束。平息一百九十只，巡逻路线便会中断。"
  ],
  [
    "Oil lamps are burning on their own all across the moor. Put out just 125 of them, and we can worry a little less about a wildfire.",
    "油灯鬼火正在原野各处自行燃烧。熄灭125只，便能少些引发野火的担忧。"
  ],
  [
    "Subduing the Beastfolk Scouts — Beastfolk scouts have blocked the road. Could you drive off just ten of them? / {current}/{target}",
    "讨伐森林兽人侦察兵 — 森林兽人侦察兵挡住了道路。能帮我击退十只吗？ ｜ 进度：{current}/{target}"
  ],
  [
    "빛나는 스킬 슬롯을 눌러 마법을 써 보세요! (지금은 {slot}번 {skillName}) 슬롯은 {slotCount}칸이고 레벨 {unlockLevels}에 하나씩 더 열려요. 사거리 밖이어도 알아서 다가가서 시전하니 걱정 마세요!",
    "点击发光的技能栏施放魔法吧！（当前是第 {slot} 栏的“{skillName}”。）技能栏共有 {slotCount} 个位置，其余技能会在 {unlockLevels} 级逐一解锁。即使距离过远也不用担心，角色会自动靠近目标后施放技能！"
  ],
  [
    "첨부: {mail1_name} x{mail1_quantity}, {mail2_name} x{mail2_quantity}, {mail3_name} x{mail3_quantity}, {mail4_name} x{mail4_quantity}",
    "附件：{mail1_name} x{mail1_quantity}, {mail2_name} x{mail2_quantity}, {mail3_name} x{mail3_quantity}, {mail4_name} x{mail4_quantity}"
  ],
  [
    "The scorched beastfolk of that valley wear their burns like medals. Drive off just a hundred and sixty and the road will open up.",
    "山谷里的焦灼兽人把满身灼痕当作勋章。赶走一百六十只，道路应该就会畅通。"
  ],
  [
    "장착 중인 장비는 제외하고, 부위에 상관없이 모든 잉여 장비가 등급별 포인트(pt)로 환산돼 낮은 등급부터 자동 소모돼요. 아래 \"재료 N pt\"는 이 포인트 기준 필요량이에요. 남는 포인트는 적립되어 다음 강화에서 먼저 사용돼요.",
    "除已穿戴的装备外，其余装备都会按品级换算为材料点数（pt），并从最低品级开始自动消耗。下方的“材料 N pt”表示本次所需点数；多余点数会自动储存，供下次强化优先使用。"
  ],
  [
    "ちょっと待って、とても大事な話です!\nスピキさんのアカウントを取り戻せる復旧コードがあります — Cookieが消えたり別のブラウザでアクセスした場合、\nこのコードだけが唯一の方法です。\n下部メニューの設定アイコン>アカウントで必ず確認しておいてくださいね!",
    "等一下，这件事非常重要！\n恢复码是找回斯皮奇账号的唯一凭证。若 Cookie 被清除或改用其他浏览器，没有恢复码就无法找回账号。\n请前往“底部菜单的设置 > 账号”查看并妥善保存！"
  ],
  [
    "심부 감시 관제탑 — 이게 그 관제탑이야, 유령. 감시의 눈을 전부 부린 게 이놈이지. 여기만 넘으면 동력핵이 코앞이야 — 챕터 하나가 통째로 걸려 있어. 혼자 감당 안 되면 지금 말해. / 진행 {current}/{target}",
    "深处监控塔 — 这就是那座监控塔，幽灵。所有监视之眼都受它操控。越过这里，动力核心就在眼前——整整一个章节都押在这一战上。一个人应付不了，就趁现在说。 ｜ 进度：{current}/{target}"
  ],
  [
    "To the Moonmist Marsh — A path has opened into the misty marsh. Please clear out just ten toad familiars. / {current}/{target}",
    "前往月雾湿地 — 通往月雾湿地的道路已经开放。请清除十只湿地蟾蜍使魔。 ｜ 进度：{current}/{target}"
  ],
  [
    "쇳물빛 굴뚝지구로 — 다음은 굴뚝지구야. 굴뚝마다 쇳물빛 연기가 쉴 새 없이 뿜어져 나오지. 숨 막히기 전에 얼른 들어가, 유령 — 꾸물대면 연기가 앞길부터 뿌옇게 지워 버릴 테니까. / 진행 {current}/{target}",
    "前往铁辉烟囱区 — 接下来是铁辉烟囱区。每根烟囱都在不停喷出熔铁色的浓烟。趁窒息前赶紧进去，幽灵——再磨蹭，烟雾就要把前路遮得一干二净了。 ｜ 进度：{current}/{target}"
  ],
  [
    "Morning at the Temple — You've come again today. Just stopping by to show your face is more than enough. / {current}/{target}",
    "教团的清晨 — 今天也来报到了呢。只要露个面就足够了。 ｜ 进度：{current}/{target}"
  ],
  [
    "The presses are still slamming down out of nowhere. Stop just 160 of them, ghost. Miss your timing and you end up flattened.",
    "冲压机魔像仍在不停砸向空处。关停160台，幽灵。错过时机，你就会变成一只压扁的铁罐头。"
  ],
  [
    "A seasonal bundle from the temple for Speaki, who loves pumpkins. Packed with generous travel funds and a handful of candy.",
    "教团为热爱南瓜的斯皮奇准备的时令礼包。里面装着充足的盘缠和一大把糖果。"
  ],
  [
    "Attached: {mail1_name} x{mail1_quantity}, {mail2_name} x{mail2_quantity}, {mail3_name} x{mail3_quantity}, EXP {mailExp_exp}",
    "附件：{mail1_name} x{mail1_quantity}, {mail2_name} x{mail2_quantity}, {mail3_name} x{mail3_quantity}, 经验值 {mailExp_exp}"
  ],
  [
    "공단 감독 오토마타 — 공단 감독 오토마타가 마지막 문을 지켜요. 이 자만 넘으면 드디어 모나티엄이에요, 스피키씨. ...거기서부턴 제가 아니라, 다른 이가 당신을 맞을 거예요. / 진행 {current}/{target}",
    "工业区监工自动机 — 工业区监工自动机守着最后一道门。只要越过它，就终于能抵达莫纳提姆了，斯皮奇。……从那里开始，迎接你的将不再是我，而是另一个人。 ｜ 进度：{current}/{target}"
  ],
  [
    "ちょっと待って、とても大事な話です!\nスピキさんのアカウントを取り戻せる復旧コードがあります — Cookieが消えたり別のブラウザでアクセスした場合、\nこのコードだけが唯一の方法です。\n設定(Oキー)>アカウントで必ず確認しておいてくださいね!",
    "等一下，这件事非常重要！\n恢复码是找回斯皮奇账号的唯一凭证。若 Cookie 被清除或改用其他浏览器，没有恢复码就无法找回账号。\n请前往“设置（O）> 账号”查看并妥善保存！"
  ],
  [
    "{base_name} — Unlocks at Lv{base_level} (Hotkey {base_key}) Deals bonus damage when target HP is {mechanism_pct}% or below",
    "{base_name} — Lv.{base_level} 解锁（快捷键：{base_key}） 目标 HP 低于或等于 {mechanism_pct}% 时威力提升"
  ],
  [
    "{base_name} — Unlocks at Lv{base_level} (Hotkey {base_key}) Pierces all enemies in a straight line (up to {cap_n} targets)",
    "{base_name} — Lv.{base_level} 解锁（快捷键：{base_key}） 贯穿直线上的所有敌人（最多 {cap_n} 个目标）"
  ],
  [
    "An adventure needs a goal! Press [Quest] to check what's next. ({key} works too, as does the menu bar at the bottom right)",
    "冒险当然要有目标！打开【任务】查看下一步行动。（也可按 {key}，或点击右下角的菜单图标。）"
  ],
  [
    "Shadows in the Mist — Mist shadows are swallowing up the path. Please clear away just twelve of them. / {current}/{target}",
    "迷雾中的暗影 — 雾影正在吞噬道路。请清除十二只。 ｜ 进度：{current}/{target}"
  ],
  [
    "잠깐만요, 아주 중요한 얘기예요!\n스피키씨 계정을 되찾을 수 있는 복구 코드가 있어요 — 쿠키가 지워지거나 다른 브라우저로 오시면\n이 코드만이 유일한 방법이에요.\n하단 메뉴의 설정 아이콘 > 계정에서 꼭 확인해 두세요!",
    "等一下，这件事非常重要！\n恢复码是找回斯皮奇账号的唯一凭证。若 Cookie 被清除或改用其他浏览器，没有恢复码就无法找回账号。\n请前往“底部菜单的设置 > 账号”查看并妥善保存！"
  ],
  [
    "工業地帯監督オートマタ — 工業地帯監督オートマタが最後の門を守っています。これさえ越えれば、いよいよモナティウムです、スピキさん。……そこから先は、私ではなく、別の者があなたを迎えるでしょう。 / 進行 {current}/{target}",
    "工业区监工自动机 — 工业区监工自动机守着最后一道门。只要越过它，就终于能抵达莫纳提姆了，斯皮奇。……从那里开始，迎接你的将不再是我，而是另一个人。 ｜ 进度：{current}/{target}"
  ],
  [
    "装備中の防具は除外され、部位に関係なくすべての余剰装備が等級別ポイント(pt)に換算され、等級の低いものから自動的に消費されます。下の「素材 N pt」はこのポイント基準の必要量です。余ったポイントは積み立てられ、次の強化で先に使用されます。",
    "除已穿戴的装备外，其余装备都会按品级换算为材料点数（pt），并从最低品级开始自动消耗。下方的“材料 N pt”表示本次所需点数；多余点数会自动储存，供下次强化优先使用。"
  ],
  [
    "{base_name} — Unlocks at Lv{base_level} (Hotkey {base_key}) Inflicts burn (damage over time) for {mechanism_sec}s on hit",
    "{base_name} — Lv.{base_level} 解锁（快捷键：{base_key}） 命中时使目标灼烧 {mechanism_sec} 秒（持续伤害）"
  ],
  [
    "Drag the screen with one finger to look around! (Pinch with two fingers to zoom, the {cameraKey} button resets the view)",
    "单指拖动即可转动视角。（双指捏合缩放，点按 {cameraKey} 重置视角。）"
  ],
  [
    "Ner's Stall — Do stop by my stall sometime. Pick out just one thing, and you'll get the hang of it. / {current}/{target}",
    "尼尔的商店 — 也来我的商店看看吧。随便买一件东西，很快就能上手。 ｜ 进度：{current}/{target}"
  ],
  [
    "切断機を解体せよ — 線路のあちこちで切断機が回ってる。止まった振りして立ってて、通り過ぎたらまた動き出すよ。百五十五個だけ引き剥がしな、幽霊——中途半端に触って泣きついてくるんじゃないよ。 / 進行 {current}/{target}",
    "拆除切割自动机 — 每条轨道上都有切割自动机在运转。它们会装作停下，等你经过时再突然启动。拆掉155台，幽灵——别笨手笨脚地弄伤自己，又跑来向我哭诉。 ｜ 进度：{current}/{target}"
  ],
  [
    "溶鉱炉コアゴーレム — 溶鉱炉コアゴーレムが地区の真ん中で真っ赤に焼けてる。そばに立ってるだけで熱気がぶわっと押し寄せてくる、幽霊 — 距離をよく測りな。それでも越えなきゃ尾根には行けない。 / 進行 {current}/{target}",
    "熔炉核心魔像 — 熔炉核心魔像正在区域中央烧得通红，光是站在旁边就能感到热浪扑面。幽灵，注意保持距离。可不越过它，就到不了山脊。 ｜ 进度：{current}/{target}"
  ],
  [
    "溶鉄色の煙突地区へ — 次は煙突地区だよ。煙突という煙突から溶鉄色の煙が絶え間なく噴き出してる。息が詰まる前にさっさと入りな、幽霊 — もたもたしてたら煙が真っ先に行く手をかすませちまうよ。 / 進行 {current}/{target}",
    "前往铁辉烟囱区 — 接下来是铁辉烟囱区。每根烟囱都在不停喷出熔铁色的浓烟。趁窒息前赶紧进去，幽灵——再磨蹭，烟雾就要把前路遮得一干二净了。 ｜ 进度：{current}/{target}"
  ],
  [
    "One Sweet Bite — Don't save that cinnamon candy for later — go on, try one. I simmered it myself. / {current}/{target}",
    "一颗甜蜜 — 别舍不得那颗肉桂味硬糖，尝一颗吧。那可是我亲手熬制的。 ｜ 进度：{current}/{target}"
  ],
  [
    "Patron of the Temple — Stop by the stall ten times, and I'll set aside something special for you. / {current}/{target}",
    "教团赞助者 — 在商店购买十次，我会为你准备一份特别的礼物。 ｜ 进度：{current}/{target}"
  ],
  [
    "Sprout Uproar — Even the sprout fairies are worked up now. Please calm down eight of them for me. / {current}/{target}",
    "嫩芽的骚动 — 连嫩芽妖精也躁动起来了。请安抚八只。 ｜ 进度：{current}/{target}"
  ],
  [
    "용광로 코어 골렘 — 용광로 코어 골렘이 지구 한복판에서 벌겋게 달아 있어. 곁에 서 있기만 해도 열기가 훅훅 끼쳐, 유령 — 거리 잘 재. 그래도 넘어야 능선으로 가. / 진행 {current}/{target}",
    "熔炉核心魔像 — 熔炉核心魔像正在区域中央烧得通红，光是站在旁边就能感到热浪扑面。幽灵，注意保持距离。可不越过它，就到不了山脊。 ｜ 进度：{current}/{target}"
  ],
  [
    "{base_name} — Cooldown {base_sec}s (Hotkey {base_key}) Deals bonus damage when target HP is {mechanism_pct}% or below",
    "{base_name} — 冷却 {base_sec} 秒（快捷键：{base_key}） 目标 HP 低于或等于 {mechanism_pct}% 时威力提升"
  ],
  [
    "{base_name} — Cooldown {base_sec}s (Hotkey {base_key}) Pierces all enemies in a straight line (up to {cap_n} targets)",
    "{base_name} — 冷却 {base_sec} 秒（快捷键：{base_key}） 贯穿直线上的所有敌人（最多 {cap_n} 个目标）"
  ],
  [
    "{base_name} — Unlocks at Lv{base_level} (Hotkey {base_key}) Deals splash damage to enemies within {mechanism_radius}m",
    "{base_name} — Lv.{base_level} 解锁（快捷键：{base_key}） 对周围 {mechanism_radius}m 内的敌人造成范围伤害"
  ],
  [
    "添付: {mail1_name} x{mail1_quantity}, {mail2_name} x{mail2_quantity}, {mail3_name} x{mail3_quantity}, 経験値 {mailExp_exp}",
    "附件：{mail1_name} x{mail1_quantity}, {mail2_name} x{mail2_quantity}, {mail3_name} x{mail3_quantity}, 经验值 {mailExp_exp}"
  ],
  [
    "An adventure needs a goal! Press [Quest] to check what's next. (Also available from the menu bar at the bottom right)",
    "冒险当然要有目标！打开【任务】查看下一步行动。（也可通过右下角的菜单图标打开。）"
  ],
  [
    "Now it's the factory row lined with streetlamps. The lights are said to be going out one by one. Head down that road.",
    "接下来是路灯林立的工业区道路。听说灯光正在一盏接一盏地熄灭。沿那条路进去吧。"
  ],
  [
    "절단기를 해체하라 — 선로마다 절단기가 돌아가고 있어. 멈춘 척 서 있다가 지나가면 다시 돌아. 155개만 뜯어내, 유령 — 어설프게 건드렸다가 나한테 징징대지 말고. / 진행 {current}/{target}",
    "拆除切割自动机 — 每条轨道上都有切割自动机在运转。它们会装作停下，等你经过时再突然启动。拆掉155台，幽灵——别笨手笨脚地弄伤自己，又跑来向我哭诉。 ｜ 进度：{current}/{target}"
  ],
  [
    "첨부: {mail1_name} x{mail1_quantity}, {mail2_name} x{mail2_quantity}, {mail3_name} x{mail3_quantity}, 경험치 {mailExp_exp}",
    "附件：{mail1_name} x{mail1_quantity}, {mail2_name} x{mail2_quantity}, {mail3_name} x{mail3_quantity}, 经验值 {mailExp_exp}"
  ],
  [
    "A supply box the World Tree Temple grants to those on a pilgrimage. Contains travel funds, Elif, and candy together.",
    "世界树教团赠给踏上朝圣之路者的补给箱。里面装有盘缠、水晶叶和糖果。"
  ],
  [
    "Border scouts are guarding the edge of Duskwood. Please drive off just 100 of them, and the way should open, Speaki.",
    "边境精灵斥候把守着暮色森林边境入口。请击退100只，道路应该就会开放，斯皮奇。"
  ],
  [
    "Source of the Wailing — The wailing ghosts won't stop crying. Please quiet just twelve of them. / {current}/{target}",
    "哀嚎之源 — 哀嚎幽灵的哭声久久不息。请平息十二只。 ｜ 进度：{current}/{target}"
  ],
  [
    "{base_name} — Cooldown {base_sec}s (Hotkey {base_key}) Inflicts burn (damage over time) for {mechanism_sec}s on hit",
    "{base_name} — 冷却 {base_sec} 秒（快捷键：{base_key}） 命中时使目标灼烧 {mechanism_sec} 秒（持续伤害）"
  ],
  [
    "深部監視管制塔 — これがその管制塔だよ、幽霊。監視の目を全部操ってたのがこいつだ。ここさえ越えれば動力核はもう目の前だ — チャプター一つ丸ごとかかってる。一人で無理なら今言いな。 / 進行 {current}/{target}",
    "深处监控塔 — 这就是那座监控塔，幽灵。所有监视之眼都受它操控。越过这里，动力核心就在眼前——整整一个章节都押在这一战上。一个人应付不了，就趁现在说。 ｜ 进度：{current}/{target}"
  ],
  [
    "잠깐만요, 아주 중요한 얘기예요!\n스피키씨 계정을 되찾을 수 있는 복구 코드가 있어요 — 쿠키가 지워지거나 다른 브라우저로 오시면\n이 코드만이 유일한 방법이에요.\n설정(O키) > 계정에서 꼭 확인해 두세요!",
    "等一下，这件事非常重要！\n恢复码是找回斯皮奇账号的唯一凭证。若 Cookie 被清除或改用其他浏览器，没有恢复码就无法找回账号。\n请前往“设置（O）> 账号”查看并妥善保存！"
  ],
  [
    "If materials do not match exactly, the leftover points are banked and used automatically on your next enhancement.",
    "若材料点数无法刚好匹配，多余点数会自动储存，供下次强化优先使用。"
  ],
  [
    "Staff of the Dawnlit Great Tree x{quantity} (ATK+{bonus_atk} DEF+{bonus_def} HP+{bonus_hp}, Req. Lv {bonus_level})",
    "晨曦巨树法杖 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "The Diligent Pilgrim — Show your face on five different days. The temple remembers diligence. / {current}/{target}",
    "勤勉的朝圣者 — 请在五个不同的日子来露个面。教团会记住你的勤勉。 ｜ 进度：{current}/{target}"
  ],
  [
    "봉인된 시제 기간트 레이드 클리어 보상으로 얻는 고유 아이템 — 격납고에 잠들어 있던 호박 모양 공격 드론 '메카 호박'으로, 장차 이를 깨워 드론 동료로 삼을 수 있다(플레이어당 1개, 소모되지 않음).",
    "通关封印原型巨像团队副本后获得的特殊道具。一架沉睡在机库中的南瓜形攻击无人机“机械南瓜”，未来可将其唤醒并收为伙伴。（每位玩家限持 1 个，使用后不会消耗。）"
  ],
  [
    "융해 경계선 — 융해 경계선이야, 유령. 발밑이 부글부글 녹아내리는 구역이니까 경계 밖으로 넘어오는 것들 190마리만 정리해 — 선 넘어가면 돌아올 생각은 접고. / 진행 {current}/{target}",
    "熔融边界 — 这里是熔融边界，幽灵。脚下的大地正在咕嘟咕嘟地熔化。清除190只越过边界的家伙——你自己要是越线，就别指望能回来。 ｜ 进度：{current}/{target}"
  ],
  [
    "이제 준비 끝이에요! 레벨을 올리고 장비를 갖추시면 더 강해지실 거예요.\n필요하시면 언제든 저를 찾아와 주세요 — 즐거운 모험 되세요, 스피키씨!\n앞으로도 새로운 걸 만나시면 제가 가끔 팁을 알려드릴게요!",
    "准备就绪！升级并穿戴装备，就能不断变强。\n需要帮助时随时来找我。祝你冒险愉快，斯皮奇！\n以后遇到新事物，我也会不时送上提示！"
  ],
  [
    "溶解の境界線 — 溶解境界線だよ、幽霊。足元がぐつぐつ溶け落ちる区域だから、境界の外から越えてくるやつを百九十匹だけ片づけな — 自分が線を越えたら、戻れるとは思わないことだね。 / 進行 {current}/{target}",
    "熔融边界 — 这里是熔融边界，幽灵。脚下的大地正在咕嘟咕嘟地熔化。清除190只越过边界的家伙——你自己要是越线，就别指望能回来。 ｜ 进度：{current}/{target}"
  ],
  [
    "정비를 몸에 익히다 — 사 놓기만 하고 안 써 보면 그게 다 무슨 소용이야. 지금 여기서 세 번은 직접 써 봐, 유령 — 선로 위에선 몸이 먼저 기억해야 산다. / 진행 {current}/{target}",
    "熟悉整备用品 — 买来却不用，那还有什么意义？现在就在这里亲手用三次，幽灵——到了轨道上，只有先让身体记住用法，才能活命。 ｜ 进度：{current}/{target}"
  ],
  [
    "{base_name} — Cooldown {base_sec}s (Hotkey {base_key}) Deals splash damage to enemies within {mechanism_radius}m",
    "{base_name} — 冷却 {base_sec} 秒（快捷键：{base_key}） 对周围 {mechanism_radius}m 内的敌人造成范围伤害"
  ],
  [
    "封印された試作ギガントレイドのクリア報酬で手に入る固有アイテムだ — 格納庫に眠っていたカボチャ型攻撃ドローン「メカカボチャ」で、いずれ目覚めさせてドローンの仲間にすることができる（プレイヤー1人につき1個、消費されない）。",
    "通关封印原型巨像团队副本后获得的特殊道具。一架沉睡在机库中的南瓜形攻击无人机“机械南瓜”，未来可将其唤醒并收为伙伴。（每位玩家限持 1 个，使用后不会消耗。）"
  ],
  [
    "번개철탑 능선에 오르다 — 번개철탑 능선이야. 발밑으로 전류가 찌릿찌릿 흐르니까 한 발씩 골라 디뎌, 유령 — 아무 데나 밟았다간 후회해. 능선 위로 올라가. / 진행 {current}/{target}",
    "登上雷电塔岭 — 这里是雷电塔岭。电流就在脚下噼啪作响，每一步都要选好落脚点，幽灵——胡乱落脚可是会后悔的。登上山岭吧。 ｜ 进度：{current}/{target}"
  ],
  [
    "I hear a young dragon deep in the forest has lost its temper. Please calm it down safely, without getting hurt.",
    "听说森林深处的幼龙正在发脾气。请安抚它，也千万别让自己受伤。"
  ],
  [
    "동력핵 심부로 — 여기가 마지막이야, 유령. 냉각 멈춘 동력핵 심부로 내려가는 길이 열렸어. ...뭐, 걱정은 안 해. 여기까지 버텨 왔잖아, 너. 내려가. / 진행 {current}/{target}",
    "深入动力核心 — 这是最后一段路了，幽灵。通往动力核心深处的道路已经开启，那里的冷却系统早已停摆。……算了，我并不担心，毕竟你都撑到这里了。下去吧。 ｜ 进度：{current}/{target}"
  ],
  [
    "At the far end of the graveyard, the great tomb-keeper spirit awaits. This is the final trial of this journey.",
    "墓园尽头，守墓大亡灵正在等着你。这是本次旅程的最终试炼。"
  ],
  [
    "Fairy Tree Apprentice Staff x{quantity} (ATK+{bonus_atk} DEF+{bonus_def} HP+{bonus_hp}, Req. Lv {bonus_level})",
    "妖精木学徒法杖 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "Great Tree Root Breastplate x{quantity} (ATK+{bonus_atk} DEF+{bonus_def} HP+{bonus_hp}, Req. Lv {bonus_level})",
    "巨树根须胸甲 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "HP does not refill on its own! Tap the {key} slot to drink a potion. Coming back to town restores you to full.",
    "HP 不会自动恢复！点按 {key} 栏位喝下药水。回到城镇后会恢复至满值。"
  ],
  [
    "Wandering Spirits — The spirits have lost their peace. Please soothe just twelve of them. / {current}/{target}",
    "游荡的亡灵 — 亡灵失去了安宁。请安抚十二只。 ｜ 进度：{current}/{target}"
  ],
  [
    "봉인된 시제 기간트 — 공단 심부 격납고에 봉인 제단이 있어. 50레벨쯤 됐으면 문 정도는 열리겠지. 유령, 설마 혼자 갈 생각은 아니지? 동료부터 챙겨. / 진행 {current}/{target}",
    "封印原型巨像 — 工业区深处的机库里有一座封印祭坛。到了50级，门应该就能打开。幽灵，你不会打算一个人去吧？先叫上同伴。 ｜ 进度：{current}/{target}"
  ],
  [
    "廃線にたどり着く — 整備が終わったならついてきな、幽霊。信号灯だけが点滅する廃線だよ — 線路を外れたらどこに突っ込むか私にも分からない。ぴったりくっついて中へ入りな。 / 進行 {current}/{target}",
    "抵达旧信号铁路 — 整备完就跟上，幽灵。前面是只剩信号灯还在闪烁的旧信号铁路——偏离轨道会栽到哪里，连我也不知道。跟紧点，往里走。 ｜ 进度：{current}/{target}"
  ],
  [
    "封印された竜鱗 — 竜鱗の守護者は森の果ての祭壇の下に封印されているんです。封印が揺らいで風が荒れてしまったので、祭壇へ続く道のそよ風精霊を十体だけ、鎮めてきてください。 / 進行 {current}/{target}",
    "被封印的龙鳞 — 龙鳞守卫被封印在森林尽头的祭坛下。封印正在动摇，风势也变得狂暴了，请先平息祭坛路上的十只和风精灵。 ｜ 进度：{current}/{target}"
  ],
  [
    "封印された試作ギガント — 工業地帯の奥、格納庫に封印祭壇がある。五十レベルになれば扉くらい開くでしょ。幽霊、まさか一人で行くつもりじゃないよね? 仲間くらい連れてきな。 / 進行 {current}/{target}",
    "封印原型巨像 — 工业区深处的机库里有一座封印祭坛。到了50级，门应该就能打开。幽灵，你不会打算一个人去吧？先叫上同伴。 ｜ 进度：{current}/{target}"
  ],
  [
    "Before the Ancient Wind — The ancient wind spirit has awoken. Please be careful, Speaki. / {current}/{target}",
    "直面远古之风 — 远古风精灵苏醒了。请小心，斯皮奇。 ｜ 进度：{current}/{target}"
  ],
  [
    "Past the forest lies the dim Gearfield Moor. They say abandoned machines roam the fields — step in carefully.",
    "离开森林，便是暮色笼罩的齿轮原野。听说废弃机械仍在田野间游荡，请小心踏入。"
  ],
  [
    "Pumpkin Cart Summon Ticket x{quantity} (ATK+{bonus_atk} DEF+{bonus_def} HP+{bonus_hp}, Req. Lv {bonus_level})",
    "南瓜马车召唤券 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "폐선로에 다다르다 — 정비 끝났으면 따라와, 유령. 신호등만 깜빡이는 폐선로야 — 선로 벗어나면 어디로 처박힐지 나도 몰라. 바짝 붙어서 안으로 들어가. / 진행 {current}/{target}",
    "抵达旧信号铁路 — 整备完就跟上，幽灵。前面是只剩信号灯还在闪烁的旧信号铁路——偏离轨道会栽到哪里，连我也不知道。跟紧点，往里走。 ｜ 进度：{current}/{target}"
  ],
  [
    "谷の奥の封印の祭壇が、とうとう砕けてしまいました。燠火の竜鱗の暴君が歩み出てくる前に…どうか仲間を集めて祭壇へお入りください。レベル三十七にならないと封印の扉は開きませんよ。おひとりでは絶対にいけません、スピキさん。",
    "山谷深处的封印祭坛终于破裂了。趁烬火龙鳞暴君还没走出来……请召集同伴进入祭坛。达到三十七级后，封印门才会开启。绝对不能独自前往，斯皮奇。"
  ],
  [
    "黄昏森の国境へ — 南の古い国境路が開けました。黄昏花が咲き乱れる辺境の森を越えないと、モナティウムへは行けないんです。まずはその森まで行ってみてください、スピキさん。 / 進行 {current}/{target}",
    "前往暮色森林边境 — 南方的旧边境道路已经开放。要前往莫纳提姆，就必须穿过开满晚霞花的边境森林。先去那片森林看看吧，斯皮奇。 ｜ 进度：{current}/{target}"
  ],
  [
    "Beastfolk Leather Greaves x{quantity} (ATK+{bonus_atk} DEF+{bonus_def} HP+{bonus_hp}, Req. Lv {bonus_level})",
    "兽族皮革护胫 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "Beastfolk Warrior Greaves x{quantity} (ATK+{bonus_atk} DEF+{bonus_def} HP+{bonus_hp}, Req. Lv {bonus_level})",
    "兽族战士护胫 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "Developer's Pumpkin Armor x{quantity} (ATK+{bonus_atk} DEF+{bonus_def} HP+{bonus_hp}, Req. Lv {bonus_level})",
    "开发者的南瓜护甲 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "Developer's Pumpkin Staff x{quantity} (ATK+{bonus_atk} DEF+{bonus_def} HP+{bonus_hp}, Req. Lv {bonus_level})",
    "开发者的南瓜法杖 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "Fairy Order Patroller Top x{quantity} (ATK+{bonus_atk} DEF+{bonus_def} HP+{bonus_hp}, Req. Lv {bonus_level})",
    "妖精团巡逻者上衣 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "Marsh Witch's Brimmed Hat x{quantity} (ATK+{bonus_atk} DEF+{bonus_def} HP+{bonus_hp}, Req. Lv {bonus_level})",
    "湿地女巫宽檐帽 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "The raid was cancelled because not everyone made it in — every party member must enter for the raid to start",
    "未能全员入场，本次团队副本已取消。请等所有队员到齐后再开始"
  ],
  [
    "골짜기 안쪽 봉인 제단이 끝내 깨졌어요. 잉걸 용린 폭군이 걸어 나오기 전에… 부디 동료를 모아 제단으로 드세요. 레벨 서른일곱은 되셔야 봉인문이 열린답니다. 혼자서는 절대 안 돼요, 스피키씨.",
    "山谷深处的封印祭坛终于破裂了。趁烬火龙鳞暴君还没走出来……请召集同伴进入祭坛。达到三十七级后，封印门才会开启。绝对不能独自前往，斯皮奇。"
  ],
  [
    "노을숲 국경으로 — 남쪽 옛 국경길이 열렸어요. 노을꽃이 흐드러진 변경숲을 지나야 모나티엄으로 갈 수 있답니다. 우선 그 숲까지 가 보세요, 스피키씨. / 진행 {current}/{target}",
    "前往暮色森林边境 — 南方的旧边境道路已经开放。要前往莫纳提姆，就必须穿过开满晚霞花的边境森林。先去那片森林看看吧，斯皮奇。 ｜ 进度：{current}/{target}"
  ],
  [
    "순례의 보급 — 서리별 고개는 여태 가 보신 어느 길보다 춥고 멀어요. 떠나기 전에 상점에서 세 가지만 사 두세요. 준비 없이 나서면 돌아오지 못해요. / 진행 {current}/{target}",
    "朝圣补给 — 霜星雪岭比你走过的任何道路都更加寒冷、遥远。出发前，请先在商店买好三样东西。毫无准备地上路，可就回不来了。 ｜ 进度：{current}/{target}"
  ],
  [
    "森の果ての封印の祭壇の下で、竜鱗の守護者が眠っているんです。もう少し体はほぐれましたか？レベル十で封印の扉が開きますから、一度叩いてみてください。手に負えなければ無理はせず、まず仲間を呼んでくださいね、スピキさん。",
    "龙鳞守卫沉睡在森林尽头的封印祭坛之下。你也差不多热好身了吧？达到十级后，封印门就会开启，不妨去敲敲看。若觉得吃力，千万别逞强，先召集同伴吧，斯皮奇。"
  ],
  [
    "Developer's Pumpkin Helm x{quantity} (ATK+{bonus_atk} DEF+{bonus_def} HP+{bonus_hp}, Req. Lv {bonus_level})",
    "开发者的南瓜头盔 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "Dragonkin Battle Greaves x{quantity} (ATK+{bonus_atk} DEF+{bonus_def} HP+{bonus_hp}, Req. Lv {bonus_level})",
    "龙族战斗护胫 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "Dragonscale-etched Staff x{quantity} (ATK+{bonus_atk} DEF+{bonus_def} HP+{bonus_hp}, Req. Lv {bonus_level})",
    "龙鳞刻纹法杖 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "Fairy Forest Scout Staff x{quantity} (ATK+{bonus_atk} DEF+{bonus_def} HP+{bonus_hp}, Req. Lv {bonus_level})",
    "妖精森林斥候法杖 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "Frost-star Shard Greaves x{quantity} (ATK+{bonus_atk} DEF+{bonus_def} HP+{bonus_hp}, Req. Lv {bonus_level})",
    "霜星碎片护胫 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "Frostbloom Crystal Staff x{quantity} (ATK+{bonus_atk} DEF+{bonus_def} HP+{bonus_hp}, Req. Lv {bonus_level})",
    "霜花水晶法杖 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "Mecha Drone - Focus Fire x{quantity} (ATK+{bonus_atk} DEF+{bonus_def} HP+{bonus_hp}, Req. Lv {bonus_level})",
    "机械无人机·集中射击 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "Police Car Summon Ticket x{quantity} (ATK+{bonus_atk} DEF+{bonus_def} HP+{bonus_hp}, Req. Lv {bonus_level})",
    "警车召唤券 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "폐선로 기관장 — 폐선로 기관장이 종착역을 틀어쥐고 있어. 저 고물만 넘으면 다음 구역이야 — 혼자 벅차면 말해, 유령. ...도와준다는 건 아니고. / 진행 {current}/{target}",
    "旧铁路幽灵列车长 — 旧铁路幽灵列车长控制着终点站。越过那个破铜烂铁，就是下一个区域。一个人撑不住就说，幽灵。……我可没说会帮你。 ｜ 进度：{current}/{target}"
  ],
  [
    "Dragonscale Breastplate x{quantity} (ATK+{bonus_atk} DEF+{bonus_def} HP+{bonus_hp}, Req. Lv {bonus_level})",
    "龙鳞胸甲 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "Pumpkin Festival Bundle x{quantity} (ATK+{bonus_atk} DEF+{bonus_def} HP+{bonus_hp}, Req. Lv {bonus_level})",
    "南瓜庆典礼包 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "이 눈깔들, 하나같이 안쪽을 노려보고 있어. 200개만 감겨, 유령. ...느껴져? 이걸 전부 지휘하는 뭔가가 심부를 내려다보며 감시하고 있어. 그놈이 우릴 똑바로 보기 전에, 눈부터 끄자.",
    "这些眼珠全都盯着里面。让200只眼睛闭上吧，幽灵。……感觉到了吗？有什么东西正俯瞰着深处，操纵所有眼睛监视这里。趁它还没看向我们，先把这些眼睛关掉。"
  ],
  [
    "Beastfolk Leather Hood x{quantity} (ATK+{bonus_atk} DEF+{bonus_def} HP+{bonus_hp}, Req. Lv {bonus_level})",
    "兽族皮革兜帽 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "Beastfolk Warrior Helm x{quantity} (ATK+{bonus_atk} DEF+{bonus_def} HP+{bonus_hp}, Req. Lv {bonus_level})",
    "兽族战士头盔 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "Fairy Order Novice Top x{quantity} (ATK+{bonus_atk} DEF+{bonus_def} HP+{bonus_hp}, Req. Lv {bonus_level})",
    "妖精团新手上衣 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "Now talk to me — I'm the one in blue! Come closer and left-click! The dialog has both [Quest] and [Shop].",
    "现在来和我说话吧——我就是那个穿蓝衣服的人！靠近后单击鼠标左键。对话框中可以打开【任务】和【商店】。"
  ],
  [
    "숲 끝 봉인 제단 아래 용린 수호자가 잠들어 있어요. 이제 몸이 좀 풀리셨죠? 열 레벨이면 봉인문이 열리니, 한번 두드려 보세요. 버거우면 억지 부리지 말고 동료부터 불러오세요, 스피키씨.",
    "龙鳞守卫沉睡在森林尽头的封印祭坛之下。你也差不多热好身了吧？达到十级后，封印门就会开启，不妨去敲敲看。若觉得吃力，千万别逞强，先召集同伴吧，斯皮奇。"
  ],
  [
    "火花を飲み込むインプボット — 工業地区の街灯をインプボットたちが飲み込んで、灯りを消しています。百三十体だけ捕まえていただければ、また道が明るくなるはずです。 / 進行 {current}/{target}",
    "吞噬火焰的小恶魔机器人 — 焊火小恶魔机器人吞噬工业区道路上的路灯，让灯光熄灭。抓住130只，道路就会再次亮起来。 ｜ 进度：{current}/{target}"
  ],
  [
    "Attached: {mail1_name} x{mail1_quantity}, {mail2_name} x{mail2_quantity}, {mail3_name} x{mail3_quantity}",
    "附件：{mail1_name} x{mail1_quantity}, {mail2_name} x{mail2_quantity}, {mail3_name} x{mail3_quantity}"
  ],
  [
    "Cinnamon Health Candy x{quantity} (ATK+{bonus_atk} DEF+{bonus_def} HP+{bonus_hp}, Req. Lv {bonus_level})",
    "肉桂味健康硬糖 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "Dragonkin Battle Helm x{quantity} (ATK+{bonus_atk} DEF+{bonus_def} HP+{bonus_hp}, Req. Lv {bonus_level})",
    "龙族战斗头盔 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "Frost-star Shard Helm x{quantity} (ATK+{bonus_atk} DEF+{bonus_def} HP+{bonus_hp}, Req. Lv {bonus_level})",
    "霜星碎片头盔 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "Gravekeeper's Greaves x{quantity} (ATK+{bonus_atk} DEF+{bonus_def} HP+{bonus_hp}, Req. Lv {bonus_level})",
    "守墓人护胫 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "Snowfrost Spirit Robe x{quantity} (ATK+{bonus_atk} DEF+{bonus_def} HP+{bonus_hp}, Req. Lv {bonus_level})",
    "雪霜精灵长袍 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "Welcome to Elias, Speaki!\nI'm Ner — this is the World Tree Temple.\nLet me show you a few things — ready?",
    "欢迎来到埃利亚斯，斯皮奇！\n我是尼尔，这里是世界树教团。\n先让我教你一些冒险的基础知识——准备好了吗？"
  ],
  [
    "봉인된 용린 — 용린 수호자는 숲 끝 제단 아래 봉인됐어요. 봉인이 흔들려 바람이 사나워졌으니, 제단 길목의 산들 바람정령 열만 잠재워 주세요. / 진행 {current}/{target}",
    "被封印的龙鳞 — 龙鳞守卫被封印在森林尽头的祭坛下。封印正在动摇，风势也变得狂暴了，请先平息祭坛路上的十只和风精灵。 ｜ 进度：{current}/{target}"
  ],
  [
    "動力核深部へ — ここが最後だよ、幽霊。冷却の止まった動力核深部へ下る道が開いた。……まあ、心配はしてない。ここまで耐え抜いてきたんだからね、お前は。下りな。 / 進行 {current}/{target}",
    "深入动力核心 — 这是最后一段路了，幽灵。通往动力核心深处的道路已经开启，那里的冷却系统早已停摆。……算了，我并不担心，毕竟你都撑到这里了。下去吧。 ｜ 进度：{current}/{target}"
  ],
  [
    "Elven Hunter Greaves x{quantity} (ATK+{bonus_atk} DEF+{bonus_def} HP+{bonus_hp}, Req. Lv {bonus_level})",
    "精灵猎手护胫 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "HP does not refill on its own! Press {key} to drink a potion. Coming back to town restores you to full.",
    "HP 不会自动恢复！按 {key} 键喝下药水。回到城镇后会恢复至满值。"
  ],
  [
    "Marshfog Spell Staff x{quantity} (ATK+{bonus_atk} DEF+{bonus_def} HP+{bonus_hp}, Req. Lv {bonus_level})",
    "沼雾咒术法杖 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "Temple Return Scroll x{quantity} (ATK+{bonus_atk} DEF+{bonus_def} HP+{bonus_hp}, Req. Lv {bonus_level})",
    "教团回城卷轴 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "The developer will reply after reviewing. Replies are kept in your inbox whether or not you are online.",
    "开发者查看后会予以回复。无论你是否在线，回复都会保存在反馈记录中。"
  ],
  [
    "これで準備万端です!レベルを上げて装備を整えるともっと強くなれますよ。\n必要な時はいつでも私を訪ねてくださいね — 楽しい冒険を、スピキさん!\nこれからも新しいものに出会ったら、時々ヒントをお伝えしますね!",
    "准备就绪！升级并穿戴装备，就能不断变强。\n需要帮助时随时来找我。祝你冒险愉快，斯皮奇！\n以后遇到新事物，我也会不时送上提示！"
  ],
  [
    "廃線機関長の幽霊 — 廃線機関長が終着駅を握ってる。あのポンコツさえ越えれば次の区域だよ — 一人で厳しいなら言いな、幽霊。……手伝うってわけじゃないけど。 / 進行 {current}/{target}",
    "旧铁路幽灵列车长 — 旧铁路幽灵列车长控制着终点站。越过那个破铜烂铁，就是下一个区域。一个人撑不住就说，幽灵。……我可没说会帮你。 ｜ 进度：{current}/{target}"
  ],
  [
    "根の洞の敷居 — いよいよ根の洞です。敷居を守る根のゴーレムを百八十体だけ、砕いてきてください。遅いですが、一度地面をねじると近くが全部揺れてしまいますよ。 / 進行 {current}/{target}",
    "曙光根穴的入口 — 接下来是曙光根穴。请摧毁一百八十只把守入口的树根魔像。它们虽然迟缓，但只要扭动一次大地，四周都会震颤。 ｜ 进度：{current}/{target}"
  ],
  [
    "巡礼の補給 — 霜星の峠は、これまで歩かれたどの道より寒くて遠いんです。発つ前に露店で三つだけ揃えていってください。備えなしで出ては、戻ってこられませんよ。 / 進行 {current}/{target}",
    "朝圣补给 — 霜星雪岭比你走过的任何道路都更加寒冷、遥远。出发前，请先在商店买好三样东西。毫无准备地上路，可就回不来了。 ｜ 进度：{current}/{target}"
  ],
  [
    "Ashen Mourning Robe x{quantity} (ATK+{bonus_atk} DEF+{bonus_def} HP+{bonus_hp}, Req. Lv {bonus_level})",
    "灰烬哀悼长袍 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "Dawn Warden Greaves x{quantity} (ATK+{bonus_atk} DEF+{bonus_def} HP+{bonus_hp}, Req. Lv {bonus_level})",
    "黎明守望者护胫 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "Marsh Witch Greaves x{quantity} (ATK+{bonus_atk} DEF+{bonus_def} HP+{bonus_hp}, Req. Lv {bonus_level})",
    "湿地女巫护胫 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "Moonhaze Witch Robe x{quantity} (ATK+{bonus_atk} DEF+{bonus_def} HP+{bonus_hp}, Req. Lv {bonus_level})",
    "月晕女巫长袍 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "번개철탑 수호기 — 번개철탑 수호기가 능선 꼭대기에 앉아 있어. 저놈만 넘으면 동력핵 심부야 — 마지막 문 앞이지. 정신 바짝 차려, 유령. / 진행 {current}/{target}",
    "雷电塔守护机 — 雷电塔守护机盘踞在山脊顶端。越过它就是动力核心深处——最后一道门就在眼前。打起精神，幽灵。 ｜ 进度：{current}/{target}"
  ],
  [
    "{key} 버튼을 한 번 누르시면 자동 공격이 시작돼요! 타겟이 쓰러질 때까지 알아서 이어가고, 다시 누르시면 멈춰요. (설정에서 자동 반복을 끄시면 누르실 때마다 한 대씩 나가요)",
    "点按一次 {key} 即可开启自动攻击！攻击会持续到目标倒下，再点按一次即可停止。（若在设置中关闭自动攻击，每次点按只会攻击一次。）"
  ],
  [
    "吹雪の中のともし火 — 吹雪の中を青い鬼火がさまよっているそうです。百三十個だけ、消してきてください。近くに立っていると、足元から先に凍りつくそうですよ。 / 進行 {current}/{target}",
    "暴风雪中的鬼火 — 听说暴风雪中飘荡着冰霜鬼火。请熄灭一百三十只。靠得太近，脚下会先结冰。 ｜ 进度：{current}/{target}"
  ],
  [
    "雷鉄塔の尾根に登る — 雷鉄塔の尾根だよ。足元にビリビリ電流が流れてるから、一歩ずつ選んで踏みな、幽霊 — 適当に踏んだら後悔するよ。尾根の上まで登りな。 / 進行 {current}/{target}",
    "登上雷电塔岭 — 这里是雷电塔岭。电流就在脚下噼啪作响，每一步都要选好落脚点，幽灵——胡乱落脚可是会后悔的。登上山岭吧。 ｜ 进度：{current}/{target}"
  ],
  [
    "Gravekeeper's Hood x{quantity} (ATK+{bonus_atk} DEF+{bonus_def} HP+{bonus_hp}, Req. Lv {bonus_level})",
    "守墓人兜帽 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "Moonlight will-o'-the-wisps are drifting through Moonring Marshdell. Please scatter just ten of them.",
    "月环泽谷中飘荡着月光鬼火。请驱散十只。"
  ],
  [
    "Spirit-bound Staff x{quantity} (ATK+{bonus_atk} DEF+{bonus_def} HP+{bonus_hp}, Req. Lv {bonus_level})",
    "精灵缚结法杖 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "Wailing Seal Staff x{quantity} (ATK+{bonus_atk} DEF+{bonus_def} HP+{bonus_hp}, Req. Lv {bonus_level})",
    "哀鸣封印法杖 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "폭주 동력핵 — 감시 관제탑까지 넘었으니 이제야 동력핵 본체가 모습을 드러냈네. 유령, 이번에도 혼자 갈 생각이면 곤란해 — 동료 데려가. / 진행 {current}/{target}",
    "暴走动力核心 — 既然连监控塔都越过了，动力核心本体终于现身了。幽灵，这一次可不能再单独行动——带上同伴。 ｜ 进度：{current}/{target}"
  ],
  [
    "墓地の祭壇の下で、墓守の石像亡霊がまだ目を覚ましているんです。大亡霊を越えられたのなら、次はそちらの番ですよ。レベル二十八で封印の扉が開きますから…今度はぜひ仲間と一緒に行ってくださいね、スピキさん。",
    "墓园祭坛之下，守墓石像亡灵依然醒着。既然已经越过守墓大亡灵，接下来就轮到它了。达到二十八级后，封印门就会开启……这一次请务必与同伴同行，斯皮奇。"
  ],
  [
    "Spiritcaller Robe x{quantity} (ATK+{bonus_atk} DEF+{bonus_def} HP+{bonus_hp}, Req. Lv {bonus_level})",
    "唤灵师长袍 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "Temple Supply Box x{quantity} (ATK+{bonus_atk} DEF+{bonus_def} HP+{bonus_hp}, Req. Lv {bonus_level})",
    "教团补给箱 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "You've come to, Speaki! Welcome to the World Tree Temple. Shall we start with just one step forward?",
    "你醒了，斯皮奇。欢迎来到世界树教团。先向前走几步吧。"
  ],
  [
    "トロッコゴーレムの暴走 — トロッコゴーレムたちが線路の上を好き勝手に暴走してる。百四十五体だけ壊しな、幽霊 — 轢かれたくないなら背後にも気をつけて。 / 進行 {current}/{target}",
    "失控的废弃轨道矿车魔像 — 废弃轨道矿车魔像正在轨道上横冲直撞。砸碎145台，幽灵——不想被碾过去，就连背后也盯紧点。 ｜ 进度：{current}/{target}"
  ],
  [
    "モナティウムからの手紙 — モナティウムの市庁舎から救援要請が届きました。南の古い国境路、黄昏花の咲く森を越える必要があるそうです。（陽風の森 南の端） / 進行 {current}/{target}",
    "来自莫纳提姆的信 — 莫纳提姆市政厅发来了求救信。要前往那里，必须沿南方旧边境道路，穿过开满晚霞花的森林。（晴风森林南端） ｜ 进度：{current}/{target}"
  ],
  [
    "{key}키를 한 번 누르시면 자동 공격이 시작돼요! 타겟이 쓰러질 때까지 알아서 이어가고, 다시 누르시면 멈춰요. (설정에서 자동 반복을 끄시면 누르실 때마다 한 대씩 나가요)",
    "按一次 {key} 即可开启自动攻击！攻击会持续到目标倒下，再按一次即可停止。（若在设置中关闭自动攻击，每次按键只会攻击一次。）"
  ],
  [
    "A special currency obtained only by leveling up Speaki's Affection — no drop, gacha, or shop route.",
    "只能通过提升斯皮奇好感度获得的特殊货币，无法从掉落、抽取或商店中取得。"
  ],
  [
    "Dawn Warden Helm x{quantity} (ATK+{bonus_atk} DEF+{bonus_def} HP+{bonus_hp}, Req. Lv {bonus_level})",
    "黎明守望者头盔 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "Experience Pouch x{quantity} (ATK+{bonus_atk} DEF+{bonus_def} HP+{bonus_hp}, Req. Lv {bonus_level})",
    "经验袋 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "Tap a slot in Equipment, then tap [Equip] on a candidate · Open Equipment from the bottom menu icon",
    "在装备界面选择栏位，再从候选装备中点击【装备】"
  ],
  [
    "모나티엄의 편지 — 모나티엄 시청에서 구조 요청이 왔어요. 남쪽 옛 국경길, 노을꽃이 피는 숲을 지나야 한대요. (햇바람 숲 남쪽 끝) / 진행 {current}/{target}",
    "来自莫纳提姆的信 — 莫纳提姆市政厅发来了求救信。要前往那里，必须沿南方旧边境道路，穿过开满晚霞花的森林。（晴风森林南端） ｜ 进度：{current}/{target}"
  ],
  [
    "뿌리굴의 문턱 — 이제 뿌리굴이에요. 문턱을 지키는 뿌리 골렘 백여든만 부숴 주세요. 느리지만 한 번 땅을 뒤틀면 근처가 다 흔들려요. / 진행 {current}/{target}",
    "曙光根穴的入口 — 接下来是曙光根穴。请摧毁一百八十只把守入口的树根魔像。它们虽然迟缓，但只要扭动一次大地，四周都会震颤。 ｜ 进度：{current}/{target}"
  ],
  [
    "여명빛 파수꾼 — 여명빛 파수꾼. 교단이 아주 오래 기다려 온 이름이에요. 다녀오시면… 제가 상점 문을 닫고 마중 나갈게요, 스피키씨. / 진행 {current}/{target}",
    "曙光守卫 — 曙光守卫——教团已经等待这个名字太久了。等你回来……我会关上店门，亲自去迎接你，斯皮奇。 ｜ 进度：{current}/{target}"
  ],
  [
    "{base_name} — Lv{base_level}에 해금 (핫키 {base_key}) 주변 반경 {mechanism_radius}m 적에게 광역 피해 (최대 {cap_n}체)",
    "{base_name} — Lv.{base_level} 解锁（快捷键：{base_key}） 对周围 {mechanism_radius}m 内的敌人造成范围伤害（最多 {cap_n} 个目标）"
  ],
  [
    "{base_name} — Unlocks at Lv{base_level} (Hotkey {base_key}) Pierces all enemies in a straight line",
    "{base_name} — Lv.{base_level} 解锁（快捷键：{base_key}） 贯穿直线上的所有敌人"
  ],
  [
    "歯車野に足を踏み入れる — 森を抜けると、薄暗い歯車野です。捨てられた機械たちが野原を転がり回っているそうなので、気をつけて足を踏み入れてください。 / 進行 {current}/{target}",
    "踏入齿轮原野 — 离开森林，便是暮色笼罩的齿轮原野。听说废弃机械仍在田野间游荡，请小心踏入。 ｜ 进度：{current}/{target}"
  ],
  [
    "霜星の峠へ — 峠の入り口に霜熊の獣人たちが巣穴を掘ったそうです。百二十匹だけ、追い払ってください。雪に足を取られると、あの前足はかわせませんから。 / 進行 {current}/{target}",
    "前往霜星雪岭 — 听说冰霜熊人在雪岭入口筑了巢。请赶走一百二十只。一旦双脚陷进积雪，就躲不开它们的熊掌了。 ｜ 进度：{current}/{target}"
  ],
  [
    "添付: {mail1_name} x{mail1_quantity}, {mail2_name} x{mail2_quantity}, {mail3_name} x{mail3_quantity}",
    "附件：{mail1_name} x{mail1_quantity}, {mail2_name} x{mail2_quantity}, {mail3_name} x{mail3_quantity}"
  ],
  [
    "Elven Scout Cap x{quantity} (ATK+{bonus_atk} DEF+{bonus_def} HP+{bonus_hp}, Req. Lv {bonus_level})",
    "精灵斥候帽 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "Now talk to me — I'm the one in blue! Come closer and tap! The dialog has both [Quest] and [Shop].",
    "现在来和我说话吧——我就是那个穿蓝衣服的人！靠近后点按我。对话框中可以打开【任务】和【商店】。"
  ],
  [
    "This Week's Subjugation — This week's big task. A hundred monsters, any kind. / {current}/{target}",
    "本周讨伐 — 这是本周的大任务。讨伐一百只，种类不限。 ｜ 进度：{current}/{target}"
  ],
  [
    "첨부: {mail1_name} x{mail1_quantity}, {mail2_name} x{mail2_quantity}, {mail3_name} x{mail3_quantity}",
    "附件：{mail1_name} x{mail1_quantity}, {mail2_name} x{mail2_quantity}, {mail3_name} x{mail3_quantity}"
  ],
  [
    "{base_name} — Lv{base_level}에 해금 (핫키 {base_key}) 대상 HP {mechanism_pct}% 이하일 때 위력 강화 (최대 {cap_n}체)",
    "{base_name} — Lv.{base_level} 解锁（快捷键：{base_key}） 目标 HP 低于或等于 {mechanism_pct}% 时威力提升（最多 {cap_n} 个目标）"
  ],
  [
    "黎明光の守護者 — 黎明光の守護者。教団がずっと長いあいだ待ち続けてきた名前です。行ってこられたら…私は露店を畳んでお迎えに出ますね、スピキさん。 / 進行 {current}/{target}",
    "曙光守卫 — 曙光守卫——教团已经等待这个名字太久了。等你回来……我会关上店门，亲自去迎接你，斯皮奇。 ｜ 进度：{current}/{target}"
  ],
  [
    "整備を体に覚えさせる — 買っただけで使わなきゃ意味ないでしょ。今ここで三回、実際に使ってみな、幽霊 — 線路の上じゃ体が先に覚えてないと死ぬよ。 / 進行 {current}/{target}",
    "熟悉整备用品 — 买来却不用，那还有什么意义？现在就在这里亲手用三次，幽灵——到了轨道上，只有先让身体记住用法，才能活命。 ｜ 进度：{current}/{target}"
  ],
  [
    "Cinnamon Candy x{quantity} (ATK+{bonus_atk} DEF+{bonus_def} HP+{bonus_hp}, Req. Lv {bonus_level})",
    "肉桂味硬糖 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "Supreme Crayon x{quantity} (ATK+{bonus_atk} DEF+{bonus_def} HP+{bonus_hp}, Req. Lv {bonus_level})",
    "金蜡笔 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "The forest fairies have gotten awfully noisy lately. Could you check on just five of them for me?",
    "森林妖精最近格外吵闹。能帮我查看五只森林妖精的情况吗？"
  ],
  [
    "Ultimate Pouch x{quantity} (ATK+{bonus_atk} DEF+{bonus_def} HP+{bonus_hp}, Req. Lv {bonus_level})",
    "终极袋 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "광차 골렘의 폭주 — 광차 골렘들이 선로 위를 제멋대로 폭주해. 145대만 부숴, 유령 — 깔리고 싶지 않으면 등 뒤도 봐 가면서. / 진행 {current}/{target}",
    "失控的废弃轨道矿车魔像 — 废弃轨道矿车魔像正在轨道上横冲直撞。砸碎145台，幽灵——不想被碾过去，就连背后也盯紧点。 ｜ 进度：{current}/{target}"
  ],
  [
    "{base_name} — クールダウン {base_sec}秒（ホットキー {base_key}） 周囲半径{mechanism_radius}mの敵に範囲ダメージ (最大{cap_n}体)",
    "{base_name} — 冷却 {base_sec} 秒（快捷键：{base_key}） 对周围 {mechanism_radius}m 内的敌人造成范围伤害（最多 {cap_n} 个目标）"
  ],
  [
    "燠火の谷 — 峠を越えると、燠火の流れる谷です。さまよう溶岩の鬼火を百五十個だけ、散らしてきてください。足元で弾けるそうですから、お気をつけて。 / 進行 {current}/{target}",
    "烬火山谷 — 翻过山口，便是流淌着烬火的山谷。请驱散一百五十只游荡的熔岩鬼火。它们会在脚下爆炸，务必小心。 ｜ 进度：{current}/{target}"
  ],
  [
    "Mecha Pumpkin x{quantity} (ATK+{bonus_atk} DEF+{bonus_def} HP+{bonus_hp}, Req. Lv {bonus_level})",
    "机械南瓜 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "눈보라 속 불씨 — 눈보라 속에서 파란 불씨가 떠돈다고들 해요. 백서른만 꺼 주세요. 가까이 서 있으면 발밑이 먼저 얼어붙는대요. / 진행 {current}/{target}",
    "暴风雪中的鬼火 — 听说暴风雪中飘荡着冰霜鬼火。请熄灭一百三十只。靠得太近，脚下会先结冰。 ｜ 进度：{current}/{target}"
  ],
  [
    "멈추지 않는 수확기 — 버려진 수확기들이 아직도 들판을 갈아엎어요. 115대만 멈춰 세워 주세요. 애먼 밭이 다 뒤집히기 전에요. / 진행 {current}/{target}",
    "永不停歇的收割机 — 齿刃收割机至今还在翻耕原野。请停下115台，别让无辜的田地全被翻个底朝天。 ｜ 进度：{current}/{target}"
  ],
  [
    "서리별 고개로 — 고개 초입에 곰 수인들이 굴을 텄대요. 백스물만 물려 주세요. 눈에 발이 묶이면 그 앞발을 피할 수가 없거든요. / 진행 {current}/{target}",
    "前往霜星雪岭 — 听说冰霜熊人在雪岭入口筑了巢。请赶走一百二十只。一旦双脚陷进积雪，就躲不开它们的熊掌了。 ｜ 进度：{current}/{target}"
  ],
  [
    "어스름을 달리는 것 — 어스름이 내리면 숲을 내달리는 것들이 있어요. 110마리만 붙잡아 주세요. 밤길이 조금은 조용해질 거예요. / 진행 {current}/{target}",
    "奔行于暮色之物 — 暮色降临后，有些家伙会在森林里狂奔。请抓住110只，夜路就能安静一些。 ｜ 进度：{current}/{target}"
  ],
  [
    "잿가루가 가라앉을 때 — 잿가루가 하도 날려서 앞이 안 보여. 170마리만 걷어내, 유령 — 재가 가라앉아야 그 안쪽이 보이거든. / 진행 {current}/{target}",
    "当灰烬落定 — 灰尘精灵漫天飞舞，什么都看不清。清除170只，幽灵——只有等尘埃落定，才能看清深处。 ｜ 进度：{current}/{target}"
  ],
  [
    "{base_name} — Lv{base_level}에 해금 (핫키 {base_key}) 적중 시 {mechanism_sec}초간 화상(지속 피해) (최대 {cap_n}체)",
    "{base_name} — Lv.{base_level} 解锁（快捷键：{base_key}） 命中时使目标灼烧 {mechanism_sec} 秒（持续伤害）（最多 {cap_n} 个目标）"
  ],
  [
    "{base_name} — Lv{base_level}で解放（ホットキー {base_key}） 周囲半径{mechanism_radius}mの敵に範囲ダメージ (最大{cap_n}体)",
    "{base_name} — Lv.{base_level} 解锁（快捷键：{base_key}） 对周围 {mechanism_radius}m 内的敌人造成范围伤害（最多 {cap_n} 个目标）"
  ],
  [
    "{base_name} — 쿨다운 {base_sec}초 (핫키 {base_key}) 주변 반경 {mechanism_radius}m 적에게 광역 피해 (최대 {cap_n}체)",
    "{base_name} — 冷却 {base_sec} 秒（快捷键：{base_key}） 对周围 {mechanism_radius}m 内的敌人造成范围伤害（最多 {cap_n} 个目标）"
  ],
  [
    "Crayon Pouch x{quantity} (ATK+{bonus_atk} DEF+{bonus_def} HP+{bonus_hp}, Req. Lv {bonus_level})",
    "蜡笔袋 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "Garnet Berry x{quantity} (ATK+{bonus_atk} DEF+{bonus_def} HP+{bonus_hp}, Req. Lv {bonus_level})",
    "石榴石果实 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "Garnet Punch x{quantity} (ATK+{bonus_atk} DEF+{bonus_def} HP+{bonus_hp}, Req. Lv {bonus_level})",
    "石榴石水果羹 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "노을숲 대족장 — 노을숲 대족장이 국경을 틀어쥐고 있어요. 이 자만 넘으면 톱니들녘으로 갈 수 있답니다. 조심하세요, 스피키씨. / 진행 {current}/{target}",
    "暮色森林大酋长 — 暮色森林大酋长控制着边境。只要越过它，就能前往齿轮原野。请小心，斯皮奇。 ｜ 进度：{current}/{target}"
  ],
  [
    "프레스를 정지시켜라 — 프레스들이 아직도 허공을 내리찍고 있어. 160대만 멈춰, 유령. 타이밍 놓치면 네가 눌린 깡통 신세야. / 진행 {current}/{target}",
    "停止冲压机 — 冲压机魔像仍在不停砸向空处。关停160台，幽灵。错过时机，你就会变成一只压扁的铁罐头。 ｜ 进度：{current}/{target}"
  ],
  [
    "この目玉ども、揃いも揃って内側を睨んでる。二百個だけ閉じさせな、幽霊。……感じる? これを全部指揮してる何かが深部を見下ろして監視してる。そいつが私たちをまともに見る前に、まず目から消そう。",
    "这些眼珠全都盯着里面。让200只眼睛闭上吧，幽灵。……感觉到了吗？有什么东西正俯瞰着深处，操纵所有眼睛监视这里。趁它还没看向我们，先把这些眼睛关掉。"
  ],
  [
    "{base_name} — 쿨다운 {base_sec}초 (핫키 {base_key}) 대상 HP {mechanism_pct}% 이하일 때 위력 강화 (최대 {cap_n}체)",
    "{base_name} — 冷却 {base_sec} 秒（快捷键：{base_key}） 目标 HP 低于或等于 {mechanism_pct}% 时威力提升（最多 {cap_n} 个目标）"
  ],
  [
    "{base_name} — クールダウン {base_sec}秒（ホットキー {base_key}） 対象HPが{mechanism_pct}%以下の時、威力強化 (最大{cap_n}体)",
    "{base_name} — 冷却 {base_sec} 秒（快捷键：{base_key}） 目标 HP 低于或等于 {mechanism_pct}% 时威力提升（最多 {cap_n} 个目标）"
  ],
  [
    "{base_name} — クールダウン {base_sec}秒（ホットキー {base_key}） 命中時{mechanism_sec}秒間火傷（継続ダメージ） (最大{cap_n}体)",
    "{base_name} — 冷却 {base_sec} 秒（快捷键：{base_key}） 命中时使目标灼烧 {mechanism_sec} 秒（持续伤害）（最多 {cap_n} 个目标）"
  ],
  [
    "雷鉄塔の守護機 — 雷鉄塔の守護機が尾根の頂上に座ってる。あいつさえ越えれば動力核深部だよ — 最後の扉の前ってこと。気を引き締めな、幽霊。 / 進行 {current}/{target}",
    "雷电塔守护机 — 雷电塔守护机盘踞在山脊顶端。越过它就是动力核心深处——最后一道门就在眼前。打起精神，幽灵。 ｜ 进度：{current}/{target}"
  ],
  [
    "A sealed altar! Tap the {key} button to take on the challenge — clear rewards come once a day.",
    "这是封印祭坛！点按 {key} 即可发起挑战；通关奖励每天只能领取一次。"
  ],
  [
    "An elven forest warden wants to put you to the test. Please win eight times to prove yourself.",
    "精灵守林人想考验你。战胜它八次，证明自己吧。"
  ],
  [
    "Speaki was moved — the candy's bittersweet taste felt just like their own thorny path in life.",
    "斯皮奇感动不已，说糖果甜中微苦的滋味，就像自己那荆棘丛生的人生。"
  ],
  [
    "Today's Hunt — Today's share of hunting. Any kind will do — just fifteen. / {current}/{target}",
    "今日狩猎 — 完成今天的狩猎吧。种类不限，击败十五只即可。 ｜ 进度：{current}/{target}"
  ],
  [
    "묘지 제단 아래, 석상망령이 아직 깨어 있어요. 무덤지기를 넘으셨다면 이제 그쪽 차례예요. 스물여덟 레벨이면 봉인문이 열리니… 이번엔 꼭 동료와 함께 가세요, 스피키씨.",
    "墓园祭坛之下，守墓石像亡灵依然醒着。既然已经越过守墓大亡灵，接下来就轮到它了。达到二十八级后，封印门就会开启……这一次请务必与同伴同行，斯皮奇。"
  ],
  [
    "コイルの蜘蛛の巣 — コイルが尾根を蜘蛛の巣みたいに絡めてる。百七十五個だけ切りな、幽霊 — 引っかかったら電流がそのままお前の体を伝うよ。 / 進行 {current}/{target}",
    "线圈蛛网 — 线圈蜘蛛机器人把山脊织成了蛛网。拆掉175台，幽灵——一旦被缠住，电流会直接贯穿你的身体。 ｜ 进度：{current}/{target}"
  ],
  [
    "{base_name} — Cooldown {base_sec}s (Hotkey {base_key}) Pierces all enemies in a straight line",
    "{base_name} — 冷却 {base_sec} 秒（快捷键：{base_key}） 贯穿直线上的所有敌人"
  ],
  [
    "{base_name} — Lv{base_level}で解放（ホットキー {base_key}） 対象HPが{mechanism_pct}%以下の時、威力強化 (最大{cap_n}体)",
    "{base_name} — Lv.{base_level} 解锁（快捷键：{base_key}） 目标 HP 低于或等于 {mechanism_pct}% 时威力提升（最多 {cap_n} 个目标）"
  ],
  [
    "{base_name} — Lv{base_level}で解放（ホットキー {base_key}） 命中時{mechanism_sec}秒間火傷（継続ダメージ） (最大{cap_n}体)",
    "{base_name} — Lv.{base_level} 解锁（快捷键：{base_key}） 命中时使目标灼烧 {mechanism_sec} 秒（持续伤害）（最多 {cap_n} 个目标）"
  ],
  [
    "止まらない収穫機 — 捨てられた収穫機がいまだに野原を掘り返しています。百十五台だけ止めてください。罪のない畑が全部ひっくり返される前に。 / 進行 {current}/{target}",
    "永不停歇的收割机 — 齿刃收割机至今还在翻耕原野。请停下115台，别让无辜的田地全被翻个底朝天。 ｜ 进度：{current}/{target}"
  ],
  [
    "Elif Pouch x{quantity} (ATK+{bonus_atk} DEF+{bonus_def} HP+{bonus_hp}, Req. Lv {bonus_level})",
    "水晶叶袋 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "Gear Pouch x{quantity} (ATK+{bonus_atk} DEF+{bonus_def} HP+{bonus_hp}, Req. Lv {bonus_level})",
    "装备袋 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "Gold Pouch x{quantity} (ATK+{bonus_atk} DEF+{bonus_def} HP+{bonus_hp}, Req. Lv {bonus_level})",
    "金币袋 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "불꽃을 삼키는 임프봇 — 공단길 가로등을 임프봇들이 삼켜 불을 꺼뜨려요. 130마리만 잡아 주시면 다시 길이 밝아질 거예요. / 진행 {current}/{target}",
    "吞噬火焰的小恶魔机器人 — 焊火小恶魔机器人吞噬工业区道路上的路灯，让灯光熄灭。抓住130只，道路就会再次亮起来。 ｜ 进度：{current}/{target}"
  ],
  [
    "코일 거미줄 — 코일들이 능선을 거미줄처럼 얽어놨어. 175개만 끊어, 유령 — 걸리면 전류가 그대로 네 몸을 타고 흐른다. / 진행 {current}/{target}",
    "线圈蛛网 — 线圈蜘蛛机器人把山脊织成了蛛网。拆掉175台，幽灵——一旦被缠住，电流会直接贯穿你的身体。 ｜ 进度：{current}/{target}"
  ],
  [
    "톱니들녘에 들어서다 — 숲을 벗어나면 어스름 톱니들녘이에요. 버려진 기계들이 들판을 굴러다닌다니, 조심히 발을 들여 보세요. / 진행 {current}/{target}",
    "踏入齿轮原野 — 离开森林，便是暮色笼罩的齿轮原野。听说废弃机械仍在田野间游荡，请小心踏入。 ｜ 进度：{current}/{target}"
  ],
  [
    "プレスを停止させろ — プレスがいまだに空を打ち下ろしてる。百六十台だけ止めな、幽霊。タイミングを逃したらお前が潰れた缶詰の仲間入りだよ。 / 進行 {current}/{target}",
    "停止冲压机 — 冲压机魔像仍在不停砸向空处。关停160台，幽灵。错过时机，你就会变成一只压扁的铁罐头。 ｜ 进度：{current}/{target}"
  ],
  [
    "{base_name} — 쿨다운 {base_sec}초 (핫키 {base_key}) 적중 시 {mechanism_sec}초간 화상(지속 피해) (최대 {cap_n}체)",
    "{base_name} — 冷却 {base_sec} 秒（快捷键：{base_key}） 命中时使目标灼烧 {mechanism_sec} 秒（持续伤害）（最多 {cap_n} 个目标）"
  ],
  [
    "Come back to town to continue the guide! Tap the {key} button near the portal to move there.",
    "请回到城镇继续教程！在传送门附近点按 {key} 按钮即可前往。"
  ],
  [
    "마을에서 스피키를 꾹 누른 채 문질러 주거나, 호박밭에서 애정 이모트({key})를 유지하면 애정도가 쌓여요. 두 경로 모두 하루 적립 상한이 있고 매일 초기화돼요.",
    "在城镇中按住斯皮奇来回抚摸，或在南瓜田持续使用好感表情（{key}），均可积累好感度。两种方式各有每日上限，并会在每天重置。"
  ],
  [
    "스피키 머리를 꾹 누른 채로 문질러 보세요! 활짝 웃으면 애정도가 쌓여요 — 레벨이 오를 때마다 최상급 크레파스를 드려요. 애정도는 강화 화면에서 확인할 수 있어요.",
    "按住斯皮奇的头来回抚摸吧！当它露出灿烂笑容时，就会积累好感度。好感度每提升 1 级，即可获得 1 支金蜡笔；进度可随时在强化界面查看。"
  ],
  [
    "이게 그 관제탑이야, 유령. 감시의 눈을 전부 부린 게 이놈이지. 여기만 넘으면 동력핵이 코앞이야 — 챕터 하나가 통째로 걸려 있어. 혼자 감당 안 되면 지금 말해.",
    "这就是那座监控塔，幽灵。所有监视之眼都受它操控。越过这里，动力核心就在眼前——整整一个章节都押在这一战上。一个人应付不了，就趁现在说。"
  ],
  [
    "잉걸 골짜기 — 고개를 넘으면 잉걸이 흐르는 골짜기예요. 떠도는 불씨 백쉰만 흩어 주세요. 발밑에서 터진다니 조심하시고요. / 진행 {current}/{target}",
    "烬火山谷 — 翻过山口，便是流淌着烬火的山谷。请驱散一百五十只游荡的熔岩鬼火。它们会在脚下爆炸，务必小心。 ｜ 进度：{current}/{target}"
  ],
  [
    "焼けた跡 — あの谷の獣人たちは、全身の火傷の跡を勲章のように見せびらかすんです。百六十匹だけ追い払っていただければ、道が開けますよ。 / 進行 {current}/{target}",
    "灼烧的伤痕 — 山谷里的焦灼兽人把满身灼痕当作勋章。赶走一百六十只，道路应该就会畅通。 ｜ 进度：{current}/{target}"
  ],
  [
    "Attached: {mail1_name} x{mail1_quantity}, {mail2_name} x{mail2_quantity}, EXP {mailExp_exp}",
    "附件：{mail1_name} x{mail1_quantity}, {mail2_name} x{mail2_quantity}, 经验值 {mailExp_exp}"
  ],
  [
    "Pick the nickname you will play under. You can set it only once and cannot change it later.",
    "请选择游戏中使用的昵称。昵称只能设置一次，之后无法更改。"
  ],
  [
    "국경 척후의 시험 — 노을숲 초입을 국경 척후들이 지켜요. 100마리만 물러서게 해 주시면 길이 열릴 거예요, 스피키씨. / 진행 {current}/{target}",
    "边境精灵斥候的试炼 — 边境精灵斥候把守着暮色森林边境入口。请击退100只，道路应该就会开放，斯皮奇。 ｜ 进度：{current}/{target}"
  ],
  [
    "녹슨 파수 기간트 — 녹슨 파수 기간트가 들녘 끝을 막고 섰어요. 낡았어도 주먹은 여전히 무겁다니, 부디 다치지 마세요. / 진행 {current}/{target}",
    "锈蚀守卫巨像 — 锈蚀守卫巨像挡住了原野尽头。听说它虽已老旧，拳头却依然沉重，请千万别受伤。 ｜ 进度：{current}/{target}"
  ],
  [
    "서리별 고대정령 — 고개 끝 얼음 공터에 서리별 고대정령이 앉아 있어요. 한 번은 넘어야 용암 골짜기로 갈 수 있답니다. / 진행 {current}/{target}",
    "霜星远古精灵 — 霜星远古精灵盘踞在雪岭尽头的冰原上。要前往烬火山谷，就必须先越过它。 ｜ 进度：{current}/{target}"
  ],
  [
    "폭주 동력핵 레이드 클리어 보상으로 얻는 고유 아이템 — 동력핵에서 뽑아낸 응축 동력으로, 장차 드론 동료를 강화하는 데 쓰인다(플레이어당 1개, 소모되지 않음).",
    "通关暴走动力核心团队副本后获得的特殊道具。由动力核心提取而成的浓缩能量，未来可用于强化无人机伙伴。（每位玩家限持 1 个，使用后不会消耗。）"
  ],
  [
    "피뢰 기사단 — 피뢰 기사단이 철탑 사이를 순찰해. 185기만 떨궈, 유령. 창끝에 벼락을 물고 다니니까 정면은 피하고. / 진행 {current}/{target}",
    "避雷针骑士团 — 避雷针骑士自动机正在铁塔之间巡逻。击落185台，幽灵。它们的枪尖带着雷电，别从正面硬碰。 ｜ 进度：{current}/{target}"
  ],
  [
    "{key}ボタンを一度押すと自動攻撃が始まります!ターゲットが倒れるまで勝手に続けて、もう一度押すと止まりますよ。(設定で自動繰り返しをオフにすると、押すたびに一撃ずつになります)",
    "点按一次 {key} 即可开启自动攻击！攻击会持续到目标倒下，再点按一次即可停止。（若在设置中关闭自动攻击，每次点按只会攻击一次。）"
  ],
  [
    "暴走する動力核 — 監視管制塔を越えて、やっと動力核本体が姿を現した。幽霊、今度も一人で行くつもりなら困るね — 仲間を連れてきな。 / 進行 {current}/{target}",
    "暴走动力核心 — 既然连监控塔都越过了，动力核心本体终于现身了。幽灵，这一次可不能再单独行动——带上同伴。 ｜ 进度：{current}/{target}"
  ],
  [
    "暴走する動力核レイドのクリア報酬で手に入る固有アイテムだ — 動力核から取り出した凝縮動力で、いずれドローンの仲間を強化するのに使われる（プレイヤー1人につき1個、消費されない）。",
    "通关暴走动力核心团队副本后获得的特殊道具。由动力核心提取而成的浓缩能量，未来可用于强化无人机伙伴。（每位玩家限持 1 个，使用后不会消耗。）"
  ],
  [
    "Recovering will delete your current account. If needed, note down its recovery code first.",
    "恢复后，当前账号将被删除。如有需要，请先记下当前账号的恢复码。"
  ],
  [
    "The guardian closes the distance even as you retreat — running alone won't win this fight.",
    "即使后退，守护者也会步步逼近；一味逃跑无法取胜。"
  ],
  [
    "You cannot change channels while inside a raid instance. Leave the instance and try again.",
    "团队副本内无法切换频道。请离开副本后重试。"
  ],
  [
    "다음은 굴뚝지구야. 굴뚝마다 쇳물빛 연기가 쉴 새 없이 뿜어져 나오지. 숨 막히기 전에 얼른 들어가, 유령 — 꾸물대면 연기가 앞길부터 뿌옇게 지워 버릴 테니까.",
    "接下来是铁辉烟囱区。每根烟囱都在不停喷出熔铁色的浓烟。趁窒息前赶紧进去，幽灵——再磨蹭，烟雾就要把前路遮得一干二净了。"
  ],
  [
    "사냥터로 나가 볼까요! 포탈 앞에서 {key} 버튼을 누르시면 필드로 가요. {key} 버튼은 포탈이든 봉인 제단이든 가까이 있는 것과 상호작용하는 버튼이랍니다.",
    "去狩猎场看看吧！靠近传送门后点按 {key}，即可前往野外。{key} 也能与附近的传送门、封印祭坛等物体互动。"
  ],
  [
    "압축장을 멈춰라 — 압축장이 멈추질 않아 공단이 온통 쇳소리예요. 140기만 세워 주세요. 그 너머가 모나티엄이랍니다. / 진행 {current}/{target}",
    "停止压缩场 — 废料压缩魔像让压缩场一直运转不停，整座工业区都回荡着金属撞击声。请关停140台。越过那里就是莫纳提姆。 ｜ 进度：{current}/{target}"
  ],
  [
    "호박밭이에요! {key}으로 애정 표현을 하고 가만히 계시면 애정도가 쌓여요 — 움직이면 멈추니 느긋하게 쉬어 가세요. 애정도는 강화 화면에서 확인할 수 있어요.",
    "这里是南瓜田！点按并按住 {key} 表达好感，同时保持不动，即可持续积累好感度。进度可随时在强化界面查看。"
  ],
  [
    "호박밭이에요! {key}키로 애정 표현을 하고 가만히 계시면 애정도가 쌓여요 — 움직이면 멈추니 느긋하게 쉬어 가세요. 애정도는 강화 화면에서 확인할 수 있어요.",
    "这里是南瓜田！按住 {key} 表达好感并保持不动，即可持续积累好感度。进度可随时在强化界面查看。"
  ],
  [
    "スピキの頭をクリックしたまま、なでなでしてみてください!満開の笑顔で愛情度が貯まりますよ — レベルが上がるたびに最上級クレパスをプレゼントです!愛情度は強化画面で確認できますよ。",
    "按住斯皮奇的头来回抚摸吧！当它露出灿烂笑容时，就会积累好感度。好感度每提升 1 级，即可获得 1 支金蜡笔；进度可随时在强化界面查看。"
  ],
  [
    "{key}キーを一度押すと自動攻撃が始まります!ターゲットが倒れるまで勝手に続けて、もう一度押すと止まりますよ。(設定で自動繰り返しをオフにすると、押すたびに一撃ずつになります)",
    "按一次 {key} 即可开启自动攻击！攻击会持续到目标倒下，再按一次即可停止。（若在设置中关闭自动攻击，每次按键只会攻击一次。）"
  ],
  [
    "薄暮を駆けるもの — 薄暮が下りると、森を駆け抜けるものたちがいます。百十匹だけ捕まえてください。夜道が少しは静かになるはずです。 / 進行 {current}/{target}",
    "奔行于暮色之物 — 暮色降临后，有些家伙会在森林里狂奔。请抓住110只，夜路就能安静一些。 ｜ 进度：{current}/{target}"
  ],
  [
    "街灯工業地区へ — 今度は街灯の並ぶ工業地区です。灯りがひとつ、またひとつと消えていっているそうです。その道へ進んでみてください。 / 進行 {current}/{target}",
    "前往灯火工厂区 — 接下来是路灯林立的工业区道路。听说灯光正在一盏接一盏地熄灭。沿那条路进去吧。 ｜ 进度：{current}/{target}"
  ],
  [
    "錆びた番兵ギガント — 錆びた番兵ギガントが野の果てをふさいでいます。古くても拳は今も重いそうですから、どうかケガをなさらないで。 / 進行 {current}/{target}",
    "锈蚀守卫巨像 — 锈蚀守卫巨像挡住了原野尽头。听说它虽已老旧，拳头却依然沉重，请千万别受伤。 ｜ 进度：{current}/{target}"
  ],
  [
    "番精霊の巡回 — 黎明の番精霊が洞の中を回りながら光の筋を引いています。百九十体だけ鎮めていただければ、巡回の線が途切れますよ。 / 進行 {current}/{target}",
    "黎明守护精灵的巡逻 — 黎明守护精灵在洞穴中巡游，划出道道光束。平息一百九十只，巡逻路线便会中断。 ｜ 进度：{current}/{target}"
  ],
  [
    "Ner's Regular — Just stop by the stall once. Regulars are the best. / {current}/{target}",
    "尼尔的常客 — 去商店随便买一样东西吧。常客总是最受欢迎的。 ｜ 进度：{current}/{target}"
  ],
  [
    "데인 자국 — 그 골짜기 수인들은 온몸에 덴 자국을 훈장처럼 달고 다녀요. 백예순만 물려 주시면 길이 트일 거예요. / 진행 {current}/{target}",
    "灼烧的伤痕 — 山谷里的焦灼兽人把满身灼痕当作勋章。赶走一百六十只，道路应该就会畅通。 ｜ 进度：{current}/{target}"
  ],
  [
    "메카 드론 - 집중 사격 x{quantity} (공+{bonus_atk} 방+{bonus_def} 체+{bonus_hp}, 요구레벨 {bonus_level})",
    "机械无人机·集中射击 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "黄昏森の大族長 — 黄昏森の大族長が国境を握っています。この者さえ越えれば、歯車野へ行けるそうです。お気をつけて、スピキさん。 / 進行 {current}/{target}",
    "暮色森林大酋长 — 暮色森林大酋长控制着边境。只要越过它，就能前往齿轮原野。请小心，斯皮奇。 ｜ 进度：{current}/{target}"
  ],
  [
    "目を奪う影 — 雪盲の影は目を見えなくしてしまいます。百四十体だけ払っていただければ、峠の果てまで道が見えるようになりますよ。 / 進行 {current}/{target}",
    "致盲的暗影 — 雪盲暗影会夺走你的视力。清除一百四十只后，通往雪岭尽头的道路便会显现。 ｜ 进度：{current}/{target}"
  ],
  [
    "圧縮場を止めろ — 圧縮場が止まらず、工業地帯は鉄の音だらけです。百四十体だけ止めてください。その先がモナティウムだそうです。 / 進行 {current}/{target}",
    "停止压缩场 — 废料压缩魔像让压缩场一直运转不停，整座工业区都回荡着金属撞击声。请关停140台。越过那里就是莫纳提姆。 ｜ 进度：{current}/{target}"
  ],
  [
    "油灯を消す — 野のあちこちで油灯がひとりでに燃え上がっています。百二十五個だけ消していただければ、野火の心配も減るはずです。 / 進行 {current}/{target}",
    "熄灭油灯 — 油灯鬼火正在原野各处自行燃烧。熄灭125只，便能少些引发野火的担忧。 ｜ 进度：{current}/{target}"
  ],
  [
    "Choose a channel to move to. You cannot change channels while in combat or on cooldown.",
    "请选择目标频道。战斗中或切换冷却期间无法更换频道。"
  ],
  [
    "Elif x{quantity} (ATK+{bonus_atk} DEF+{bonus_def} HP+{bonus_hp}, Req. Lv {bonus_level})",
    "水晶叶 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "Gold x{quantity} (ATK+{bonus_atk} DEF+{bonus_def} HP+{bonus_hp}, Req. Lv {bonus_level})",
    "金币 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "Hold right-click and drag to look around! (Scroll to zoom, {cameraKey} resets the view)",
    "按住鼠标右键拖动即可转动视角。（滚动滚轮缩放，按 {cameraKey} 重置视角。）"
  ],
  [
    "You got new gear! Equip it from the Equipment icon in the bottom menu to grow stronger.",
    "获得新装备了！从底部菜单的装备图标中穿戴它，就能变得更强。"
  ],
  [
    "かぼちゃ畑ですよ!{key}キーで愛情表現をしたまま、のんびりしてみてください — 動くと止まっちゃうので、ゆっくり休んでいってくださいね。愛情度は強化画面で確認できますよ。",
    "这里是南瓜田！按住 {key} 表达好感并保持不动，即可持续积累好感度。进度可随时在强化界面查看。"
  ],
  [
    "国境斥候の試練 — 黄昏森の入り口を国境斥候たちが見張っています。百匹だけ退けていただければ、道が開くはずです、スピキさん。 / 進行 {current}/{target}",
    "边境精灵斥候的试炼 — 边境精灵斥候把守着暮色森林边境入口。请击退100只，道路应该就会开放，斯皮奇。 ｜ 进度：{current}/{target}"
  ],
  [
    "狩場へ出かけましょうか!ポータルの前で{key}ボタンを押すとフィールドへ行けます。{key}ボタンはポータルでも封印の祭壇でも、近くにあるものと触れ合うボタンなんですよ。",
    "去狩猎场看看吧！靠近传送门后点按 {key}，即可前往野外。{key} 也能与附近的传送门、封印祭坛等物体互动。"
  ],
  [
    "The game couldn't be started due to a temporary problem. Please try again in a moment.",
    "游戏暂时无法启动，请稍后重试。"
  ],
  [
    "You already claimed today's clear reward — you can still enter, but there is no reward",
    "今日通关奖励已领取；仍可进入，但不会再次获得奖励"
  ],
  [
    "You cannot change channels while inside an instance. Leave the instance and try again.",
    "副本内无法切换频道。请离开副本后重试。"
  ],
  [
    "개발자의 호박 지팡이 x{quantity} (공+{bonus_atk} 방+{bonus_def} 체+{bonus_hp}, 요구레벨 {bonus_level})",
    "开发者的南瓜法杖 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "공단 감독 오토마타가 마지막 문을 지켜요. 이 자만 넘으면 드디어 모나티엄이에요, 스피키씨. ...거기서부턴 제가 아니라, 다른 이가 당신을 맞을 거예요.",
    "工业区监工自动机守着最后一道门。只要越过它，就终于能抵达莫纳提姆了，斯皮奇。……从那里开始，迎接你的将不再是我，而是另一个人。"
  ],
  [
    "요정나무 견습 지팡이 x{quantity} (공+{bonus_atk} 방+{bonus_def} 체+{bonus_hp}, 요구레벨 {bonus_level})",
    "妖精木学徒法杖 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "요정숲 정찰자 지팡이 x{quantity} (공+{bonus_atk} 방+{bonus_def} 체+{bonus_hp}, 요구레벨 {bonus_level})",
    "妖精森林斥候法杖 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "村でスピキを長押ししてなでなでするか、かぼちゃ畑で愛情表現エモート({key})を維持すると愛情度が貯まります。どちらのルートにも1日の上限があり、毎日リセットされます。",
    "在城镇中按住斯皮奇来回抚摸，或在南瓜田持续使用好感表情（{key}），均可积累好感度。两种方式各有每日上限，并会在每天重置。"
  ],
  [
    "添付: {mail1_name} x{mail1_quantity}, {mail2_name} x{mail2_quantity}, 経験値 {mailExp_exp}",
    "附件：{mail1_name} x{mail1_quantity}, {mail2_name} x{mail2_quantity}, 经验值 {mailExp_exp}"
  ],
  [
    "A sealed altar! Press {key} to take on the challenge — clear rewards come once a day.",
    "这是封印祭坛！按 {key} 即可发起挑战；通关奖励每天只能领取一次。"
  ],
  [
    "A wandering wind spirit keeps stirring up the road. Please settle just eight of them.",
    "游荡风精灵扰乱了道路。请平息八只。"
  ],
  [
    "Do stop by my stall sometime. Pick out just one thing, and you'll get the hang of it.",
    "也来我的商店看看吧。随便买一件东西，很快就能上手。"
  ],
  [
    "There is no healing spring within the sealed chamber. Stock up on potions beforehand.",
    "封印之室内没有治愈之泉，请提前备好药水。"
  ],
  [
    "가로등 공단길로 — 이제 가로등이 늘어선 공단길이에요. 불빛이 하나둘 꺼져 간대요. 그 길로 접어들어 보세요. / 진행 {current}/{target}",
    "前往灯火工厂区 — 接下来是路灯林立的工业区道路。听说灯光正在一盏接一盏地熄灭。沿那条路进去吧。 ｜ 进度：{current}/{target}"
  ],
  [
    "개발자의 호박 갑주 x{quantity} (공+{bonus_atk} 방+{bonus_def} 체+{bonus_hp}, 요구레벨 {bonus_level})",
    "开发者的南瓜护甲 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "개발자의 호박 투구 x{quantity} (공+{bonus_atk} 방+{bonus_def} 체+{bonus_hp}, 요구레벨 {bonus_level})",
    "开发者的南瓜头盔 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "계피맛 건강 알사탕 x{quantity} (공+{bonus_atk} 방+{bonus_def} 체+{bonus_hp}, 요구레벨 {bonus_level})",
    "肉桂味健康硬糖 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "교단에서 눈뜨다 — 정신이 드셨군요, 스피키씨. 세계수 교단에 오신 걸 환영해요. 우선 한 발 내디뎌 볼까요? / 진행 {current}/{target}",
    "在教团中醒来 — 你醒了，斯皮奇。欢迎来到世界树教团。先向前走几步吧。 ｜ 进度：{current}/{target}"
  ],
  [
    "늪안개 주문 지팡이 x{quantity} (공+{bonus_atk} 방+{bonus_def} 체+{bonus_hp}, 요구레벨 {bonus_level})",
    "沼雾咒术法杖 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "서리꽃 결정 지팡이 x{quantity} (공+{bonus_atk} 방+{bonus_def} 체+{bonus_hp}, 요구레벨 {bonus_level})",
    "霜花水晶法杖 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "여명빛 거목 지팡이 x{quantity} (공+{bonus_atk} 방+{bonus_def} 체+{bonus_hp}, 요구레벨 {bonus_level})",
    "晨曦巨树法杖 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "요정단 순찰자 상의 x{quantity} (공+{bonus_atk} 방+{bonus_def} 체+{bonus_hp}, 요구레벨 {bonus_level})",
    "妖精团巡逻者上衣 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "요정단 초심자 상의 x{quantity} (공+{bonus_atk} 방+{bonus_def} 체+{bonus_hp}, 요구레벨 {bonus_level})",
    "妖精团新手上衣 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "첨부: {mail1_name} x{mail1_quantity}, {mail2_name} x{mail2_quantity}, 경험치 {mailExp_exp}",
    "附件：{mail1_name} x{mail1_quantity}, {mail2_name} x{mail2_quantity}, 经验值 {mailExp_exp}"
  ],
  [
    "かぼちゃ畑ですよ!{key}で愛情表現をしたまま、のんびりしてみてください — 動くと止まっちゃうので、ゆっくり休んでいってくださいね。愛情度は強化画面で確認できますよ。",
    "这里是南瓜田！点按并按住 {key} 表达好感，同时保持不动，即可持续积累好感度。进度可随时在强化界面查看。"
  ],
  [
    "{base_name} — Lv{base_level}에 해금 (핫키 {base_key}) 주변 반경 {mechanism_radius}m 적에게 광역 피해",
    "{base_name} — Lv.{base_level} 解锁（快捷键：{base_key}） 对周围 {mechanism_radius}m 内的敌人造成范围伤害"
  ],
  [
    "避雷騎士団 — 避雷騎士団が鉄塔の間を巡回してる。百八十五体だけ落としな、幽霊。槍の先に雷を宿してるから、正面は避けな。 / 進行 {current}/{target}",
    "避雷针骑士团 — 避雷针骑士自动机正在铁塔之间巡逻。击落185台，幽灵。它们的枪尖带着雷电，别从正面硬碰。 ｜ 进度：{current}/{target}"
  ],
  [
    "灰塵が沈むころ — 灰塵がひどく舞って前が見えない。百七十匹だけ払いな、幽霊 — 灰が沈まないと、その奥は見えないから。 / 進行 {current}/{target}",
    "当灰烬落定 — 灰尘精灵漫天飞舞，什么都看不清。清除170只，幽灵——只有等尘埃落定，才能看清深处。 ｜ 进度：{current}/{target}"
  ],
  [
    "線路のあちこちで切断機が回ってる。止まった振りして立ってて、通り過ぎたらまた動き出すよ。百五十五個だけ引き剥がしな、幽霊——中途半端に触って泣きついてくるんじゃないよ。",
    "每条轨道上都有切割自动机在运转。它们会装作停下，等你经过时再突然启动。拆掉155台，幽灵——别笨手笨脚地弄伤自己，又跑来向我哭诉。"
  ],
  [
    "A Sweet Habit — Why not use just one of your consumables today? / {current}/{target}",
    "甜蜜的习惯 — 今天也挑一件随身的消耗品用用看吧？ ｜ 进度：{current}/{target}"
  ],
  [
    "An apprentice witch is running a dangerous experiment. Please stop just ten of them.",
    "见习湿地女巫们正在进行危险实验。请制止其中十名。"
  ],
  [
    "곡성 봉인 지팡이 x{quantity} (공+{bonus_atk} 방+{bonus_def} 체+{bonus_hp}, 요구레벨 {bonus_level})",
    "哀鸣封印法杖 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "눈서리 정령 로브 x{quantity} (공+{bonus_atk} 방+{bonus_def} 체+{bonus_hp}, 요구레벨 {bonus_level})",
    "雪霜精灵长袍 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "달무리 마녀 로브 x{quantity} (공+{bonus_atk} 방+{bonus_def} 체+{bonus_hp}, 요구레벨 {bonus_level})",
    "月晕女巫长袍 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "사냥터로 나가 볼까요! 포탈 앞에서 {key}키를 누르시면 필드로 가요. {key}키는 포탈이든 봉인 제단이든 가까이 있는 것과 상호작용하는 키랍니다.",
    "去狩猎场看看吧！靠近传送门后按 {key}，即可前往野外。{key} 也能与附近的传送门、封印祭坛等物体互动。"
  ],
  [
    "서리별 파편 각반 x{quantity} (공+{bonus_atk} 방+{bonus_def} 체+{bonus_hp}, 요구레벨 {bonus_level})",
    "霜星碎片护胫 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "서리별 파편 투구 x{quantity} (공+{bonus_atk} 방+{bonus_def} 체+{bonus_hp}, 요구레벨 {bonus_level})",
    "霜星碎片头盔 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "엘프 사냥꾼 각반 x{quantity} (공+{bonus_atk} 방+{bonus_def} 체+{bonus_hp}, 요구레벨 {bonus_level})",
    "精灵猎手护胫 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "여명 파수꾼 각반 x{quantity} (공+{bonus_atk} 방+{bonus_def} 체+{bonus_hp}, 요구레벨 {bonus_level})",
    "黎明守望者护胫 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "여명 파수꾼 투구 x{quantity} (공+{bonus_atk} 방+{bonus_def} 체+{bonus_hp}, 요구레벨 {bonus_level})",
    "黎明守望者头盔 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "여명의 문지기 — 여명 용린병은 뿌리굴 가장 안쪽을 지켜요. 이백만 넘어서 주세요. 그 너머가 마지막이에요. / 진행 {current}/{target}",
    "黎明守门人 — 黎明龙鳞兵守卫着曙光根穴最深处。击败两百名守卫吧，它们身后就是终点。 ｜ 进度：{current}/{target}"
  ],
  [
    "용린 각인 지팡이 x{quantity} (공+{bonus_atk} 방+{bonus_def} 체+{bonus_hp}, 요구레벨 {bonus_level})",
    "龙鳞刻纹法杖 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "잿그늘 상복 로브 x{quantity} (공+{bonus_atk} 방+{bonus_def} 체+{bonus_hp}, 요구레벨 {bonus_level})",
    "灰烬哀悼长袍 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "파수정령의 순찰 — 파수정령이 굴 안을 돌며 빛줄기를 그어요. 백아흔만 잠재워 주시면 순찰선이 끊길 거예요. / 진행 {current}/{target}",
    "黎明守护精灵的巡逻 — 黎明守护精灵在洞穴中巡游，划出道道光束。平息一百九十只，巡逻路线便会中断。 ｜ 进度：{current}/{target}"
  ],
  [
    "호박 축제 꾸러미 x{quantity} (공+{bonus_atk} 방+{bonus_def} 체+{bonus_hp}, 요구레벨 {bonus_level})",
    "南瓜庆典礼包 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "シナモン健康キャンディ x{quantity} (攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}、必要Lv{bonus_level})",
    "肉桂味健康硬糖 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "メカドローン・集中射撃 x{quantity} (攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}、必要Lv{bonus_level})",
    "机械无人机·集中射击 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "{base_name} — Lv{base_level}에 해금 (핫키 {base_key}) 대상 HP {mechanism_pct}% 이하일 때 위력 강화",
    "{base_name} — Lv.{base_level} 解锁（快捷键：{base_key}） 目标 HP 低于或等于 {mechanism_pct}% 时威力提升"
  ],
  [
    "{base_name} — クールダウン {base_sec}秒（ホットキー {base_key}） 周囲半径{mechanism_radius}mの敵に範囲ダメージ",
    "{base_name} — 冷却 {base_sec} 秒（快捷键：{base_key}） 对周围 {mechanism_radius}m 内的敌人造成范围伤害"
  ],
  [
    "次は煙突地区だよ。煙突という煙突から溶鉄色の煙が絶え間なく噴き出してる。息が詰まる前にさっさと入りな、幽霊 — もたもたしてたら煙が真っ先に行く手をかすませちまうよ。",
    "接下来是铁辉烟囱区。每根烟囱都在不停喷出熔铁色的浓烟。趁窒息前赶紧进去，幽灵——再磨蹭，烟雾就要把前路遮得一干二净了。"
  ],
  [
    "工業地帯監督オートマタが最後の門を守っています。これさえ越えれば、いよいよモナティウムです、スピキさん。……そこから先は、私ではなく、別の者があなたを迎えるでしょう。",
    "工业区监工自动机守着最后一道门。只要越过它，就终于能抵达莫纳提姆了，斯皮奇。……从那里开始，迎接你的将不再是我，而是另一个人。"
  ],
  [
    "開発者のカボチャの兜 x{quantity} (攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}、必要Lv{bonus_level})",
    "开发者的南瓜头盔 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "開発者のカボチャの鎧 x{quantity} (攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}、必要Lv{bonus_level})",
    "开发者的南瓜护甲 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "開発者のカボチャの杖 x{quantity} (攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}、必要Lv{bonus_level})",
    "开发者的南瓜法杖 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "溶鉱炉コアゴーレムが地区の真ん中で真っ赤に焼けてる。そばに立ってるだけで熱気がぶわっと押し寄せてくる、幽霊 — 距離をよく測りな。それでも越えなきゃ尾根には行けない。",
    "熔炉核心魔像正在区域中央烧得通红，光是站在旁边就能感到热浪扑面。幽灵，注意保持距离。可不越过它，就到不了山脊。"
  ],
  [
    "湿地魔女のつば広帽子 x{quantity} (攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}、必要Lv{bonus_level})",
    "湿地女巫宽檐帽 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "狩場へ出かけましょうか!ポータルの前で{key}キーを押すとフィールドへ行けます。{key}キーはポータルでも封印の祭壇でも、近くにあるものと触れ合うキーなんですよ。",
    "去狩猎场看看吧！靠近传送门后按 {key}，即可前往野外。{key} 也能与附近的传送门、封印祭坛等物体互动。"
  ],
  [
    "霜星の古の精霊 — 峠の果ての氷の広場に、霜星の古の精霊が座っています。一度は越えないと、燠火の谷へは行けないんです。 / 進行 {current}/{target}",
    "霜星远古精灵 — 霜星远古精灵盘踞在雪岭尽头的冰原上。要前往烬火山谷，就必须先越过它。 ｜ 进度：{current}/{target}"
  ],
  [
    "妖精団の初心者の上着 x{quantity} (攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}、必要Lv{bonus_level})",
    "妖精团新手上衣 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "妖精団の巡回者の上着 x{quantity} (攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}、必要Lv{bonus_level})",
    "妖精团巡逻者上衣 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "Come back to town to continue the guide! Press {key} near the portal to move there.",
    "请回到城镇继续教程！在传送门附近按 {key} 键即可前往。"
  ],
  [
    "Google sign-in verification is taking longer than expected. Please try again later.",
    "Google 登录验证耗时较长，请稍后重试。"
  ],
  [
    "That player already sent you a friend request. Please check your received requests.",
    "对方已经向你发送了好友申请，请查看收到的申请。"
  ],
  [
    "The Great Marsh Witch has set her sights on the graveyard. Please stop her, Speaki.",
    "大沼泽女巫盯上了墓园。请阻止她，斯皮奇。"
  ],
  [
    "거목 뿌리 흉갑 x{quantity} (공+{bonus_atk} 방+{bonus_def} 체+{bonus_hp}, 요구레벨 {bonus_level})",
    "巨树根须胸甲 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "교단 보급 상자 x{quantity} (공+{bonus_atk} 방+{bonus_def} 체+{bonus_hp}, 요구레벨 {bonus_level})",
    "教团补给箱 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "수인 가죽 각반 x{quantity} (공+{bonus_atk} 방+{bonus_def} 체+{bonus_hp}, 요구레벨 {bonus_level})",
    "兽族皮革护胫 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "수인 가죽 두건 x{quantity} (공+{bonus_atk} 방+{bonus_def} 체+{bonus_hp}, 요구레벨 {bonus_level})",
    "兽族皮革兜帽 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "수인 전사 각반 x{quantity} (공+{bonus_atk} 방+{bonus_def} 체+{bonus_hp}, 요구레벨 {bonus_level})",
    "兽族战士护胫 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "수인 전사 투구 x{quantity} (공+{bonus_atk} 방+{bonus_def} 체+{bonus_hp}, 요구레벨 {bonus_level})",
    "兽族战士头盔 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "습지마녀 챙모자 x{quantity} (공+{bonus_atk} 방+{bonus_def} 체+{bonus_hp}, 요구레벨 {bonus_level})",
    "湿地女巫宽檐帽 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "정령결속 지팡이 x{quantity} (공+{bonus_atk} 방+{bonus_def} 체+{bonus_hp}, 요구레벨 {bonus_level})",
    "精灵缚结法杖 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "최상급 크레파스 x{quantity} (공+{bonus_atk} 방+{bonus_def} 체+{bonus_hp}, 요구레벨 {bonus_level})",
    "金蜡笔 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "크레파스 주머니 x{quantity} (공+{bonus_atk} 방+{bonus_def} 체+{bonus_hp}, 요구레벨 {bonus_level})",
    "蜡笔袋 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "호박마차 소환권 x{quantity} (공+{bonus_atk} 방+{bonus_def} 체+{bonus_hp}, 요구레벨 {bonus_level})",
    "南瓜马车召唤券 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "カボチャ馬車の召喚券 x{quantity} (攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}、必要Lv{bonus_level})",
    "南瓜马车召唤券 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "{base_name} — Lv{base_level}で解放（ホットキー {base_key}） 周囲半径{mechanism_radius}mの敵に範囲ダメージ",
    "{base_name} — Lv.{base_level} 解锁（快捷键：{base_key}） 对周围 {mechanism_radius}m 内的敌人造成范围伤害"
  ],
  [
    "教団で目覚めて — お目覚めになったんですね、スピキさん。世界樹教団へようこそ。まずは一歩、踏み出してみましょうか？ / 進行 {current}/{target}",
    "在教团中醒来 — 你醒了，斯皮奇。欢迎来到世界树教团。先向前走几步吧。 ｜ 进度：{current}/{target}"
  ],
  [
    "妖精樹の見習いの杖 x{quantity} (攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}、必要Lv{bonus_level})",
    "妖精木学徒法杖 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "妖精の森の斥候の杖 x{quantity} (攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}、必要Lv{bonus_level})",
    "妖精森林斥候法杖 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "Another Speaki! Right-click tap them to send a party invite. (Up to {max} members)",
    "遇到另一位斯皮奇了！短按鼠标右键即可邀请对方组队。（队伍最多 {max} 人。）"
  ],
  [
    "Premium currency — spent on special shop goods such as gacha pulls and gold sacks.",
    "珍贵的特殊货币，可用于抽取奖励、购买金币袋等特殊商品。"
  ],
  [
    "경험치 주머니 x{quantity} (공+{bonus_atk} 방+{bonus_def} 체+{bonus_hp}, 요구레벨 {bonus_level})",
    "经验袋 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "계피맛 알사탕 x{quantity} (공+{bonus_atk} 방+{bonus_def} 체+{bonus_hp}, 요구레벨 {bonus_level})",
    "肉桂味硬糖 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "궁극의 주머니 x{quantity} (공+{bonus_atk} 방+{bonus_def} 체+{bonus_hp}, 요구레벨 {bonus_level})",
    "终极袋 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "무덤지기 각반 x{quantity} (공+{bonus_atk} 방+{bonus_def} 체+{bonus_hp}, 요구레벨 {bonus_level})",
    "守墓人护胫 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "무덤지기 후드 x{quantity} (공+{bonus_atk} 방+{bonus_def} 체+{bonus_hp}, 요구레벨 {bonus_level})",
    "守墓人兜帽 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "습지마녀 각반 x{quantity} (공+{bonus_atk} 방+{bonus_def} 체+{bonus_hp}, 요구레벨 {bonus_level})",
    "湿地女巫护胫 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "엘리프 주머니 x{quantity} (공+{bonus_atk} 방+{bonus_def} 체+{bonus_hp}, 요구레벨 {bonus_level})",
    "水晶叶袋 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "용광로 코어 골렘이 지구 한복판에서 벌겋게 달아 있어. 곁에 서 있기만 해도 열기가 훅훅 끼쳐, 유령 — 거리 잘 재. 그래도 넘어야 능선으로 가.",
    "熔炉核心魔像正在区域中央烧得通红，光是站在旁边就能感到热浪扑面。幽灵，注意保持距离。可不越过它，就到不了山脊。"
  ],
  [
    "용족 전투각반 x{quantity} (공+{bonus_atk} 방+{bonus_def} 체+{bonus_hp}, 요구레벨 {bonus_level})",
    "龙族战斗护胫 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "용족 전투투구 x{quantity} (공+{bonus_atk} 방+{bonus_def} 체+{bonus_hp}, 요구레벨 {bonus_level})",
    "龙族战斗头盔 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "ガーネットの水菓子 x{quantity} (攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}、必要Lv{bonus_level})",
    "石榴石水果羹 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "カボチャ祭りの包み x{quantity} (攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}、必要Lv{bonus_level})",
    "南瓜庆典礼包 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "シナモンキャンディ x{quantity} (攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}、必要Lv{bonus_level})",
    "肉桂味硬糖 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "{base_name} — Lv{base_level}에 해금 (핫키 {base_key}) 적중 시 {mechanism_sec}초간 화상(지속 피해)",
    "{base_name} — Lv.{base_level} 解锁（快捷键：{base_key}） 命中时使目标灼烧 {mechanism_sec} 秒（持续伤害）"
  ],
  [
    "{base_name} — 쿨다운 {base_sec}초 (핫키 {base_key}) 주변 반경 {mechanism_radius}m 적에게 광역 피해",
    "{base_name} — 冷却 {base_sec} 秒（快捷键：{base_key}） 对周围 {mechanism_radius}m 内的敌人造成范围伤害"
  ],
  [
    "{base_name} — クールダウン {base_sec}秒（ホットキー {base_key}） 対象HPが{mechanism_pct}%以下の時、威力強化",
    "{base_name} — 冷却 {base_sec} 秒（快捷键：{base_key}） 目标 HP 低于或等于 {mechanism_pct}% 时威力提升"
  ],
  [
    "{base_name} — クールダウン {base_sec}秒（ホットキー {base_key}） 命中時{mechanism_sec}秒間火傷（継続ダメージ）",
    "{base_name} — 冷却 {base_sec} 秒（快捷键：{base_key}） 命中时使目标灼烧 {mechanism_sec} 秒（持续伤害）"
  ],
  [
    "大樹の根の胸当て x{quantity} (攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}、必要Lv{bonus_level})",
    "巨树根须胸甲 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "甘いひとつぶ — そのシナモンキャンディ、しまい込まずにひとつ食べてみてください。私が直接煮詰めたものなんですよ。 / 進行 {current}/{target}",
    "一颗甜蜜 — 别舍不得那颗肉桂味硬糖，尝一颗吧。那可是我亲手熬制的。 ｜ 进度：{current}/{target}"
  ],
  [
    "灰陰の喪服ローブ x{quantity} (攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}、必要Lv{bonus_level})",
    "灰烬哀悼长袍 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "精霊使いのローブ x{quantity} (攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}、必要Lv{bonus_level})",
    "唤灵师长袍 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "黎明の番人の脚衣 x{quantity} (攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}、必要Lv{bonus_level})",
    "黎明守望者护胫 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "竜族の戦闘かぶと x{quantity} (攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}、必要Lv{bonus_level})",
    "龙族战斗头盔 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "獣人戦士のかぶと x{quantity} (攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}、必要Lv{bonus_level})",
    "兽族战士头盔 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "雪霜精霊のローブ x{quantity} (攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}、必要Lv{bonus_level})",
    "雪霜精灵长袍 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "燠火の竜鱗の暴君レイドのクリア報酬で手に入る鍵アイテムだ — 所持していると「=」キーで2人乗りカボチャ馬車を召喚して乗ることができる（使用しても消費されない）。",
    "通关烬火龙鳞暴君团队副本后获得的关键道具。持有时按“=”键，即可召唤并乘坐双人南瓜马车；使用后不会消耗。"
  ],
  [
    "月暈魔女のローブ x{quantity} (攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}、必要Lv{bonus_level})",
    "月晕女巫长袍 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "A path has opened into the misty marsh. Please clear out just ten toad familiars.",
    "通往月雾湿地的道路已经开放。请清除十只湿地蟾蜍使魔。"
  ],
  [
    "Even the sprout fairies are worked up now. Please calm down eight of them for me.",
    "连嫩芽妖精也躁动起来了。请安抚八只。"
  ],
  [
    "Let's head back to the field! Tap the {key} button near the portal to move there.",
    "回到野外继续吧！在传送门附近点按 {key} 按钮即可前往。"
  ],
  [
    "Right-click drag: rotate camera / Right-click tap: invite player to party (fixed)",
    "按住右键拖动：旋转镜头；短按右键：邀请玩家组队（固定）"
  ],
  [
    "Your friend list has reached its limit. Please remove some friends and try again.",
    "好友数量已达上限，请先整理好友列表后再试。"
  ],
  [
    "골드 주머니 x{quantity} (공+{bonus_atk} 방+{bonus_def} 체+{bonus_hp}, 요구레벨 {bonus_level})",
    "金币袋 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "교단 귀환서 x{quantity} (공+{bonus_atk} 방+{bonus_def} 체+{bonus_hp}, 요구레벨 {bonus_level})",
    "教团回城卷轴 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "기름등을 끄다 — 들녘 곳곳에 기름등이 저 혼자 타올라요. 125개만 꺼 주시면 들불 걱정은 덜겠어요. / 진행 {current}/{target}",
    "熄灭油灯 — 油灯鬼火正在原野各处自行燃烧。熄灭125只，便能少些引发野火的担忧。 ｜ 进度：{current}/{target}"
  ],
  [
    "석류석 열매 x{quantity} (공+{bonus_atk} 방+{bonus_def} 체+{bonus_hp}, 요구레벨 {bonus_level})",
    "石榴石果实 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "석류석 화채 x{quantity} (공+{bonus_atk} 방+{bonus_def} 체+{bonus_hp}, 요구레벨 {bonus_level})",
    "石榴石水果羹 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "선로마다 절단기가 돌아가고 있어. 멈춘 척 서 있다가 지나가면 다시 돌아. 155개만 뜯어내, 유령 — 어설프게 건드렸다가 나한테 징징대지 말고.",
    "每条轨道上都有切割自动机在运转。它们会装作停下，等你经过时再突然启动。拆掉155台，幽灵——别笨手笨脚地弄伤自己，又跑来向我哭诉。"
  ],
  [
    "엘프 정찰모 x{quantity} (공+{bonus_atk} 방+{bonus_def} 체+{bonus_hp}, 요구레벨 {bonus_level})",
    "精灵斥候帽 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "용비늘 흉갑 x{quantity} (공+{bonus_atk} 방+{bonus_def} 체+{bonus_hp}, 요구레벨 {bonus_level})",
    "龙鳞胸甲 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "융해 경계선이야, 유령. 발밑이 부글부글 녹아내리는 구역이니까 경계 밖으로 넘어오는 것들 190마리만 정리해 — 선 넘어가면 돌아올 생각은 접고.",
    "这里是熔融边界，幽灵。脚下的大地正在咕嘟咕嘟地熔化。清除190只越过边界的家伙——你自己要是越线，就别指望能回来。"
  ],
  [
    "잉걸 용린 폭군 레이드 클리어 보상으로 얻는 열쇠 아이템 — 소지하면 '=' 키로 2인승 호박마차를 소환해 탑승할 수 있다(사용·소모되지 않음).",
    "通关烬火龙鳞暴君团队副本后获得的关键道具。持有时按“=”键，即可召唤并乘坐双人南瓜马车；使用后不会消耗。"
  ],
  [
    "장비 주머니 x{quantity} (공+{bonus_atk} 방+{bonus_def} 체+{bonus_hp}, 요구레벨 {bonus_level})",
    "装备袋 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "정령사 로브 x{quantity} (공+{bonus_atk} 방+{bonus_def} 체+{bonus_hp}, 요구레벨 {bonus_level})",
    "唤灵师长袍 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "エルフ猟師の脚衣 x{quantity} (攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}、必要Lv{bonus_level})",
    "精灵猎手护胫 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "これがその管制塔だよ、幽霊。監視の目を全部操ってたのがこいつだ。ここさえ越えれば動力核はもう目の前だ — チャプター一つ丸ごとかかってる。一人で無理なら今言いな。",
    "这就是那座监控塔，幽灵。所有监视之眼都受它操控。越过这里，动力核心就在眼前——整整一个章节都押在这一战上。一个人应付不了，就趁现在说。"
  ],
  [
    "{base_name} — Lv{base_level}で解放（ホットキー {base_key}） 対象HPが{mechanism_pct}%以下の時、威力強化",
    "{base_name} — Lv.{base_level} 解锁（快捷键：{base_key}） 目标 HP 低于或等于 {mechanism_pct}% 时威力提升"
  ],
  [
    "{base_name} — Lv{base_level}で解放（ホットキー {base_key}） 命中時{mechanism_sec}秒間火傷（継続ダメージ）",
    "{base_name} — Lv.{base_level} 解锁（快捷键：{base_key}） 命中时使目标灼烧 {mechanism_sec} 秒（持续伤害）"
  ],
  [
    "{base_name} — 쿨다운 {base_sec}초 (핫키 {base_key}) 대상 HP {mechanism_pct}% 이하일 때 위력 강화",
    "{base_name} — 冷却 {base_sec} 秒（快捷键：{base_key}） 目标 HP 低于或等于 {mechanism_pct}% 时威力提升"
  ],
  [
    "黎明の大樹の杖 x{quantity} (攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}、必要Lv{bonus_level})",
    "晨曦巨树法杖 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "黎明の番人の兜 x{quantity} (攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}、必要Lv{bonus_level})",
    "黎明守望者头盔 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "竜族の戦闘脚衣 x{quantity} (攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}、必要Lv{bonus_level})",
    "龙族战斗护胫 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "墓守りのフード x{quantity} (攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}、必要Lv{bonus_level})",
    "守墓人兜帽 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "溶解境界線だよ、幽霊。足元がぐつぐつ溶け落ちる区域だから、境界の外から越えてくるやつを百九十匹だけ片づけな — 自分が線を越えたら、戻れるとは思わないことだね。",
    "这里是熔融边界，幽灵。脚下的大地正在咕嘟咕嘟地熔化。清除190只越过边界的家伙——你自己要是越线，就别指望能回来。"
  ],
  [
    "湿地魔女の脚衣 x{quantity} (攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}、必要Lv{bonus_level})",
    "湿地女巫护胫 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "獣人戦士の脚衣 x{quantity} (攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}、必要Lv{bonus_level})",
    "兽族战士护胫 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "獣人の革の脚衣 x{quantity} (攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}、必要Lv{bonus_level})",
    "兽族皮革护胫 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "霜星の破片脚衣 x{quantity} (攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}、必要Lv{bonus_level})",
    "霜星碎片护胫 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "最上級クレパス x{quantity} (攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}、必要Lv{bonus_level})",
    "金蜡笔 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "Don't save that cinnamon candy for later — go on, try one. I simmered it myself.",
    "别舍不得那颗肉桂味硬糖，尝一颗吧。那可是我亲手熬制的。"
  ],
  [
    "Gold, Elif, Supreme Crayons, Experience Pouches, and legendary gear all at once.",
    "金币、水晶叶、金蜡笔、经验袋和传说装备，一袋全有。"
  ],
  [
    "You've come again today. Just stopping by to show your face is more than enough.",
    "今天也来报到了呢。只要露个面就足够了。"
  ],
  [
    "눈먼 그림자 — 설맹 그림자는 눈을 멀게 해요. 백마흔만 걷어 주시면 고개 끝까지 길이 보일 거예요. / 진행 {current}/{target}",
    "致盲的暗影 — 雪盲暗影会夺走你的视力。清除一百四十只后，通往雪岭尽头的道路便会显现。 ｜ 进度：{current}/{target}"
  ],
  [
    "메카 호박 x{quantity} (공+{bonus_atk} 방+{bonus_def} 체+{bonus_hp}, 요구레벨 {bonus_level})",
    "机械南瓜 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "エルフの斥候帽 x{quantity} (攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}、必要Lv{bonus_level})",
    "精灵斥候帽 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "ガーネットの実 x{quantity} (攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}、必要Lv{bonus_level})",
    "石榴石果实 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "パトカー召喚券 x{quantity} (攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}、必要Lv{bonus_level})",
    "警车召唤券 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "{date}まで利用が制限されます。それ以降は再度接続できます。異議がある場合は新しいアカウントを作成し、設定 > 開発者へのお問い合わせからご連絡ください。",
    "账号封禁将持续至 {date}，届时可重新连接。如需申诉，请创建新账号并通过“设置 > 联系开发者”提交。"
  ],
  [
    "教団の補給箱 x{quantity} (攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}、必要Lv{bonus_level})",
    "教团补给箱 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "教団の帰還書 x{quantity} (攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}、必要Lv{bonus_level})",
    "教团回城卷轴 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "精霊結束の杖 x{quantity} (攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}、必要Lv{bonus_level})",
    "精灵缚结法杖 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "警察車両の姿をした特別なマウント召喚券だ — 所持していると「=」キーでパトカーを召喚して乗ることができる（性能はカボチャ馬車と同じで、見た目だけが異なる）。",
    "警车造型的特殊坐骑召唤券。持有时按“=”键，即可召唤并乘坐警车；性能与南瓜马车相同，仅外观不同。"
  ],
  [
    "哭声封印の杖 x{quantity} (攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}、必要Lv{bonus_level})",
    "哀鸣封印法杖 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "竜鱗刻印の杖 x{quantity} (攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}、必要Lv{bonus_level})",
    "龙鳞刻纹法杖 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "竜鱗の胸当て x{quantity} (攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}、必要Lv{bonus_level})",
    "龙鳞胸甲 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "墓守りの脚衣 x{quantity} (攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}、必要Lv{bonus_level})",
    "守墓人护胫 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "獣人の革頭巾 x{quantity} (攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}、必要Lv{bonus_level})",
    "兽族皮革兜帽 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "霜花結晶の杖 x{quantity} (攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}、必要Lv{bonus_level})",
    "霜花水晶法杖 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "霜星の破片兜 x{quantity} (攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}、必要Lv{bonus_level})",
    "霜星碎片头盔 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "Mist shadows are swallowing up the path. Please clear away just twelve of them.",
    "雾影正在吞噬道路。请清除十二只。"
  ],
  [
    "달콤한 한 알 — 그 계피맛 알사탕, 아껴 두지 말고 하나 드셔 보세요. 제가 직접 조린 거랍니다. / 진행 {current}/{target}",
    "一颗甜蜜 — 别舍不得那颗肉桂味硬糖，尝一颗吧。那可是我亲手熬制的。 ｜ 进度：{current}/{target}"
  ],
  [
    "폴리스카 x{quantity} (공+{bonus_atk} 방+{bonus_def} 체+{bonus_hp}, 요구레벨 {bonus_level})",
    "警车召唤券 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "エリーフの袋 x{quantity} (攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}、必要Lv{bonus_level})",
    "水晶叶袋 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "クレパスの袋 x{quantity} (攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}、必要Lv{bonus_level})",
    "蜡笔袋 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "ゴールドの袋 x{quantity} (攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}、必要Lv{bonus_level})",
    "金币袋 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "メカカボチャ x{quantity} (攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}、必要Lv{bonus_level})",
    "机械南瓜 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "{base_name} — 쿨다운 {base_sec}초 (핫키 {base_key}) 적중 시 {mechanism_sec}초간 화상(지속 피해)",
    "{base_name} — 冷却 {base_sec} 秒（快捷键：{base_key}） 命中时使目标灼烧 {mechanism_sec} 秒（持续伤害）"
  ],
  [
    "経験値の袋 x{quantity} (攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}、必要Lv{bonus_level})",
    "经验袋 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "黎明の門番 — 黎明の竜鱗兵は根の洞の一番奥を守っています。二百体、越えてきてください。その先が最後ですよ。 / 進行 {current}/{target}",
    "黎明守门人 — 黎明龙鳞兵守卫着曙光根穴最深处。击败两百名守卫吧，它们身后就是终点。 ｜ 进度：{current}/{target}"
  ],
  [
    "月暈の沼谷のともし火 — 月暈の沼谷に月明かりの鬼火がさまよっているんです。十個だけ、散らしてきてください。 / 進行 {current}/{target}",
    "月环泽谷的灯火 — 月环泽谷中飘荡着月光鬼火。请驱散十只。 ｜ 进度：{current}/{target}"
  ],
  [
    "沼霧の呪杖 x{quantity} (攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}、必要Lv{bonus_level})",
    "沼雾咒术法杖 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "엘리프 x{quantity} (공+{bonus_atk} 방+{bonus_def} 체+{bonus_hp}, 요구레벨 {bonus_level})",
    "水晶叶 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "\n\n{entries} · top-right minimap · tap to talk · tap a nearby player to invite",
    "\n\n{entries} · 右上角小地图 · 点按进行对话 · 点按附近的玩家发送邀请"
  ],
  [
    "究極の袋 x{quantity} (攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}、必要Lv{bonus_level})",
    "终极袋 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "妖精たちの様子を見て — 森の妖精たちが急に騒がしくなったんです。五匹だけ、様子を見てきていただけますか？ / 進行 {current}/{target}",
    "森林妖精的异动 — 森林妖精最近格外吵闹。能帮我查看五只森林妖精的情况吗？ ｜ 进度：{current}/{target}"
  ],
  [
    "月霧の湿地へ — 霧に包まれた湿地への道が開けました。ヒキガエルの使い魔を十匹だけ、片づけてきてください。 / 進行 {current}/{target}",
    "前往月雾湿地 — 通往月雾湿地的道路已经开放。请清除十只湿地蟾蜍使魔。 ｜ 进度：{current}/{target}"
  ],
  [
    "装備の袋 x{quantity} (攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}、必要Lv{bonus_level})",
    "装备袋 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "Basic soft currency — used for general purposes such as growth and purchases.",
    "最常用的基础货币，可用于角色成长和商店消费。"
  ],
  [
    "Beastfolk scouts have blocked the road. Could you drive off just ten of them?",
    "森林兽人侦察兵挡住了道路。能帮我击退十只吗？"
  ],
  [
    "Enter a recovery code issued on another device to continue with that account.",
    "输入在其他设备上保存的恢复码，即可继续使用该账号。"
  ],
  [
    "골드 x{quantity} (공+{bonus_atk} 방+{bonus_def} 체+{bonus_hp}, 요구레벨 {bonus_level})",
    "金币 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "여기가 마지막이야, 유령. 냉각 멈춘 동력핵 심부로 내려가는 길이 열렸어. ...뭐, 걱정은 안 해. 여기까지 버텨 왔잖아, 너. 내려가.",
    "这是最后一段路了，幽灵。通往动力核心深处的道路已经开启，那里的冷却系统早已停摆。……算了，我并不担心，毕竟你都撑到这里了。下去吧。"
  ],
  [
    "이제 저에게 말을 걸어 보세요 — 저는 푸른 옷을 입고 있어요! 가까이 오셔서 좌클릭! 대화창에서 [퀘스트]와 [상점]을 여실 수 있어요.",
    "现在来和我说话吧——我就是那个穿蓝衣服的人！靠近后单击鼠标左键。对话框中可以打开【任务】和【商店】。"
  ],
  [
    "エリーフ x{quantity} (攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}、必要Lv{bonus_level})",
    "水晶叶 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "ゴールド x{quantity} (攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}、必要Lv{bonus_level})",
    "金币 x{quantity} （攻+{bonus_atk} 防+{bonus_def} 体+{bonus_hp}，需要等级 {bonus_level}）"
  ],
  [
    "\n\n{entries} · top-right minimap · left-click to talk · right-click to invite",
    "\n\n{entries} · 右上角小地图 · 鼠标左键对话 · 鼠标右键邀请组队"
  ],
  [
    "{base_name} — Lv{base_level}에 해금 (핫키 {base_key}) 일직선상의 모든 적 관통 (최대 {cap_n}체)",
    "{base_name} — Lv.{base_level} 解锁（快捷键：{base_key}） 贯穿直线上的所有敌人（最多 {cap_n} 个目标）"
  ],
  [
    "{base_name} — クールダウン {base_sec}秒（ホットキー {base_key}） 直線上のすべての敵を貫通 (最大{cap_n}体)",
    "{base_name} — 冷却 {base_sec} 秒（快捷键：{base_key}） 贯穿直线上的所有敌人（最多 {cap_n} 个目标）"
  ],
  [
    "幼い竜をなだめる — 森の奥で幼い竜が怒っているそうです。どうかケガをしないよう、なだめてきてください。 / 進行 {current}/{target}",
    "安抚幼龙 — 听说森林深处的幼龙正在发脾气。请安抚它，也千万别让自己受伤。 ｜ 进度：{current}/{target}"
  ],
  [
    "Ner: Don't push yourself too hard, Speaki. Call for backup if it gets rough.",
    "尼尔：别太勉强自己，斯皮奇。觉得吃力就先叫上伙伴吧。"
  ],
  [
    "You've already reached the max level, so the experience pouch can't be used.",
    "已达到最高等级，无法使用经验袋。"
  ],
  [
    "사 놓기만 하고 안 써 보면 그게 다 무슨 소용이야. 지금 여기서 세 번은 직접 써 봐, 유령 — 선로 위에선 몸이 먼저 기억해야 산다.",
    "买来却不用，那还有什么意义？现在就在这里亲手用三次，幽灵——到了轨道上，只有先让身体记住用法，才能活命。"
  ],
  [
    "화면을 한 손가락으로 드래그해서 시점을 돌려 보세요! (두 손가락으로 오므리거나 벌려서 줌, {cameraKey} 버튼으로 시점 초기화)",
    "单指拖动即可转动视角。（双指捏合缩放，点按 {cameraKey} 重置视角。）"
  ],
  [
    "こんにちは。\n\n以前に支給された報酬が取り消されました。\n\n理由: {reason}\n\nご不明な点がございましたらカスタマーサポートまでご連絡ください。",
    "你好。\n\n先前发放的奖励已被取消。\n\n原因：{reason}\n\n如有疑问，请联系客服。"
  ],
  [
    "{base_name} — Lv{base_level}で解放（ホットキー {base_key}） 直線上のすべての敵を貫通 (最大{cap_n}体)",
    "{base_name} — Lv.{base_level} 解锁（快捷键：{base_key}） 贯穿直线上的所有敌人（最多 {cap_n} 个目标）"
  ],
  [
    "竜鱗の守護者は森の果ての祭壇の下に封印されているんです。封印が揺らいで風が荒れてしまったので、祭壇へ続く道のそよ風精霊を十体だけ、鎮めてきてください。",
    "龙鳞守卫被封印在森林尽头的祭坛下。封印正在动摇，风势也变得狂暴了，请先平息祭坛路上的十只和风精灵。"
  ],
  [
    "네르의 상점 — 제 상점도 한 번 들러 주세요. 뭐라도 하나 사 보시면 감이 잡히실 거예요. / 진행 {current}/{target}",
    "尼尔的商店 — 也来我的商店看看吧。随便买一件东西，很快就能上手。 ｜ 进度：{current}/{target}"
  ],
  [
    "서리별 고개는 여태 가 보신 어느 길보다 춥고 멀어요. 떠나기 전에 상점에서 세 가지만 사 두세요. 준비 없이 나서면 돌아오지 못해요.",
    "霜星雪岭比你走过的任何道路都更加寒冷、遥远。出发前，请先在商店买好三样东西。毫无准备地上路，可就回不来了。"
  ],
  [
    "ネルの露店 — 私の露店にもぜひ寄ってみてください。何か一つ選んでみれば、感じがつかめると思いますよ。 / 進行 {current}/{target}",
    "尼尔的商店 — 也来我的商店看看吧。随便买一件东西，很快就能上手。 ｜ 进度：{current}/{target}"
  ],
  [
    "{date}까지 이용이 제한됩니다. 해당 시각 이후 다시 접속할 수 있어요. 이의는 새 계정의 설정 > 개발자 문의로 접수해 주세요.",
    "账号封禁将持续至 {date}，届时可重新连接。如需申诉，请创建新账号并通过“设置 > 联系开发者”提交。"
  ],
  [
    "南の古い国境路が開けました。黄昏花が咲き乱れる辺境の森を越えないと、モナティウムへは行けないんです。まずはその森まで行ってみてください、スピキさん。",
    "南方的旧边境道路已经开放。要前往莫纳提姆，就必须穿过开满晚霞花的边境森林。先去那片森林看看吧，斯皮奇。"
  ],
  [
    "整備が終わったならついてきな、幽霊。信号灯だけが点滅する廃線だよ — 線路を外れたらどこに突っ込むか私にも分からない。ぴったりくっついて中へ入りな。",
    "整备完就跟上，幽灵。前面是只剩信号灯还在闪烁的旧信号铁路——偏离轨道会栽到哪里，连我也不知道。跟紧点，往里走。"
  ],
  [
    "Inquiries are currently overwhelmed. We'll reopen once things settle down.",
    "咨询量目前过大，待情况缓和后将重新开放。"
  ],
  [
    "Stop by the stall ten times, and I'll set aside something special for you.",
    "在商店购买十次，我会为你准备一份特别的礼物。"
  ],
  [
    "This exceeds the purchase limit. Please reduce the quantity and try again.",
    "超出购买上限，请减少数量后重试。"
  ],
  [
    "경찰차 모양의 특별 마운트 소환권 — 소지하면 '=' 키로 폴리스카를 소환해 탑승할 수 있다(성능은 호박마차와 동일, 외관만 다름).",
    "警车造型的特殊坐骑召唤券。持有时按“=”键，即可召唤并乘坐警车；性能与南瓜马车相同，仅外观不同。"
  ],
  [
    "무덤지기 대망령 — 묘지의 끝, 무덤지기 대망령이 기다려요. 이 여정의 마지막 시험이에요. / 진행 {current}/{target}",
    "守墓大亡灵 — 墓园尽头，守墓大亡灵正在等着你。这是本次旅程的最终试炼。 ｜ 进度：{current}/{target}"
  ],
  [
    "어린 용을 달래다 — 숲 깊은 곳 어린 용이 성이 났대요. 부디 다치지 않게 달래 주세요. / 진행 {current}/{target}",
    "安抚幼龙 — 听说森林深处的幼龙正在发脾气。请安抚它，也千万别让自己受伤。 ｜ 进度：{current}/{target}"
  ],
  [
    "이제 저에게 말을 걸어 보세요 — 저는 푸른 옷을 입고 있어요! 가까이 가서 탭! 대화창에서 [퀘스트]와 [상점]을 여실 수 있어요.",
    "现在来和我说话吧——我就是那个穿蓝衣服的人！靠近后点按我。对话框中可以打开【任务】和【商店】。"
  ],
  [
    "{base_name} — 쿨다운 {base_sec}초 (핫키 {base_key}) 일직선상의 모든 적 관통 (최대 {cap_n}체)",
    "{base_name} — 冷却 {base_sec} 秒（快捷键：{base_key}） 贯穿直线上的所有敌人（最多 {cap_n} 个目标）"
  ],
  [
    "{name} is not on the map with the sealed altar, so the party cannot enter",
    "{name} 不在封印祭坛所在的地图，队伍无法入场"
  ],
  [
    "利用が制限されているアカウントのため復旧できません。異議がある場合は新しいアカウントを作成し、設定 > 開発者へのお問い合わせからご連絡ください。",
    "此账号已被限制使用，无法恢复。如需申诉，请创建新账号并通过设置 > 联系开发者提交。"
  ],
  [
    "A sack worth grabbing when travel funds run short — packed nice and full.",
    "急需盘缠时值得带上的一袋金币，装得沉甸甸的。"
  ],
  [
    "An error occurred while processing your purchase. Please try again later.",
    "处理购买时发生错误，请稍后重试。"
  ],
  [
    "Walk with the left joystick! (You can jump with the {jumpKey} button too)",
    "用左侧摇杆走动吧！（也可以点按 {jumpKey} 按钮跳跃）"
  ],
  [
    "Your inquiry has been received. The developer will reply after reviewing.",
    "反馈已提交，开发者查看后会予以回复。"
  ],
  [
    "공단 심부 격납고에 봉인 제단이 있어. 50레벨쯤 됐으면 문 정도는 열리겠지. 유령, 설마 혼자 갈 생각은 아니지? 동료부터 챙겨.",
    "工业区深处的机库里有一座封印祭坛。到了50级，门应该就能打开。幽灵，你不会打算一个人去吧？先叫上同伴。"
  ],
  [
    "남쪽 옛 국경길이 열렸어요. 노을꽃이 흐드러진 변경숲을 지나야 모나티엄으로 갈 수 있답니다. 우선 그 숲까지 가 보세요, 스피키씨.",
    "南方的旧边境道路已经开放。要前往莫纳提姆，就必须穿过开满晚霞花的边境森林。先去那片森林看看吧，斯皮奇。"
  ],
  [
    "번개철탑 능선이야. 발밑으로 전류가 찌릿찌릿 흐르니까 한 발씩 골라 디뎌, 유령 — 아무 데나 밟았다간 후회해. 능선 위로 올라가.",
    "这里是雷电塔岭。电流就在脚下噼啪作响，每一步都要选好落脚点，幽灵——胡乱落脚可是会后悔的。登上山岭吧。"
  ],
  [
    "정비 끝났으면 따라와, 유령. 신호등만 깜빡이는 폐선로야 — 선로 벗어나면 어디로 처박힐지 나도 몰라. 바짝 붙어서 안으로 들어가.",
    "整备完就跟上，幽灵。前面是只剩信号灯还在闪烁的旧信号铁路——偏离轨道会栽到哪里，连我也不知道。跟紧点，往里走。"
  ],
  [
    "폐선로 기관장이 종착역을 틀어쥐고 있어. 저 고물만 넘으면 다음 구역이야 — 혼자 벅차면 말해, 유령. ...도와준다는 건 아니고.",
    "旧铁路幽灵列车长控制着终点站。越过那个破铜烂铁，就是下一个区域。一个人撑不住就说，幽灵。……我可没说会帮你。"
  ],
  [
    "アカウントが利用制限されたため、接続が終了しました。異議がある場合は新しいアカウントを作成し、設定 > 開発者へのお問い合わせからご連絡ください。",
    "账号已被封禁，连接已断开。如需申诉，请创建新账号并通过“设置 > 联系开发者”提交。"
  ],
  [
    "2-12 characters — Korean, letters, or digits only (no spaces or symbols)",
    "2–12 个韩文、英文字母或数字（不可使用空格或特殊符号）"
  ],
  [
    "誰かのいたずらなのか、ところどころに石が混ざっていた。心配したものの、スピキは自分にぴったりの食べ物だと叫び、喜んでぴょんぴょん跳ね回っている。",
    "不知是谁恶作剧，里面零星混进了几块石头。本来还有些担心，斯皮奇却高喊这正适合自己，开心得蹦蹦跳跳。"
  ],
  [
    "新芽たちの騒ぎ — 新芽の妖精たちまで浮き足立ってしまって。八匹だけ、落ち着かせてきてください。 / 進行 {current}/{target}",
    "嫩芽的骚动 — 连嫩芽妖精也躁动起来了。请安抚八只。 ｜ 进度：{current}/{target}"
  ],
  [
    "Attached: {mail1_name} x{mail1_quantity}, {mail2_name} x{mail2_quantity}",
    "附件：{mail1_name} x{mail1_quantity}, {mail2_name} x{mail2_quantity}"
  ],
  [
    "Let's head back to the field! Press {key} near the portal to move there.",
    "回到野外继续吧！在传送门附近按 {key} 键即可前往。"
  ],
  [
    "Lv{level} {slot} — grants +{def} Defense and +{hp} Max HP when equipped.",
    "Lv.{level} {slot} — 防御力 +{def}，最大生命值 +{hp}"
  ],
  [
    "Tap the emote (smiley) button below next to a downed ally to revive them",
    "靠近倒地的队友，点击下方的表情（笑脸）按钮，即可将其救起"
  ],
  [
    "Welcome to {zoneName}! The deeper you go, the stronger the monsters get.",
    "欢迎来到 {zoneName}！越往深处，出现的怪物就越强。"
  ],
  [
    "누군가의 장난인지 중간 중간에 돌이 섞여있었다. 걱정했지만 스피키는 자기와 어울리는 음식이라 외치고 기뻐하며 팔짝팔짝 뛰어다닌다.",
    "不知是谁恶作剧，里面零星混进了几块石头。本来还有些担心，斯皮奇却高喊这正适合自己，开心得蹦蹦跳跳。"
  ],
  [
    "工業地帯の奥、格納庫に封印祭壇がある。五十レベルになれば扉くらい開くでしょ。幽霊、まさか一人で行くつもりじゃないよね? 仲間くらい連れてきな。",
    "工业区深处的机库里有一座封印祭坛。到了50级，门应该就能打开。幽灵，你不会打算一个人去吧？先叫上同伴。"
  ],
  [
    "獣人斥候の討伐 — 獣人の斥候たちが道をふさいでしまって。十匹だけ、追い払っていただけますか？ / 進行 {current}/{target}",
    "讨伐森林兽人侦察兵 — 森林兽人侦察兵挡住了道路。能帮我击退十只吗？ ｜ 进度：{current}/{target}"
  ],
  [
    "The wailing ghosts won't stop crying. Please quiet just twelve of them.",
    "哀嚎幽灵的哭声久久不息。请平息十二只。"
  ],
  [
    "You're out of {name} — restock at the shop or assign a different potion",
    "{name} 已用完 — 请到商店补充或指定其他药水"
  ],
  [
    "Your enhancement info has changed. Please check the latest state again.",
    "强化信息已更新，请确认最新状态后重试。"
  ],
  [
    "달안개 습지로 — 안개 낀 습지로 길이 열렸어요. 두꺼비 사역마 열만 정리해 주세요. / 진행 {current}/{target}",
    "前往月雾湿地 — 通往月雾湿地的道路已经开放。请清除十只湿地蟾蜍使魔。 ｜ 进度：{current}/{target}"
  ],
  [
    "용린 수호자는 숲 끝 제단 아래 봉인됐어요. 봉인이 흔들려 바람이 사나워졌으니, 제단 길목의 산들 바람정령 열만 잠재워 주세요.",
    "龙鳞守卫被封印在森林尽头的祭坛下。封印正在动摇，风势也变得狂暴了，请先平息祭坛路上的十只和风精灵。"
  ],
  [
    "さすらう風をつかまえる — さすらう風精霊が道を乱してしまって。八体だけ、鎮めてきてください。 / 進行 {current}/{target}",
    "捕捉游荡之风 — 游荡风精灵扰乱了道路。请平息八只。 ｜ 进度：{current}/{target}"
  ],
  [
    "見習い魔女の実験 — 見習い魔女が危険な実験をしているんです。十人だけ、止めてきてください。 / 進行 {current}/{target}",
    "见习湿地女巫的实验 — 见习湿地女巫们正在进行危险实验。请制止其中十名。 ｜ 进度：{current}/{target}"
  ],
  [
    "冒険には目標が必要ですよね!【クエスト】を押してやることを確認してみましょう。(普段は{key}キー、右下のメニューアイコンからも開けます)",
    "冒险当然要有目标！打开【任务】查看下一步行动。（也可按 {key}，或点击右下角的菜单图标。）"
  ],
  [
    "霜星の峠は、これまで歩かれたどの道より寒くて遠いんです。発つ前に露店で三つだけ揃えていってください。備えなしで出ては、戻ってこられませんよ。",
    "霜星雪岭比你走过的任何道路都更加寒冷、遥远。出发前，请先在商店买好三样东西。毫无准备地上路，可就回不来了。"
  ],
  [
    "A gift has arrived! Claim it from the mailbox icon in the bottom menu.",
    "礼物到了！从底部菜单的邮箱图标中领取。"
  ],
  [
    "Another Speaki! Tap them to send a party invite. (Up to {max} members)",
    "遇到另一位斯皮奇了！点按对方即可邀请组队。（队伍最多 {max} 人。）"
  ],
  [
    "Cookieが削除されたり別のブラウザでアクセスした場合、このコードだけがアカウントを取り戻す唯一の手段です。安全な場所にメモしてください。",
    "若 Cookie 被清除或改用其他浏览器，此恢复码将是找回账号的唯一凭证，请务必妥善保存。"
  ],
  [
    "Show your face on five different days. The temple remembers diligence.",
    "请在五个不同的日子来露个面。教团会记住你的勤勉。"
  ],
  [
    "Your connection was closed by an administrator. You can reconnect now.",
    "管理员已关闭你的连接。你现在可以重新连接。"
  ],
  [
    "달무리 늪골의 불빛 — 달무리 늪골에 달빛 도깨비불이 떠돌아요. 열만 흩어 주세요. / 진행 {current}/{target}",
    "月环泽谷的灯火 — 月环泽谷中飘荡着月光鬼火。请驱散十只。 ｜ 进度：{current}/{target}"
  ],
  [
    "떠도는 바람을 붙잡다 — 떠도는 바람정령이 길을 어지럽혀요. 여덟만 잠재워 주세요. / 진행 {current}/{target}",
    "捕捉游荡之风 — 游荡风精灵扰乱了道路。请平息八只。 ｜ 进度：{current}/{target}"
  ],
  [
    "안녕하세요.\n\n이전에 지급된 보상이 취소되었습니다.\n\n사유: {reason}\n\n문의 사항이 있으시면 고객센터로 연락해 주세요.",
    "你好。\n\n先前发放的奖励已被取消。\n\n原因：{reason}\n\n如有疑问，请联系客服。"
  ],
  [
    "ここが最後だよ、幽霊。冷却の止まった動力核深部へ下る道が開いた。……まあ、心配はしてない。ここまで耐え抜いてきたんだからね、お前は。下りな。",
    "这是最后一段路了，幽灵。通往动力核心深处的道路已经开启，那里的冷却系统早已停摆。……算了，我并不担心，毕竟你都撑到这里了。下去吧。"
  ],
  [
    "誰かのいたずらなのか、ところどころ石が混ざっていた。心配したものの、スピキは自分にぴったりの食べ物だと叫んで喜び、ぴょんぴょん跳ね回った。",
    "不知是谁恶作剧，里面零星混进了几块石头。本来还有些担心，斯皮奇却高喊这正适合自己，开心得蹦蹦跳跳。"
  ],
  [
    "The spirits have lost their peace. Please soothe just twelve of them.",
    "亡灵失去了安宁。请安抚十二只。"
  ],
  [
    "대습지 마녀 강림 — 대습지 마녀가 묘지를 넘봐요. 부디 막아 주세요, 스피키씨. / 진행 {current}/{target}",
    "大沼泽女巫降临 — 大沼泽女巫盯上了墓园。请阻止她，斯皮奇。 ｜ 进度：{current}/{target}"
  ],
  [
    "모험엔 목표가 있어야죠! [퀘스트]를 눌러 할 일을 확인해 보세요. (평소엔 {key}키, 우하단 메뉴 아이콘으로도 열려요)",
    "冒险当然要有目标！打开【任务】查看下一步行动。（也可按 {key}，或点击右下角的菜单图标。）"
  ],
  [
    "いよいよ根の洞です。敷居を守る根のゴーレムを百八十体だけ、砕いてきてください。遅いですが、一度地面をねじると近くが全部揺れてしまいますよ。",
    "接下来是曙光根穴。请摧毁一百八十只把守入口的树根魔像。它们虽然迟缓，但只要扭动一次大地，四周都会震颤。"
  ],
  [
    "ネルがスピキのよく実したカボチャを市場で売りさばいて用意してくれた路銀の袋（カボチャは苦手なくせに、売るときは目をつぶってやってのける）。",
    "尼尔把斯皮奇种熟的南瓜拿到集市卖掉，才凑出这袋盘缠。（她虽然讨厌南瓜，做买卖时还是会闭着眼把事情办妥。）"
  ],
  [
    "大湿地魔女の降臨 — 大湿地魔女が墓地を狙っています。どうか止めてください、スピキさん。 / 進行 {current}/{target}",
    "大沼泽女巫降临 — 大沼泽女巫盯上了墓园。请阻止她，斯皮奇。 ｜ 进度：{current}/{target}"
  ],
  [
    "A conflict occurred while processing your request. Please try again.",
    "处理请求时发生冲突，请重试。"
  ],
  [
    "An error occurred while granting the reward. Please try again later.",
    "发放奖励时发生错误，请稍后重试。"
  ],
  [
    "That player's friend list is full, so you can't accept this request.",
    "对方的好友列表已满，无法接受此申请。"
  ],
  [
    "Touching a nuruling downs you — your drones fight back automatically",
    "碰到努噜灵就会倒地！无人机会自动作战，注意躲避敌人"
  ],
  [
    "Upgrades can't be undone. A way to redistribute will be added later.",
    "属性强化后无法撤销；重置分配功能将在之后推出。"
  ],
  [
    "감시 관제탑까지 넘었으니 이제야 동력핵 본체가 모습을 드러냈네. 유령, 이번에도 혼자 갈 생각이면 곤란해 — 동료 데려가.",
    "既然连监控塔都越过了，动力核心本体终于现身了。幽灵，这一次可不能再单独行动——带上同伴。"
  ],
  [
    "숲지기의 시험 — 엘프 숲지기가 당신을 시험하려 해요. 여덟 번 이겨 보이세요. / 진행 {current}/{target}",
    "守林人的试炼 — 精灵守林人想考验你。战胜它八次，证明自己吧。 ｜ 进度：{current}/{target}"
  ],
  [
    "廃線機関長が終着駅を握ってる。あのポンコツさえ越えれば次の区域だよ — 一人で厳しいなら言いな、幽霊。……手伝うってわけじゃないけど。",
    "旧铁路幽灵列车长控制着终点站。越过那个破铜烂铁，就是下一个区域。一个人撑不住就说，幽灵。……我可没说会帮你。"
  ],
  [
    "今度は私に話しかけてみてください — 私は青い服を着ています!近づいて左クリック!会話画面から【クエスト】と【ショップ】を開けますよ。",
    "现在来和我说话吧——我就是那个穿蓝衣服的人！靠近后单击鼠标左键。对话框中可以打开【任务】和【商店】。"
  ],
  [
    "墓守の大亡霊 — 墓地の果てで、墓守の大亡霊が待っています。この旅の最後の試練ですよ。 / 進行 {current}/{target}",
    "守墓大亡灵 — 墓园尽头，守墓大亡灵正在等着你。这是本次旅程的最终试炼。 ｜ 进度：{current}/{target}"
  ],
  [
    "森番の試練 — エルフの森番があなたを試そうとしています。八回、勝って見せてください。 / 進行 {current}/{target}",
    "守林人的试炼 — 精灵守林人想考验你。战胜它八次，证明自己吧。 ｜ 进度：{current}/{target}"
  ],
  [
    "Your upgrade info has changed. Please check the latest state again.",
    "强化信息已更新，请确认最新状态后重试。"
  ],
  [
    "번개철탑 수호기가 능선 꼭대기에 앉아 있어. 저놈만 넘으면 동력핵 심부야 — 마지막 문 앞이지. 정신 바짝 차려, 유령.",
    "雷电塔守护机盘踞在山脊顶端。越过它就是动力核心深处——最后一道门就在眼前。打起精神，幽灵。"
  ],
  [
    "수인 정찰병 토벌 — 수인 정찰병이 길을 막아섰어요. 열만 물리쳐 주시겠어요? / 진행 {current}/{target}",
    "讨伐森林兽人侦察兵 — 森林兽人侦察兵挡住了道路。能帮我击退十只吗？ ｜ 进度：{current}/{target}"
  ],
  [
    "요정을 살펴라 — 숲의 요정들이 부쩍 소란스러워요. 다섯만 살펴봐 주시겠어요? / 진행 {current}/{target}",
    "森林妖精的异动 — 森林妖精最近格外吵闹。能帮我查看五只森林妖精的情况吗？ ｜ 进度：{current}/{target}"
  ],
  [
    "教団の朝 — 今日も来てくださったんですね。少し顔を見せていただくだけで十分ですよ。 / 進行 {current}/{target}",
    "教团的清晨 — 今天也来报到了呢。只要露个面就足够了。 ｜ 进度：{current}/{target}"
  ],
  [
    "泣き声の源 — 哭声幽霊の泣き声が止まらないんです。十二体だけ、鎮めてきてください。 / 進行 {current}/{target}",
    "哀嚎之源 — 哀嚎幽灵的哭声久久不息。请平息十二只。 ｜ 进度：{current}/{target}"
  ],
  [
    "峠の入り口に霜熊の獣人たちが巣穴を掘ったそうです。百二十匹だけ、追い払ってください。雪に足を取られると、あの前足はかわせませんから。",
    "听说冰霜熊人在雪岭入口筑了巢。请赶走一百二十只。一旦双脚陷进积雪，就躲不开它们的熊掌了。"
  ],
  [
    "添付: {mail1_name} x{mail1_quantity}, {mail2_name} x{mail2_quantity}",
    "附件：{mail1_name} x{mail1_quantity}, {mail2_name} x{mail2_quantity}"
  ],
  [
    "Could not connect to the channel you chose. Please select another.",
    "无法连接至所选频道，请选择其他频道。"
  ],
  [
    "The server is currently under maintenance. Please try again later.",
    "服务器正在维护，请稍后重试。"
  ],
  [
    "You have been signed out from another device. Please log in again.",
    "账号已在另一台设备上退出登录，请重新登录。"
  ],
  [
    "You have reached today's inquiry limit. Please try again tomorrow.",
    "已达到今天的咨询次数上限，请明天再试。"
  ],
  [
    "견습 마녀의 실험 — 견습 마녀가 위험한 실험을 벌여요. 열만 말려 주세요. / 진행 {current}/{target}",
    "见习湿地女巫的实验 — 见习湿地女巫们正在进行危险实验。请制止其中十名。 ｜ 进度：{current}/{target}"
  ],
  [
    "엘리아스에 오신 걸 환영해요, 스피키씨!\n저는 네르 — 여긴 세계수 교단이에요.\n몇 가지만 알려드릴게요, 준비되셨나요?",
    "欢迎来到埃利亚斯，斯皮奇！\n我是尼尔，这里是世界树教团。\n先让我教你一些冒险的基础知识——准备好了吗？"
  ],
  [
    "첨부: {mail1_name} x{mail1_quantity}, {mail2_name} x{mail2_quantity}",
    "附件：{mail1_name} x{mail1_quantity}, {mail2_name} x{mail2_quantity}"
  ],
  [
    "さまよう亡霊 — 亡霊たちが安らぎを失ってしまって。十二体だけ、慰めてきてください。 / 進行 {current}/{target}",
    "游荡的亡灵 — 亡灵失去了安宁。请安抚十二只。 ｜ 进度：{current}/{target}"
  ],
  [
    "吹雪の中を青い鬼火がさまよっているそうです。百三十個だけ、消してきてください。近くに立っていると、足元から先に凍りつくそうですよ。",
    "听说暴风雪中飘荡着冰霜鬼火。请熄灭一百三十只。靠得太近，脚下会先结冰。"
  ],
  [
    "今度は私に話しかけてみてください — 私は青い服を着ています!近づいてタップ!会話画面から【クエスト】と【ショップ】を開けますよ。",
    "现在来和我说话吧——我就是那个穿蓝衣服的人！靠近后点按我。对话框中可以打开【任务】和【商店】。"
  ],
  [
    "今日の狩り — 今日の分の狩りです。種類は問いませんので、十五体だけお願いします。 / 進行 {current}/{target}",
    "今日狩猎 — 完成今天的狩猎吧。种类不限，击败十五只即可。 ｜ 进度：{current}/{target}"
  ],
  [
    "雷鉄塔の尾根だよ。足元にビリビリ電流が流れてるから、一歩ずつ選んで踏みな、幽霊 — 適当に踏んだら後悔するよ。尾根の上まで登りな。",
    "这里是雷电塔岭。电流就在脚下噼啪作响，每一步都要选好落脚点，幽灵——胡乱落脚可是会后悔的。登上山岭吧。"
  ],
  [
    "利用が制限されているアカウントです。異議がある場合は新しいアカウントを作成し、設定 > 開発者へのお問い合わせからご連絡ください。",
    "此账号已被限制使用。如需申诉，请创建新账号，并通过设置 > 联系开发者提交申请。"
  ],
  [
    "峠を越えると、燠火の流れる谷です。さまよう溶岩の鬼火を百五十個だけ、散らしてきてください。足元で弾けるそうですから、お気をつけて。",
    "翻过山口，便是流淌着烬火的山谷。请驱散一百五十只游荡的熔岩鬼火。它们会在脚下爆炸，务必小心。"
  ],
  [
    "고대의 바람 앞에서 — 고대 바람정령이 깨어났어요. 조심하세요, 스피키씨. / 진행 {current}/{target}",
    "直面远古之风 — 远古风精灵苏醒了。请小心，斯皮奇。 ｜ 进度：{current}/{target}"
  ],
  [
    "네르가 스피키의 여문 호박을 장에 내다 팔아 챙겨 준 노잣돈 주머니(호박은 질색하면서도 파는 건 눈 딱 감고 한다).",
    "尼尔把斯皮奇种熟的南瓜拿到集市卖掉，才凑出这袋盘缠。（她虽然讨厌南瓜，做买卖时还是会闭着眼把事情办妥。）"
  ],
  [
    "여명빛 파수꾼. 교단이 아주 오래 기다려 온 이름이에요. 다녀오시면… 제가 상점 문을 닫고 마중 나갈게요, 스피키씨.",
    "曙光守卫——教团已经等待这个名字太久了。等你回来……我会关上店门，亲自去迎接你，斯皮奇。"
  ],
  [
    "이제 뿌리굴이에요. 문턱을 지키는 뿌리 골렘 백여든만 부숴 주세요. 느리지만 한 번 땅을 뒤틀면 근처가 다 흔들려요.",
    "接下来是曙光根穴。请摧毁一百八十只把守入口的树根魔像。它们虽然迟缓，但只要扭动一次大地，四周都会震颤。"
  ],
  [
    "マウスの右クリックを押したままドラッグして、視点を回してみましょう!(ホイールでズーム、{cameraKey}キーで視点リセット)",
    "按住鼠标右键拖动即可转动视角。（滚动滚轮缩放，按 {cameraKey} 重置视角。）"
  ],
  [
    "工業地区の街灯をインプボットたちが飲み込んで、灯りを消しています。百三十体だけ捕まえていただければ、また道が明るくなるはずです。",
    "焊火小恶魔机器人吞噬工业区道路上的路灯，让灯光熄灭。抓住130只，道路就会再次亮起来。"
  ],
  [
    "教団の後援者 — 露店に十回寄っていただけたら、特別なものを用意しておきますね。 / 進行 {current}/{target}",
    "教团赞助者 — 在商店购买十次，我会为你准备一份特别的礼物。 ｜ 进度：{current}/{target}"
  ],
  [
    "霧の中の影 — 霧の影が道を飲み込んでしまって。十二体だけ、払ってきてください。 / 進行 {current}/{target}",
    "迷雾中的暗影 — 雾影正在吞噬道路。请清除十二只。 ｜ 进度：{current}/{target}"
  ],
  [
    "All solo raid slots are taken. Try with a party or again shortly",
    "单人进入名额已满，请组队挑战或稍后重试"
  ],
  [
    "Great, finish it off! Defeating monsters earns you EXP and loot.",
    "很好，现在击败它吧！打倒怪物可以获得经验值和战利品。"
  ],
  [
    "Nicknames must be 2-12 characters of Korean, letters, or digits.",
    "昵称须由 2–12 个韩文、英文字母或数字组成。"
  ],
  [
    "You can earn rewards up to 10 times a day. Entries are unlimited",
    "每天最多可领取 10 次奖励，挑战次数不限"
  ],
  [
    "곡성의 근원 — 곡성유령의 울음이 그치질 않아요. 열둘만 잠재워 주세요. / 진행 {current}/{target}",
    "哀嚎之源 — 哀嚎幽灵的哭声久久不息。请平息十二只。 ｜ 进度：{current}/{target}"
  ],
  [
    "교단의 아침 — 오늘도 와 주셨군요. 잠깐 얼굴 비춘 것만으로 충분해요. / 진행 {current}/{target}",
    "教团的清晨 — 今天也来报到了呢。只要露个面就足够了。 ｜ 进度：{current}/{target}"
  ],
  [
    "교단의 후원자 — 상점에서 열 번 사 주시면, 특별한 걸 챙겨 드릴게요. / 진행 {current}/{target}",
    "教团赞助者 — 在商店购买十次，我会为你准备一份特别的礼物。 ｜ 进度：{current}/{target}"
  ],
  [
    "모나티엄 시청에서 구조 요청이 왔어요. 남쪽 옛 국경길, 노을꽃이 피는 숲을 지나야 한대요. (햇바람 숲 남쪽 끝)",
    "莫纳提姆市政厅发来了求救信。要前往那里，必须沿南方旧边境道路，穿过开满晚霞花的森林。（晴风森林南端）"
  ],
  [
    "성실한 순례자 — 다섯 날 얼굴을 비춰 주세요. 교단은 성실을 기억해요. / 진행 {current}/{target}",
    "勤勉的朝圣者 — 请在五个不同的日子来露个面。教团会记住你的勤勉。 ｜ 进度：{current}/{target}"
  ],
  [
    "쿠키를 지우거나 다른 브라우저에서 접속하면 이 코드만이 계정을 되찾을 유일한 수단입니다. 안전한 곳에 메모해두세요.",
    "若 Cookie 被清除或改用其他浏览器，此恢复码将是找回账号的唯一凭证，请务必妥善保存。"
  ],
  [
    "ネルの常連さん — 露店にひとつだけ寄ってみてください。常連さんが一番ですから。 / 進行 {current}/{target}",
    "尼尔的常客 — 去商店随便买一样东西吧。常客总是最受欢迎的。 ｜ 进度：{current}/{target}"
  ],
  [
    "{base_name} — クールダウン {base_sec}秒（ホットキー {base_key}） 直線上のすべての敵を貫通",
    "{base_name} — 冷却 {base_sec} 秒（快捷键：{base_key}） 贯穿直线上的所有敌人"
  ],
  [
    "⚠ この先に表示される復旧コードはアカウントのパスワードに相当します。配信・画面共有中の方は、映り込まないようご注意ください!",
    "⚠ 下方恢复码等同于你的账号密码。如果正在直播或共享屏幕，请务必避免泄露！"
  ],
  [
    "古の風の前で — 古の風精霊が目覚めました。お気をつけくださいね、スピキさん。 / 進行 {current}/{target}",
    "直面远古之风 — 远古风精灵苏醒了。请小心，斯皮奇。 ｜ 进度：{current}/{target}"
  ],
  [
    "黎明光の守護者。教団がずっと長いあいだ待ち続けてきた名前です。行ってこられたら…私は露店を畳んでお迎えに出ますね、スピキさん。",
    "曙光守卫——教团已经等待这个名字太久了。等你回来……我会关上店门，亲自去迎接你，斯皮奇。"
  ],
  [
    "On use, raises your level by exactly 1 (unusable at max level).",
    "使用后立即提升 1 级（达到最高等级后无法使用）。"
  ],
  [
    "Signed in from another device — this connection has been closed",
    "检测到其他设备登录，此连接已断开"
  ],
  [
    "The connection is temporarily unstable. Please try again later.",
    "连接暂时不稳定，请稍后重试。"
  ],
  [
    "{base_name} — Lv{base_level}에 해금 (핫키 {base_key}) 일직선상의 모든 적 관통",
    "{base_name} — Lv.{base_level} 解锁（快捷键：{base_key}） 贯穿直线上的所有敌人"
  ],
  [
    "{base_name} — Lv{base_level}で解放（ホットキー {base_key}） 直線上のすべての敵を貫通",
    "{base_name} — Lv.{base_level} 解锁（快捷键：{base_key}） 贯穿直线上的所有敌人"
  ],
  [
    "甘い習慣 — お持ちの消耗品をひとつくらい、今日使ってみるのはいかがですか？ / 進行 {current}/{target}",
    "甜蜜的习惯 — 今天也挑一件随身的消耗品用用看吧？ ｜ 进度：{current}/{target}"
  ],
  [
    "実直な巡礼者 — 五日間、顔を見せてください。教団は実直さを覚えていますよ。 / 進行 {current}/{target}",
    "勤勉的朝圣者 — 请在五个不同的日子来露个面。教团会记住你的勤勉。 ｜ 进度：{current}/{target}"
  ],
  [
    "Equipment cannot be used. Equip it from Equipment (E) instead.",
    "装备无法直接使用，请前往装备界面（E）穿戴。"
  ],
  [
    "Item-based draw placeholder — grants Gold or Energy by chance.",
    "进行一次普通抽取，随机获得金币或能量。"
  ],
  [
    "Next: {levelLabel_n} stacks · Defense bonus {current} → {next}",
    "再强化 {levelLabel_n} 层：防御力 {current} → {next}"
  ],
  [
    "Please rotate your device to landscape for the best experience",
    "请将设备转为横屏，以获得更流畅的游戏体验"
  ],
  [
    "The ancient wind spirit has awoken. Please be careful, Speaki.",
    "远古风精灵苏醒了。请小心，斯皮奇。"
  ],
  [
    "고개 초입에 곰 수인들이 굴을 텄대요. 백스물만 물려 주세요. 눈에 발이 묶이면 그 앞발을 피할 수가 없거든요.",
    "听说冰霜熊人在雪岭入口筑了巢。请赶走一百二十只。一旦双脚陷进积雪，就躲不开它们的熊掌了。"
  ],
  [
    "안개 속 그림자 — 안개 그림자가 길을 삼켜요. 열둘만 걷어 주세요. / 진행 {current}/{target}",
    "迷雾中的暗影 — 雾影正在吞噬道路。请清除十二只。 ｜ 进度：{current}/{target}"
  ],
  [
    "トロッコゴーレムたちが線路の上を好き勝手に暴走してる。百四十五体だけ壊しな、幽霊 — 轢かれたくないなら背後にも気をつけて。",
    "废弃轨道矿车魔像正在轨道上横冲直撞。砸碎145台，幽灵——不想被碾过去，就连背后也盯紧点。"
  ],
  [
    "モナティウムの市庁舎から救援要請が届きました。南の古い国境路、黄昏花の咲く森を越える必要があるそうです。（陽風の森 南の端）",
    "莫纳提姆市政厅发来了求救信。要前往那里，必须沿南方旧边境道路，穿过开满晚霞花的森林。（晴风森林南端）"
  ],
  [
    "⚠ 다음에 나올 복구 코드는 계정 비밀번호에 해당합니다. 방송·화면 공유 중이시면 노출되지 않도록 주의하세요!",
    "⚠ 下方恢复码等同于你的账号密码。如果正在直播或共享屏幕，请务必避免泄露！"
  ],
  [
    "Lv10 bottom — grants +2 Defense and +20 Max HP when equipped.",
    "Lv10 下装——装备时防御力 +2，最大 HP +20"
  ],
  [
    "Lv15 bottom — grants +3 Defense and +28 Max HP when equipped.",
    "Lv15 下装——装备时防御力 +3，最大 HP +28"
  ],
  [
    "Lv20 bottom — grants +4 Defense and +36 Max HP when equipped.",
    "Lv20 下装——装备时防御力 +4，最大 HP +36"
  ],
  [
    "Lv25 bottom — grants +4 Defense and +44 Max HP when equipped.",
    "Lv25 下装——装备时防御力 +4，最大 HP +44"
  ],
  [
    "Lv30 bottom — grants +5 Defense and +51 Max HP when equipped.",
    "Lv30 下装——装备时防御力 +5，最大 HP +51"
  ],
  [
    "Lv40 bottom — grants +7 Defense and +66 Max HP when equipped.",
    "Lv40 下装——装备时防御力 +7，最大 HP +66"
  ],
  [
    "Lv50 bottom — grants +8 Defense and +81 Max HP when equipped.",
    "Lv50 下装——装备时防御力 +8，最大 HP +81"
  ],
  [
    "Next: {levelLabel_n} stacks · Attack bonus {current} → {next}",
    "再强化 {levelLabel_n} 层：攻击力 {current} → {next}"
  ],
  [
    "No messages yet. Feel free to leave a question or bug report.",
    "暂无反馈记录。欢迎提交问题或错误报告。"
  ],
  [
    "Press T to emote (dance) next to a downed ally to revive them",
    "队友倒地后，在其身旁按 T 并选择“跳舞”表情，即可将其救起"
  ],
  [
    "You can only enter from the map where the sealed altar stands",
    "只能从封印祭坛所在的地图进入"
  ],
  [
    "You got new gear! Equip it in Equipment (E) to grow stronger.",
    "获得新装备了！按 E 打开装备界面并穿戴它，就能变得更强。"
  ],
  [
    "광차 골렘들이 선로 위를 제멋대로 폭주해. 145대만 부숴, 유령 — 깔리고 싶지 않으면 등 뒤도 봐 가면서.",
    "废弃轨道矿车魔像正在轨道上横冲直撞。砸碎145台，幽灵——不想被碾过去，就连背后也盯紧点。"
  ],
  [
    "노을숲 대족장이 국경을 틀어쥐고 있어요. 이 자만 넘으면 톱니들녘으로 갈 수 있답니다. 조심하세요, 스피키씨.",
    "暮色森林大酋长控制着边境。只要越过它，就能前往齿轮原野。请小心，斯皮奇。"
  ],
  [
    "눈보라 속에서 파란 불씨가 떠돈다고들 해요. 백서른만 꺼 주세요. 가까이 서 있으면 발밑이 먼저 얼어붙는대요.",
    "听说暴风雪中飘荡着冰霜鬼火。请熄灭一百三十只。靠得太近，脚下会先结冰。"
  ],
  [
    "마우스 우클릭을 누른 채로 드래그해서 시점을 돌려 보세요! (휠로 줌, {cameraKey}키로 시점 초기화)",
    "按住鼠标右键拖动即可转动视角。（滚动滚轮缩放，按 {cameraKey} 重置视角。）"
  ],
  [
    "새싹의 소란 — 새싹 요정들까지 들떴네요. 여덟만 진정시켜 주세요. / 진행 {current}/{target}",
    "嫩芽的骚动 — 连嫩芽妖精也躁动起来了。请安抚八只。 ｜ 进度：{current}/{target}"
  ],
  [
    "오늘의 사냥 — 오늘 몫의 사냥이에요. 종류는 상관없으니 열다섯만. / 진행 {current}/{target}",
    "今日狩猎 — 完成今天的狩猎吧。种类不限，击败十五只即可。 ｜ 进度：{current}/{target}"
  ],
  [
    "画面を指1本でドラッグして視点を回してみましょう!(指2本でつまんでズーム、{cameraKey}ボタンで視点リセット)",
    "单指拖动即可转动视角。（双指捏合缩放，点按 {cameraKey} 重置视角。）"
  ],
  [
    "雷鉄塔の守護機が尾根の頂上に座ってる。あいつさえ越えれば動力核深部だよ — 最後の扉の前ってこと。気を引き締めな、幽霊。",
    "雷电塔守护机盘踞在山脊顶端。越过它就是动力核心深处——最后一道门就在眼前。打起精神，幽灵。"
  ],
  [
    "買っただけで使わなきゃ意味ないでしょ。今ここで三回、実際に使ってみな、幽霊 — 線路の上じゃ体が先に覚えてないと死ぬよ。",
    "买来却不用，那还有什么意义？现在就在这里亲手用三次，幽灵——到了轨道上，只有先让身体记住用法，才能活命。"
  ],
  [
    "森を抜けると、薄暗い歯車野です。捨てられた機械たちが野原を転がり回っているそうなので、気をつけて足を踏み入れてください。",
    "离开森林，便是暮色笼罩的齿轮原野。听说废弃机械仍在田野间游荡，请小心踏入。"
  ],
  [
    "Lv5 bottom — grants +1 Defense and +15 Max HP when equipped.",
    "Lv5 下装——装备时防御力 +1，最大 HP +15"
  ],
  [
    "Lv50 top — grants +11 Defense and +135 Max HP when equipped.",
    "Lv50 上衣——装备时防御力 +11，最大 HP +135"
  ],
  [
    "Next: Lv.{enhanceLevel_n} · Defense bonus {current} → {next}",
    "强化至 +{enhanceLevel_n}：防御力 {current} → {next}"
  ],
  [
    "Preparing the new version — will retry automatically shortly",
    "正在准备更新，稍后会自动重试"
  ],
  [
    "You're down — tap a skill icon below to watch a party member",
    "你已倒下——点击下方队友图标切换视角"
  ],
  [
    "모험엔 목표가 있어야죠! [퀘스트]를 눌러 할 일을 확인해 보세요. (우하단 메뉴 아이콘에서 열 수 있어요)",
    "冒险当然要有目标！打开【任务】查看下一步行动。（也可通过右下角的菜单图标打开。）"
  ],
  [
    "코일들이 능선을 거미줄처럼 얽어놨어. 175개만 끊어, 유령 — 걸리면 전류가 그대로 네 몸을 타고 흐른다.",
    "线圈蜘蛛机器人把山脊织成了蛛网。拆掉175台，幽灵——一旦被缠住，电流会直接贯穿你的身体。"
  ],
  [
    "あの谷の獣人たちは、全身の火傷の跡を勲章のように見せびらかすんです。百六十匹だけ追い払っていただければ、道が開けますよ。",
    "山谷里的焦灼兽人把满身灼痕当作勋章。赶走一百六十只，道路应该就会畅通。"
  ],
  [
    "{base_name} — 쿨다운 {base_sec}초 (핫키 {base_key}) 일직선상의 모든 적 관통",
    "{base_name} — 冷却 {base_sec} 秒（快捷键：{base_key}） 贯穿直线上的所有敌人"
  ],
  [
    "Attached: {mail1_name} x{mail1_quantity}, EXP {mailExp_exp}",
    "附件：{mail1_name} x{mail1_quantity}, 经验值 {mailExp_exp}"
  ],
  [
    "Lv40 top — grants +9 Defense and +110 Max HP when equipped.",
    "Lv40 上衣——装备时防御力 +9，最大 HP +110"
  ],
  [
    "Next: Lv.{enhanceLevel_n} · Attack bonus {current} → {next}",
    "强化至 +{enhanceLevel_n}：攻击力 {current} → {next}"
  ],
  [
    "This item cannot be used because its reward table is empty.",
    "奖励表为空，无法使用此物品。"
  ],
  [
    "Your friend list is full, so you can't accept this request.",
    "你的好友列表已满，无法接受此申请。"
  ],
  [
    "고개를 넘으면 잉걸이 흐르는 골짜기예요. 떠도는 불씨 백쉰만 흩어 주세요. 발밑에서 터진다니 조심하시고요.",
    "翻过山口，便是流淌着烬火的山谷。请驱散一百五十只游荡的熔岩鬼火。它们会在脚下爆炸，务必小心。"
  ],
  [
    "달콤한 습관 — 가진 소모품 하나쯤 오늘 써 보시는 건 어때요? / 진행 {current}/{target}",
    "甜蜜的习惯 — 今天也挑一件随身的消耗品用用看吧？ ｜ 进度：{current}/{target}"
  ],
  [
    "떠도는 망령 — 망령들이 안식을 잃었어요. 열둘만 달래 주세요. / 진행 {current}/{target}",
    "游荡的亡灵 — 亡灵失去了安宁。请安抚十二只。 ｜ 进度：{current}/{target}"
  ],
  [
    "버려진 수확기들이 아직도 들판을 갈아엎어요. 115대만 멈춰 세워 주세요. 애먼 밭이 다 뒤집히기 전에요.",
    "齿刃收割机至今还在翻耕原野。请停下115台，别让无辜的田地全被翻个底朝天。"
  ],
  [
    "어스름이 내리면 숲을 내달리는 것들이 있어요. 110마리만 붙잡아 주세요. 밤길이 조금은 조용해질 거예요.",
    "暮色降临后，有些家伙会在森林里狂奔。请抓住110只，夜路就能安静一些。"
  ],
  [
    "한 주의 토벌 — 이번 주 큰 몫이에요. 백 마리, 종류 불문. / 진행 {current}/{target}",
    "本周讨伐 — 这是本周的大任务。讨伐一百只，种类不限。 ｜ 进度：{current}/{target}"
  ],
  [
    "コイルが尾根を蜘蛛の巣みたいに絡めてる。百七十五個だけ切りな、幽霊 — 引っかかったら電流がそのままお前の体を伝うよ。",
    "线圈蜘蛛机器人把山脊织成了蛛网。拆掉175台，幽灵——一旦被缠住，电流会直接贯穿你的身体。"
  ],
  [
    "{name} — Return to town (Hotkey {key}) · Fully restores HP",
    "{name} — 返回城镇并恢复全部生命值（快捷键：{key}）"
  ],
  [
    "冒険には目標が必要ですよね!【クエスト】を押してやることを確認してみましょう。(右下のメニューアイコンから開けます)",
    "冒险当然要有目标！打开【任务】查看下一步行动。（也可通过右下角的菜单图标打开。）"
  ],
  [
    "捨てられた収穫機がいまだに野原を掘り返しています。百十五台だけ止めてください。罪のない畑が全部ひっくり返される前に。",
    "齿刃收割机至今还在翻耕原野。请停下115台，别让无辜的田地全被翻个底朝天。"
  ],
  [
    "A gift has arrived! Press M to claim it from your mailbox.",
    "礼物到了！按 M 键前往邮箱领取。"
  ],
  [
    "A return item that takes you back to the temple when used.",
    "使用后可返回教团的回城道具。"
  ],
  [
    "Lv10 hat — grants +1 Defense and +15 Max HP when equipped.",
    "Lv10 帽子——装备时防御力 +1，最大 HP +15"
  ],
  [
    "Lv10 top — grants +3 Defense and +35 Max HP when equipped.",
    "Lv10 上衣——装备时防御力 +3，最大 HP +35"
  ],
  [
    "Lv15 hat — grants +2 Defense and +19 Max HP when equipped.",
    "Lv15 帽子——装备时防御力 +2，最大 HP +19"
  ],
  [
    "Lv15 top — grants +4 Defense and +48 Max HP when equipped.",
    "Lv15 上衣——装备时防御力 +4，最大 HP +48"
  ],
  [
    "Lv20 hat — grants +2 Defense and +24 Max HP when equipped.",
    "Lv20 帽子——装备时防御力 +2，最大 HP +24"
  ],
  [
    "Lv20 top — grants +5 Defense and +60 Max HP when equipped.",
    "Lv20 上衣——装备时防御力 +5，最大 HP +60"
  ],
  [
    "Lv25 hat — grants +3 Defense and +29 Max HP when equipped.",
    "Lv25 帽子——装备时防御力 +3，最大 HP +29"
  ],
  [
    "Lv25 top — grants +6 Defense and +72 Max HP when equipped.",
    "Lv25 上衣——装备时防御力 +6，最大 HP +72"
  ],
  [
    "Lv30 hat — grants +4 Defense and +34 Max HP when equipped.",
    "Lv30 帽子——装备时防御力 +4，最大 HP +34"
  ],
  [
    "Lv30 top — grants +7 Defense and +85 Max HP when equipped.",
    "Lv30 上衣——装备时防御力 +7，最大 HP +85"
  ],
  [
    "Lv40 hat — grants +4 Defense and +44 Max HP when equipped.",
    "Lv40 帽子——装备时防御力 +4，最大 HP +44"
  ],
  [
    "Lv50 hat — grants +6 Defense and +54 Max HP when equipped.",
    "Lv50 帽子——装备时防御力 +6，最大 HP +54"
  ],
  [
    "Monatium City Hall. Spit it out, ghost — what do you need?",
    "这里是莫纳提姆市政厅。有事就直说吧，幽灵。"
  ],
  [
    "Today's share of hunting. Any kind will do — just fifteen.",
    "完成今天的狩猎吧。种类不限，击败十五只即可。"
  ],
  [
    "네르의 단골 — 상점에서 하나만 사 주세요. 단골이 최고예요. / 진행 {current}/{target}",
    "尼尔的常客 — 去商店随便买一样东西吧。常客总是最受欢迎的。 ｜ 进度：{current}/{target}"
  ],
  [
    "잿가루가 하도 날려서 앞이 안 보여. 170마리만 걷어내, 유령 — 재가 가라앉아야 그 안쪽이 보이거든.",
    "灰尘精灵漫天飞舞，什么都看不清。清除170只，幽灵——只有等尘埃落定，才能看清深处。"
  ],
  [
    "체력은 저절로 차지 않아요! {key} 슬롯을 눌러 물약을 드세요. 마을로 돌아오시면 가득 채워 드려요.",
    "HP 不会自动恢复！点按 {key} 栏位喝下药水。回到城镇后会恢复至满值。"
  ],
  [
    "프레스들이 아직도 허공을 내리찍고 있어. 160대만 멈춰, 유령. 타이밍 놓치면 네가 눌린 깡통 신세야.",
    "冲压机魔像仍在不停砸向空处。关停160台，幽灵。错过时机，你就会变成一只压扁的铁罐头。"
  ],
  [
    "피뢰 기사단이 철탑 사이를 순찰해. 185기만 떨궈, 유령. 창끝에 벼락을 물고 다니니까 정면은 피하고.",
    "避雷针骑士自动机正在铁塔之间巡逻。击落185台，幽灵。它们的枪尖带着雷电，别从正面硬碰。"
  ],
  [
    "Lv5 hat — grants +1 Defense and +10 Max HP when equipped.",
    "Lv5 帽子——装备时防御力 +1，最大 HP +10"
  ],
  [
    "Lv5 top — grants +2 Defense and +20 Max HP when equipped.",
    "Lv5 上衣——装备时防御力 +2，最大 HP +20"
  ],
  [
    "Next: {levelLabel_n} stacks · HP bonus {current} → {next}",
    "再强化 {levelLabel_n} 层：生命值 {current} → {next}"
  ],
  [
    "This Google account is already linked to another account.",
    "此 Google 账号已经关联到其他账号。"
  ],
  [
    "You can only enter from the map where the signpost stands",
    "请在活动立牌所在的地图进入"
  ],
  [
    "プレスがいまだに空を打ち下ろしてる。百六十台だけ止めな、幽霊。タイミングを逃したらお前が潰れた缶詰の仲間入りだよ。",
    "冲压机魔像仍在不停砸向空处。关停160台，幽灵。错过时机，你就会变成一只压扁的铁罐头。"
  ],
  [
    "監視管制塔を越えて、やっと動力核本体が姿を現した。幽霊、今度も一人で行くつもりなら困るね — 仲間を連れてきな。",
    "既然连监控塔都越过了，动力核心本体终于现身了。幽灵，这一次可不能再单独行动——带上同伴。"
  ],
  [
    "Too many raids are in progress. Please try again shortly",
    "正在进行的团队副本过多，请稍后重试"
  ],
  [
    "You can only buy up to {max} right now (purchase limit).",
    "目前最多可购买 {max} 个（已达购买上限）"
  ],
  [
    "You cannot change channels while inside a raid instance.",
    "团队副本内无法切换频道。"
  ],
  [
    "계정 이용이 제한되어 접속이 종료되었습니다. 이의는 새 계정의 설정 > 개발자 문의로 접수해 주세요.",
    "账号已被封禁，连接已断开。如需申诉，请创建新账号并通过“设置 > 联系开发者”提交。"
  ],
  [
    "고개 끝 얼음 공터에 서리별 고대정령이 앉아 있어요. 한 번은 넘어야 용암 골짜기로 갈 수 있답니다.",
    "霜星远古精灵盘踞在雪岭尽头的冰原上。要前往烬火山谷，就必须先越过它。"
  ],
  [
    "그 골짜기 수인들은 온몸에 덴 자국을 훈장처럼 달고 다녀요. 백예순만 물려 주시면 길이 트일 거예요.",
    "山谷里的焦灼兽人把满身灼痕当作勋章。赶走一百六十只，道路应该就会畅通。"
  ],
  [
    "숲을 벗어나면 어스름 톱니들녘이에요. 버려진 기계들이 들판을 굴러다닌다니, 조심히 발을 들여 보세요.",
    "离开森林，便是暮色笼罩的齿轮原野。听说废弃机械仍在田野间游荡，请小心踏入。"
  ],
  [
    "이용이 제한된 계정이라 복구할 수 없습니다. 이의는 새 계정의 설정 > 개발자 문의로 접수해 주세요.",
    "此账号已被限制使用，无法恢复。如需申诉，请创建新账号并通过设置 > 联系开发者提交。"
  ],
  [
    "今度は街灯の並ぶ工業地区です。灯りがひとつ、またひとつと消えていっているそうです。その道へ進んでみてください。",
    "接下来是路灯林立的工业区道路。听说灯光正在一盏接一盏地熄灭。沿那条路进去吧。"
  ],
  [
    "今週の討伐 — 今週の大きな役目です。百体、種類は問いません。 / 進行 {current}/{target}",
    "本周讨伐 — 这是本周的大任务。讨伐一百只，种类不限。 ｜ 进度：{current}/{target}"
  ],
  [
    "黎明の番精霊が洞の中を回りながら光の筋を引いています。百九十体だけ鎮めていただければ、巡回の線が途切れますよ。",
    "黎明守护精灵在洞穴中巡游，划出道道光束。平息一百九十只，巡逻路线便会中断。"
  ],
  [
    "雪盲の影は目を見えなくしてしまいます。百四十体だけ払っていただければ、峠の果てまで道が見えるようになりますよ。",
    "雪盲暗影会夺走你的视力。清除一百四十只后，通往雪岭尽头的道路便会显现。"
  ],
  [
    "野のあちこちで油灯がひとりでに燃え上がっています。百二十五個だけ消していただければ、野火の心配も減るはずです。",
    "油灯鬼火正在原野各处自行燃烧。熄灭125只，便能少些引发野火的担忧。"
  ],
  [
    "Affection +{delta} (Pumpkin patch today {points}/{cap})",
    "好感度 +{delta}（南瓜田今日 {points}/{cap}）"
  ],
  [
    "Buy {quantity} of {name} for {total} {priceName} total?",
    "确认花费 {total} {priceName} 购买 {quantity} 个{name}吗？"
  ],
  [
    "Dodge pumpkins for 5 minutes and run as far as you can.",
    "躲开滚来的假南瓜，在 5 分钟内尽可能跑得更远！"
  ],
  [
    "Have an existing account? Continue with a recovery code",
    "已有账号？使用恢复码继续"
  ],
  [
    "Next: Lv.{enhanceLevel_n} · HP bonus {current} → {next}",
    "强化至 +{enhanceLevel_n}：生命值 {current} → {next}"
  ],
  [
    "Sign-up is temporarily limited. Please try again later.",
    "注册目前受到限制，请稍后重试。"
  ],
  [
    "This request doesn't exist or has already been handled.",
    "该好友申请不存在或已被处理。"
  ],
  [
    "Welcome, Speaki! Just let me know if you need anything.",
    "欢迎，斯皮奇！有需要的话尽管告诉我。"
  ],
  [
    "You exceeded the maximum quantity allowed per purchase.",
    "超出单次购买的最大数量。"
  ],
  [
    "공단길 가로등을 임프봇들이 삼켜 불을 꺼뜨려요. 130마리만 잡아 주시면 다시 길이 밝아질 거예요.",
    "焊火小恶魔机器人吞噬工业区道路上的路灯，让灯光熄灭。抓住130只，道路就会再次亮起来。"
  ],
  [
    "노을숲 초입을 국경 척후들이 지켜요. 100마리만 물러서게 해 주시면 길이 열릴 거예요, 스피키씨.",
    "边境精灵斥候把守着暮色森林边境入口。请击退100只，道路应该就会开放，斯皮奇。"
  ],
  [
    "녹슨 파수 기간트가 들녘 끝을 막고 섰어요. 낡았어도 주먹은 여전히 무겁다니, 부디 다치지 마세요.",
    "锈蚀守卫巨像挡住了原野尽头。听说它虽已老旧，拳头却依然沉重，请千万别受伤。"
  ],
  [
    "압축장이 멈추질 않아 공단이 온통 쇳소리예요. 140기만 세워 주세요. 그 너머가 모나티엄이랍니다.",
    "废料压缩魔像让压缩场一直运转不停，整座工业区都回荡着金属撞击声。请关停140台。越过那里就是莫纳提姆。"
  ],
  [
    "エリアスへようこそ、スピキさん!\n私はネル — ここは世界樹教団です。\nいくつか教えますね、準備はいいですか?",
    "欢迎来到埃利亚斯，斯皮奇！\n我是尼尔，这里是世界树教团。\n先让我教你一些冒险的基础知识——准备好了吗？"
  ],
  [
    "カボチャが大好きなスピキのために教団が用意した季節の包み。たっぷりの路銀とひとつかみのキャンディが入っている。",
    "教团为热爱南瓜的斯皮奇准备的时令礼包。里面装着充足的盘缠和一大把糖果。"
  ],
  [
    "薄暮が下りると、森を駆け抜けるものたちがいます。百十匹だけ捕まえてください。夜道が少しは静かになるはずです。",
    "暮色降临后，有些家伙会在森林里狂奔。请抓住110只，夜路就能安静一些。"
  ],
  [
    "Dev-only armor — grants +999,999 Max HP when equipped.",
    "开发专用护甲——装备时最大 HP +999,999"
  ],
  [
    "Dev-only weapon — grants +99,999 Attack when equipped.",
    "开发专用武器——装备时攻击力 +99,999"
  ],
  [
    "HPは自然には回復しませんよ!{key}スロットを押してポーションを飲んでくださいね。村に戻れば全回復です。",
    "HP 不会自动恢复！点按 {key} 栏位喝下药水。回到城镇后会恢复至满值。"
  ],
  [
    "If it's too much alone, bring companions to the altar.",
    "如果独自应付不来，就和伙伴们一起挑战祭坛吧。"
  ],
  [
    "Lv{level} {slot} — grants +{atk} Attack when equipped.",
    "Lv.{level} {slot} — 攻击力 +{atk}"
  ],
  [
    "Mail arrived: {title} — check your mailbox to claim it",
    "收到邮件：{title} — 可前往邮箱领取"
  ],
  [
    "Stop by the [Shop] too — potions and gear are on sale!",
    "也来逛逛【商店】吧，这里出售药水和装备！"
  ],
  [
    "This slot is already at the maximum enhancement level.",
    "已达到最高强化等级。"
  ],
  [
    "You are sending too quickly. Please try again shortly.",
    "发送过于频繁，请稍后重试。"
  ],
  [
    "달안개 습지의 정령 이슬을 모은 주머니. 손에 쥐면 영롱한 결정으로 굳어 값나가는 엘리프가 된다.",
    "装着从月雾湿地收集而来的精灵露水。握在手中便会凝结成流光溢彩的水晶叶。"
  ],
  [
    "이용이 제한된 계정입니다. 이의가 있으면 새 계정을 만들어 설정 > 개발자 문의로 접수해 주세요.",
    "此账号已被限制使用。如需申诉，请创建新账号，并通过设置 > 联系开发者提交申请。"
  ],
  [
    "復旧すると現在のアカウントは削除されます。必要であれば先に現在のアカウントの復旧コードをメモしてください。",
    "恢复后，当前账号将被删除。如有需要，请先记下当前账号的恢复码。"
  ],
  [
    "黄昏森の大族長が国境を握っています。この者さえ越えれば、歯車野へ行けるそうです。お気をつけて、スピキさん。",
    "暮色森林大酋长控制着边境。只要越过它，就能前往齿轮原野。请小心，斯皮奇。"
  ],
  [
    "錆びた番兵ギガントが野の果てをふさいでいます。古くても拳は今も重いそうですから、どうかケガをなさらないで。",
    "锈蚀守卫巨像挡住了原野尽头。听说它虽已老旧，拳头却依然沉重，请千万别受伤。"
  ],
  [
    "添付: {mail1_name} x{mail1_quantity}, 経験値 {mailExp_exp}",
    "附件：{mail1_name} x{mail1_quantity}, 经验值 {mailExp_exp}"
  ],
  [
    "圧縮場が止まらず、工業地帯は鉄の音だらけです。百四十体だけ止めてください。その先がモナティウムだそうです。",
    "废料压缩魔像让压缩场一直运转不停，整座工业区都回荡着金属撞击声。请关停140台。越过那里就是莫纳提姆。"
  ],
  [
    "Changing the language will reload the page. Continue?",
    "更改语言将刷新页面，是否继续？"
  ],
  [
    "Dev-only helm — grants +99,999 Defense when equipped.",
    "开发专用头盔——装备时防御力 +99,999"
  ],
  [
    "The server is currently full. Please try again later.",
    "服务器已满员，暂时无法连接。请稍后重试"
  ],
  [
    "The temporary account just created will be discarded.",
    "刚刚创建的临时账号将会消失。"
  ],
  [
    "You've grown closer to Speaki! (Affection Lv.{level})",
    "与斯皮奇的好感度升至 Lv.{level}！"
  ],
  [
    "첨부: {mail1_name} x{mail1_quantity}, 경험치 {mailExp_exp}",
    "附件：{mail1_name} x{mail1_quantity}, 经验值 {mailExp_exp}"
  ],
  [
    "체력은 저절로 차지 않아요! {key}키로 물약을 드세요. 마을로 돌아오시면 가득 채워 드려요.",
    "HP 不会自动恢复！按 {key} 键喝下药水。回到城镇后会恢复至满值。"
  ],
  [
    "{name} {quantity}개를 총 {total} {priceName}에 구매하시겠습니까?",
    "确认花费 {total} {priceName} 购买 {quantity} 个{name}吗？"
  ],
  [
    "避雷騎士団が鉄塔の間を巡回してる。百八十五体だけ落としな、幽霊。槍の先に雷を宿してるから、正面は避けな。",
    "避雷针骑士自动机正在铁塔之间巡逻。击落185台，幽灵。它们的枪尖带着雷电，别从正面硬碰。"
  ],
  [
    "黄昏森の入り口を国境斥候たちが見張っています。百匹だけ退けていただければ、道が開くはずです、スピキさん。",
    "边境精灵斥候把守着暮色森林边境入口。请击退100只，道路应该就会开放，斯皮奇。"
  ],
  [
    "Channel change is on cooldown ({seconds}s remaining)",
    "频道切换冷却中，还需 {seconds} 秒"
  ],
  [
    "Deals bonus damage when target HP is {pct}% or below",
    "目标 HP 低于或等于 {pct}% 时威力提升"
  ],
  [
    "Ha ha ha ha, please show lots of love for EpidGames.",
    "哈哈哈哈！请多多支持 Epid Games！"
  ],
  [
    "You can only respond to friend requests sent to you.",
    "只能处理发给自己的好友申请。"
  ],
  [
    "You're hunting with a much higher-level party member",
    "队友等级远高于你"
  ],
  [
    "게임에서 사용할 닉네임을 정해 주세요. 최초 1회만 지정할 수 있고 나중에 바꿀 수 없습니다.",
    "请选择游戏中使用的昵称。昵称只能设置一次，之后无法更改。"
  ],
  [
    "다른 스피키씨네요! 원격 플레이어를 탭하시면 파티에 초대하실 수 있어요. (최대 {max}명)",
    "遇到另一位斯皮奇了！点按对方即可邀请组队。（队伍最多 {max} 人。）"
  ],
  [
    "봉인 제단이에요! {key} 버튼으로 도전하실 수 있어요 — 클리어 보상은 하루 한 번이에요.",
    "这是封印祭坛！点按 {key} 即可发起挑战；通关奖励每天只能领取一次。"
  ],
  [
    "세계수 교단이 순례길에 오른 이에게 내리는 보급 상자. 노잣돈과 엘리프, 사탕이 함께 들었다.",
    "世界树教团赠给踏上朝圣之路者的补给箱。里面装有盘缠、水晶叶和糖果。"
  ],
  [
    "装備画面のスロットをタップして候補から【装備】をタップ · 装備画面は下部メニューアイコンから開けます",
    "在装备界面选择栏位，再从候选装备中点击【装备】"
  ],
  [
    "A pouch of gear — there's no telling what's inside.",
    "谁也不知道里面装着什么装备。"
  ],
  [
    "Could not set your nickname. Please try again later",
    "昵称设置失败，请稍后重试"
  ],
  [
    "Every affection level up earns you a Golden Crayon.",
    "好感度每提升 1 级，即可获得 1 支金蜡笔。"
  ],
  [
    "Just stop by the stall once. Regulars are the best.",
    "去商店随便买一样东西吧。常客总是最受欢迎的。"
  ],
  [
    "This week's big task. A hundred monsters, any kind.",
    "这是本周的大任务。讨伐一百只，种类不限。"
  ],
  [
    "Too many runs in progress. Please try again shortly",
    "当前场次过多，请稍后再试"
  ],
  [
    "Your daily login reward has arrived in your mailbox",
    "每日签到奖励已送达邮箱"
  ],
  [
    "다른 스피키씨네요! 우클릭을 짧게 탭하시면 파티에 초대하실 수 있어요. (최대 {max}명)",
    "遇到另一位斯皮奇了！短按鼠标右键即可邀请对方组队。（队伍最多 {max} 人。）"
  ],
  [
    "호박을 사랑하는 스피키를 위한 교단의 계절 꾸러미. 넉넉한 노잣돈과 사탕 한 움큼이 담겼다.",
    "教团为热爱南瓜的斯皮奇准备的时令礼包。里面装着充足的盘缠和一大把糖果。"
  ],
  [
    "\n\n{entries} · 右上のミニマップ · タップで会話 · 近くのプレイヤーをタップして招待",
    "\n\n{entries} · 右上角小地图 · 点按进行对话 · 点按附近的玩家发送邀请"
  ],
  [
    "{name}'s level is too low (requires level {level})",
    "{name} 的等级不足（需要 {level} 级）"
  ],
  [
    "灰塵がひどく舞って前が見えない。百七十匹だけ払いな、幽霊 — 灰が沈まないと、その奥は見えないから。",
    "灰尘精灵漫天飞舞，什么都看不清。清除170只，幽灵——只有等尘埃落定，才能看清深处。"
  ],
  [
    "月霧の湿地で集めた精霊の雫を入れた袋。手に握るときらめく結晶へと固まり、値打ちのあるエリーフになる。",
    "装着从月雾湿地收集而来的精灵露水。握在手中便会凝结成流光溢彩的水晶叶。"
  ],
  [
    "A pouch that, very rarely, holds a Supreme Crayon.",
    "极少数袋子里……会藏着一支金蜡笔。"
  ],
  [
    "An error occurred while claiming the quest reward.",
    "领取任务奖励时发生错误。"
  ],
  [
    "Inflicts burn (damage over time) for {sec}s on hit",
    "命中时使目标灼烧 {sec} 秒（持续伤害）"
  ],
  [
    "This mail was already claimed or no longer exists.",
    "此邮件已领取或不存在。"
  ],
  [
    "안내를 이어가려면 마을로 돌아와 주세요! 포탈 앞에서 {key} 버튼을 누르시면 이동해요.",
    "请回到城镇继续教程！在传送门附近点按 {key} 按钮即可前往。"
  ],
  [
    "여명 용린병은 뿌리굴 가장 안쪽을 지켜요. 이백만 넘어서 주세요. 그 너머가 마지막이에요.",
    "黎明龙鳞兵守卫着曙光根穴最深处。击败两百名守卫吧，它们身后就是终点。"
  ],
  [
    "이제 가로등이 늘어선 공단길이에요. 불빛이 하나둘 꺼져 간대요. 그 길로 접어들어 보세요.",
    "接下来是路灯林立的工业区道路。听说灯光正在一盏接一盏地熄灭。沿那条路进去吧。"
  ],
  [
    "정신이 드셨군요, 스피키씨. 세계수 교단에 오신 걸 환영해요. 우선 한 발 내디뎌 볼까요?",
    "你醒了，斯皮奇。欢迎来到世界树教团。先向前走几步吧。"
  ],
  [
    "혼자 입장할 수 있는 자리가 가득 찼습니다. 파티로 도전하거나 잠시 후 다시 시도해 주세요",
    "单人进入名额已满，请组队挑战或稍后重试"
  ],
  [
    "峠の果ての氷の広場に、霜星の古の精霊が座っています。一度は越えないと、燠火の谷へは行けないんです。",
    "霜星远古精灵盘踞在雪岭尽头的冰原上。要前往烬火山谷，就必须先越过它。"
  ],
  [
    "Connection lost — Reconnecting… ({attempt}/{max})",
    "连接已断开，正在重新连接…（{attempt}/{max}）"
  ],
  [
    "Dodge the fake pumpkins and run as far as you can",
    "躲开滚来的假南瓜，坚持到最后并尽可能跑得更远！"
  ],
  [
    "Double-click to equip · Manage from Equipment (E)",
    "双击穿戴 · 按 E 打开装备界面"
  ],
  [
    "Failed to load game data. Please try again later.",
    "无法加载游戏数据，请稍后重试。"
  ],
  [
    "HPは自然には回復しませんよ!{key}キーでポーションを飲んでくださいね。村に戻れば全回復です。",
    "HP 不会自动恢复！按 {key} 键喝下药水。回到城镇后会恢复至满值。"
  ],
  [
    "Left-click: target monsters / talk to NPC (fixed)",
    "左键：锁定怪物；与 NPC 对话（固定）"
  ],
  [
    "Level up! New skills and gear unlock as you grow.",
    "升级了！随着成长，会解锁新的技能和装备。"
  ],
  [
    "Potions can only be used with the in-game hotkey.",
    "此物品只能在游戏画面中通过快捷键使用。"
  ],
  [
    "The request contains a value that is not allowed.",
    "请求中包含不允许的值。"
  ],
  [
    "Walk with WASD! (You can jump with {jumpKey} too)",
    "用 WASD 走动吧！（也可以按 {jumpKey} 键跳跃）"
  ],
  [
    "You cannot re-enter yet. Please try again shortly",
    "暂时无法再次进入，请稍后重试"
  ],
  [
    "봉인 제단이에요! {key}키로 도전하실 수 있어요 — 클리어 보상은 하루 한 번이에요.",
    "这是封印祭坛！按 {key} 即可发起挑战；通关奖励每天只能领取一次。"
  ],
  [
    "좋아요, 이제 끝을 내 주세요! 몬스터를 처치하시면 경험치와 전리품을 얻으실 수 있어요.",
    "很好，现在击败它吧！打倒怪物可以获得经验值和战利品。"
  ],
  [
    "파수정령이 굴 안을 돌며 빛줄기를 그어요. 백아흔만 잠재워 주시면 순찰선이 끊길 거예요.",
    "黎明守护精灵在洞穴中巡游，划出道道光束。平息一百九十只，巡逻路线便会中断。"
  ],
  [
    "ゲームで使うニックネームを決めてください。設定できるのは最初の1回だけで、あとから変更できません。",
    "请选择游戏中使用的昵称。昵称只能设置一次，之后无法更改。"
  ],
  [
    "スピキの親愛度レベルアップでのみ手に入る特別な通貨 — ドロップ・ガチャ・ショップの入手経路なし。",
    "只能通过提升斯皮奇好感度获得的特殊货币，无法从掉落、抽取或商店中取得。"
  ],
  [
    "{name}を{quantity}個、合計{total} {priceName}で購入しますか？",
    "确认花费 {total} {priceName} 购买 {quantity} 个{name}吗？"
  ],
  [
    "次は+{enhanceLevel_n}強化 · 防御力強化 {current} → {next}",
    "强化至 +{enhanceLevel_n}：防御力 {current} → {next}"
  ],
  [
    "次は+{enhanceLevel_n}強化 · 攻撃力強化 {current} → {next}",
    "强化至 +{enhanceLevel_n}：攻击力 {current} → {next}"
  ],
  [
    "右クリックドラッグ: カメラ回転 / 右クリック短押し: 他プレイヤーをパーティーに招待（固定）",
    "按住右键拖动：旋转镜头；短按右键：邀请玩家组队（固定）"
  ],
  [
    "A server error occurred. Please try again later.",
    "服务器发生内部错误，请稍后重试。"
  ],
  [
    "Gold owned: {gold} · Material points: {points}pt",
    "金币 {gold} · 材料 {points} pt"
  ],
  [
    "Lv{level} {slot} — 装備するとぼうぎょ力+{def}、さいだいHP+{hp}。",
    "Lv.{level} {slot} — 防御力 +{def}，最大生命值 +{hp}"
  ],
  [
    "Success {success}% · Keep {keep}% · Drop {down}%",
    "成功 {success}% · 维持 {keep}% · 降级 {down}%"
  ],
  [
    "You've reached level {level}. Claim your reward!",
    "你已达到 {level} 级，请领取奖励！"
  ],
  [
    "다음 {enhanceLevel_n}강 · 공격력 강화 {current} → {next}",
    "强化至 +{enhanceLevel_n}：攻击力 {current} → {next}"
  ],
  [
    "다음 {enhanceLevel_n}강 · 방어력 강화 {current} → {next}",
    "强化至 +{enhanceLevel_n}：防御力 {current} → {next}"
  ],
  [
    "레이드 사본 안에서는 채널을 변경할 수 없습니다. 사본을 나간 뒤 다시 시도해 주세요.",
    "团队副本内无法切换频道。请离开副本后重试。"
  ],
  [
    "복구하면 현재 계정은 삭제됩니다. 필요하면 지금 계정의 복구 코드를 먼저 메모해두세요.",
    "恢复后，当前账号将被删除。如有需要，请先记下当前账号的恢复码。"
  ],
  [
    "안내를 이어가려면 마을로 돌아와 주세요! 포탈 앞에서 {key}키를 누르시면 이동해요.",
    "请回到城镇继续教程！在传送门附近按 {key} 键即可前往。"
  ],
  [
    "장비창 슬롯을 눌러 후보에서 [장착]을 눌러요 · 장비창은 하단 메뉴 아이콘으로 열어요",
    "在装备界面选择栏位，再从候选装备中点击【装备】"
  ],
  [
    "お目覚めになったんですね、スピキさん。世界樹教団へようこそ。まずは一歩、踏み出してみましょうか？",
    "你醒了，斯皮奇。欢迎来到世界树教团。先向前走几步吧。"
  ],
  [
    "そのシナモンキャンディ、しまい込まずにひとつ食べてみてください。私が直接煮詰めたものなんですよ。",
    "别舍不得那颗肉桂味硬糖，尝一颗吧。那可是我亲手熬制的。"
  ],
  [
    "\n\n{entries} · 우상단 미니맵 · 탭으로 대화 · 원격 플레이어 탭으로 초대",
    "\n\n{entries} · 右上角小地图 · 点按进行对话 · 点按附近的玩家发送邀请"
  ],
  [
    "{name} is on a different map and could not join",
    "{name} 不在当前地图，无法一同入场"
  ],
  [
    "次は{levelLabel_n}スタック · 防御力強化 {current} → {next}",
    "再强化 {levelLabel_n} 层：防御力 {current} → {next}"
  ],
  [
    "次は{levelLabel_n}スタック · 攻撃力強化 {current} → {next}",
    "再强化 {levelLabel_n} 层：攻击力 {current} → {next}"
  ],
  [
    "次は+{enhanceLevel_n}強化 · 体力強化 {current} → {next}",
    "强化至 +{enhanceLevel_n}：生命值 {current} → {next}"
  ],
  [
    "Affection is full for today (daily cap reached)",
    "今天的好感度已满（已达到每日上限）"
  ],
  [
    "Deals splash damage to enemies within {radius}m",
    "对周围 {radius}m 内的敌人造成范围伤害"
  ],
  [
    "Why not use just one of your consumables today?",
    "今天也挑一件随身的消耗品用用看吧？"
  ],
  [
    "With your {priceName}, you can buy up to {max}.",
    "使用持有的 {priceName} 最多可购买 {max} 个"
  ],
  [
    "You're down — press 1–4 to watch a party member",
    "你已倒下——按数字键 1～4 切换队友视角"
  ],
  [
    "다음 {enhanceLevel_n}강 · 체력 강화 {current} → {next}",
    "强化至 +{enhanceLevel_n}：生命值 {current} → {next}"
  ],
  [
    "다음 {levelLabel_n}스택 · 공격력 강화 {current} → {next}",
    "再强化 {levelLabel_n} 层：攻击力 {current} → {next}"
  ],
  [
    "다음 {levelLabel_n}스택 · 방어력 강화 {current} → {next}",
    "再强化 {levelLabel_n} 层：防御力 {current} → {next}"
  ],
  [
    "들녘 곳곳에 기름등이 저 혼자 타올라요. 125개만 꺼 주시면 들불 걱정은 덜겠어요.",
    "油灯鬼火正在原野各处自行燃烧。熄灭125只，便能少些引发野火的担忧。"
  ],
  [
    "설맹 그림자는 눈을 멀게 해요. 백마흔만 걷어 주시면 고개 끝까지 길이 보일 거예요.",
    "雪盲暗影会夺走你的视力。清除一百四十只后，通往雪岭尽头的道路便会显现。"
  ],
  [
    "왼쪽 조이스틱으로 걸어 보세요! ({jumpKey} 버튼으로 점프도 하실 수 있어요)",
    "用左侧摇杆走动吧！（也可以点按 {jumpKey} 按钮跳跃）"
  ],
  [
    "レイドインスタンス内ではチャンネルを変更できません。インスタンスを出てから再試行してください。",
    "团队副本内无法切换频道。请离开副本后重试。"
  ],
  [
    "(ATK+{atk} DEF+{def} HP+{hp}, Req. Lv {level})",
    "（攻+{atk} 防+{def} 体+{hp}，需要等级 {level}）"
  ],
  [
    "{levelLabel} · {stat} bonus {current} → {next}",
    "{levelLabel}：{stat} {current} → {next}"
  ],
  [
    "次は{levelLabel_n}スタック · 体力強化 {current} → {next}",
    "再强化 {levelLabel_n} 层：生命值 {current} → {next}"
  ],
  [
    "黎明の竜鱗兵は根の洞の一番奥を守っています。二百体、越えてきてください。その先が最後ですよ。",
    "黎明龙鳞兵守卫着曙光根穴最深处。击败两百名守卫吧，它们身后就是终点。"
  ],
  [
    "世界樹教団が巡礼の旅に出た者へ授ける補給箱。路銀とエリーフ、キャンディがまとめて入っている。",
    "世界树教团赠给踏上朝圣之路者的补给箱。里面装有盘缠、水晶叶和糖果。"
  ],
  [
    "Base {base} + Gear {equip} + Upgrade {upgrade}",
    "基础 {base} + 装备 {equip} + 强化 {upgrade}"
  ],
  [
    "Lv{level} {slot} — 착용 시 방어력 +{def}, 최대체력 +{hp}",
    "Lv.{level} {slot} — 防御力 +{def}，最大生命值 +{hp}"
  ],
  [
    "Lv10 weapon — grants +13 Attack when equipped.",
    "Lv10 武器——装备时攻击力 +13"
  ],
  [
    "Lv15 weapon — grants +17 Attack when equipped.",
    "Lv15 武器——装备时攻击力 +17"
  ],
  [
    "Lv20 weapon — grants +22 Attack when equipped.",
    "Lv20 武器——装备时攻击力 +22"
  ],
  [
    "Lv25 weapon — grants +26 Attack when equipped.",
    "Lv25 武器——装备时攻击力 +26"
  ],
  [
    "Lv30 weapon — grants +31 Attack when equipped.",
    "Lv30 武器——装备时攻击力 +31"
  ],
  [
    "Lv40 weapon — grants +40 Attack when equipped.",
    "Lv40 武器——装备时攻击力 +40"
  ],
  [
    "Lv50 weapon — grants +49 Attack when equipped.",
    "Lv50 武器——装备时攻击力 +49"
  ],
  [
    "Return to the Order (town) · Fully restores HP",
    "返回教团（城镇）并恢复全部生命值"
  ],
  [
    "You haven't met this quest's requirements yet.",
    "尚未满足此任务的条件。"
  ],
  [
    "Your session has expired. Please log in again.",
    "认证已过期，请重新登录。"
  ],
  [
    "다음 {levelLabel_n}스택 · 체력 강화 {current} → {next}",
    "再强化 {levelLabel_n} 层：生命值 {current} → {next}"
  ],
  [
    "이동할 채널을 선택하세요. 전투 중이거나 쿨다운이 남아 있으면 변경할 수 없습니다.",
    "请选择目标频道。战斗中或切换冷却期间无法更换频道。"
  ],
  [
    "スピキはキャンディの甘くほろ苦い味が、まるで茨の道のような自分の人生みたいだと感動していた。",
    "斯皮奇感动不已，说糖果甜中微苦的滋味，就像自己那荆棘丛生的人生。"
  ],
  [
    "パーティー全員が入場できなかったため、レイドが中止されました。全員そろわないと開始できません",
    "未能全员入场，本次团队副本已取消。请等所有队员到齐后再开始"
  ],
  [
    "{name}이(가) 다 떨어졌습니다 — 상점에서 보충하거나 다른 포션을 지정하세요",
    "{name} 已用完 — 请到商店补充或指定其他药水"
  ],
  [
    "{remaining}pt to next level · {total}pt total",
    "距离下一级还需 {remaining}pt · 累计 {total}pt"
  ],
  [
    "素材がぴったり合わない場合、余ったポイントは積み立てられ、次の強化で自動的に使用されます。",
    "若材料点数无法刚好匹配，多余点数会自动储存，供下次强化优先使用。"
  ],
  [
    "左のジョイスティックで歩いてみましょう!({jumpKey}ボタンでジャンプもできますよ)",
    "用左侧摇杆走动吧！（也可以点按 {jumpKey} 按钮跳跃）"
  ],
  [
    "An invitation to that player is still pending",
    "已向该玩家发出邀请，请等待回应"
  ],
  [
    "Congested · {population} / {capacity} players",
    "拥挤 · {population}/{capacity} 人"
  ],
  [
    "Display has stopped. Please refresh the page.",
    "画面显示已停止，请刷新页面"
  ],
  [
    "Enhancement level is kept when you swap gear.",
    "更换装备不会影响强化等级。"
  ],
  [
    "No attendance rewards are set for this month.",
    "本月未设置签到奖励"
  ],
  [
    "Survive 6 minutes against swarming nurulings.",
    "在蜂拥而来的努噜灵群中坚持生存 6 分钟！"
  ],
  [
    "You can chat once you reach level {minLevel}.",
    "达到 {minLevel} 级后才能发送聊天消息。"
  ],
  [
    "Your session is invalid. Please log in again.",
    "认证信息无效，请重新登录。"
  ],
  [
    "개발자가 확인 후 답변드립니다. 답변은 접속 여부와 무관하게 문의함에 보관됩니다.",
    "开发者查看后会予以回复。无论你是否在线，回复都会保存在反馈记录中。"
  ],
  [
    "그 계피맛 알사탕, 아껴 두지 말고 하나 드셔 보세요. 제가 직접 조린 거랍니다.",
    "别舍不得那颗肉桂味硬糖，尝一颗吧。那可是我亲手熬制的。"
  ],
  [
    "쓰러진 동료 옆에서 하단 감정표현(웃는 얼굴) 버튼을 누르면 부활시킬 수 있습니다",
    "靠近倒地的队友，点击下方的表情（笑脸）按钮，即可将其救起"
  ],
  [
    "필드로 돌아가서 계속해 볼까요! 포탈 앞에서 {key} 버튼을 누르시면 이동해요.",
    "回到野外继续吧！在传送门附近点按 {key} 按钮即可前往。"
  ],
  [
    "\n\n{entries} · 右上のミニマップ · 左クリックで会話 · 右クリックで招待",
    "\n\n{entries} · 右上角小地图 · 鼠标左键对话 · 鼠标右键邀请组队"
  ],
  [
    "{name} — Summon/dismount cart (Hotkey {key})",
    "{name} — 召唤马车或下车（快捷键：{key}）"
  ],
  [
    "{name} — Unlocks at Lv{level} (Hotkey {key})",
    "{name} — Lv.{level} 解锁（快捷键：{key}）"
  ],
  [
    "開発者が確認のうえ返信します。返信はオンライン状態に関わらず問い合わせ箱に保管されます。",
    "开发者查看后会予以回复。无论你是否在线，回复都会保存在反馈记录中。"
  ],
  [
    "他のスピキさんですね!右クリックを短く押すとパーティーに誘えますよ。(最大{max}人)",
    "遇到另一位斯皮奇了！短按鼠标右键即可邀请对方组队。（队伍最多 {max} 人。）"
  ],
  [
    "霧に包まれた湿地への道が開けました。ヒキガエルの使い魔を十匹だけ、片づけてきてください。",
    "通往月雾湿地的道路已经开放。请清除十只湿地蟾蜍使魔。"
  ],
  [
    "Earn rewards every day based on your ranking",
    "每日还可根据排名获得奖励"
  ],
  [
    "Lv5 weapon — grants +8 Attack when equipped.",
    "Lv5 武器——装备时攻击力 +8"
  ],
  [
    "Moderate · {population} / {capacity} players",
    "一般 · {population}/{capacity} 人"
  ],
  [
    "No account was found for this recovery code.",
    "找不到该恢复码对应的账号。"
  ],
  [
    "Revisit tips you saw once during onboarding.",
    "可在此重新查看新手引导中仅出现一次的提示。"
  ],
  [
    "Runaway Maintenance Unit (Summon) Lv.{level}",
    "暴走维修单元（召唤） Lv.{level}"
  ],
  [
    "You can't send a friend request to yourself.",
    "不能向自己发送好友申请。"
  ],
  [
    "사본 안에서는 채널을 변경할 수 없습니다. 사본을 나간 뒤 다시 시도해 주세요.",
    "副本内无法切换频道。请离开副本后重试。"
  ],
  [
    "우클릭 드래그: 카메라 회전 / 우클릭 짧게: 다른 플레이어 파티 초대 (고정)",
    "按住右键拖动：旋转镜头；短按右键：邀请玩家组队（固定）"
  ],
  [
    "장비를 얻으셨네요! 하단 메뉴의 장비 아이콘에서 장착하시면 더 강해지실 거예요.",
    "获得新装备了！从底部菜单的装备图标中穿戴它，就能变得更强。"
  ],
  [
    "재료가 정확히 맞지 않으면 남는 포인트는 적립되어 다음 강화에 자동 사용됩니다.",
    "若材料点数无法刚好匹配，多余点数会自动储存，供下次强化优先使用。"
  ],
  [
    "インスタンス内ではチャンネルを変更できません。インスタンスを出てから再試行してください。",
    "副本内无法切换频道。请离开副本后重试。"
  ],
  [
    "{levelLabel} · {stat} 강화 {current} → {next}",
    "{levelLabel}：{stat} {current} → {next}"
  ],
  [
    "{warning}\nAre you sure you want to recover?",
    "{warning}\n确定要恢复吗？"
  ],
  [
    "私の露店にもぜひ寄ってみてください。何か一つ選んでみれば、感じがつかめると思いますよ。",
    "也来我的商店看看吧。随便买一件东西，很快就能上手。"
  ],
  [
    "Automatically uses your lowest-grade potion",
    "优先自动使用品级最低的药水"
  ],
  [
    "Could not find a player with that nickname.",
    "找不到使用该昵称的玩家。"
  ],
  [
    "Googleログインの確認に時間がかかっています。しばらくしてから再度お試しください。",
    "Google 登录验证耗时较长，请稍后重试。"
  ],
  [
    "Level up! New skill \"{skillName}\" unlocked!",
    "升级了！新技能「{skillName}」已解锁！"
  ],
  [
    "No data · {population} / {capacity} players",
    "无数据 · {population}/{capacity} 人"
  ],
  [
    "Relaxed · {population} / {capacity} players",
    "空闲 · {population}/{capacity} 人"
  ],
  [
    "Staff of the Dawnlit Great Tree x{quantity}",
    "晨曦巨树法杖 x{quantity}"
  ],
  [
    "This item doesn't match the equipment slot.",
    "此物品与装备栏位不匹配。"
  ],
  [
    "Today: {remaining}/{cap} rewarded runs left",
    "今日剩余奖励次数：{remaining}/{cap}"
  ],
  [
    "You cannot change channels while in combat.",
    "战斗期间无法切换频道。"
  ],
  [
    "Your Google sign-in information is invalid.",
    "Google 登录信息无效。"
  ],
  [
    "필드로 돌아가서 계속해 볼까요! 포탈 앞에서 {key}키를 누르시면 이동해요.",
    "回到野外继续吧！在传送门附近按 {key} 键即可前往。"
  ],
  [
    "アイテムベースの抽選プレースホルダー — 確率でゴールドまたはエネルギーを付与します。",
    "进行一次普通抽取，随机获得金币或能量。"
  ],
  [
    "\n\n{entries} · 우상단 미니맵 · 좌클릭 대화 · 우클릭 파티 초대",
    "\n\n{entries} · 右上角小地图 · 鼠标左键对话 · 鼠标右键邀请组队"
  ],
  [
    "{levelLabel} · {stat}強化 {current} → {next}",
    "{levelLabel}：{stat} {current} → {next}"
  ],
  [
    "{name}が切れました — ショップで補充するか、別のポーションを指定してください",
    "{name} 已用完 — 请到商店补充或指定其他药水"
  ],
  [
    "案内の続きは村へ戻ってからですよ!ポータルの前で{key}ボタンを押すと移動します。",
    "请回到城镇继续教程！在传送门附近点按 {key} 按钮即可前往。"
  ],
  [
    "装備を手に入れましたね!下部メニューの装備アイコンで装着するともっと強くなれますよ。",
    "获得新装备了！从底部菜单的装备图标中穿戴它，就能变得更强。"
  ],
  [
    "Enhancement failed — dropped to Lv.{level}",
    "强化失败：降至 +{level}"
  ],
  [
    "Gear enhancement is unavailable right now.",
    "目前无法使用装备强化。"
  ],
  [
    "The operations team has sent you a reward.",
    "运营团队向你发放了奖励。"
  ],
  [
    "Your reward for completing '{questTitle}'.",
    "这是完成“{questTitle}”任务的奖励。"
  ],
  [
    "다른 기기에서 발급받은 복구 코드를 입력하면 그 계정으로 이어서 시작합니다.",
    "输入在其他设备上保存的恢复码，即可继续使用该账号。"
  ],
  [
    "스피키는 사탕의 달콤쌉싸름한 맛이 가시밭길 같은 자기 인생 같다며 감동했다.",
    "斯皮奇感动不已，说糖果甜中微苦的滋味，就像自己那荆棘丛生的人生。"
  ],
  [
    "제 상점도 한 번 들러 주세요. 뭐라도 하나 사 보시면 감이 잡히실 거예요.",
    "也来我的商店看看吧。随便买一件东西，很快就能上手。"
  ],
  [
    "파티 전원이 입장하지 못해 레이드가 취소되었습니다. 전원이 모여야 시작됩니다",
    "未能全员入场，本次团队副本已取消。请等所有队员到齐后再开始"
  ],
  [
    "いいですね、とどめを刺してください!モンスターを倒すと経験値と戦利品が得られますよ。",
    "很好，现在击败它吧！打倒怪物可以获得经验值和战利品。"
  ],
  [
    "スピキはキャンディのほろ苦い味が、まるで茨の道のような自分の人生みたいだと感動した。",
    "斯皮奇感动不已，说糖果甜中微苦的滋味，就像自己那荆棘丛生的人生。"
  ],
  [
    "フィールドに戻って続けましょうか!ポータルの前で{key}ボタンを押すと移動します。",
    "回到野外继续吧！在传送门附近点按 {key} 按钮即可前往。"
  ],
  [
    "案内の続きは村へ戻ってからですよ!ポータルの前で{key}キーを押すと移動します。",
    "请回到城镇继续教程！在传送门附近按 {key} 键即可前往。"
  ],
  [
    "森の奥で幼い竜が怒っているそうです。どうかケガをしないよう、なだめてきてください。",
    "听说森林深处的幼龙正在发脾气。请安抚它，也千万别让自己受伤。"
  ],
  [
    "月暈の沼谷に月明かりの鬼火がさまよっているんです。十個だけ、散らしてきてください。",
    "月环泽谷中飘荡着月光鬼火。请驱散十只。"
  ],
  [
    "Connection lost — Please refresh the page",
    "连接已断开，请刷新页面"
  ],
  [
    "Enhancement succeeded! Reached Lv.{level}",
    "强化成功：达到 +{level}！"
  ],
  [
    "Found a monster? Left-click to target it.",
    "找到怪物了吗？按鼠标左键选中它。"
  ],
  [
    "Lightning Rod Knight Automaton Lv.{level}",
    "避雷针骑士自动机 Lv.{level}"
  ],
  [
    "Past Day 28, the default reward is given.",
    "超过第 28 天后将发放基础奖励。"
  ],
  [
    "That party member isn't visible right now",
    "暂时无法观看这名队友"
  ],
  [
    "This item can only be used one at a time.",
    "此物品每次只能使用一个。"
  ],
  [
    "Too many attempts. Please try again later",
    "尝试过于频繁，请稍后重试"
  ],
  [
    "You cannot change channels while casting.",
    "施法期间无法切换频道。"
  ],
  [
    "You cannot return from here (fields only)",
    "无法从这里回城（仅限野外）"
  ],
  [
    "Your level is too low to equip this item.",
    "等级不足，无法装备此物品。"
  ],
  [
    "강화는 되돌릴 수 없습니다. 배분 변경 수단은 추후 별도 제공 예정입니다.",
    "属性强化后无法撤销；重置分配功能将在之后推出。"
  ],
  [
    "상대가 이미 나에게 친구 요청을 보냈습니다. 받은 요청함을 확인해 주세요.",
    "对方已经向你发送了好友申请，请查看收到的申请。"
  ],
  [
    "일시적인 문제로 게임을 시작하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    "游戏暂时无法启动，请稍后重试。"
  ],
  [
    "ソロ入場の枠がいっぱいです。パーティーで挑戦するか、しばらくしてからお試しください",
    "单人进入名额已满，请组队挑战或稍后重试"
  ],
  [
    "ネル: 無理しないでくださいね、スピキさん。厳しければ先に仲間を呼んでくださいね。",
    "尼尔：别太勉强自己，斯皮奇。觉得吃力就先叫上伙伴吧。"
  ],
  [
    "フィールドに戻って続けましょうか!ポータルの前で{key}キーを押すと移動します。",
    "回到野外继续吧！在传送门附近按 {key} 键即可前往。"
  ],
  [
    "プレゼントが届きましたよ!下部メニューの郵便箱アイコンから受け取ってみてください。",
    "礼物到了！从底部菜单的邮箱图标中领取。"
  ],
  [
    "{zoneName}에 오셨네요! 더 깊은 곳일수록 강한 아이들이 나와요.",
    "欢迎来到 {zoneName}！越往深处，出现的怪物就越强。"
  ],
  [
    "封印の祭壇です!{key}ボタンで挑戦できますよ — クリア報酬は1日1回です。",
    "这是封印祭坛！点按 {key} 即可发起挑战；通关奖励每天只能领取一次。"
  ],
  [
    "森の妖精たちが急に騒がしくなったんです。五匹だけ、様子を見てきていただけますか？",
    "森林妖精最近格外吵闹。能帮我查看五只森林妖精的情况吗？"
  ],
  [
    "一時的な問題でゲームを開始できませんでした。しばらくしてから再度お試しください。",
    "游戏暂时无法启动，请稍后重试。"
  ],
  [
    "Affection earned! (Today {points}/{cap})",
    "获得好感度！（今日 {points}/{cap}）"
  ],
  [
    "Attached: {mail1_name} x{mail1_quantity}",
    "附件：{mail1_name} x{mail1_quantity}"
  ],
  [
    "Failed to load — try reopening the panel",
    "加载失败，请重新打开面板"
  ],
  [
    "Full · {population} / {capacity} players",
    "满员 · {population}/{capacity} 人"
  ],
  [
    "Gold spent {gold} · Materials {points}pt",
    "消耗 {gold} 金币 · {points} pt 材料"
  ],
  [
    "Hangar Defense Drone (Summon) Lv.{level}",
    "机库防卫无人机（召唤） Lv.{level}"
  ],
  [
    "No return items available (Hotkey {key})",
    "没有可用的回城道具（快捷键：{key}）"
  ],
  [
    "The destination town could not be found.",
    "找不到目的地城镇。"
  ],
  [
    "This request has already been processed.",
    "此请求已经处理。"
  ],
  [
    "This request is already being processed.",
    "此请求正在处理中。"
  ],
  [
    "WASD로 걸어 보세요! ({jumpKey}키로 점프도 하실 수 있어요)",
    "用 WASD 走动吧！（也可以按 {jumpKey} 键跳跃）"
  ],
  [
    "You can only travel while inside a town.",
    "只能在城镇内使用传送。"
  ],
  [
    "You cannot send chat messages right now.",
    "目前无法发送聊天消息。"
  ],
  [
    "You're already friends with that player.",
    "你们已经是好友。"
  ],
  [
    "Your reward for day {day} of attendance.",
    "这是第 {day} 天的签到奖励。"
  ],
  [
    "스피키 애정도 레벨업으로만 얻는 특별 재화 — 드롭·가챠·상점 경로 없음",
    "只能通过提升斯皮奇好感度获得的特殊货币，无法从掉落、抽取或商店中取得。"
  ],
  [
    "오늘 클리어 보상은 이미 받았습니다 — 입장은 가능하지만 보상은 없습니다",
    "今日通关奖励已领取；仍可进入，但不会再次获得奖励"
  ],
  [
    "サーバーが混雑しているため接続できません。しばらくしてからもう一度お試しください",
    "服务器已满员，暂时无法连接。请稍后重试"
  ],
  [
    "{name} — Cooldown {sec}s (Hotkey {key})",
    "{name} — 冷却 {sec} 秒（快捷键：{key}）"
  ],
  [
    "封印の祭壇です!{key}キーで挑戦できますよ — クリア報酬は1日1回です。",
    "这是封印祭坛！按 {key} 即可发起挑战；通关奖励每天只能领取一次。"
  ],
  [
    "他のスピキさんですね!タップするとパーティーに誘えますよ。(最大{max}人)",
    "遇到另一位斯皮奇了！点按对方即可邀请组队。（队伍最多 {max} 人。）"
  ],
  [
    "A reply from the developer has arrived.",
    "开发者已回复。"
  ],
  [
    "Fairy Tree Apprentice Staff x{quantity}",
    "妖精木学徒法杖 x{quantity}"
  ],
  [
    "Great Tree Root Breastplate x{quantity}",
    "巨树根须胸甲 x{quantity}"
  ],
  [
    "Only the party leader can request entry",
    "只有队长可以发起入场"
  ],
  [
    "Recovery failed. Please try again later",
    "恢复失败，请稍后重试"
  ],
  [
    "Select a target first (click a monster)",
    "请先点击怪物选择目标"
  ],
  [
    "There are no other towns available yet.",
    "目前没有其他可传送的城镇。"
  ],
  [
    "묘지의 끝, 무덤지기 대망령이 기다려요. 이 여정의 마지막 시험이에요.",
    "墓园尽头，守墓大亡灵正在等着你。这是本次旅程的最终试炼。"
  ],
  [
    "보유 {priceName}(으)로는 {max}개까지 구매할 수 있습니다",
    "使用持有的 {priceName} 最多可购买 {max} 个"
  ],
  [
    "성공 {success}% · 유지 {keep}% · 하락 {down}%",
    "成功 {success}% · 维持 {keep}% · 降级 {down}%"
  ],
  [
    "쓰러진 동료 옆에서 T로 감정표현(춤)을 선택하면 부활시킬 수 있습니다",
    "队友倒地后，在其身旁按 T 并选择“跳舞”表情，即可将其救起"
  ],
  [
    "오늘 보낼 수 있는 문의 수를 초과했습니다. 내일 다시 시도해 주세요.",
    "已达到今天的咨询次数上限，请明天再试。"
  ],
  [
    "친구 수가 상한에 도달했습니다. 친구를 정리한 후 다시 시도해 주세요.",
    "好友数量已达上限，请先整理好友列表后再试。"
  ],
  [
    "ゲームデータの読み込みに失敗しました。しばらくしてからもう一度お試しください。",
    "无法加载游戏数据，请稍后重试。"
  ],
  [
    "ダウンしました — 下のスキルアイコンをタップしてパーティメンバーの視点を見る",
    "你已倒下——点击下方队友图标切换视角"
  ],
  [
    "(공+{atk} 방+{def} 체+{hp}, 요구레벨 {level})",
    "（攻+{atk} 防+{def} 体+{hp}，需要等级 {level}）"
  ],
  [
    "{name} has requested to ride your cart",
    "{name} 请求搭乘你的马车"
  ],
  [
    "☑ Daily limit {remaining}/{dailyLimit}",
    "☑ 每日限购 {remaining}/{dailyLimit}"
  ],
  [
    "本日のクリア報酬はすでに受け取りました — 入場はできますが報酬はありません",
    "今日通关奖励已领取；仍可进入，但不会再次获得奖励"
  ],
  [
    "新芽の妖精たちまで浮き足立ってしまって。八匹だけ、落ち着かせてきてください。",
    "连嫩芽妖精也躁动起来了。请安抚八只。"
  ],
  [
    "移動するチャンネルを選んでください。戦闘中やクールダウン中は変更できません。",
    "请选择目标频道。战斗中或切换冷却期间无法更换频道。"
  ],
  [
    "Claimed through Day {count} this month",
    "本月已领取至第 {count} 天"
  ],
  [
    "No HP potions available (Hotkey {key})",
    "没有可用的 HP 药水（快捷键：{key}）"
  ],
  [
    "Only the party leader can start a raid",
    "只有队长可以开启团队副本"
  ],
  [
    "Pierces all enemies in a straight line",
    "贯穿直线上的所有敌人"
  ],
  [
    "Pumpkin Cart Summon Ticket x{quantity}",
    "南瓜马车召唤券 x{quantity}"
  ],
  [
    "Rewards are delivered to your mailbox.",
    "奖励将发送到邮箱。"
  ],
  [
    "This is the maximum enhancement level.",
    "已达到最高强化等级。"
  ],
  [
    "This monster is too high-level for you",
    "怪物等级远高于你"
  ],
  [
    "WASDで歩いてみましょう!({jumpKey}キーでジャンプもできますよ)",
    "用 WASD 走动吧！（也可以按 {jumpKey} 键跳跃）"
  ],
  [
    "You don't have enough Supreme Crayons.",
    "金蜡笔不足。"
  ],
  [
    "구글 로그인 확인이 지연되고 있습니다. 잠시 후 다시 시도해 주세요.",
    "Google 登录验证耗时较长，请稍后重试。"
  ],
  [
    "수호자는 물러서도 거리를 좁혀옵니다 — 도망만으로는 이길 수 없어요.",
    "即使后退，守护者也会步步逼近；一味逃跑无法取胜。"
  ],
  [
    "숲 깊은 곳 어린 용이 성이 났대요. 부디 다치지 않게 달래 주세요.",
    "听说森林深处的幼龙正在发脾气。请安抚它，也千万别让自己受伤。"
  ],
  [
    "온보딩 중 한 번 보고 지나간 안내를 여기서 다시 확인할 수 있어요.",
    "可在此重新查看新手引导中仅出现一次的提示。"
  ],
  [
    "プレミアム通貨 — ガチャや金貨袋など特別なショップ商品の消費に使用します。",
    "珍贵的特殊货币，可用于抽取奖励、购买金币袋等特殊商品。"
  ],
  [
    "{name} — Dismount cart (Hotkey {key})",
    "{name} — 下车（快捷键：{key}）"
  ],
  [
    "{name} — Heals {heal}% (Hotkey {key})",
    "{name} — 恢复 {heal}%（快捷键：{key}）"
  ],
  [
    "{name} — 마을로 귀환 (핫키 {key}) · 체력 전량 회복",
    "{name} — 返回城镇并恢复全部生命值（快捷键：{key}）"
  ],
  [
    "倒れた仲間のそばで下の感情表現(スマイル)ボタンをタップすると蘇生できます",
    "靠近倒地的队友，点击下方的表情（笑脸）按钮，即可将其救起"
  ],
  [
    "封印の間には回復の泉がありません。ポーションは事前に準備しておきましょう。",
    "封印之室内没有治愈之泉，请提前备好药水。"
  ],
  [
    "基本 {base} + 装備 {equip} + 強化 {upgrade}",
    "基础 {base} + 装备 {equip} + 强化 {upgrade}"
  ],
  [
    "親愛度 +{delta}(かぼちゃ畑 本日 {points}/{cap})",
    "好感度 +{delta}（南瓜田今日 {points}/{cap}）"
  ],
  [
    "獣人の斥候たちが道をふさいでしまって。十匹だけ、追い払っていただけますか？",
    "森林兽人侦察兵挡住了道路。能帮我击退十只吗？"
  ],
  [
    "他の端末で発行された復旧コードを入力すると、そのアカウントで続けられます。",
    "输入在其他设备上保存的恢复码，即可继续使用该账号。"
  ],
  [
    "選択したチャンネルに接続できませんでした。他のチャンネルを選んでください。",
    "无法连接至所选频道，请选择其他频道。"
  ],
  [
    "Beastfolk Leather Greaves x{quantity}",
    "兽族皮革护胫 x{quantity}"
  ],
  [
    "Beastfolk Warrior Greaves x{quantity}",
    "兽族战士护胫 x{quantity}"
  ],
  [
    "Developer's Pumpkin Armor x{quantity}",
    "开发者的南瓜护甲 x{quantity}"
  ],
  [
    "Developer's Pumpkin Staff x{quantity}",
    "开发者的南瓜法杖 x{quantity}"
  ],
  [
    "Down — wait for an ally to revive you",
    "你已倒下——等待队友救援"
  ],
  [
    "Factory Overseer Automaton Lv.{level}",
    "工业区监工自动机 Lv.{level}"
  ],
  [
    "Fairy Order Patroller Top x{quantity}",
    "妖精团巡逻者上衣 x{quantity}"
  ],
  [
    "Marsh Witch's Brimmed Hat x{quantity}",
    "湿地女巫宽檐帽 x{quantity}"
  ],
  [
    "Marshfire Will-o'-the-Wisp Lv.{level}",
    "沼泽鬼火 Lv.{level}"
  ],
  [
    "Moonlight Will-o'-the-Wisp Lv.{level}",
    "月光鬼火 Lv.{level}"
  ],
  [
    "Remove {name} from your friends list?",
    "要将 {name} 从好友列表中删除吗？"
  ],
  [
    "You've already sent a friend request.",
    "你已经发送过好友申请。"
  ],
  [
    "기본 {base} + 장비 {equip} + 강화 {upgrade}",
    "基础 {base} + 装备 {equip} + 强化 {upgrade}"
  ],
  [
    "보상은 하루 최대 10회까지 받을 수 있습니다. 입장은 무제한입니다",
    "每天最多可领取 10 次奖励，挑战次数不限"
  ],
  [
    "아직 주고받은 문의가 없습니다. 궁금한 점이나 버그를 남겨 주세요.",
    "暂无反馈记录。欢迎提交问题或错误报告。"
  ],
  [
    "안개 낀 습지로 길이 열렸어요. 두꺼비 사역마 열만 정리해 주세요.",
    "通往月雾湿地的道路已经开放。请清除十只湿地蟾蜍使魔。"
  ],
  [
    "일시적으로 접속이 원활하지 않습니다. 잠시 후 다시 시도해 주세요.",
    "连接暂时不稳定，请稍后重试。"
  ],
  [
    "장비 아이템은 사용할 수 없습니다. 장비창(E)에서 장착해 주세요.",
    "装备无法直接使用，请前往装备界面（E）穿戴。"
  ],
  [
    "장비를 얻으셨네요! E키(장비)에서 장착하시면 더 강해지실 거예요.",
    "获得新装备了！按 E 打开装备界面并穿戴它，就能变得更强。"
  ],
  [
    "회원가입이 일시적으로 제한되었습니다. 잠시 후 다시 시도해 주세요.",
    "注册目前受到限制，请稍后重试。"
  ],
  [
    "フレンド数が上限に達しています。フレンドを整理してから再度お試しください。",
    "好友数量已达上限，请先整理好友列表后再试。"
  ],
  [
    "(攻+{atk} 防+{def} 体+{hp}、必要Lv{level})",
    "（攻+{atk} 防+{def} 体+{hp}，需要等级 {level}）"
  ],
  [
    "【ショップ】にも寄ってくださいね — ポーションや装備を売っていますよ!",
    "也来逛逛【商店】吧，这里出售药水和装备！"
  ],
  [
    "報酬の付与中にエラーが発生しました。しばらくしてから再度お試しください。",
    "发放奖励时发生错误，请稍后重试。"
  ],
  [
    "成功{success}% · 維持{keep}% · 下降{down}%",
    "成功 {success}% · 维持 {keep}% · 降级 {down}%"
  ],
  [
    "会員登録が一時的に制限されています。しばらくしてから再度お試しください。",
    "注册目前受到限制，请稍后重试。"
  ],
  [
    "相手からすでにフレンド申請が届いています。受信した申請をご確認ください。",
    "对方已经向你发送了好友申请，请查看收到的申请。"
  ],
  [
    "装備を手に入れましたね!Eキー(装備)で装着するともっと強くなれますよ。",
    "获得新装备了！按 E 打开装备界面并穿戴它，就能变得更强。"
  ],
  [
    "Daily limit {remaining}/{dailyLimit}",
    "每日限购 {remaining}/{dailyLimit}"
  ],
  [
    "Developer's Pumpkin Helm x{quantity}",
    "开发者的南瓜头盔 x{quantity}"
  ],
  [
    "Dragonkin Battle Greaves x{quantity}",
    "龙族战斗护胫 x{quantity}"
  ],
  [
    "Dragonscale-etched Staff x{quantity}",
    "龙鳞刻纹法杖 x{quantity}"
  ],
  [
    "Fairy Forest Scout Staff x{quantity}",
    "妖精森林斥候法杖 x{quantity}"
  ],
  [
    "Frost-star Ancient Spirit Lv.{level}",
    "霜星远古精灵 Lv.{level}"
  ],
  [
    "Frost-star Shard Greaves x{quantity}",
    "霜星碎片护胫 x{quantity}"
  ],
  [
    "Frostbloom Crystal Staff x{quantity}",
    "霜花水晶法杖 x{quantity}"
  ],
  [
    "Gravekeeper Statue Wraith Lv.{level}",
    "守墓石像亡灵 Lv.{level}"
  ],
  [
    "Lv{level} {slot} — 装備するとこうげき力+{atk}。",
    "Lv.{level} {slot} — 攻击力 +{atk}"
  ],
  [
    "Mecha Drone - Focus Fire x{quantity}",
    "机械无人机·集中射击 x{quantity}"
  ],
  [
    "Oil Lamp Will-o'-the-Wisp Lv.{level}",
    "油灯鬼火 Lv.{level}"
  ],
  [
    "Police Car Summon Ticket x{quantity}",
    "警车召唤券 x{quantity}"
  ],
  [
    "The recovery code format is invalid.",
    "恢复码格式无效。"
  ],
  [
    "This product is no longer available.",
    "找不到正在出售的商品。"
  ],
  [
    "Upgrades aren't available right now.",
    "目前无法强化。"
  ],
  [
    "You can't raise affection right now.",
    "目前无法提升好感度。"
  ],
  [
    "You have no equipment for this slot.",
    "没有此栏位可用的装备。"
  ],
  [
    "게임 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
    "无法加载游戏数据，请稍后重试。"
  ],
  [
    "골드·엘리프·최상급 크레파스·경험치 주머니·전설 장비를 한 번에.",
    "金币、水晶叶、金蜡笔、经验袋和传说装备，一袋全有。"
  ],
  [
    "구매 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
    "处理购买时发生错误，请稍后重试。"
  ],
  [
    "다음 레벨까지 {remaining}pt · 누적 {total}pt",
    "距离下一级还需 {remaining}pt · 累计 {total}pt"
  ],
  [
    "보상 지급 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
    "发放奖励时发生错误，请稍后重试。"
  ],
  [
    "서버가 혼잡하여 접속할 수 없습니다. 잠시 후 다시 시도해 주세요",
    "服务器已满员，暂时无法连接。请稍后重试"
  ],
  [
    "애정도 +{delta} (호박밭 오늘 {points}/{cap})",
    "好感度 +{delta}（南瓜田今日 {points}/{cap}）"
  ],
  [
    "채널 변경 쿨다운이 남아 있습니다 ({seconds}초 후 가능)",
    "频道切换冷却中，还需 {seconds} 秒"
  ],
  [
    "프리미엄 재화 — 가챠·금화 자루 등 특수 상점 상품 소비에 사용",
    "珍贵的特殊货币，可用于抽取奖励、购买金币袋等特殊商品。"
  ],
  [
    "{name} — クールダウン {sec}秒（ホットキー {key}）",
    "{name} — 冷却 {sec} 秒（快捷键：{key}）"
  ],
  [
    "{name}님이 봉인 제단이 있는 맵에 없어 입장할 수 없습니다",
    "{name} 不在封印祭坛所在的地图，队伍无法入场"
  ],
  [
    "{zoneName}へようこそ!奥へ進むほど強い子たちが出てきますよ。",
    "欢迎来到 {zoneName}！越往深处，出现的怪物就越强。"
  ],
  [
    "購入処理中にエラーが発生しました。しばらくしてから再度お試しください。",
    "处理购买时发生错误，请稍后重试。"
  ],
  [
    "見習い魔女が危険な実験をしているんです。十人だけ、止めてきてください。",
    "见习湿地女巫们正在进行危险实验。请制止其中十名。"
  ],
  [
    "今日も来てくださったんですね。少し顔を見せていただくだけで十分ですよ。",
    "今天也来报到了呢。只要露个面就足够了。"
  ],
  [
    "所持ゴールド {gold} · 所持素材ポイント {points}pt",
    "金币 {gold} · 材料 {points} pt"
  ],
  [
    "新しいバージョンを準備しています — しばらくして自動的に再試行します",
    "正在准备更新，稍后会自动重试"
  ],
  [
    "Dawn Dragonscale Soldier Lv.{level}",
    "黎明龙鳞兵 Lv.{level}"
  ],
  [
    "Defeated — check the revival prompt",
    "已倒下 — 请查看复活提示"
  ],
  [
    "Dragonscale Breastplate x{quantity}",
    "龙鳞胸甲 x{quantity}"
  ],
  [
    "Ember Dragonscale Tyrant Lv.{level}",
    "烬火龙鳞暴君 Lv.{level}"
  ],
  [
    "Forest Beastfolk Trapper Lv.{level}",
    "森林兽人陷阱猎手 Lv.{level}"
  ],
  [
    "Great Gravekeeper Spirit Lv.{level}",
    "守墓大亡灵 Lv.{level}"
  ],
  [
    "Heat-suit Mole Beastfolk Lv.{level}",
    "隔热服鼹鼠人 Lv.{level}"
  ],
  [
    "Patrol Drone (Old Model) Lv.{level}",
    "巡逻无人机（旧型） Lv.{level}"
  ],
  [
    "Pumpkin Festival Bundle x{quantity}",
    "南瓜庆典礼包 x{quantity}"
  ],
  [
    "The Dragonscale of the Sealed Altar",
    "封印祭坛的龙鳞"
  ],
  [
    "The request failed (HTTP {status}).",
    "请求失败（HTTP {status}）。"
  ],
  [
    "You don't have enough of this item.",
    "物品数量不足。"
  ],
  [
    "Your nickname can only be set once.",
    "昵称只能设置一次。"
  ],
  [
    "관리자에 의해 접속이 종료되었습니다. 다시 접속할 수 있습니다.",
    "管理员已关闭你的连接。你现在可以重新连接。"
  ],
  [
    "네르: 무리하지 말아요, 스피키씨. 버거우면 동료부터 불러와요.",
    "尼尔：别太勉强自己，斯皮奇。觉得吃力就先叫上伙伴吧。"
  ],
  [
    "봉인의 방에는 회복의 샘이 없습니다. 물약은 미리 챙겨 두세요.",
    "封印之室内没有治愈之泉，请提前备好药水。"
  ],
  [
    "새 버전을 준비하고 있어요 — 잠시 후 자동으로 다시 시도합니다",
    "正在准备更新，稍后会自动重试"
  ],
  [
    "선물이 도착했어요! 하단 메뉴의 우편함 아이콘에서 받아 보세요.",
    "礼物到了！从底部菜单的邮箱图标中领取。"
  ],
  [
    "선택한 채널에 접속하지 못했습니다. 다른 채널을 선택해 주세요.",
    "无法连接至所选频道，请选择其他频道。"
  ],
  [
    "연결이 끊겼습니다 — 재접속 중…({attempt}/{max})",
    "连接已断开，正在重新连接…（{attempt}/{max}）"
  ],
  [
    "진행 중인 레이드가 너무 많습니다. 잠시 후 다시 시도해 주세요",
    "正在进行的团队副本过多，请稍后重试"
  ],
  [
    "처리 중 다른 요청과 충돌이 발생했습니다. 다시 시도해 주세요.",
    "处理请求时发生冲突，请重试。"
  ],
  [
    "エルフの森番があなたを試そうとしています。八回、勝って見せてください。",
    "精灵守林人想考验你。战胜它八次，证明自己吧。"
  ],
  [
    "モンスターを見つけましたか?左クリックでターゲットを選んでみましょう。",
    "找到怪物了吗？按鼠标左键选中它。"
  ],
  [
    "{name} — Lv{level}で解放（ホットキー {key}）",
    "{name} — Lv.{level} 解锁（快捷键：{key}）"
  ],
  [
    "{name}님의 레벨이 부족합니다 (레벨 {level} 필요)",
    "{name} 的等级不足（需要 {level} 级）"
  ],
  [
    "☑ Limited {remaining}/{totalLimit}",
    "☑ 限购 {remaining}/{totalLimit}"
  ],
  [
    "次のレベルまで{remaining}pt · 累計{total}pt",
    "距离下一级还需 {remaining}pt · 累计 {total}pt"
  ],
  [
    "哭声幽霊の泣き声が止まらないんです。十二体だけ、鎮めてきてください。",
    "哀嚎幽灵的哭声久久不息。请平息十二只。"
  ],
  [
    "墓地の果てで、墓守の大亡霊が待っています。この旅の最後の試練ですよ。",
    "墓园尽头，守墓大亡灵正在等着你。这是本次旅程的最终试炼。"
  ],
  [
    "守護者は下がっても距離を詰めてきます — 逃げるだけでは勝てません。",
    "即使后退，守护者也会步步逼近；一味逃跑无法取胜。"
  ],
  [
    "添付: {mail1_name} x{mail1_quantity}",
    "附件：{mail1_name} x{mail1_quantity}"
  ],
  [
    "現在サーバーメンテナンス中です。しばらくしてから再度お試しください。",
    "服务器正在维护，请稍后重试。"
  ],
  [
    "Beastfolk Leather Hood x{quantity}",
    "兽族皮革兜帽 x{quantity}"
  ],
  [
    "Beastfolk Warrior Helm x{quantity}",
    "兽族战士头盔 x{quantity}"
  ],
  [
    "Complete the previous quest first.",
    "请先完成前置任务。"
  ],
  [
    "Fairy Order Novice Top x{quantity}",
    "妖精团新手上衣 x{quantity}"
  ],
  [
    "Found a monster? Tap to target it.",
    "找到怪物了吗？点按怪物来选中它。"
  ],
  [
    "Into the Ironglow Chimney District",
    "前往铁辉烟囱区"
  ],
  [
    "Lightning Strike Spirit Lv.{level}",
    "落雷精灵 Lv.{level}"
  ],
  [
    "Lv{level} {slot} — 착용 시 공격력 +{atk}",
    "Lv.{level} {slot} — 攻击力 +{atk}"
  ],
  [
    "Lv50上着 — 装備するとぼうぎょ力+11、さいだいHP+135。",
    "Lv50 上衣——装备时防御力 +11，最大 HP +135"
  ],
  [
    "No account was found for this code",
    "未找到与此恢复码对应的账号"
  ],
  [
    "Overload Circuit Spirit Lv.{level}",
    "过载电路精灵 Lv.{level}"
  ],
  [
    "Railway Conductor Ghost Lv.{level}",
    "旧铁路幽灵列车长 Lv.{level}"
  ],
  [
    "Sealed Prototype Gigant Lv.{level}",
    "封印原型巨像 Lv.{level}"
  ],
  [
    "This event is not active right now",
    "活动尚未开放"
  ],
  [
    "You've used up today's reward runs",
    "今日奖励次数已用完"
  ],
  [
    "강화 정보가 변경되었습니다. 최신 상태를 다시 확인해 주세요.",
    "强化信息已更新，请确认最新状态后重试。"
  ],
  [
    "레벨 업이에요! 새 스킬 「{skillName}」 해금이에요!",
    "升级了！新技能「{skillName}」已解锁！"
  ],
  [
    "서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
    "服务器发生内部错误，请稍后重试。"
  ],
  [
    "엘프 숲지기가 당신을 시험하려 해요. 여덟 번 이겨 보이세요.",
    "精灵守林人想考验你。战胜它八次，证明自己吧。"
  ],
  [
    "정보 없음 · {population} / {capacity}명",
    "无数据 · {population}/{capacity} 人"
  ],
  [
    "첨부: {mail1_name} x{mail1_quantity}",
    "附件：{mail1_name} x{mail1_quantity}"
  ],
  [
    "このGoogleアカウントはすでに別のアカウントに連携されています。",
    "此 Google 账号已经关联到其他账号。"
  ],
  [
    "ニックネームの設定に失敗しました。しばらくしてから再度お試しください",
    "昵称设置失败，请稍后重试"
  ],
  [
    "ヌウリングに触れるとダウンします — ドローンが自動で戦ってくれます",
    "碰到努噜灵就会倒地！无人机会自动作战，注意躲避敌人"
  ],
  [
    "プレゼントが届きましたよ!Mキーで郵便箱から受け取ってみてください。",
    "礼物到了！按 M 键前往邮箱领取。"
  ],
  [
    "{name} — Lv{level}에 해금 (핫키 {key})",
    "{name} — Lv.{level} 解锁（快捷键：{key}）"
  ],
  [
    "{name} has invited you to a party",
    "{name} 邀请你加入队伍"
  ],
  [
    "{name} is already in another raid",
    "{name} 已在其他团队副本中"
  ],
  [
    "{name}さんが封印の祭壇があるマップにいないため入場できません",
    "{name} 不在封印祭坛所在的地图，队伍无法入场"
  ],
  [
    "{population} / {capacity} players",
    "{population}/{capacity} 人"
  ],
  [
    "本日送信できるお問い合わせ数を超えました。明日また試してください。",
    "已达到今天的咨询次数上限，请明天再试。"
  ],
  [
    "大湿地魔女が墓地を狙っています。どうか止めてください、スピキさん。",
    "大沼泽女巫盯上了墓园。请阻止她，斯皮奇。"
  ],
  [
    "倒れた仲間のそばでTを押して感情表現(ダンス)を選ぶと蘇生できます",
    "队友倒地后，在其身旁按 T 并选择“跳舞”表情，即可将其救起"
  ],
  [
    "接続が切れました — 再接続中…({attempt}/{max})",
    "连接已断开，正在重新连接…（{attempt}/{max}）"
  ],
  [
    "今日の分の狩りです。種類は問いませんので、十五体だけお願いします。",
    "完成今天的狩猎吧。种类不限，击败十五只即可。"
  ],
  [
    "進行中のレイドが多すぎます。しばらくしてからもう一度お試しください",
    "正在进行的团队副本过多，请稍后重试"
  ],
  [
    "情報なし · {population} / {capacity}人",
    "无数据 · {population}/{capacity} 人"
  ],
  [
    "亡霊たちが安らぎを失ってしまって。十二体だけ、慰めてきてください。",
    "亡灵失去了安宁。请安抚十二只。"
  ],
  [
    "相手のフレンドリストが上限に達しているため、申請を承認できません。",
    "对方的好友列表已满，无法接受此申请。"
  ],
  [
    "自分のフレンドリストが上限に達しているため、申請を承認できません。",
    "你的好友列表已满，无法接受此申请。"
  ],
  [
    "A reward from the operations team",
    "运营团队的奖励已送达"
  ],
  [
    "Activate Mecha Drone - Focus Fire",
    "机械无人机：集中射击"
  ],
  [
    "Apprentice Marsh Witch Lv.{level}",
    "见习湿地女巫 Lv.{level}"
  ],
  [
    "Cinnamon Health Candy x{quantity}",
    "肉桂味健康硬糖 x{quantity}"
  ],
  [
    "Current account's recovery code: ",
    "当前账号的恢复码："
  ],
  [
    "Dragonkin Battle Helm x{quantity}",
    "龙族战斗头盔 x{quantity}"
  ],
  [
    "Ember Hatchling Dragon Lv.{level}",
    "烬火幼龙 Lv.{level}"
  ],
  [
    "Ember Will-o'-the-Wisp Lv.{level}",
    "余烬鬼火 Lv.{level}"
  ],
  [
    "Forest Beastfolk Scout Lv.{level}",
    "森林兽人侦察兵 Lv.{level}"
  ],
  [
    "Frost Will-o'-the-Wisp Lv.{level}",
    "冰霜鬼火 Lv.{level}"
  ],
  [
    "Frost-star Shard Helm x{quantity}",
    "霜星碎片头盔 x{quantity}"
  ],
  [
    "Gravekeeper's Greaves x{quantity}",
    "守墓人护胫 x{quantity}"
  ],
  [
    "Lv10ズボン — 装備するとぼうぎょ力+2、さいだいHP+20。",
    "Lv10 下装——装备时防御力 +2，最大 HP +20"
  ],
  [
    "Lv15ズボン — 装備するとぼうぎょ力+3、さいだいHP+28。",
    "Lv15 下装——装备时防御力 +3，最大 HP +28"
  ],
  [
    "Lv20ズボン — 装備するとぼうぎょ力+4、さいだいHP+36。",
    "Lv20 下装——装备时防御力 +4，最大 HP +36"
  ],
  [
    "Lv25ズボン — 装備するとぼうぎょ力+4、さいだいHP+44。",
    "Lv25 下装——装备时防御力 +4，最大 HP +44"
  ],
  [
    "Lv30ズボン — 装備するとぼうぎょ力+5、さいだいHP+51。",
    "Lv30 下装——装备时防御力 +5，最大 HP +51"
  ],
  [
    "Lv40上着 — 装備するとぼうぎょ力+9、さいだいHP+110。",
    "Lv40 上衣——装备时防御力 +9，最大 HP +110"
  ],
  [
    "Lv40ズボン — 装備するとぼうぎょ力+7、さいだいHP+66。",
    "Lv40 下装——装备时防御力 +7，最大 HP +66"
  ],
  [
    "Lv50 상의 — 착용 시 방어력 +11, 최대체력 +135",
    "Lv50 上衣——装备时防御力 +11，最大 HP +135"
  ],
  [
    "Lv50ズボン — 装備するとぼうぎょ力+8、さいだいHP+81。",
    "Lv50 下装——装备时防御力 +8，最大 HP +81"
  ],
  [
    "No minigame is running right now.",
    "目前没有开放的小游戏。"
  ],
  [
    "Only the party leader can do that",
    "只有队长可以执行此操作"
  ],
  [
    "Party status {partyStatus_status}",
    "队员存活：{partyStatus_status}"
  ],
  [
    "Power Line Watch Drone Lv.{level}",
    "输电监控无人机 Lv.{level}"
  ],
  [
    "Runaway Maintenance Unit (Summon)",
    "暴走维修单元（召唤）"
  ],
  [
    "Snowfrost Spirit Robe x{quantity}",
    "雪霜精灵长袍 x{quantity}"
  ],
  [
    "The Apprentice Witch's Experiment",
    "见习湿地女巫的实验"
  ],
  [
    "Thunder Pylon Guardian Lv.{level}",
    "雷电塔守护机 Lv.{level}"
  ],
  [
    "You cannot return while in combat",
    "战斗中无法回城"
  ],
  [
    "노잣돈이 급할 때 챙기면 좋은 자루다. 두둑하게 담겨 있다.",
    "急需盘缠时值得带上的一袋金币，装得沉甸甸的。"
  ],
  [
    "달무리 늪골에 달빛 도깨비불이 떠돌아요. 열만 흩어 주세요.",
    "月环泽谷中飘荡着月光鬼火。请驱散十只。"
  ],
  [
    "대습지 마녀가 묘지를 넘봐요. 부디 막아 주세요, 스피키씨.",
    "大沼泽女巫盯上了墓园。请阻止她，斯皮奇。"
  ],
  [
    "레벨 {minLevel} 이상부터 채팅을 보낼 수 있습니다.",
    "达到 {minLevel} 级后才能发送聊天消息。"
  ],
  [
    "숲의 요정들이 부쩍 소란스러워요. 다섯만 살펴봐 주시겠어요?",
    "森林妖精最近格外吵闹。能帮我查看五只森林妖精的情况吗？"
  ],
  [
    "아직 다시 입장할 수 없습니다. 잠시 후 다시 시도해 주세요",
    "暂时无法再次进入，请稍后重试"
  ],
  [
    "여기가 모나티엄 시청이야. 필요한 거 있으면 말해봐, 유령.",
    "这里是莫纳提姆市政厅。有事就直说吧，幽灵。"
  ],
  [
    "우편 도착: {title} — 우편함에서 수령할 수 있습니다",
    "收到邮件：{title} — 可前往邮箱领取"
  ],
  [
    "진행 중인 판이 너무 많습니다. 잠시 후 다시 시도해 주세요",
    "当前场次过多，请稍后再试"
  ],
  [
    "オンボーディング中に一度だけ表示された案内をここで再確認できます。",
    "可在此重新查看新手引导中仅出现一次的提示。"
  ],
  [
    "ゴールド・エリーフ・最上級クレパス・経験値の袋・伝説装備を一度に。",
    "金币、水晶叶、金蜡笔、经验袋和传说装备，一袋全有。"
  ],
  [
    "サーバーエラーが発生しました。しばらくしてから再度お試しください。",
    "服务器发生内部错误，请稍后重试。"
  ],
  [
    "さすらう風精霊が道を乱してしまって。八体だけ、鎮めてきてください。",
    "游荡风精灵扰乱了道路。请平息八只。"
  ],
  [
    "ニックネームはハングル・英字・数字の2〜12文字のみ使用できます。",
    "昵称须由 2–12 个韩文、英文字母或数字组成。"
  ],
  [
    "まだやり取りはありません。ご質問や不具合をお気軽にお送りください。",
    "暂无反馈记录。欢迎提交问题或错误报告。"
  ],
  [
    "モンスターを見つけましたか?タップでターゲットを選んでみましょう。",
    "找到怪物了吗？点按怪物来选中它。"
  ],
  [
    "レベルアップです!新しいスキル「{skillName}」解放です!",
    "升级了！新技能「{skillName}」已解锁！"
  ],
  [
    "[상점]에도 들러 주세요 — 물약이랑 장비를 팔고 있어요!",
    "也来逛逛【商店】吧，这里出售药水和装备！"
  ],
  [
    "{name} — 回復 {heal}%（ホットキー {key}）",
    "{name} — 恢复 {heal}%（快捷键：{key}）"
  ],
  [
    "{name} — 町へ帰還（ホットキー {key}）・HP全回復",
    "{name} — 返回城镇并恢复全部生命值（快捷键：{key}）"
  ],
  [
    "{name} — Activate (Hotkey {key})",
    "{name} — 发动（快捷键：{key}）"
  ],
  [
    "{name} sent you a friend request",
    "{name} 向你发送了好友申请"
  ],
  [
    "{name}さんのレベルが足りません（レベル{level}必要）",
    "{name} 的等级不足（需要 {level} 级）"
  ],
  [
    "☑ 일일 한정 {remaining}/{dailyLimit}",
    "☑ 每日限购 {remaining}/{dailyLimit}"
  ],
  [
    "報酬は1日最大10回まで獲得できます。入場回数に制限はありません",
    "每天最多可领取 10 次奖励，挑战次数不限"
  ],
  [
    "強化は元に戻せません。振り分けの変更手段は今後別途提供予定です。",
    "属性强化后无法撤销；重置分配功能将在之后推出。"
  ],
  [
    "霧の影が道を飲み込んでしまって。十二体だけ、払ってきてください。",
    "雾影正在吞噬道路。请清除十二只。"
  ],
  [
    "装備アイテムは使用できません。装備画面(E)で装備してください。",
    "装备无法直接使用，请前往装备界面（E）穿戴。"
  ],
  [
    "左クリック: モンスターのターゲット / NPCとの会話（固定）",
    "左键：锁定怪物；与 NPC 对话（固定）"
  ],
  [
    "Auto-repeat basic attack (Space)",
    "自动重复普通攻击（Space）"
  ],
  [
    "Click to see replacement options",
    "点击查看可用装备"
  ],
  [
    "Descent of the Great Marsh Witch",
    "大沼泽女巫降临"
  ],
  [
    "Elven Hunter Greaves x{quantity}",
    "精灵猎手护胫 x{quantity}"
  ],
  [
    "Exhaust Cleaner Drone Lv.{level}",
    "排气清扫无人机 Lv.{level}"
  ],
  [
    "Lava Will-o'-the-Wisp Lv.{level}",
    "熔岩鬼火 Lv.{level}"
  ],
  [
    "Limited {remaining}/{totalLimit}",
    "限购 {remaining}/{totalLimit}"
  ],
  [
    "Location: zone {zone} ({x}, {z})",
    "位置：区域 {zone}（{x}, {z}）"
  ],
  [
    "Lv10帽子 — 装備するとぼうぎょ力+1、さいだいHP+15。",
    "Lv10 帽子——装备时防御力 +1，最大 HP +15"
  ],
  [
    "Lv10上着 — 装備するとぼうぎょ力+3、さいだいHP+35。",
    "Lv10 上衣——装备时防御力 +3，最大 HP +35"
  ],
  [
    "Lv15帽子 — 装備するとぼうぎょ力+2、さいだいHP+19。",
    "Lv15 帽子——装备时防御力 +2，最大 HP +19"
  ],
  [
    "Lv15上着 — 装備するとぼうぎょ力+4、さいだいHP+48。",
    "Lv15 上衣——装备时防御力 +4，最大 HP +48"
  ],
  [
    "Lv20帽子 — 装備するとぼうぎょ力+2、さいだいHP+24。",
    "Lv20 帽子——装备时防御力 +2，最大 HP +24"
  ],
  [
    "Lv20上着 — 装備するとぼうぎょ力+5、さいだいHP+60。",
    "Lv20 上衣——装备时防御力 +5，最大 HP +60"
  ],
  [
    "Lv25帽子 — 装備するとぼうぎょ力+3、さいだいHP+29。",
    "Lv25 帽子——装备时防御力 +3，最大 HP +29"
  ],
  [
    "Lv25上着 — 装備するとぼうぎょ力+6、さいだいHP+72。",
    "Lv25 上衣——装备时防御力 +6，最大 HP +72"
  ],
  [
    "Lv30帽子 — 装備するとぼうぎょ力+4、さいだいHP+34。",
    "Lv30 帽子——装备时防御力 +4，最大 HP +34"
  ],
  [
    "Lv30上着 — 装備するとぼうぎょ力+7、さいだいHP+85。",
    "Lv30 上衣——装备时防御力 +7，最大 HP +85"
  ],
  [
    "Lv40 상의 — 착용 시 방어력 +9, 최대체력 +110",
    "Lv40 上衣——装备时防御力 +9，最大 HP +110"
  ],
  [
    "Lv40帽子 — 装備するとぼうぎょ力+4、さいだいHP+44。",
    "Lv40 帽子——装备时防御力 +4，最大 HP +44"
  ],
  [
    "Lv50帽子 — 装備するとぼうぎょ力+6、さいだいHP+54。",
    "Lv50 帽子——装备时防御力 +6，最大 HP +54"
  ],
  [
    "Lv5ズボン — 装備するとぼうぎょ力+1、さいだいHP+15。",
    "Lv5 下装——装备时防御力 +1，最大 HP +15"
  ],
  [
    "Marsh Witch Preceptor Lv.{level}",
    "沼泽女巫导师 Lv.{level}"
  ],
  [
    "Marshfog Spell Staff x{quantity}",
    "沼雾咒术法杖 x{quantity}"
  ],
  [
    "No change — stayed at Lv.{level}",
    "强化未变：维持 +{level}"
  ],
  [
    "Overload Power Spirit Lv.{level}",
    "暴走电力精灵 Lv.{level}"
  ],
  [
    "Pale Will-o'-the-Wisp Lv.{level}",
    "苍白鬼火 Lv.{level}"
  ],
  [
    "Root-entangled Wraith Lv.{level}",
    "根缚亡灵 Lv.{level}"
  ],
  [
    "Sickle Vole Beastfolk Lv.{level}",
    "镰刀田鼠人 Lv.{level}"
  ],
  [
    "Temple Return Scroll x{quantity}",
    "教团回城卷轴 x{quantity}"
  ],
  [
    "Wandering Wind Spirit Lv.{level}",
    "游荡风精灵 Lv.{level}"
  ],
  [
    "You are already on this channel.",
    "你已在此频道中。"
  ],
  [
    "You cannot enter while in combat",
    "战斗中无法进入"
  ],
  [
    "구매 한도를 초과합니다. 수량을 줄여 다시 시도해 주세요.",
    "超出购买上限，请减少数量后重试。"
  ],
  [
    "닉네임은 한글·영문·숫자 2~12자만 사용할 수 있습니다.",
    "昵称须由 2–12 个韩文、英文字母或数字组成。"
  ],
  [
    "떠도는 바람정령이 길을 어지럽혀요. 여덟만 잠재워 주세요.",
    "游荡风精灵扰乱了道路。请平息八只。"
  ],
  [
    "사용할 수 있는 귀환 아이템이 없습니다 (핫키 {key})",
    "没有可用的回城道具（快捷键：{key}）"
  ],
  [
    "상대의 친구 목록이 가득 차서 요청을 수락할 수 없습니다.",
    "对方的好友列表已满，无法接受此申请。"
  ],
  [
    "어서 오세요, 스피키씨! 필요한 게 있으면 말씀해 주세요.",
    "欢迎，斯皮奇！有需要的话尽管告诉我。"
  ],
  [
    "지금은 {max}개까지만 구매할 수 있습니다 (구매 한도)",
    "目前最多可购买 {max} 个（已达购买上限）"
  ],
  [
    "スピキともっと仲良くなりました!(親愛度 Lv.{level})",
    "与斯皮奇的好感度升至 Lv.{level}！"
  ],
  [
    "ダウンしました — 数字キー1〜4でパーティメンバーの視点を見る",
    "你已倒下——按数字键 1～4 切换队友视角"
  ],
  [
    "レベルアップです!成長すると新しいスキルや装備が解放されますよ。",
    "升级了！随着成长，会解锁新的技能和装备。"
  ],
  [
    "{stat} bonus {current} → {next}",
    "{stat} {current} → {next}"
  ],
  [
    "☑ 本日限定 {remaining}/{dailyLimit}",
    "☑ 每日限购 {remaining}/{dailyLimit}"
  ],
  [
    "混雑 · {population} / {capacity}人",
    "拥挤 · {population}/{capacity} 人"
  ],
  [
    "基本のソフト通貨 — 成長や購入など汎用的な消費に使用します。",
    "最常用的基础货币，可用于角色成长和商店消费。"
  ],
  [
    "接続が一時的に不安定です。しばらくしてから再度お試しください。",
    "连接暂时不稳定，请稍后重试。"
  ],
  [
    "露店に十回寄っていただけたら、特別なものを用意しておきますね。",
    "在商店购买十次，我会为你准备一份特别的礼物。"
  ],
  [
    "満室 · {population} / {capacity}人",
    "满员 · {population}/{capacity} 人"
  ],
  [
    "普通 · {population} / {capacity}人",
    "一般 · {population}/{capacity} 人"
  ],
  [
    "強化情報が変更されました。最新の状態をもう一度ご確認ください。",
    "强化信息已更新，请确认最新状态后重试。"
  ],
  [
    "使用するとレベルがちょうど1上がる（最大レベル時は使用不可）。",
    "使用后立即提升 1 级（达到最高等级后无法使用）。"
  ],
  [
    "使用できるHPポーションがありません（ホットキー {key}）",
    "没有可用的 HP 药水（快捷键：{key}）"
  ],
  [
    "余裕 · {population} / {capacity}人",
    "空闲 · {population}/{capacity} 人"
  ],
  [
    "An even tastier Cinnamon Candy.",
    "比普通肉桂味硬糖更加美味。"
  ],
  [
    "Ashen Mourning Robe x{quantity}",
    "灰烬哀悼长袍 x{quantity}"
  ],
  [
    "Core Guard Automaton Lv.{level}",
    "核心守卫自动机 Lv.{level}"
  ],
  [
    "Dawn Warden Greaves x{quantity}",
    "黎明守望者护胫 x{quantity}"
  ],
  [
    "Dragonscale Guardian Lv.{level}",
    "龙鳞守卫 Lv.{level}"
  ],
  [
    "Frost Bear Beastfolk Lv.{level}",
    "冰霜熊人 Lv.{level}"
  ],
  [
    "Gentle Breeze Spirit Lv.{level}",
    "和风精灵 Lv.{level}"
  ],
  [
    "Lv10 모자 — 착용 시 방어력 +1, 최대체력 +15",
    "Lv10 帽子——装备时防御力 +1，最大 HP +15"
  ],
  [
    "Lv10 상의 — 착용 시 방어력 +3, 최대체력 +35",
    "Lv10 上衣——装备时防御力 +3，最大 HP +35"
  ],
  [
    "Lv10 하의 — 착용 시 방어력 +2, 최대체력 +20",
    "Lv10 下装——装备时防御力 +2，最大 HP +20"
  ],
  [
    "Lv15 모자 — 착용 시 방어력 +2, 최대체력 +19",
    "Lv15 帽子——装备时防御力 +2，最大 HP +19"
  ],
  [
    "Lv15 상의 — 착용 시 방어력 +4, 최대체력 +48",
    "Lv15 上衣——装备时防御力 +4，最大 HP +48"
  ],
  [
    "Lv15 하의 — 착용 시 방어력 +3, 최대체력 +28",
    "Lv15 下装——装备时防御力 +3，最大 HP +28"
  ],
  [
    "Lv20 모자 — 착용 시 방어력 +2, 최대체력 +24",
    "Lv20 帽子——装备时防御力 +2，最大 HP +24"
  ],
  [
    "Lv20 상의 — 착용 시 방어력 +5, 최대체력 +60",
    "Lv20 上衣——装备时防御力 +5，最大 HP +60"
  ],
  [
    "Lv20 하의 — 착용 시 방어력 +4, 최대체력 +36",
    "Lv20 下装——装备时防御力 +4，最大 HP +36"
  ],
  [
    "Lv25 모자 — 착용 시 방어력 +3, 최대체력 +29",
    "Lv25 帽子——装备时防御力 +3，最大 HP +29"
  ],
  [
    "Lv25 상의 — 착용 시 방어력 +6, 최대체력 +72",
    "Lv25 上衣——装备时防御力 +6，最大 HP +72"
  ],
  [
    "Lv25 하의 — 착용 시 방어력 +4, 최대체력 +44",
    "Lv25 下装——装备时防御力 +4，最大 HP +44"
  ],
  [
    "Lv30 모자 — 착용 시 방어력 +4, 최대체력 +34",
    "Lv30 帽子——装备时防御力 +4，最大 HP +34"
  ],
  [
    "Lv30 상의 — 착용 시 방어력 +7, 최대체력 +85",
    "Lv30 上衣——装备时防御力 +7，最大 HP +85"
  ],
  [
    "Lv30 하의 — 착용 시 방어력 +5, 최대체력 +51",
    "Lv30 下装——装备时防御力 +5，最大 HP +51"
  ],
  [
    "Lv40 모자 — 착용 시 방어력 +4, 최대체력 +44",
    "Lv40 帽子——装备时防御力 +4，最大 HP +44"
  ],
  [
    "Lv40 하의 — 착용 시 방어력 +7, 최대체력 +66",
    "Lv40 下装——装备时防御力 +7，最大 HP +66"
  ],
  [
    "Lv50 모자 — 착용 시 방어력 +6, 최대체력 +54",
    "Lv50 帽子——装备时防御力 +6，最大 HP +54"
  ],
  [
    "Lv50 하의 — 착용 시 방어력 +8, 최대체력 +81",
    "Lv50 下装——装备时防御力 +8，最大 HP +81"
  ],
  [
    "Lv5帽子 — 装備するとぼうぎょ力+1、さいだいHP+10。",
    "Lv5 帽子——装备时防御力 +1，最大 HP +10"
  ],
  [
    "Lv5上着 — 装備するとぼうぎょ力+2、さいだいHP+20。",
    "Lv5 上衣——装备时防御力 +2，最大 HP +20"
  ],
  [
    "Marsh Witch Greaves x{quantity}",
    "湿地女巫护胫 x{quantity}"
  ],
  [
    "Moonhaze Witch Robe x{quantity}",
    "月晕女巫长袍 x{quantity}"
  ],
  [
    "Moorland Wind Spirit Lv.{level}",
    "原野风精灵 Lv.{level}"
  ],
  [
    "Move closer to the sealed altar",
    "请靠近封印祭坛"
  ],
  [
    "Move: WASD / Arrow keys (fixed)",
    "移动：WASD 或方向键（固定）"
  ],
  [
    "Movement keys cannot be changed",
    "无法更改移动按键"
  ],
  [
    "Party invitation sent to {name}",
    "已向 {name} 发送组队邀请"
  ],
  [
    "Please set your nickname first.",
    "请先设置昵称。"
  ],
  [
    "Refreshes about every 3 minutes",
    "约每 3 分钟更新一次"
  ],
  [
    "Requires level {level} to enter",
    "需要达到 {level} 级才能进入"
  ],
  [
    "Sent a friend request to {name}",
    "已向 {name} 发送好友申请"
  ],
  [
    "Staff of the Dawnlit Great Tree",
    "晨曦巨树法杖"
  ],
  [
    "That nickname is already taken.",
    "此昵称已被使用。"
  ],
  [
    "This skill unlocks at Lv{level}",
    "该技能将在 Lv.{level} 解锁"
  ],
  [
    "Updating to the latest version…",
    "正在更新至最新版本…"
  ],
  [
    "Welding Spark Impbot Lv.{level}",
    "焊火小恶魔机器人 Lv.{level}"
  ],
  [
    "You are already in another raid",
    "你已在其他团队副本中"
  ],
  [
    "You are now friends with {name}",
    "你已与 {name} 成为好友"
  ],
  [
    "You don't have any return items",
    "没有可用的回城道具"
  ],
  [
    "You don't have enough currency.",
    "货币不足。"
  ],
  [
    "곡성유령의 울음이 그치질 않아요. 열둘만 잠재워 주세요.",
    "哀嚎幽灵的哭声久久不息。请平息十二只。"
  ],
  [
    "너무 빠르게 전송했습니다. 잠시 후 다시 시도해 주세요.",
    "发送过于频繁，请稍后重试。"
  ],
  [
    "닉네임 지정에 실패했습니다. 잠시 후 다시 시도해 주세요",
    "昵称设置失败，请稍后重试"
  ],
  [
    "다른 기기에서 로그아웃되었습니다. 다시 로그인해 주세요.",
    "账号已在另一台设备上退出登录，请重新登录。"
  ],
  [
    "레벨 {level}에 도달하셨습니다. 보상을 수령하세요.",
    "你已达到 {level} 级，请领取奖励！"
  ],
  [
    "만석 · {population} / {capacity}명",
    "满员 · {population}/{capacity} 人"
  ],
  [
    "보유 골드 {gold} · 보유 재료 {points}pt",
    "金币 {gold} · 材料 {points} pt"
  ],
  [
    "보통 · {population} / {capacity}명",
    "一般 · {population}/{capacity} 人"
  ],
  [
    "사용 시 레벨이 정확히 1 오른다(만렙 시 사용 불가).",
    "使用后立即提升 1 级（达到最高等级后无法使用）。"
  ],
  [
    "사용할 수 있는 HP 포션이 없습니다 (핫키 {key})",
    "没有可用的 HP 药水（快捷键：{key}）"
  ],
  [
    "수인 정찰병이 길을 막아섰어요. 열만 물리쳐 주시겠어요?",
    "森林兽人侦察兵挡住了道路。能帮我击退十只吗？"
  ],
  [
    "스피키와 더 가까워졌어요! (애정도 Lv.{level})",
    "与斯皮奇的好感度升至 Lv.{level}！"
  ],
  [
    "아이템 기반 뽑기 플레이스홀더 — 골드/에너지 확률 지급",
    "进行一次普通抽取，随机获得金币或能量。"
  ],
  [
    "아주 드물게… 최상급 크레파스를 얻을 수 있는 주머니다.",
    "极少数袋子里……会藏着一支金蜡笔。"
  ],
  [
    "여유 · {population} / {capacity}명",
    "空闲 · {population}/{capacity} 人"
  ],
  [
    "오늘도 와 주셨군요. 잠깐 얼굴 비춘 것만으로 충분해요.",
    "今天也来报到了呢。只要露个面就足够了。"
  ],
  [
    "이 아이템은 게임 화면에서 핫키로만 사용할 수 있습니다.",
    "此物品只能在游戏画面中通过快捷键使用。"
  ],
  [
    "이미 최고 레벨이라 경험치 주머니를 사용할 수 없습니다.",
    "已达到最高等级，无法使用经验袋。"
  ],
  [
    "현재 서버 점검 중입니다. 잠시 후 다시 시도해 주세요.",
    "服务器正在维护，请稍后重试。"
  ],
  [
    "혼잡 · {population} / {capacity}명",
    "拥挤 · {population}/{capacity} 人"
  ],
  [
    "いらっしゃい、スピキさん!必要なものがあれば言ってくださいね。",
    "欢迎，斯皮奇！有需要的话尽管告诉我。"
  ],
  [
    "お持ちの消耗品をひとつくらい、今日使ってみるのはいかがですか？",
    "今天也挑一件随身的消耗品用用看吧？"
  ],
  [
    "お問い合わせが集中しております。落ち着き次第、再開いたします。",
    "咨询量目前过大，待情况缓和后将重新开放。"
  ],
  [
    "チャンネル変更のクールダウン中です（あと{seconds}秒）",
    "频道切换冷却中，还需 {seconds} 秒"
  ],
  [
    "レベル{level}に到達しました。報酬を受け取ってください。",
    "你已达到 {level} 级，请领取奖励！"
  ],
  [
    "{name} — 馬車を召喚/降車（ホットキー {key}）",
    "{name} — 召唤马车或下车（快捷键：{key}）"
  ],
  [
    "{name} — Summon (Hotkey {key})",
    "{name} — 召唤（快捷键：{key}）"
  ],
  [
    "{name} — 쿨다운 {sec}초 (핫키 {key})",
    "{name} — 冷却 {sec} 秒（快捷键：{key}）"
  ],
  [
    "{name} — 회복 {heal}% (핫키 {key})",
    "{name} — 恢复 {heal}%（快捷键：{key}）"
  ],
  [
    "5分間カボチャを避けながら、できるだけ遠くまで走りましょう。",
    "躲开滚来的假南瓜，在 5 分钟内尽可能跑得更远！"
  ],
  [
    "古の風精霊が目覚めました。お気をつけくださいね、スピキさん。",
    "远古风精灵苏醒了。请小心，斯皮奇。"
  ],
  [
    "露店にひとつだけ寄ってみてください。常連さんが一番ですから。",
    "去商店随便买一样东西吧。常客总是最受欢迎的。"
  ],
  [
    "使用できる帰還アイテムがありません（ホットキー {key}）",
    "没有可用的回城道具（快捷键：{key}）"
  ],
  [
    "他の端末からログアウトされました。再度ログインしてください。",
    "账号已在另一台设备上退出登录，请重新登录。"
  ],
  [
    "Ancient Wind Spirit Lv.{level}",
    "远古风精灵 Lv.{level}"
  ],
  [
    "Ashen Wailing Ghost Lv.{level}",
    "灰烬哀嚎幽灵 Lv.{level}"
  ],
  [
    "Connected to Channel {channel}",
    "已连接至频道 {channel}"
  ],
  [
    "Coolant Spray Drone Lv.{level}",
    "冷却液喷洒无人机 Lv.{level}"
  ],
  [
    "Elven Forest Warden Lv.{level}",
    "精灵守林人 Lv.{level}"
  ],
  [
    "Gearblade Harvester Lv.{level}",
    "齿刃收割机 Lv.{level}"
  ],
  [
    "Gravekeeper's Hood x{quantity}",
    "守墓人兜帽 x{quantity}"
  ],
  [
    "Leafshed Elf Warden Lv.{level}",
    "落叶精灵守卫 Lv.{level}"
  ],
  [
    "Lightning Rod Knight Automaton",
    "避雷针骑士自动机"
  ],
  [
    "Lv5 모자 — 착용 시 방어력 +1, 최대체력 +10",
    "Lv5 帽子——装备时防御力 +1，最大 HP +10"
  ],
  [
    "Lv5 상의 — 착용 시 방어력 +2, 최대체력 +20",
    "Lv5 上衣——装备时防御力 +2，最大 HP +20"
  ],
  [
    "Lv5 하의 — 착용 시 방어력 +1, 최대체력 +15",
    "Lv5 下装——装备时防御力 +1，最大 HP +15"
  ],
  [
    "Marsh Toad Familiar Lv.{level}",
    "湿地蟾蜍使魔 Lv.{level}"
  ],
  [
    "Pumpkin patch {points}/{cap}pt",
    "南瓜田累计 {points}/{cap}pt"
  ],
  [
    "Rusted Watch Gigant Lv.{level}",
    "锈蚀守卫巨像 Lv.{level}"
  ],
  [
    "Spirit-bound Staff x{quantity}",
    "精灵缚结法杖 x{quantity}"
  ],
  [
    "That player could not be found",
    "找不到该玩家"
  ],
  [
    "Thornbush Beastfolk Lv.{level}",
    "荆棘丛兽人 Lv.{level}"
  ],
  [
    "Thundercloud Wyvern Lv.{level}",
    "雷云飞龙 Lv.{level}"
  ],
  [
    "Today: unlimited rewarded runs",
    "今日奖励次数不限"
  ],
  [
    "Today's reward already claimed",
    "今日奖励已领取"
  ],
  [
    "Wailing Seal Staff x{quantity}",
    "哀鸣封印法杖 x{quantity}"
  ],
  [
    "What Runs Through the Twilight",
    "奔行于暮色之物"
  ],
  [
    "What Sleeps Beneath the Statue",
    "沉睡于石像之下"
  ],
  [
    "견습 마녀가 위험한 실험을 벌여요. 열만 말려 주세요.",
    "见习湿地女巫们正在进行危险实验。请制止其中十名。"
  ],
  [
    "내 친구 목록이 가득 차서 요청을 수락할 수 없습니다.",
    "你的好友列表已满，无法接受此申请。"
  ],
  [
    "누루링에 닿으면 다운됩니다 — 드론이 자동으로 싸워줘요",
    "碰到努噜灵就会倒地！无人机会自动作战，注意躲避敌人"
  ],
  [
    "다섯 날 얼굴을 비춰 주세요. 교단은 성실을 기억해요.",
    "请在五个不同的日子来露个面。教团会记住你的勤勉。"
  ],
  [
    "문의가 과열되고 있습니다. 소강 후에 다시 열겠습니다.",
    "咨询量目前过大，待情况缓和后将重新开放。"
  ],
  [
    "상점에서 열 번 사 주시면, 특별한 걸 챙겨 드릴게요.",
    "在商店购买十次，我会为你准备一份特别的礼物。"
  ],
  [
    "애정도 레벨이 오를 때마다 황금 크레파스 1개를 받아요",
    "好感度每提升 1 级，即可获得 1 支金蜡笔。"
  ],
  [
    "인증 정보가 유효하지 않습니다. 다시 로그인해 주세요.",
    "认证信息无效，请重新登录。"
  ],
  [
    "일일 한정 {remaining}/{dailyLimit}",
    "每日限购 {remaining}/{dailyLimit}"
  ],
  [
    "한글·영문·숫자 2~12자 (공백·특수문자 사용 불가)",
    "2–12 个韩文、英文字母或数字（不可使用空格或特殊符号）"
  ],
  [
    "パーティー生存状況 {partyStatus_status}",
    "队员存活：{partyStatus_status}"
  ],
  [
    "{count} owned · Heals {heal}%",
    "持有 {count} 个 · 恢复 {heal}%"
  ],
  [
    "{name} — 馬車から降りる（ホットキー {key}）",
    "{name} — 下车（快捷键：{key}）"
  ],
  [
    "{name}さんは別のマップにいるため参加できませんでした",
    "{name} 不在当前地图，无法一同入场"
  ],
  [
    "☑ 限定 {remaining}/{totalLimit}",
    "☑ 限购 {remaining}/{totalLimit}"
  ],
  [
    "☑ 한정 {remaining}/{totalLimit}",
    "☑ 限购 {remaining}/{totalLimit}"
  ],
  [
    "6분 동안 몰려드는 누루링 무리 속에서 살아남으세요.",
    "在蜂拥而来的努噜灵群中坚持生存 6 分钟！"
  ],
  [
    "愛情度のレベルが上がるたびに黄金のクレパスを1個もらえます",
    "好感度每提升 1 级，即可获得 1 支金蜡笔。"
  ],
  [
    "本日限定 {remaining}/{dailyLimit}",
    "每日限购 {remaining}/{dailyLimit}"
  ],
  [
    "購入上限を超えています。数量を減らして再度お試しください。",
    "超出购买上限，请减少数量后重试。"
  ],
  [
    "進行中の回が多すぎます。しばらくしてから再試行してください",
    "当前场次过多，请稍后再试"
  ],
  [
    "送信が早すぎます。しばらくしてからもう一度お試しください。",
    "发送过于频繁，请稍后重试。"
  ],
  [
    "所持{priceName}では{max}個まで購入できます",
    "使用持有的 {priceName} 最多可购买 {max} 个"
  ],
  [
    "五日間、顔を見せてください。教団は実直さを覚えていますよ。",
    "请在五个不同的日子来露个面。教团会记住你的勤勉。"
  ],
  [
    "一人では手に負えないなら、仲間と一緒に祭壇を叩きましょう。",
    "如果独自应付不来，就和伙伴们一起挑战祭坛吧。"
  ],
  [
    "An even tastier Garnet Berry.",
    "将石榴石果实制成的清甜水果羹，味道更加可口。"
  ],
  [
    "Broken Scout Drone Lv.{level}",
    "故障侦察无人机 Lv.{level}"
  ],
  [
    "Chat is temporarily disabled.",
    "聊天功能暂时停用。"
  ],
  [
    "Dawn Warden Spirit Lv.{level}",
    "黎明守护精灵 Lv.{level}"
  ],
  [
    "Dawnlight Guardian Lv.{level}",
    "曙光守卫 Lv.{level}"
  ],
  [
    "Duskwood Chieftain Lv.{level}",
    "暮色森林大酋长 Lv.{level}"
  ],
  [
    "Furnace Core Golem Lv.{level}",
    "熔炉核心魔像 Lv.{level}"
  ],
  [
    "Hangar Defense Drone (Summon)",
    "机库防卫无人机（召唤）"
  ],
  [
    "Newly Risen Wraith Lv.{level}",
    "初醒亡灵 Lv.{level}"
  ],
  [
    "Press any key (ESC to cancel)",
    "请按任意键（ESC 取消）"
  ],
  [
    "Reaching the Derelict Railway",
    "抵达旧信号铁路"
  ],
  [
    "Restores {percent}% of Max HP",
    "恢复最大 HP 的 {percent}%"
  ],
  [
    "Runaway Power Core Lv.{level}",
    "暴走动力核心 Lv.{level}"
  ],
  [
    "Scorched Beastfolk Lv.{level}",
    "焦灼兽人 Lv.{level}"
  ],
  [
    "Signal Light Ghost Lv.{level}",
    "信号灯幽灵 Lv.{level}"
  ],
  [
    "Speaki Affection (Lv {level})",
    "斯皮奇好感度（Lv.{level}）"
  ],
  [
    "Spiritcaller Robe x{quantity}",
    "唤灵师长袍 x{quantity}"
  ],
  [
    "Subduing the Beastfolk Scouts",
    "讨伐森林兽人侦察兵"
  ],
  [
    "Temple Supply Box x{quantity}",
    "教团补给箱 x{quantity}"
  ],
  [
    "The Harvester That Won't Stop",
    "永不停歇的收割机"
  ],
  [
    "This item cannot be equipped.",
    "此物品无法装备。"
  ],
  [
    "Tow Claw Automaton Lv.{level}",
    "牵引钳自动机 Lv.{level}"
  ],
  [
    "You cannot fight in this area",
    "无法在此区域战斗"
  ],
  [
    "You don't have any HP potions",
    "没有可用的 HP 药水"
  ],
  [
    "기본 소프트 재화 — 성장·구매 등 범용 소비에 사용",
    "最常用的基础货币，可用于角色成长和商店消费。"
  ],
  [
    "레벨 업이에요! 성장하시면 새 스킬과 장비가 열려요.",
    "升级了！随着成长，会解锁新的技能和装备。"
  ],
  [
    "몬스터를 찾으셨나요? 좌클릭으로 타겟을 잡아 보세요.",
    "找到怪物了吗？按鼠标左键选中它。"
  ],
  [
    "보상 테이블이 비어있어 아이템을 사용할 수 없습니다.",
    "奖励表为空，无法使用此物品。"
  ],
  [
    "언어를 변경하면 페이지가 새로고침됩니다. 계속할까요?",
    "更改语言将刷新页面，是否继续？"
  ],
  [
    "해당 복구 코드에 대응하는 계정을 찾을 수 없습니다.",
    "找不到该恢复码对应的账号。"
  ],
  [
    "ハングル・英字・数字の2〜12文字（空白・記号は使用不可）",
    "2–12 个韩文、英文字母或数字（不可使用空格或特殊符号）"
  ],
  [
    "リクエストに失敗しました (HTTP {status})。",
    "请求失败（HTTP {status}）。"
  ],
  [
    "レベル{minLevel}以上からチャットを利用できます。",
    "达到 {minLevel} 级后才能发送聊天消息。"
  ],
  [
    "'{questTitle}' 퀘스트 완료 보상입니다.",
    "这是完成“{questTitle}”任务的奖励。"
  ],
  [
    "{name} — 마차 소환/하차 (핫키 {key})",
    "{name} — 召唤马车或下车（快捷键：{key}）"
  ],
  [
    "{name}님이 다른 맵에 있어 참여하지 못했습니다",
    "{name} 不在当前地图，无法一同入场"
  ],
  [
    "{stat} 강화 {current} → {next}",
    "{stat} {current} → {next}"
  ],
  [
    "本日の報酬回数 残り{remaining}/{cap}回",
    "今日剩余奖励次数：{remaining}/{cap}"
  ],
  [
    "開発用の鎧 — 装備するとさいだいHP+999,999。",
    "开发专用护甲——装备时最大 HP +999,999"
  ],
  [
    "路銀に困ったときのための袋。たっぷりと詰め込まれている。",
    "急需盘缠时值得带上的一袋金币，装得沉甸甸的。"
  ],
  [
    "強化情報が変更されました。最新の状態を確認してください。",
    "强化信息已更新，请确认最新状态后重试。"
  ],
  [
    "試行回数が多すぎます。しばらくしてから再度お試しください",
    "尝试过于频繁，请稍后重试"
  ],
  [
    "先にターゲットを選択してください（モンスターをクリック）",
    "请先点击怪物选择目标"
  ],
  [
    "言語を変更するとページが再読み込みされます。続けますか？",
    "更改语言将刷新页面，是否继续？"
  ],
  [
    "Climbing Thunder Pylon Ridge",
    "登上雷电塔岭"
  ],
  [
    "Continue an Existing Account",
    "继续使用现有账号"
  ],
  [
    "Crush Press Golem Lv.{level}",
    "冲压机魔像 Lv.{level}"
  ],
  [
    "Dawn Warden Helm x{quantity}",
    "黎明守望者头盔 x{quantity}"
  ],
  [
    "Defeated — Press R to revive",
    "已倒下 — 按 R 复活"
  ],
  [
    "Duskflower Spirit Lv.{level}",
    "暮色花精灵 Lv.{level}"
  ],
  [
    "Experience Pouch x{quantity}",
    "经验袋 x{quantity}"
  ],
  [
    "Failed to enter the minigame",
    "入场失败，请稍后再试"
  ],
  [
    "Final survival time {score}s",
    "最终生存时间 {score}秒"
  ],
  [
    "Great Marsh Witch Lv.{level}",
    "大沼泽女巫 Lv.{level}"
  ],
  [
    "Here's your standard reward.",
    "这是基础奖励。"
  ],
  [
    "Lights of Moonring Marshdell",
    "月环泽谷的灯火"
  ],
  [
    "Mecha Pumpkin is on cooldown",
    "机械南瓜正在等待重新召唤"
  ],
  [
    "Party best survival {score}s",
    "队伍最长生存 {score}秒"
  ],
  [
    "Please enter a recovery code",
    "请输入恢复码"
  ],
  [
    "Scrap Press Golem Lv.{level}",
    "废料压缩魔像 Lv.{level}"
  ],
  [
    "That raid could not be found",
    "找不到该团队副本"
  ],
  [
    "Threshold of the Root Hollow",
    "曙光根穴的入口"
  ],
  [
    "Track Cleaner Bot Lv.{level}",
    "轨道清扫机器人 Lv.{level}"
  ],
  [
    "고대 바람정령이 깨어났어요. 조심하세요, 스피키씨.",
    "远古风精灵苏醒了。请小心，斯皮奇。"
  ],
  [
    "사용 시 교단으로 돌아올 수 있는 귀환 아이템이다.",
    "使用后可返回教团的回城道具。"
  ],
  [
    "새싹 요정들까지 들떴네요. 여덟만 진정시켜 주세요.",
    "连嫩芽妖精也躁动起来了。请安抚八只。"
  ],
  [
    "선물이 도착했어요! M키로 우편함에서 받아 보세요.",
    "礼物到了！按 M 键前往邮箱领取。"
  ],
  [
    "소모 골드 {gold} · 재료 {points}pt",
    "消耗 {gold} 金币 · {points} pt 材料"
  ],
  [
    "쓰러졌어요 — 하단 아이콘을 눌러 파티원 시점 보기",
    "你已倒下——点击下方队友图标切换视角"
  ],
  [
    "오늘 몫의 사냥이에요. 종류는 상관없으니 열다섯만.",
    "完成今天的狩猎吧。种类不限，击败十五只即可。"
  ],
  [
    "이 아이템은 한 번에 하나씩만 사용할 수 있습니다.",
    "此物品每次只能使用一个。"
  ],
  [
    "ここはモナティウムの市庁舎よ。用があるなら言いな、幽霊。",
    "这里是莫纳提姆市政厅。有事就直说吧，幽灵。"
  ],
  [
    "ポーションはゲーム画面のホットキーからのみ使用できます。",
    "此物品只能在游戏画面中通过快捷键使用。"
  ],
  [
    "{name}님이 이미 다른 레이드에 참여 중입니다",
    "{name} 已在其他团队副本中"
  ],
  [
    "{stat}強化 {current} → {next}",
    "{stat} {current} → {next}"
  ],
  [
    "5분 동안 호박을 피해 최대한 멀리 달려 보세요.",
    "躲开滚来的假南瓜，在 5 分钟内尽可能跑得更远！"
  ],
  [
    "6分間、押し寄せるヌウリングの群れを生き延びましょう。",
    "在蜂拥而来的努噜灵群中坚持生存 6 分钟！"
  ],
  [
    "報酬テーブルが空のため、このアイテムは使用できません。",
    "奖励表为空，无法使用此物品。"
  ],
  [
    "復旧に失敗しました。しばらくしてから再度お試しください",
    "恢复失败，请稍后重试"
  ],
  [
    "開発用の武器 — 装備するとこうげき力+99,999。",
    "开发专用武器——装备时攻击力 +99,999"
  ],
  [
    "認証の有効期限が切れました。再度ログインしてください。",
    "认证已过期，请重新登录。"
  ],
  [
    "限定 {remaining}/{totalLimit}",
    "限购 {remaining}/{totalLimit}"
  ],
  [
    "消費ゴールド{gold} · 素材{points}pt",
    "消耗 {gold} 金币 · {points} pt 材料"
  ],
  [
    "Already assigned to {label}",
    "该按键已分配给“{label}”"
  ],
  [
    "Already in another minigame",
    "你已经在其他活动场景中"
  ],
  [
    "Black Marsh Toad Lv.{level}",
    "黑沼蟾蜍 Lv.{level}"
  ],
  [
    "Border Elf Scout Lv.{level}",
    "边境精灵斥候 Lv.{level}"
  ],
  [
    "Catching the Wandering Wind",
    "捕捉游荡之风"
  ],
  [
    "Choose a town to travel to.",
    "请选择目的地。"
  ],
  [
    "Cutter Automaton Lv.{level}",
    "切割自动机 Lv.{level}"
  ],
  [
    "Day {day} — {name} x{count}",
    "第{day}天 — {name} x{count}"
  ],
  [
    "Elven Scout Cap x{quantity}",
    "精灵斥候帽 x{quantity}"
  ],
  [
    "Fairy Tree Apprentice Staff",
    "妖精木学徒法杖"
  ],
  [
    "Great Tree Root Breastplate",
    "巨树根须胸甲"
  ],
  [
    "Molten Slimecore Lv.{level}",
    "熔融史莱姆核心 Lv.{level}"
  ],
  [
    "Moonshadow Witch Lv.{level}",
    "月影女巫 Lv.{level}"
  ],
  [
    "Night mode (darker scenery)",
    "夜间模式（调暗场景）"
  ],
  [
    "Permanent — click once more",
    "永久强化（再次点击确认）"
  ],
  [
    "Ride request sent to {name}",
    "已向 {name} 发送搭乘请求"
  ],
  [
    "Snowblind Shadow Lv.{level}",
    "雪盲暗影 Lv.{level}"
  ],
  [
    "Snowflower Fairy Lv.{level}",
    "雪花妖精 Lv.{level}"
  ],
  [
    "Supplies for the Pilgrimage",
    "朝圣补给"
  ],
  [
    "The Sealed Prototype Gigant",
    "封印原型巨像"
  ],
  [
    "The target channel is full.",
    "目标频道已满员。"
  ],
  [
    "Twilight Wolfkin Lv.{level}",
    "暮色狼人 Lv.{level}"
  ],
  [
    "Wandering Spirit Lv.{level}",
    "游荡亡灵 Lv.{level}"
  ],
  [
    "Watcher Eye Lens Lv.{level}",
    "监视之眼镜片 Lv.{level}"
  ],
  [
    "You cannot enter while dead",
    "倒地时无法进入"
  ],
  [
    "개발용 갑주 — 착용 시 최대체력 +999,999",
    "开发专用护甲——装备时最大 HP +999,999"
  ],
  [
    "레이드 사본 안에서는 채널을 변경할 수 없습니다.",
    "团队副本内无法切换频道。"
  ],
  [
    "몬스터를 찾으셨나요? 탭으로 타겟을 잡아 보세요.",
    "找到怪物了吗？点按怪物来选中它。"
  ],
  [
    "시도가 너무 잦습니다. 잠시 후 다시 시도해주세요",
    "尝试过于频繁，请稍后重试"
  ],
  [
    "안개 그림자가 길을 삼켜요. 열둘만 걷어 주세요.",
    "雾影正在吞噬道路。请清除十二只。"
  ],
  [
    "애정도 적립! (오늘 {points}/{cap})",
    "获得好感度！（今日 {points}/{cap}）"
  ],
  [
    "오늘 보상 {remaining}/{cap}회 남음",
    "今日剩余奖励次数：{remaining}/{cap}"
  ],
  [
    "한정 {remaining}/{totalLimit}",
    "限购 {remaining}/{totalLimit}"
  ],
  [
    "{name}님을 친구 목록에서 삭제하시겠습니까?",
    "要将 {name} 从好友列表中删除吗？"
  ],
  [
    "{population} / {capacity}人",
    "{population}/{capacity} 人"
  ],
  [
    "{population} / {capacity}명",
    "{population}/{capacity} 人"
  ],
  [
    "処理中に競合が発生しました。もう一度お試しください。",
    "处理请求时发生冲突，请重试。"
  ],
  [
    "既存のアカウントをお持ちですか？復旧コードで引き継ぐ",
    "已有账号？使用恢复码继续"
  ],
  [
    "開発用の兜 — 装備するとぼうぎょ力+99,999。",
    "开发专用头盔——装备时防御力 +99,999"
  ],
  [
    "親愛度アップ!(本日 {points}/{cap})",
    "获得好感度！（今日 {points}/{cap}）"
  ],
  [
    "偽のカボチャを避けて、できるだけ遠くまで進みましょう",
    "躲开滚来的假南瓜，坚持到最后并尽可能跑得更远！"
  ],
  [
    "現在は{max}個までしか購入できません（購入制限）",
    "目前最多可购买 {max} 个（已达购买上限）"
  ],
  [
    "郵便到着: {title} — 郵便箱で受け取れます",
    "收到邮件：{title} — 可前往邮箱领取"
  ],
  [
    "A new inquiry has arrived.",
    "收到新的咨询。"
  ],
  [
    "An unknown error occurred.",
    "发生未知错误。"
  ],
  [
    "Cinnamon Candy x{quantity}",
    "肉桂味硬糖 x{quantity}"
  ],
  [
    "Click or press ESC to skip",
    "单击或按 ESC 跳过"
  ],
  [
    "Core Watchtower Lv.{level}",
    "深处监控塔 Lv.{level}"
  ],
  [
    "Factory Overseer Automaton",
    "工业区监工自动机"
  ],
  [
    "Fake Pumpkin Dodge Ranking",
    "南瓜大逃亡 · 今日排行榜"
  ],
  [
    "Get closer to the signpost",
    "请再靠近活动立牌一些"
  ],
  [
    "Into the Power Core Depths",
    "深入动力核心"
  ],
  [
    "Marshfire Will-o'-the-Wisp",
    "沼泽鬼火"
  ],
  [
    "Moonlight Will-o'-the-Wisp",
    "月光鬼火"
  ],
  [
    "Please enter your inquiry.",
    "请输入咨询内容。"
  ],
  [
    "Pumpkin Cart Summon Ticket",
    "南瓜马车召唤券"
  ],
  [
    "Quest Reward: {questTitle}",
    "任务完成奖励：{questTitle}"
  ],
  [
    "Rail Cart Golem Lv.{level}",
    "废弃轨道矿车魔像 Lv.{level}"
  ],
  [
    "Ranking is scoped to today",
    "仅显示今日成绩"
  ],
  [
    "Recover another account...",
    "恢复其他账号…"
  ],
  [
    "Returning to town shortly…",
    "正在返回城镇…"
  ],
  [
    "Reward Cancellation Notice",
    "奖励发放取消通知"
  ],
  [
    "Sunbough Dragonscale Altar",
    "阳枝龙鳞祭坛"
  ],
  [
    "Supreme Crayon x{quantity}",
    "金蜡笔 x{quantity}"
  ],
  [
    "The code format is invalid",
    "恢复码格式无效"
  ],
  [
    "The invitation has expired",
    "邀请已过期"
  ],
  [
    "The Warden Spirits' Patrol",
    "黎明守护精灵的巡逻"
  ],
  [
    "To the Lamplit Factory Row",
    "前往灯火工厂区"
  ],
  [
    "Trial of the Border Scouts",
    "边境精灵斥候的试炼"
  ],
  [
    "Ultimate Pouch x{quantity}",
    "终极袋 x{quantity}"
  ],
  [
    "Waterweed Fairy Lv.{level}",
    "水草妖精 Lv.{level}"
  ],
  [
    "You cannot invite yourself",
    "不能邀请自己"
  ],
  [
    "가진 소모품 하나쯤 오늘 써 보시는 건 어때요?",
    "今天也挑一件随身的消耗品用用看吧？"
  ],
  [
    "망령들이 안식을 잃었어요. 열둘만 달래 주세요.",
    "亡灵失去了安宁。请安抚十二只。"
  ],
  [
    "복구에 실패했습니다. 잠시 후 다시 시도해주세요",
    "恢复失败，请稍后重试"
  ],
  [
    "쓰러졌어요 — 숫자키 1~4로 파티원 시점 보기",
    "你已倒下——按数字键 1～4 切换队友视角"
  ],
  [
    "요청에 실패했습니다 (HTTP {status})",
    "请求失败（HTTP {status}）。"
  ],
  [
    "자기 자신에게는 친구 요청을 보낼 수 없습니다.",
    "不能向自己发送好友申请。"
  ],
  [
    "좌클릭: 몬스터 타겟팅 / NPC 대화 (고정)",
    "左键：锁定怪物；与 NPC 对话（固定）"
  ],
  [
    "파티 생존 {partyStatus_status}",
    "队员存活：{partyStatus_status}"
  ],
  [
    "혼자 벅차다면, 동료와 함께 제단을 두드리세요.",
    "如果独自应付不来，就和伙伴们一起挑战祭坛吧。"
  ],
  [
    "お問い合わせを受け付けました。確認のうえ返信します。",
    "反馈已提交，开发者查看后会予以回复。"
  ],
  [
    "この復旧コードに対応するアカウントが見つかりません。",
    "找不到该恢复码对应的账号。"
  ],
  [
    "まだ再入場できません。しばらくしてからお試しください",
    "暂时无法再次进入，请稍后重试"
  ],
  [
    "レイドインスタンス内ではチャンネルを変更できません。",
    "团队副本内无法切换频道。"
  ],
  [
    "{day}日目 — {name} x{count}",
    "第{day}天 — {name} x{count}"
  ],
  [
    "{day}일차 — {name} x{count}",
    "第{day}天 — {name} x{count}"
  ],
  [
    "{name} — 마차 하차 (핫키 {key})",
    "{name} — 下车（快捷键：{key}）"
  ],
  [
    "{name}さんをフレンドリストから削除しますか？",
    "要将 {name} 从好友列表中删除吗？"
  ],
  [
    "{score}m (Top {percent}%)",
    "{score}m（前 {percent}%）"
  ],
  [
    "{score}s (Top {percent}%)",
    "{score}秒（前 {percent}%）"
  ],
  [
    "「{questTitle}」クエスト完了報酬です。",
    "这是完成“{questTitle}”任务的奖励。"
  ],
  [
    "該当するニックネームのプレイヤーが見つかりません。",
    "找不到使用该昵称的玩家。"
  ],
  [
    "管理者により接続が終了されました。再接続できます。",
    "管理员已关闭你的连接。你现在可以重新连接。"
  ],
  [
    "取得に失敗しました — パネルを開き直してください",
    "加载失败，请重新打开面板"
  ],
  [
    "位置: ゾーン {zone} ({x}, {z})",
    "位置：区域 {zone}（{x}, {z}）"
  ],
  [
    "下河夏荷、エピッドゲームズをぜひ応援してください。",
    "哈哈哈哈！请多多支持 Epid Games！"
  ],
  [
    "Ashdust Spirit Lv.{level}",
    "灰尘精灵 Lv.{level}"
  ],
  [
    "Ashen Sarcophagus Sanctum",
    "灰烬石棺圣所"
  ],
  [
    "Beastfolk Leather Greaves",
    "兽族皮革护胫"
  ],
  [
    "Beastfolk Warrior Greaves",
    "兽族战士护胫"
  ],
  [
    "Chieftain of the Duskwood",
    "暮色森林大酋长"
  ],
  [
    "Coil Spiderbot Lv.{level}",
    "线圈蜘蛛机器人 Lv.{level}"
  ],
  [
    "Dawn Elf Guard Lv.{level}",
    "黎明精灵守卫 Lv.{level}"
  ],
  [
    "Developer's Pumpkin Armor",
    "开发者的南瓜护甲"
  ],
  [
    "Developer's Pumpkin Staff",
    "开发者的南瓜法杖"
  ],
  [
    "Duskwing Fairy Lv.{level}",
    "暮翼妖精 Lv.{level}"
  ],
  [
    "Failed to change channel.",
    "频道切换失败。"
  ],
  [
    "Fairy Order Patroller Top",
    "妖精团巡逻者上衣"
  ],
  [
    "Frost-star Ancient Spirit",
    "霜星远古精灵"
  ],
  [
    "Gearing Up for the Depths",
    "深入前的整备"
  ],
  [
    "Gravekeeper Statue Wraith",
    "守墓石像亡灵"
  ],
  [
    "Impbots That Devour Flame",
    "吞噬火焰的小恶魔机器人"
  ],
  [
    "Ironglow Chimney District",
    "铁辉烟囱区"
  ],
  [
    "Marsh Witch's Brimmed Hat",
    "湿地女巫宽檐帽"
  ],
  [
    "Mecha Pumpkin x{quantity}",
    "机械南瓜 x{quantity}"
  ],
  [
    "Move closer to the portal",
    "请靠近传送门"
  ],
  [
    "New patch notes available",
    "有新的更新日志"
  ],
  [
    "Oil Lamp Will-o'-the-Wisp",
    "油灯鬼火"
  ],
  [
    "Party Entry (1–4 players)",
    "组队入场（1～4人）"
  ],
  [
    "Please claim your reward.",
    "请领取奖励。"
  ],
  [
    "Reply sent to {nickname}.",
    "已向 {nickname} 发送回复。"
  ],
  [
    "Skill effect glow (bloom)",
    "技能特效辉光（Bloom）"
  ],
  [
    "Soothing the Young Dragon",
    "安抚幼龙"
  ],
  [
    "Sunbloom Fairy Lv.{level}",
    "阳花妖精 Lv.{level}"
  ],
  [
    "The Lightning Rod Knights",
    "避雷针骑士团"
  ],
  [
    "The potion is on cooldown",
    "药水正在冷却"
  ],
  [
    "Total {total} {priceName}",
    "总计 {total} {priceName}"
  ],
  [
    "개발용 무기 — 착용 시 공격력 +99,999",
    "开发专用武器——装备时攻击力 +99,999"
  ],
  [
    "개발용 투구 — 착용 시 방어력 +99,999",
    "开发专用头盔——装备时防御力 +99,999"
  ],
  [
    "기존 계정이 있으신가요? 복구 코드로 이어하기",
    "已有账号？使用恢复码继续"
  ],
  [
    "다른 기기에서 로그인되어 연결이 종료되었습니다",
    "检测到其他设备登录，此连接已断开"
  ],
  [
    "레벨 {level} 이상만 입장할 수 있습니다",
    "需要达到 {level} 级才能进入"
  ],
  [
    "메카 드론 - 집중 사격 x{quantity}",
    "机械无人机·集中射击 x{quantity}"
  ],
  [
    "문의가 접수되었습니다. 확인 후 답변드립니다.",
    "反馈已提交，开发者查看后会予以回复。"
  ],
  [
    "본인이 받은 친구 요청만 응답할 수 있습니다.",
    "只能处理发给自己的好友申请。"
  ],
  [
    "봉인 제단이 있는 맵에서만 입장할 수 있습니다",
    "只能从封印祭坛所在的地图进入"
  ],
  [
    "상점에서 하나만 사 주세요. 단골이 최고예요.",
    "去商店随便买一样东西吧。常客总是最受欢迎的。"
  ],
  [
    "어떤 장비가 들어있는지 알 수 없는 주머니다.",
    "谁也不知道里面装着什么装备。"
  ],
  [
    "원활한 플레이를 위해 화면을 가로로 돌려주세요",
    "请将设备转为横屏，以获得更流畅的游戏体验"
  ],
  [
    "이번 주 큰 몫이에요. 백 마리, 종류 불문.",
    "这是本周的大任务。讨伐一百只，种类不限。"
  ],
  [
    "인증이 만료되었습니다. 다시 로그인해 주세요.",
    "认证已过期，请重新登录。"
  ],
  [
    "주변 반경 {radius}m 적에게 광역 피해",
    "对周围 {radius}m 内的敌人造成范围伤害"
  ],
  [
    "화면 표시가 중단되었습니다. 새로고침해 주세요",
    "画面显示已停止，请刷新页面"
  ],
  [
    "すでに最高レベルのため、経験値袋は使用できません。",
    "已达到最高等级，无法使用经验袋。"
  ],
  [
    "レベル差が大きいパーティメンバーと狩りをしています",
    "队友等级远高于你"
  ],
  [
    "{name} — 発動（ホットキー {key}）",
    "{name} — 发动（快捷键：{key}）"
  ],
  [
    "{name} — 召喚（ホットキー {key}）",
    "{name} — 召唤（快捷键：{key}）"
  ],
  [
    "{nickname} さんへ返信を送信しました。",
    "已向 {nickname} 发送回复。"
  ],
  [
    "{nickname}에게 답변을 전송했습니다.",
    "已向 {nickname} 发送回复。"
  ],
  [
    "{score}m (상위 {percent}%)",
    "{score}m（前 {percent}%）"
  ],
  [
    "{score}초 (상위 {percent}%)",
    "{score}秒（前 {percent}%）"
  ],
  [
    "別の端末でログインされたため、接続が終了しました",
    "检测到其他设备登录，此连接已断开"
  ],
  [
    "格納庫防衛ドローン（召喚） Lv.{level}",
    "机库防卫无人机（召唤） Lv.{level}"
  ],
  [
    "画面表示が停止しました。ページを更新してください",
    "画面显示已停止，请刷新页面"
  ],
  [
    "快適にプレイするため、画面を横向きにしてください",
    "请将设备转为横屏，以获得更流畅的游戏体验"
  ],
  [
    "任意のキーを押してください（ESCでキャンセル）",
    "请按任意键（ESC 取消）"
  ],
  [
    "自分が受け取ったフレンド申請にのみ応答できます。",
    "只能处理发给自己的好友申请。"
  ],
  [
    "Already in another party",
    "对方已在其他队伍中"
  ],
  [
    "Cinder Spirit Lv.{level}",
    "烬火精灵 Lv.{level}"
  ],
  [
    "Crayon Pouch x{quantity}",
    "蜡笔袋 x{quantity}"
  ],
  [
    "Dawn Dragonscale Soldier",
    "黎明龙鳞兵"
  ],
  [
    "Developer's Pumpkin Helm",
    "开发者的南瓜头盔"
  ],
  [
    "Dragonkin Battle Greaves",
    "龙族战斗护胫"
  ],
  [
    "Dragonscale-etched Staff",
    "龙鳞刻纹法杖"
  ],
  [
    "Ember Dragonscale Tyrant",
    "烬火龙鳞暴君"
  ],
  [
    "Failed to enter the raid",
    "进入团队副本失败"
  ],
  [
    "Failed to join the queue",
    "匹配失败，请稍后再试"
  ],
  [
    "Failed to return to town",
    "回城失败"
  ],
  [
    "Failed to use the potion",
    "使用药水失败"
  ],
  [
    "Fairy Forest Scout Staff",
    "妖精森林斥候法杖"
  ],
  [
    "Fake Pumpkin Dodge Track",
    "南瓜大逃亡赛道"
  ],
  [
    "Forest Beastfolk Trapper",
    "森林兽人陷阱猎手"
  ],
  [
    "Frost-star Shard Greaves",
    "霜星碎片护胫"
  ],
  [
    "Frostbloom Crystal Staff",
    "霜花水晶法杖"
  ],
  [
    "Garnet Berry x{quantity}",
    "石榴石果实 x{quantity}"
  ],
  [
    "Garnet Punch x{quantity}",
    "石榴石水果羹 x{quantity}"
  ],
  [
    "Great Gravekeeper Spirit",
    "守墓大亡灵"
  ],
  [
    "Heat-suit Mole Beastfolk",
    "隔热服鼹鼠人"
  ],
  [
    "Invalid channel request.",
    "频道请求无效。"
  ],
  [
    "Lamplit Factory District",
    "灯火工厂区"
  ],
  [
    "MAX Enhancement Reached!",
    "强化达到 MAX！"
  ],
  [
    "Mecha Drone - Focus Fire",
    "机械无人机·集中射击"
  ],
  [
    "Mossback Toad Lv.{level}",
    "苔背蟾蜍 Lv.{level}"
  ],
  [
    "Not equipped — no effect",
    "尚未装备，属性加成不会生效"
  ],
  [
    "NuruLing Busters Ranking",
    "努噜灵大作战 · 今日排行榜"
  ],
  [
    "Patrol Drone (Old Model)",
    "巡逻无人机（旧型）"
  ],
  [
    "Please check your input.",
    "请检查输入内容。"
  ],
  [
    "Police Car Summon Ticket",
    "警车召唤券"
  ],
  [
    "Supreme Crayons: {count}",
    "持有金蜡笔 {count} 个"
  ],
  [
    "Switch to desktop layout",
    "切换至 PC 布局"
  ],
  [
    "The party request failed",
    "队伍请求失败"
  ],
  [
    "Total Stats (Lv {level})",
    "总属性（Lv.{level}）"
  ],
  [
    "Wailing Ghost Lv.{level}",
    "哀嚎幽灵 Lv.{level}"
  ],
  [
    "You don't own this item.",
    "你没有此物品。"
  ],
  [
    "You must buy at least 1.",
    "至少需要购买 1 个"
  ],
  [
    "격납고 방위 드론(소환) Lv.{level}",
    "机库防卫无人机（召唤） Lv.{level}"
  ],
  [
    "대상 HP {pct}% 이하일 때 위력 강화",
    "目标 HP 低于或等于 {pct}% 时威力提升"
  ],
  [
    "매일 랭킹에 따라 보상을 획득할 수 있습니다",
    "每日还可根据排名获得奖励"
  ],
  [
    "보유 {count}개 · 회복 {heal}%",
    "持有 {count} 个 · 恢复 {heal}%"
  ],
  [
    "아직 이동할 수 있는 다른 마을이 없습니다.",
    "目前没有其他可传送的城镇。"
  ],
  [
    "오늘은 애정도가 가득해요 (일일 상한 도달)",
    "今天的好感度已满（已达到每日上限）"
  ],
  [
    "이곳에서는 귀환할 수 없습니다 (필드 전용)",
    "无法从这里回城（仅限野外）"
  ],
  [
    "해당 닉네임의 플레이어를 찾을 수 없습니다.",
    "找不到使用该昵称的玩家。"
  ],
  [
    "このアイテムは一度に1つずつしか使用できません。",
    "此物品每次只能使用一个。"
  ],
  [
    "ダブルクリックで装備 · 管理は装備画面(E)で",
    "双击穿戴 · 按 E 打开装备界面"
  ],
  [
    "{amount} On-Level Bonus",
    "同等级加成 {amount}"
  ],
  [
    "{name} has gone offline",
    "{name} 已离线"
  ],
  [
    "{name}さんがすでに他のレイドに参加中です",
    "{name} 已在其他团队副本中"
  ],
  [
    "28일차를 넘기면 기본 보상이 지급됩니다.",
    "超过第 28 天后将发放基础奖励。"
  ],
  [
    "暴走整備ユニット（召喚） Lv.{level}",
    "暴走维修单元（召唤） Lv.{level}"
  ],
  [
    "該当する復旧コードのアカウントが見つかりません",
    "未找到与此恢复码对应的账号"
  ],
  [
    "今週の大きな役目です。百体、種類は問いません。",
    "这是本周的大任务。讨伐一百只，种类不限。"
  ],
  [
    "認証情報が無効です。再度ログインしてください。",
    "认证信息无效，请重新登录。"
  ],
  [
    "下河夏荷, 에피드게임즈 많이 사랑해주세요.",
    "哈哈哈哈！请多多支持 Epid Games！"
  ],
  [
    "Awakening in the Temple",
    "在教团中醒来"
  ],
  [
    "Before the Ancient Wind",
    "直面远古之风"
  ],
  [
    "Close the Watching Eyes",
    "闭上监视之眼"
  ],
  [
    "Couldn't start the game",
    "无法启动游戏"
  ],
  [
    "Dragonscale Breastplate",
    "龙鳞胸甲"
  ],
  [
    "Ember Lizard Lv.{level}",
    "烬火蜥蜴 Lv.{level}"
  ],
  [
    "Entering Gearfield Moor",
    "踏入齿轮原野"
  ],
  [
    "Failed to load location",
    "无法加载位置"
  ],
  [
    "Final distance {score}m",
    "最终距离 {score}m"
  ],
  [
    "Forest Fairy Lv.{level}",
    "森林妖精 Lv.{level}"
  ],
  [
    "Gatekeepers of the Dawn",
    "黎明守门人"
  ],
  [
    "Gaunt Shadow Lv.{level}",
    "枯瘦暗影 Lv.{level}"
  ],
  [
    "Lightning Strike Spirit",
    "落雷精灵"
  ],
  [
    "Lv10武器 — 装備するとこうげき力+13。",
    "Lv10 武器——装备时攻击力 +13"
  ],
  [
    "Lv15武器 — 装備するとこうげき力+17。",
    "Lv15 武器——装备时攻击力 +17"
  ],
  [
    "Lv20武器 — 装備するとこうげき力+22。",
    "Lv20 武器——装备时攻击力 +22"
  ],
  [
    "Lv25武器 — 装備するとこうげき力+26。",
    "Lv25 武器——装备时攻击力 +26"
  ],
  [
    "Lv30武器 — 装備するとこうげき力+31。",
    "Lv30 武器——装备时攻击力 +31"
  ],
  [
    "Lv40武器 — 装備するとこうげき力+40。",
    "Lv40 武器——装备时攻击力 +40"
  ],
  [
    "Lv50武器 — 装備するとこうげき力+49。",
    "Lv50 武器——装备时攻击力 +49"
  ],
  [
    "Minigame data not found",
    "未找到小游戏信息"
  ],
  [
    "Overload Circuit Spirit",
    "过载电路精灵"
  ],
  [
    "Pumpkin Festival Bundle",
    "南瓜庆典礼包"
  ],
  [
    "Putting the Gear to Use",
    "熟悉整备用品"
  ],
  [
    "Quick Match (4 players)",
    "四人快速匹配"
  ],
  [
    "Railway Conductor Ghost",
    "旧铁路幽灵列车长"
  ],
  [
    "Ranking — Level Top 100",
    "排行榜 — 等级 Top 100"
  ],
  [
    "Revisit onboarding tips",
    "重新查看新手引导提示"
  ],
  [
    "Sealed Prototype Gigant",
    "封印原型巨像"
  ],
  [
    "Spark Spirit Lv.{level}",
    "电火花精灵 Lv.{level}"
  ],
  [
    "Sprout Fairy Lv.{level}",
    "嫩芽妖精 Lv.{level}"
  ],
  [
    "This Week's Subjugation",
    "本周讨伐"
  ],
  [
    "Use with hotkey ({key})",
    "快捷键：{key}"
  ],
  [
    "Young Dragon Lv.{level}",
    "幼龙 Lv.{level}"
  ],
  [
    "Your HP is already full",
    "HP 已满"
  ],
  [
    "개발자의 호박 지팡이 x{quantity}",
    "开发者的南瓜法杖 x{quantity}"
  ],
  [
    "닉네임은 최초 1회만 지정할 수 있습니다.",
    "昵称只能设置一次。"
  ],
  [
    "요정나무 견습 지팡이 x{quantity}",
    "妖精木学徒法杖 x{quantity}"
  ],
  [
    "요정숲 정찰자 지팡이 x{quantity}",
    "妖精森林斥候法杖 x{quantity}"
  ],
  [
    "위치: 존 {zone} ({x}, {z})",
    "位置：区域 {zone}（{x}, {z}）"
  ],
  [
    "이미 다른 계정에 연결된 구글 계정입니다.",
    "此 Google 账号已经关联到其他账号。"
  ],
  [
    "이미 수령했거나 존재하지 않는 우편입니다.",
    "此邮件已领取或不存在。"
  ],
  [
    "이번 달 {count}일차까지 수령했습니다",
    "本月已领取至第 {count} 天"
  ],
  [
    "입간판이 있는 맵에서만 입장할 수 있습니다",
    "请在活动立牌所在的地图进入"
  ],
  [
    "퀘스트 보상 처리 중 오류가 발생했습니다.",
    "领取任务奖励时发生错误。"
  ],
  [
    "퀘스트 완료 보상: {questTitle}",
    "任务完成奖励：{questTitle}"
  ],
  [
    "폭주 정비 유닛(소환) Lv.{level}",
    "暴走维修单元（召唤） Lv.{level}"
  ],
  [
    "호박밭 적립 {points}/{cap}pt",
    "南瓜田累计 {points}/{cap}pt"
  ],
  [
    "シナモン健康キャンディ x{quantity}",
    "肉桂味健康硬糖 x{quantity}"
  ],
  [
    "パーティーリーダーのみ入場をリクエストできます",
    "只有队长可以发起入场"
  ],
  [
    "メカドローン・集中射撃 x{quantity}",
    "机械无人机·集中射击 x{quantity}"
  ],
  [
    "{name} — 발동 (핫키 {key})",
    "{name} — 发动（快捷键：{key}）"
  ],
  [
    "{name} — 소환 (핫키 {key})",
    "{name} — 召唤（快捷键：{key}）"
  ],
  [
    "{name}님에게 동승 요청을 보냈습니다",
    "已向 {name} 发送搭乘请求"
  ],
  [
    "{name}님에게 친구 요청을 보냈습니다",
    "已向 {name} 发送好友申请"
  ],
  [
    "{name}님에게 파티 초대를 보냈습니다",
    "已向 {name} 发送组队邀请"
  ],
  [
    "{name}님이 마차 동승을 요청했습니다",
    "{name} 请求搭乘你的马车"
  ],
  [
    "{name}さんにパーティー招待を送りました",
    "已向 {name} 发送组队邀请"
  ],
  [
    "{nickname}에게 답변을 입력하세요",
    "回复 {nickname}"
  ],
  [
    "{score}秒（上位{percent}%）",
    "{score}秒（前 {percent}%）"
  ],
  [
    "{score}m（上位{percent}%）",
    "{score}m（前 {percent}%）"
  ],
  [
    "本日は親愛度が満タンです(1日の上限に到達)",
    "今天的好感度已满（已达到每日上限）"
  ],
  [
    "封印された試作ギガント Lv.{level}",
    "封印原型巨像 Lv.{level}"
  ],
  [
    "工業地帯監督オートマタ Lv.{level}",
    "工业区监工自动机 Lv.{level}"
  ],
  [
    "合計 {total} {priceName}",
    "总计 {total} {priceName}"
  ],
  [
    "接続が切れました — 再読み込みしてください",
    "连接已断开，请刷新页面"
  ],
  [
    "開発者のカボチャの兜 x{quantity}",
    "开发者的南瓜头盔 x{quantity}"
  ],
  [
    "開発者のカボチャの鎧 x{quantity}",
    "开发者的南瓜护甲 x{quantity}"
  ],
  [
    "開発者のカボチャの杖 x{quantity}",
    "开发者的南瓜法杖 x{quantity}"
  ],
  [
    "湿地魔女のつば広帽子 x{quantity}",
    "湿地女巫宽檐帽 x{quantity}"
  ],
  [
    "湿地ヒキガエルの使い魔 Lv.{level}",
    "湿地蟾蜍使魔 Lv.{level}"
  ],
  [
    "所持{count}個 · 回復{heal}%",
    "持有 {count} 个 · 恢复 {heal}%"
  ],
  [
    "妖精団の初心者の上着 x{quantity}",
    "妖精团新手上衣 x{quantity}"
  ],
  [
    "妖精団の巡回者の上着 x{quantity}",
    "妖精团巡逻者上衣 x{quantity}"
  ],
  [
    "周囲半径{radius}mの敵に範囲ダメージ",
    "对周围 {radius}m 内的敌人造成范围伤害"
  ],
  [
    "A Letter from Monatium",
    "来自莫纳提姆的信"
  ],
  [
    "Apprentice Marsh Witch",
    "见习湿地女巫"
  ],
  [
    "Back to nickname setup",
    "返回昵称设置"
  ],
  [
    "Beastfolk Leather Hood",
    "兽族皮革兜帽"
  ],
  [
    "Beastfolk Warrior Helm",
    "兽族战士头盔"
  ],
  [
    "Elif Pouch x{quantity}",
    "水晶叶袋 x{quantity}"
  ],
  [
    "Ember Flameheart Altar",
    "烬火炎心祭坛"
  ],
  [
    "Ember Hatchling Dragon",
    "烬火幼龙"
  ],
  [
    "Ember Will-o'-the-Wisp",
    "余烬鬼火"
  ],
  [
    "Fairy Order Novice Top",
    "妖精团新手上衣"
  ],
  [
    "Forest Beastfolk Scout",
    "森林兽人侦察兵"
  ],
  [
    "Frost Will-o'-the-Wisp",
    "冰霜鬼火"
  ],
  [
    "Gear Pouch x{quantity}",
    "装备袋 x{quantity}"
  ],
  [
    "Gold Pouch x{quantity}",
    "金币袋 x{quantity}"
  ],
  [
    "Left-click target rule",
    "左键选怪规则"
  ],
  [
    "Lv10 무기 — 착용 시 공격력 +13",
    "Lv10 武器——装备时攻击力 +13"
  ],
  [
    "Lv15 무기 — 착용 시 공격력 +17",
    "Lv15 武器——装备时攻击力 +17"
  ],
  [
    "Lv20 무기 — 착용 시 공격력 +22",
    "Lv20 武器——装备时攻击力 +22"
  ],
  [
    "Lv25 무기 — 착용 시 공격력 +26",
    "Lv25 武器——装备时攻击力 +26"
  ],
  [
    "Lv30 무기 — 착용 시 공격력 +31",
    "Lv30 武器——装备时攻击力 +31"
  ],
  [
    "Lv40 무기 — 착용 시 공격력 +40",
    "Lv40 武器——装备时攻击力 +40"
  ],
  [
    "Lv50 무기 — 착용 시 공격력 +49",
    "Lv50 武器——装备时攻击力 +49"
  ],
  [
    "Match found! Entering…",
    "匹配成功，正在入场…"
  ],
  [
    "Mist Shadow Lv.{level}",
    "雾影 Lv.{level}"
  ],
  [
    "Power Line Watch Drone",
    "输电监控无人机"
  ],
  [
    "Requesting raid entry…",
    "正在请求进入团队副本…"
  ],
  [
    "Return was interrupted",
    "回城已中断"
  ],
  [
    "Snuffing the Oil Lamps",
    "熄灭油灯"
  ],
  [
    "Soot Impbot Lv.{level}",
    "烟灰小恶魔机器人 Lv.{level}"
  ],
  [
    "tap the revival prompt",
    "点按复活提示"
  ],
  [
    "That player is offline",
    "该玩家不在线"
  ],
  [
    "The Runaway Power Core",
    "暴走动力核心"
  ],
  [
    "The Sealed Dragonscale",
    "被封印的龙鳞"
  ],
  [
    "Thunder Pylon Guardian",
    "雷电塔守护机"
  ],
  [
    "To the Duskwood Border",
    "前往暮色森林边境"
  ],
  [
    "Today's best: {score}m",
    "今日最佳 {score}m"
  ],
  [
    "Today's best: {score}s",
    "今日最长生存 {score}秒"
  ],
  [
    "Tomb Shadow Lv.{level}",
    "墓影 Lv.{level}"
  ],
  [
    "Waiting… {count}/{max}",
    "匹配中… {count}/{max}"
  ],
  [
    "You are not in a party",
    "你不在队伍中"
  ],
  [
    "가짜 호박을 피해 최대한 멀리 나아가세요",
    "躲开滚来的假南瓜，坚持到最后并尽可能跑得更远！"
  ],
  [
    "개발자의 호박 갑주 x{quantity}",
    "开发者的南瓜护甲 x{quantity}"
  ],
  [
    "개발자의 호박 투구 x{quantity}",
    "开发者的南瓜头盔 x{quantity}"
  ],
  [
    "계피맛 건강 알사탕 x{quantity}",
    "肉桂味健康硬糖 x{quantity}"
  ],
  [
    "교단(마을)으로 귀환 · 체력 전량 회복",
    "返回教团（城镇）并恢复全部生命值"
  ],
  [
    "늪안개 주문 지팡이 x{quantity}",
    "沼雾咒术法杖 x{quantity}"
  ],
  [
    "더블클릭으로 장착 · 관리는 장비창(E)",
    "双击穿戴 · 按 E 打开装备界面"
  ],
  [
    "서리꽃 결정 지팡이 x{quantity}",
    "霜花水晶法杖 x{quantity}"
  ],
  [
    "시전 중에는 채널을 변경할 수 없습니다.",
    "施法期间无法切换频道。"
  ],
  [
    "여명빛 거목 지팡이 x{quantity}",
    "晨曦巨树法杖 x{quantity}"
  ],
  [
    "요정단 순찰자 상의 x{quantity}",
    "妖精团巡逻者上衣 x{quantity}"
  ],
  [
    "요정단 초심자 상의 x{quantity}",
    "妖精团新手上衣 x{quantity}"
  ],
  [
    "이번 달 출석 보상이 설정되지 않았습니다",
    "本月未设置签到奖励"
  ],
  [
    "적중 시 {sec}초간 화상(지속 피해)",
    "命中时使目标灼烧 {sec} 秒（持续伤害）"
  ],
  [
    "전투 중에는 채널을 변경할 수 없습니다.",
    "战斗期间无法切换频道。"
  ],
  [
    "존재하지 않거나 이미 처리된 요청입니다.",
    "该好友申请不存在或已被处理。"
  ],
  [
    "지금은 장비 강화를 이용할 수 없습니다.",
    "目前无法使用装备强化。"
  ],
  [
    "カボチャ馬車の召喚券 x{quantity}",
    "南瓜马车召唤券 x{quantity}"
  ],
  [
    "かぼちゃ畑 {points}/{cap}pt",
    "南瓜田累计 {points}/{cap}pt"
  ],
  [
    "クエスト報酬の処理中にエラーが発生しました。",
    "领取任务奖励时发生错误。"
  ],
  [
    "クエスト完了報酬: {questTitle}",
    "任务完成奖励：{questTitle}"
  ],
  [
    "ごくまれに… 最上級クレパスが手に入る袋だ。",
    "极少数袋子里……会藏着一支金蜡笔。"
  ],
  [
    "{name} could not join",
    "{name} 未能一同入场"
  ],
  [
    "{name}님이 친구 요청을 보냈습니다",
    "{name} 向你发送了好友申请"
  ],
  [
    "{name}が馬車への同乗を希望しています",
    "{name} 请求搭乘你的马车"
  ],
  [
    "{name}さんがパーティーに招待しました",
    "{name} 邀请你加入队伍"
  ],
  [
    "{name}さんがフレンド申請を送りました",
    "{name} 向你发送了好友申请"
  ],
  [
    "{name}さんにフレンド申請を送りました",
    "已向 {name} 发送好友申请"
  ],
  [
    "+{amount} Party Bonus",
    "队伍加成 +{amount}"
  ],
  [
    "28日目を超えると基本報酬が支給されます。",
    "超过第 28 天后将发放基础奖励。"
  ],
  [
    "廃線トロッコゴーレム Lv.{level}",
    "废弃轨道矿车魔像 Lv.{level}"
  ],
  [
    "故障した偵察ドローン Lv.{level}",
    "故障侦察无人机 Lv.{level}"
  ],
  [
    "今月のログインボーナスが設定されていません",
    "本月未设置签到奖励"
  ],
  [
    "今月は{count}日目まで受け取りました",
    "本月已领取至第 {count} 天"
  ],
  [
    "今は見ることができないパーティメンバーです",
    "暂时无法观看这名队友"
  ],
  [
    "進行 {current}/{target}",
    "进度：{current}/{target}"
  ],
  [
    "鎌使いの野ねずみ獣人 Lv.{level}",
    "镰刀田鼠人 Lv.{level}"
  ],
  [
    "煤まみれインプボット Lv.{level}",
    "烟灰小恶魔机器人 Lv.{level}"
  ],
  [
    "毎日のランキングに応じて報酬を獲得できます",
    "每日还可根据排名获得奖励"
  ],
  [
    "牽引アームオートマタ Lv.{level}",
    "牵引钳自动机 Lv.{level}"
  ],
  [
    "溶接火花インプボット Lv.{level}",
    "焊火小恶魔机器人 Lv.{level}"
  ],
  [
    "巡回ドローン（旧型） Lv.{level}",
    "巡逻无人机（旧型） Lv.{level}"
  ],
  [
    "妖精樹の見習いの杖 x{quantity}",
    "妖精木学徒法杖 x{quantity}"
  ],
  [
    "妖精の森の斥候の杖 x{quantity}",
    "妖精森林斥候法杖 x{quantity}"
  ],
  [
    "Ash Wraith Lv.{level}",
    "灰烬亡灵 Lv.{level}"
  ],
  [
    "Cinnamon Health Candy",
    "肉桂味健康硬糖"
  ],
  [
    "Dawn Fairy Lv.{level}",
    "黎明妖精 Lv.{level}"
  ],
  [
    "Dawnlight Root Hollow",
    "曙光根穴"
  ],
  [
    "Dismantle the Cutters",
    "拆除切割自动机"
  ],
  [
    "Dragonkin Battle Helm",
    "龙族战斗头盔"
  ],
  [
    "Emberfall Lava Cavern",
    "烬火熔岩窟"
  ],
  [
    "Exhaust Cleaner Drone",
    "排气清扫无人机"
  ],
  [
    "Frost-star Shard Helm",
    "霜星碎片头盔"
  ],
  [
    "Frostreach Snow Hills",
    "霜星雪岭"
  ],
  [
    "Gravekeeper's Greaves",
    "守墓人护胫"
  ],
  [
    "Hide HUD (Screenshot)",
    "隐藏 HUD（截图）"
  ],
  [
    "Ice Spirit Lv.{level}",
    "寒冰精灵 Lv.{level}"
  ],
  [
    "Lava Will-o'-the-Wisp",
    "熔岩鬼火"
  ],
  [
    "Loading channel info…",
    "正在加载频道信息…"
  ],
  [
    "Lv{level}에 해금되는 스킬입니다",
    "该技能将在 Lv.{level} 解锁"
  ],
  [
    "Lv5武器 — 装備するとこうげき力+8。",
    "Lv5 武器——装备时攻击力 +8"
  ],
  [
    "Marsh Witch Preceptor",
    "沼泽女巫导师"
  ],
  [
    "Morning at the Temple",
    "教团的清晨"
  ],
  [
    "No products for sale.",
    "没有正在出售的商品。"
  ],
  [
    "Not enough materials.",
    "材料不足。"
  ],
  [
    "Other players' sounds",
    "其他玩家的声音"
  ],
  [
    "Overload Power Spirit",
    "暴走电力精灵"
  ],
  [
    "Pale Will-o'-the-Wisp",
    "苍白鬼火"
  ],
  [
    "Quest reward claimed.",
    "已领取任务奖励。"
  ],
  [
    "Return is on cooldown",
    "回城正在冷却"
  ],
  [
    "Root Golem Lv.{level}",
    "树根魔像 Lv.{level}"
  ],
  [
    "Root-entangled Wraith",
    "根缚亡灵"
  ],
  [
    "Sickle Vole Beastfolk",
    "镰刀田鼠人"
  ],
  [
    "Snowfrost Spirit Robe",
    "雪霜精灵长袍"
  ],
  [
    "Source of the Wailing",
    "哀嚎之源"
  ],
  [
    "Speaki wrote it down!",
    "斯皮奇已经记下来了！"
  ],
  [
    "That ally is down too",
    "这名队友也倒下了"
  ],
  [
    "To the Moonmist Marsh",
    "前往月雾湿地"
  ],
  [
    "Wandering Wind Spirit",
    "游荡风精灵"
  ],
  [
    "Weapon Tuning (Debug)",
    "武器调校（调试）"
  ],
  [
    "Wisps in the Blizzard",
    "暴风雪中的鬼火"
  ],
  [
    "강화 실패 — {level}강으로 하락",
    "强化失败：降至 +{level}"
  ],
  [
    "견인 집게 오토마타 Lv.{level}",
    "牵引钳自动机 Lv.{level}"
  ],
  [
    "곡성 봉인 지팡이 x{quantity}",
    "哀鸣封印法杖 x{quantity}"
  ],
  [
    "공단 감독 오토마타 Lv.{level}",
    "工业区监工自动机 Lv.{level}"
  ],
  [
    "구글 로그인 정보가 유효하지 않습니다.",
    "Google 登录信息无效。"
  ],
  [
    "눈서리 정령 로브 x{quantity}",
    "雪霜精灵长袍 x{quantity}"
  ],
  [
    "다운 상태 — 동료의 부활을 기다리세요",
    "你已倒下——等待队友救援"
  ],
  [
    "달무리 마녀 로브 x{quantity}",
    "月晕女巫长袍 x{quantity}"
  ],
  [
    "방열복 두더지 수인 Lv.{level}",
    "隔热服鼹鼠人 Lv.{level}"
  ],
  [
    "봉인된 시제 기간트 Lv.{level}",
    "封印原型巨像 Lv.{level}"
  ],
  [
    "서리별 파편 각반 x{quantity}",
    "霜星碎片护胫 x{quantity}"
  ],
  [
    "서리별 파편 투구 x{quantity}",
    "霜星碎片头盔 x{quantity}"
  ],
  [
    "습지 두꺼비 사역마 Lv.{level}",
    "湿地蟾蜍使魔 Lv.{level}"
  ],
  [
    "엘프 사냥꾼 각반 x{quantity}",
    "精灵猎手护胫 x{quantity}"
  ],
  [
    "여명 파수꾼 각반 x{quantity}",
    "黎明守望者护胫 x{quantity}"
  ],
  [
    "여명 파수꾼 투구 x{quantity}",
    "黎明守望者头盔 x{quantity}"
  ],
  [
    "연결이 끊겼습니다 — 새로고침해 주세요",
    "连接已断开，请刷新页面"
  ],
  [
    "용린 각인 지팡이 x{quantity}",
    "龙鳞刻纹法杖 x{quantity}"
  ],
  [
    "잎갈이 엘프 파수꾼 Lv.{level}",
    "落叶精灵守卫 Lv.{level}"
  ],
  [
    "잿그늘 상복 로브 x{quantity}",
    "灰烬哀悼长袍 x{quantity}"
  ],
  [
    "지금 만들어진 임시 계정은 사라집니다.",
    "刚刚创建的临时账号将会消失。"
  ],
  [
    "진행 {current}/{target}",
    "进度：{current}/{target}"
  ],
  [
    "채널 {channel}에 접속되었습니다",
    "已连接至频道 {channel}"
  ],
  [
    "총 {total} {priceName}",
    "总计 {total} {priceName}"
  ],
  [
    "코어 경비 오토마타 Lv.{level}",
    "核心守卫自动机 Lv.{level}"
  ],
  [
    "피뢰 기사 오토마타 Lv.{level}",
    "避雷针骑士自动机 Lv.{level}"
  ],
  [
    "허용되지 않은 값이 포함되어 있습니다.",
    "请求中包含不允许的值。"
  ],
  [
    "현재 채팅 기능이 일시 중단되었습니다.",
    "聊天功能暂时停用。"
  ],
  [
    "호박 축제 꾸러미 x{quantity}",
    "南瓜庆典礼包 x{quantity}"
  ],
  [
    "ガーネットの水菓子 x{quantity}",
    "石榴石水果羹 x{quantity}"
  ],
  [
    "カボチャ祭りの包み x{quantity}",
    "南瓜庆典礼包 x{quantity}"
  ],
  [
    "ごくまれに…最上級クレパスが手に入る袋だ。",
    "极少数袋子里……会藏着一支金蜡笔。"
  ],
  [
    "シナモンキャンディ x{quantity}",
    "肉桂味硬糖 x{quantity}"
  ],
  [
    "すでに{label}に割り当てられています",
    "该按键已分配给“{label}”"
  ],
  [
    "チャンネル{channel}に接続しました",
    "已连接至频道 {channel}"
  ],
  [
    "ニックネームは最初の1回のみ設定できます。",
    "昵称只能设置一次。"
  ],
  [
    "{warning}\n本当に復旧しますか？",
    "{warning}\n确定要恢复吗？"
  ],
  [
    "/ Your kills {kills}",
    "｜ 我的击杀：{kills}"
  ],
  [
    "1회 최대 구매 수량을 초과했습니다.",
    "超出单次购买的最大数量。"
  ],
  [
    "避雷騎士オートマタ Lv.{level}",
    "避雷针骑士自动机 Lv.{level}"
  ],
  [
    "存在しないか、すでに処理された申請です。",
    "该好友申请不存在或已被处理。"
  ],
  [
    "大樹の根の胸当て x{quantity}",
    "巨树根须胸甲 x{quantity}"
  ],
  [
    "対象HPが{pct}%以下の時、威力強化",
    "目标 HP 低于或等于 {pct}% 时威力提升"
  ],
  [
    "封印の祭壇があるマップでのみ入場できます",
    "只能从封印祭坛所在的地图进入"
  ],
  [
    "合計ステータス (Lv {level})",
    "总属性（Lv.{level}）"
  ],
  [
    "灰陰の喪服ローブ x{quantity}",
    "灰烬哀悼长袍 x{quantity}"
  ],
  [
    "今作成された仮アカウントは削除されます。",
    "刚刚创建的临时账号将会消失。"
  ],
  [
    "精霊使いのローブ x{quantity}",
    "唤灵师长袍 x{quantity}"
  ],
  [
    "黎明エルフの守護兵 Lv.{level}",
    "黎明精灵守卫 Lv.{level}"
  ],
  [
    "黎明の番人の脚衣 x{quantity}",
    "黎明守望者护胫 x{quantity}"
  ],
  [
    "竜族の戦闘かぶと x{quantity}",
    "龙族战斗头盔 x{quantity}"
  ],
  [
    "命中時{sec}秒間火傷（継続ダメージ）",
    "命中时使目标灼烧 {sec} 秒（持续伤害）"
  ],
  [
    "耐熱服のモグラ獣人 Lv.{level}",
    "隔热服鼹鼠人 Lv.{level}"
  ],
  [
    "錆びた番兵ギガント Lv.{level}",
    "锈蚀守卫巨像 Lv.{level}"
  ],
  [
    "溶鉱炉コアゴーレム Lv.{level}",
    "熔炉核心魔像 Lv.{level}"
  ],
  [
    "獣人戦士のかぶと x{quantity}",
    "兽族战士头盔 x{quantity}"
  ],
  [
    "雪霜精霊のローブ x{quantity}",
    "雪霜精灵长袍 x{quantity}"
  ],
  [
    "圧着プレスゴーレム Lv.{level}",
    "冲压机魔像 Lv.{level}"
  ],
  [
    "月暈魔女のローブ x{quantity}",
    "月晕女巫长袍 x{quantity}"
  ],
  [
    "A reward has arrived",
    "奖励已送达"
  ],
  [
    "Ashen Mist Graveyard",
    "灰雾墓园"
  ],
  [
    "Check on the Fairies",
    "森林妖精的异动"
  ],
  [
    "Choose Your Nickname",
    "设置昵称"
  ],
  [
    "Core Guard Automaton",
    "核心守卫自动机"
  ],
  [
    "Dew Fairy Lv.{level}",
    "露珠妖精 Lv.{level}"
  ],
  [
    "Distance {distance}m",
    "已跑 {distance}m"
  ],
  [
    "Dragonscale Guardian",
    "龙鳞守卫"
  ],
  [
    "Elven Hunter Greaves",
    "精灵猎手护胫"
  ],
  [
    "Frost Bear Beastfolk",
    "冰霜熊人"
  ],
  [
    "Gentle Breeze Spirit",
    "和风精灵"
  ],
  [
    "Get closer to {name}",
    "请靠近 {name}"
  ],
  [
    "Invalid destination.",
    "目的地无效。"
  ],
  [
    "Level {level} Reward",
    "达到 {level} 级的奖励"
  ],
  [
    "Level up! Lv.{level}",
    "升级！Lv.{level}"
  ],
  [
    "Lv{level}で解放されるスキルです",
    "该技能将在 Lv.{level} 解锁"
  ],
  [
    "Lv5 무기 — 착용 시 공격력 +8",
    "Lv5 武器——装备时攻击力 +8"
  ],
  [
    "Marshfog Spell Staff",
    "沼雾咒术法杖"
  ],
  [
    "Moorland Wind Spirit",
    "原野风精灵"
  ],
  [
    "No received requests",
    "暂无收到的好友申请"
  ],
  [
    "Patron of the Temple",
    "教团赞助者"
  ],
  [
    "Skill is on cooldown",
    "技能正在冷却"
  ],
  [
    "Start with this name",
    "使用此昵称开始"
  ],
  [
    "Summon Mecha Pumpkin",
    "召唤机械南瓜"
  ],
  [
    "Temple Return Scroll",
    "教团回城卷轴"
  ],
  [
    "The Blinding Shadows",
    "致盲的暗影"
  ],
  [
    "The Diligent Pilgrim",
    "勤勉的朝圣者"
  ],
  [
    "Welding Spark Impbot",
    "焊火小恶魔机器人"
  ],
  [
    "When the Ash Settles",
    "当灰烬落定"
  ],
  [
    "거목 뿌리 흉갑 x{quantity}",
    "巨树根须胸甲 x{quantity}"
  ],
  [
    "고장난 정찰 드론 Lv.{level}",
    "故障侦察无人机 Lv.{level}"
  ],
  [
    "과부하 배전 정령 Lv.{level}",
    "过载电路精灵 Lv.{level}"
  ],
  [
    "교단 보급 상자 x{quantity}",
    "教团补给箱 x{quantity}"
  ],
  [
    "낫잡이 들쥐 수인 Lv.{level}",
    "镰刀田鼠人 Lv.{level}"
  ],
  [
    "녹슨 파수 기간트 Lv.{level}",
    "锈蚀守卫巨像 Lv.{level}"
  ],
  [
    "늪지 마녀 견습장 Lv.{level}",
    "沼泽女巫导师 Lv.{level}"
  ],
  [
    "복구 코드 형식이 올바르지 않습니다.",
    "恢复码格式无效。"
  ],
  [
    "선행 퀘스트를 먼저 완료해야 합니다.",
    "请先完成前置任务。"
  ],
  [
    "수인 가죽 각반 x{quantity}",
    "兽族皮革护胫 x{quantity}"
  ],
  [
    "수인 가죽 두건 x{quantity}",
    "兽族皮革兜帽 x{quantity}"
  ],
  [
    "수인 전사 각반 x{quantity}",
    "兽族战士护胫 x{quantity}"
  ],
  [
    "수인 전사 투구 x{quantity}",
    "兽族战士头盔 x{quantity}"
  ],
  [
    "순찰 드론(구형) Lv.{level}",
    "巡逻无人机（旧型） Lv.{level}"
  ],
  [
    "숲 수인 덫사냥꾼 Lv.{level}",
    "森林兽人陷阱猎手 Lv.{level}"
  ],
  [
    "스피키 애정도 (Lv {level})",
    "斯皮奇好感度（Lv.{level}）"
  ],
  [
    "습지마녀 챙모자 x{quantity}",
    "湿地女巫宽檐帽 x{quantity}"
  ],
  [
    "심부 감시 관제탑 Lv.{level}",
    "深处监控塔 Lv.{level}"
  ],
  [
    "압착 프레스 골렘 Lv.{level}",
    "冲压机魔像 Lv.{level}"
  ],
  [
    "여명 엘프 수호병 Lv.{level}",
    "黎明精灵守卫 Lv.{level}"
  ],
  [
    "오늘의 보상 횟수를 모두 사용했습니다",
    "今日奖励次数已用完"
  ],
  [
    "용광로 코어 골렘 Lv.{level}",
    "熔炉核心魔像 Lv.{level}"
  ],
  [
    "용접 불꽃 임프봇 Lv.{level}",
    "焊火小恶魔机器人 Lv.{level}"
  ],
  [
    "장비를 바꿔도 강화 단계는 유지됩니다",
    "更换装备不会影响强化等级。"
  ],
  [
    "정령결속 지팡이 x{quantity}",
    "精灵缚结法杖 x{quantity}"
  ],
  [
    "조회 실패 — 패널을 다시 열어보세요",
    "加载失败，请重新打开面板"
  ],
  [
    "최대 HP의 {percent}% 회복",
    "恢复最大 HP 的 {percent}%"
  ],
  [
    "최상급 크레파스 x{quantity}",
    "金蜡笔 x{quantity}"
  ],
  [
    "크레파스 주머니 x{quantity}",
    "蜡笔袋 x{quantity}"
  ],
  [
    "타겟을 먼저 선택하세요(몬스터 클릭)",
    "请先点击怪物选择目标"
  ],
  [
    "파티장만 레이드에 입장할 수 있습니다",
    "只有队长可以开启团队副本"
  ],
  [
    "판매 중인 상품을 찾을 수 없습니다.",
    "找不到正在出售的商品。"
  ],
  [
    "폐선로 광차 골렘 Lv.{level}",
    "废弃轨道矿车魔像 Lv.{level}"
  ],
  [
    "호박마차 소환권 x{quantity}",
    "南瓜马车召唤券 x{quantity}"
  ],
  [
    "エルフ猟師の脚衣 x{quantity}",
    "精灵猎手护胫 x{quantity}"
  ],
  [
    "コア警備オートマタ Lv.{level}",
    "核心守卫自动机 Lv.{level}"
  ],
  [
    "ここでは帰還できません(フィールド専用)",
    "无法从这里回城（仅限野外）"
  ],
  [
    "すでに受け取ったか、存在しない郵便です。",
    "此邮件已领取或不存在。"
  ],
  [
    "ダウン状態 — 仲間の蘇生を待ちましょう",
    "你已倒下——等待队友救援"
  ],
  [
    "どんな装備が入っているかわからない袋だ。",
    "谁也不知道里面装着什么装备。"
  ],
  [
    "メカカボチャは再召喚のクールダウン中です",
    "机械南瓜正在等待重新召唤"
  ],
  [
    "レベルが不足しているため装備できません。",
    "等级不足，无法装备此物品。"
  ],
  [
    "{name} is in combat",
    "{name} 正在战斗"
  ],
  [
    "{name}님은 함께하지 못했습니다",
    "{name} 未能一同入场"
  ],
  [
    "{name}님이 파티에 초대했습니다",
    "{name} 邀请你加入队伍"
  ],
  [
    "{name}さんとフレンドになりました",
    "你已与 {name} 成为好友"
  ],
  [
    "{name}さんは参加できませんでした",
    "{name} 未能一同入场"
  ],
  [
    "{name}に同乗をリクエストしました",
    "已向 {name} 发送搭乘请求"
  ],
  [
    "{nickname} さんへ返信を入力",
    "回复 {nickname}"
  ],
  [
    "{warning}\n정말 복구할까요?",
    "{warning}\n确定要恢复吗？"
  ],
  [
    "廃品圧縮ゴーレム Lv.{level}",
    "废料压缩魔像 Lv.{level}"
  ],
  [
    "廃線機関長の幽霊 Lv.{level}",
    "旧铁路幽灵列车长 Lv.{level}"
  ],
  [
    "国境エルフの斥候 Lv.{level}",
    "边境精灵斥候 Lv.{level}"
  ],
  [
    "黒沼のヒキガエル Lv.{level}",
    "黑沼蟾蜍 Lv.{level}"
  ],
  [
    "冷却散布ドローン Lv.{level}",
    "冷却液喷洒无人机 Lv.{level}"
  ],
  [
    "黎明の大樹の杖 x{quantity}",
    "晨曦巨树法杖 x{quantity}"
  ],
  [
    "黎明の番人の兜 x{quantity}",
    "黎明守望者头盔 x{quantity}"
  ],
  [
    "竜族の戦闘脚衣 x{quantity}",
    "龙族战斗护胫 x{quantity}"
  ],
  [
    "落葉のエルフ森番 Lv.{level}",
    "落叶精灵守卫 Lv.{level}"
  ],
  [
    "目覚めたての亡霊 Lv.{level}",
    "初醒亡灵 Lv.{level}"
  ],
  [
    "墓守りのフード x{quantity}",
    "守墓人兜帽 x{quantity}"
  ],
  [
    "排気清掃ドローン Lv.{level}",
    "排气清扫无人机 Lv.{level}"
  ],
  [
    "切断機オートマタ Lv.{level}",
    "切割自动机 Lv.{level}"
  ],
  [
    "溶解スライムコア Lv.{level}",
    "熔融史莱姆核心 Lv.{level}"
  ],
  [
    "湿地魔女の脚衣 x{quantity}",
    "湿地女巫护胫 x{quantity}"
  ],
  [
    "使用すると教団へ戻れる帰還アイテムだ。",
    "使用后可返回教团的回城道具。"
  ],
  [
    "獣人戦士の脚衣 x{quantity}",
    "兽族战士护胫 x{quantity}"
  ],
  [
    "獣人の革の脚衣 x{quantity}",
    "兽族皮革护胫 x{quantity}"
  ],
  [
    "霜星の破片脚衣 x{quantity}",
    "霜星碎片护胫 x{quantity}"
  ],
  [
    "送電監視ドローン Lv.{level}",
    "输电监控无人机 Lv.{level}"
  ],
  [
    "所持しているHPポーションがありません",
    "没有可用的 HP 药水"
  ],
  [
    "苔背のヒキガエル Lv.{level}",
    "苔背蟾蜍 Lv.{level}"
  ],
  [
    "先行クエストを先にクリアしてください。",
    "请先完成前置任务。"
  ],
  [
    "現在、装備強化はご利用いただけません。",
    "目前无法使用装备强化。"
  ],
  [
    "一度に購入できる最大数量を超えました。",
    "超出单次购买的最大数量。"
  ],
  [
    "移動: WASD / 矢印キー（固定）",
    "移动：WASD 或方向键（固定）"
  ],
  [
    "燠火の竜鱗の暴君 Lv.{level}",
    "烬火龙鳞暴君 Lv.{level}"
  ],
  [
    "沼地魔女見習い長 Lv.{level}",
    "沼泽女巫导师 Lv.{level}"
  ],
  [
    "装備を替えても強化段階は維持されます。",
    "更换装备不会影响强化等级。"
  ],
  [
    "最上級クレパス x{quantity}",
    "金蜡笔 x{quantity}"
  ],
  [
    "Ancient Wind Spirit",
    "远古风精灵"
  ],
  [
    "Ashen Mourning Robe",
    "灰烬哀悼长袍"
  ],
  [
    "Ashen Wailing Ghost",
    "灰烬哀嚎幽灵"
  ],
  [
    "Coolant Spray Drone",
    "冷却液喷洒无人机"
  ],
  [
    "Dawn Warden Greaves",
    "黎明守望者护胫"
  ],
  [
    "Elven Forest Warden",
    "精灵守林人"
  ],
  [
    "Gearblade Harvester",
    "齿刃收割机"
  ],
  [
    "Gold owned: {count}",
    "金币 {count}"
  ],
  [
    "Hangar Sealed Altar",
    "机库封印祭坛"
  ],
  [
    "Leafshed Elf Warden",
    "落叶精灵守卫"
  ],
  [
    "Marsh Toad Familiar",
    "湿地蟾蜍使魔"
  ],
  [
    "Marsh Witch Greaves",
    "湿地女巫护胫"
  ],
  [
    "Moonhaze Witch Robe",
    "月晕女巫长袍"
  ],
  [
    "Party best {score}m",
    "队伍最佳 {score}m"
  ],
  [
    "Party member {slot}",
    "队伍成员 {slot}"
  ],
  [
    "Press Enter to chat",
    "按 Enter 输入聊天内容"
  ],
  [
    "Pumpkin patch today",
    "今日南瓜田"
  ],
  [
    "Reached Lv.{level}!",
    "强化达到 +{level}！"
  ],
  [
    "Reply to {nickname}",
    "回复 {nickname}"
  ],
  [
    "Returning in {time}",
    "将在 {time} 后自动返回"
  ],
  [
    "Rusted Watch Gigant",
    "锈蚀守卫巨像"
  ],
  [
    "Shadows in the Mist",
    "迷雾中的暗影"
  ],
  [
    "Sound effects (SFX)",
    "音效（SFX）"
  ],
  [
    "The Molten Boundary",
    "熔融边界"
  ],
  [
    "The request failed.",
    "请求失败。"
  ],
  [
    "Thornbush Beastfolk",
    "荆棘丛兽人"
  ],
  [
    "Thunder Pylon Ridge",
    "雷电塔岭"
  ],
  [
    "Thundercloud Wyvern",
    "雷云飞龙"
  ],
  [
    "갓 깨어난 망령 Lv.{level}",
    "初醒亡灵 Lv.{level}"
  ],
  [
    "경험치 주머니 x{quantity}",
    "经验袋 x{quantity}"
  ],
  [
    "계피맛 알사탕 x{quantity}",
    "肉桂味硬糖 x{quantity}"
  ],
  [
    "국경 엘프 척후 Lv.{level}",
    "边境精灵斥候 Lv.{level}"
  ],
  [
    "궁극의 주머니 x{quantity}",
    "终极袋 x{quantity}"
  ],
  [
    "기름등 도깨비불 Lv.{level}",
    "油灯鬼火 Lv.{level}"
  ],
  [
    "냉각 살포 드론 Lv.{level}",
    "冷却液喷洒无人机 Lv.{level}"
  ],
  [
    "대기 중… {count}/{max}",
    "匹配中… {count}/{max}"
  ],
  [
    "떠도는 바람정령 Lv.{level}",
    "游荡风精灵 Lv.{level}"
  ],
  [
    "레벨이 부족해 장착할 수 없습니다.",
    "等级不足，无法装备此物品。"
  ],
  [
    "마을 안에서만 이동할 수 있습니다.",
    "只能在城镇内使用传送。"
  ],
  [
    "묘지기 석상망령 Lv.{level}",
    "守墓石像亡灵 Lv.{level}"
  ],
  [
    "무덤지기 각반 x{quantity}",
    "守墓人护胫 x{quantity}"
  ],
  [
    "무덤지기 대망령 Lv.{level}",
    "守墓大亡灵 Lv.{level}"
  ],
  [
    "무덤지기 후드 x{quantity}",
    "守墓人兜帽 x{quantity}"
  ],
  [
    "배기 청소 드론 Lv.{level}",
    "排气清扫无人机 Lv.{level}"
  ],
  [
    "번개철탑 수호기 Lv.{level}",
    "雷电塔守护机 Lv.{level}"
  ],
  [
    "변화 없음 — {level}강 유지",
    "强化未变：维持 +{level}"
  ],
  [
    "봉인 제단에 더 가까이 가야 합니다",
    "请靠近封印祭坛"
  ],
  [
    "뿌리 얽힌 망령 Lv.{level}",
    "根缚亡灵 Lv.{level}"
  ],
  [
    "사망 상태에서는 입장할 수 없습니다",
    "倒地时无法进入"
  ],
  [
    "새 버전으로 업데이트하는 중입니다…",
    "正在更新至最新版本…"
  ],
  [
    "서리별 고대정령 Lv.{level}",
    "霜星远古精灵 Lv.{level}"
  ],
  [
    "송전 감시 드론 Lv.{level}",
    "输电监控无人机 Lv.{level}"
  ],
  [
    "숲 수인 정찰병 Lv.{level}",
    "森林兽人侦察兵 Lv.{level}"
  ],
  [
    "습지마녀 각반 x{quantity}",
    "湿地女巫护胫 x{quantity}"
  ],
  [
    "아무 키나 누르세요 (ESC 취소)",
    "请按任意键（ESC 取消）"
  ],
  [
    "어스름 늑대수인 Lv.{level}",
    "暮色狼人 Lv.{level}"
  ],
  [
    "엘리프 주머니 x{quantity}",
    "水晶叶袋 x{quantity}"
  ],
  [
    "오늘 내 최고 기록 {score}m",
    "今日最佳 {score}m"
  ],
  [
    "오늘 내 최고 기록 {score}초",
    "今日最长生存 {score}秒"
  ],
  [
    "용족 전투각반 x{quantity}",
    "龙族战斗护胫 x{quantity}"
  ],
  [
    "용족 전투투구 x{quantity}",
    "龙族战斗头盔 x{quantity}"
  ],
  [
    "융해 슬라임코어 Lv.{level}",
    "熔融史莱姆核心 Lv.{level}"
  ],
  [
    "이동: WASD / 방향키 (고정)",
    "移动：WASD 或方向键（固定）"
  ],
  [
    "이미 다른 미니게임에 참여 중입니다",
    "你已经在其他活动场景中"
  ],
  [
    "이미 친구 요청을 보낸 상태입니다.",
    "你已经发送过好友申请。"
  ],
  [
    "잉걸 용린 폭군 Lv.{level}",
    "烬火龙鳞暴君 Lv.{level}"
  ],
  [
    "잿빛 곡성 유령 Lv.{level}",
    "灰烬哀嚎幽灵 Lv.{level}"
  ],
  [
    "절단기 오토마타 Lv.{level}",
    "切割自动机 Lv.{level}"
  ],
  [
    "지금은 애정도를 올릴 수 없습니다.",
    "目前无法提升好感度。"
  ],
  [
    "창백한 도깨비불 Lv.{level}",
    "苍白鬼火 Lv.{level}"
  ],
  [
    "퀘스트 조건이 달성되지 않았습니다.",
    "尚未满足此任务的条件。"
  ],
  [
    "파티장만 입장을 요청할 수 있습니다",
    "只有队长可以发起入场"
  ],
  [
    "폐품 압축 골렘 Lv.{level}",
    "废料压缩魔像 Lv.{level}"
  ],
  [
    "폭주 전력 정령 Lv.{level}",
    "暴走电力精灵 Lv.{level}"
  ],
  [
    "현재 진행되는 미니게임이 없습니다.",
    "目前没有开放的小游戏。"
  ],
  [
    "エルフの斥候帽 x{quantity}",
    "精灵斥候帽 x{quantity}"
  ],
  [
    "ガーネットの実 x{quantity}",
    "石榴石果实 x{quantity}"
  ],
  [
    "コイル蜘蛛ボット Lv.{level}",
    "线圈蜘蛛机器人 Lv.{level}"
  ],
  [
    "すでに使用されているニックネームです。",
    "此昵称已被使用。"
  ],
  [
    "スピキ愛情度 (Lv {level})",
    "斯皮奇好感度（Lv.{level}）"
  ],
  [
    "パトカー召喚券 x{quantity}",
    "警车召唤券 x{quantity}"
  ],
  [
    "レベル{level}以上で入場できます",
    "需要达到 {level} 级才能进入"
  ],
  [
    "(EXP gain reduced)",
    "（获得的经验值减少）"
  ],
  [
    "{name}님과 친구가 되었습니다",
    "你已与 {name} 成为好友"
  ],
  [
    "{name}님의 접속이 끊겼습니다",
    "{name} 已离线"
  ],
  [
    "{name}에게 더 가까이 가세요",
    "请靠近 {name}"
  ],
  [
    "{name}にもっと近づいてください",
    "请靠近 {name}"
  ],
  [
    "暴走する動力核 Lv.{level}",
    "暴走动力核心 Lv.{level}"
  ],
  [
    "本日の報酬回数をすべて使い切りました",
    "今日奖励次数已用完"
  ],
  [
    "変化なし — +{level}を維持",
    "强化未变：维持 +{level}"
  ],
  [
    "歯車刃の収穫機 Lv.{level}",
    "齿刃收割机 Lv.{level}"
  ],
  [
    "待機中… {count}/{max}",
    "匹配中… {count}/{max}"
  ],
  [
    "復旧コードの形式が正しくありません。",
    "恢复码格式无效。"
  ],
  [
    "過負荷配電精霊 Lv.{level}",
    "过载电路精灵 Lv.{level}"
  ],
  [
    "黄昏森の大族長 Lv.{level}",
    "暮色森林大酋长 Lv.{level}"
  ],
  [
    "灰色の哭声幽霊 Lv.{level}",
    "灰烬哀嚎幽灵 Lv.{level}"
  ],
  [
    "基本攻撃の自動リピート（Space）",
    "自动重复普通攻击（Space）"
  ],
  [
    "見習い湿地魔女 Lv.{level}",
    "见习湿地女巫 Lv.{level}"
  ],
  [
    "教団の補給箱 x{quantity}",
    "教团补给箱 x{quantity}"
  ],
  [
    "教団の帰還書 x{quantity}",
    "教团回城卷轴 x{quantity}"
  ],
  [
    "精霊結束の杖 x{quantity}",
    "精灵缚结法杖 x{quantity}"
  ],
  [
    "哭声封印の杖 x{quantity}",
    "哀鸣封印法杖 x{quantity}"
  ],
  [
    "雷雲ワイバーン Lv.{level}",
    "雷云飞龙 Lv.{level}"
  ],
  [
    "雷鉄塔の守護機 Lv.{level}",
    "雷电塔守护机 Lv.{level}"
  ],
  [
    "黎明光の守護者 Lv.{level}",
    "曙光守卫 Lv.{level}"
  ],
  [
    "竜鱗刻印の杖 x{quantity}",
    "龙鳞刻纹法杖 x{quantity}"
  ],
  [
    "竜鱗の胸当て x{quantity}",
    "龙鳞胸甲 x{quantity}"
  ],
  [
    "墓守の石像亡霊 Lv.{level}",
    "守墓石像亡灵 Lv.{level}"
  ],
  [
    "墓守りの脚衣 x{quantity}",
    "守墓人护胫 x{quantity}"
  ],
  [
    "強化失敗 — +{level}に下降",
    "强化失败：降至 +{level}"
  ],
  [
    "森の獣人罠猟師 Lv.{level}",
    "森林兽人陷阱猎手 Lv.{level}"
  ],
  [
    "深部監視管制塔 Lv.{level}",
    "深处监控塔 Lv.{level}"
  ],
  [
    "適正レベルボーナス {amount}",
    "同等级加成 {amount}"
  ],
  [
    "獣人の革頭巾 x{quantity}",
    "兽族皮革兜帽 x{quantity}"
  ],
  [
    "霜花結晶の杖 x{quantity}",
    "霜花水晶法杖 x{quantity}"
  ],
  [
    "霜星の古の精霊 Lv.{level}",
    "霜星远古精灵 Lv.{level}"
  ],
  [
    "霜星の破片兜 x{quantity}",
    "霜星碎片头盔 x{quantity}"
  ],
  [
    "所持している帰還アイテムがありません",
    "没有可用的回城道具"
  ],
  [
    "先にニックネームを設定してください。",
    "请先设置昵称。"
  ],
  [
    "現在開催中のミニゲームはありません。",
    "目前没有开放的小游戏。"
  ],
  [
    "線路清掃ボット Lv.{level}",
    "轨道清扫机器人 Lv.{level}"
  ],
  [
    "許可されていない値が含まれています。",
    "请求中包含不允许的值。"
  ],
  [
    "詠唱中はチャンネルを変更できません。",
    "施法期间无法切换频道。"
  ],
  [
    "月明かりの鬼火 Lv.{level}",
    "月光鬼火 Lv.{level}"
  ],
  [
    "運営チームから報酬が支給されました。",
    "运营团队向你发放了奖励。"
  ],
  [
    "戦闘中はチャンネルを変更できません。",
    "战斗期间无法切换频道。"
  ],
  [
    "自分自身にフレンド申請はできません。",
    "不能向自己发送好友申请。"
  ],
  [
    "Account Restricted",
    "账号封禁通知"
  ],
  [
    "Ashshade Tomb Hill",
    "灰影墓丘"
  ],
  [
    "Attendance Rewards",
    "签到奖励"
  ],
  [
    "Broken Scout Drone",
    "故障侦察无人机"
  ],
  [
    "Daily Login Reward",
    "每日登录奖励"
  ],
  [
    "Dawn Warden Spirit",
    "黎明守护精灵"
  ],
  [
    "Dawnlight Guardian",
    "曙光守卫"
  ],
  [
    "Duskwood Chieftain",
    "暮色森林大酋长"
  ],
  [
    "Entering the raid…",
    "正在进入团队副本…"
  ],
  [
    "Fake Pumpkin Dodge",
    "南瓜大逃亡"
  ],
  [
    "Furnace Core Golem",
    "熔炉核心魔像"
  ],
  [
    "Googleログイン情報が無効です。",
    "Google 登录信息无效。"
  ],
  [
    "Gravekeeper's Hood",
    "守墓人兜帽"
  ],
  [
    "Moonring Marshdell",
    "月环泽谷"
  ],
  [
    "Newly Risen Wraith",
    "初醒亡灵"
  ],
  [
    "No blocked players",
    "暂无已屏蔽玩家"
  ],
  [
    "No patch notes yet",
    "暂无更新日志"
  ],
  [
    "No quests to show.",
    "没有可显示的任务。"
  ],
  [
    "Old Signal Railway",
    "旧信号铁路"
  ],
  [
    "Purchase complete.",
    "购买成功。"
  ],
  [
    "Runaway Power Core",
    "暴走动力核心"
  ],
  [
    "Runaway Rail Golem",
    "失控的废弃轨道矿车魔像"
  ],
  [
    "Sack of Gold Coins",
    "金币袋"
  ],
  [
    "Scorched Beastfolk",
    "焦灼兽人"
  ],
  [
    "Server Maintenance",
    "服务器维护通知"
  ],
  [
    "Signal Light Ghost",
    "信号灯幽灵"
  ],
  [
    "Spirit-bound Staff",
    "精灵缚结法杖"
  ],
  [
    "Stop the Compactor",
    "停止压缩场"
  ],
  [
    "Switch combat/menu",
    "切换战斗/菜单"
  ],
  [
    "The Warden's Trial",
    "守林人的试炼"
  ],
  [
    "To Frostreach Pass",
    "前往霜星雪岭"
  ],
  [
    "Tow Claw Automaton",
    "牵引钳自动机"
  ],
  [
    "Wailing Seal Staff",
    "哀鸣封印法杖"
  ],
  [
    "가시덤불 수인 Lv.{level}",
    "荆棘丛兽人 Lv.{level}"
  ],
  [
    "감시 눈알렌즈 Lv.{level}",
    "监视之眼镜片 Lv.{level}"
  ],
  [
    "강화 성공! {level}강 달성",
    "强化成功：达到 +{level}！"
  ],
  [
    "검은늪 두꺼비 Lv.{level}",
    "黑沼蟾蜍 Lv.{level}"
  ],
  [
    "견습 습지마녀 Lv.{level}",
    "见习湿地女巫 Lv.{level}"
  ],
  [
    "고대 바람정령 Lv.{level}",
    "远古风精灵 Lv.{level}"
  ],
  [
    "골드 주머니 x{quantity}",
    "金币袋 x{quantity}"
  ],
  [
    "교단 귀환서 x{quantity}",
    "教团回城卷轴 x{quantity}"
  ],
  [
    "그을음 임프봇 Lv.{level}",
    "烟灰小恶魔机器人 Lv.{level}"
  ],
  [
    "기본공격 자동 반복 (Space)",
    "自动重复普通攻击（Space）"
  ],
  [
    "노을나비 요정 Lv.{level}",
    "暮翼妖精 Lv.{level}"
  ],
  [
    "노을숲 대족장 Lv.{level}",
    "暮色森林大酋长 Lv.{level}"
  ],
  [
    "늪불 도깨비불 Lv.{level}",
    "沼泽鬼火 Lv.{level}"
  ],
  [
    "달그림자 마녀 Lv.{level}",
    "月影女巫 Lv.{level}"
  ],
  [
    "달빛 도깨비불 Lv.{level}",
    "月光鬼火 Lv.{level}"
  ],
  [
    "들녘 바람정령 Lv.{level}",
    "原野风精灵 Lv.{level}"
  ],
  [
    "목적지 마을을 찾을 수 없습니다.",
    "找不到目的地城镇。"
  ],
  [
    "미니게임 정보를 찾을 수 없습니다",
    "未找到小游戏信息"
  ],
  [
    "산들 바람정령 Lv.{level}",
    "和风精灵 Lv.{level}"
  ],
  [
    "서리 곰 수인 Lv.{level}",
    "冰霜熊人 Lv.{level}"
  ],
  [
    "서리 도깨비불 Lv.{level}",
    "冰霜鬼火 Lv.{level}"
  ],
  [
    "석류석 열매 x{quantity}",
    "石榴石果实 x{quantity}"
  ],
  [
    "석류석 화채 x{quantity}",
    "石榴石水果羹 x{quantity}"
  ],
  [
    "알 수 없는 오류가 발생했습니다.",
    "发生未知错误。"
  ],
  [
    "엘프 정찰모 x{quantity}",
    "精灵斥候帽 x{quantity}"
  ],
  [
    "여명 파수정령 Lv.{level}",
    "黎明守护精灵 Lv.{level}"
  ],
  [
    "여명빛 파수꾼 Lv.{level}",
    "曙光守卫 Lv.{level}"
  ],
  [
    "용비늘 흉갑 x{quantity}",
    "龙鳞胸甲 x{quantity}"
  ],
  [
    "용암 도깨비불 Lv.{level}",
    "熔岩鬼火 Lv.{level}"
  ],
  [
    "이 지역에서는 전투할 수 없습니다",
    "无法在此区域战斗"
  ],
  [
    "이끼등 두꺼비 Lv.{level}",
    "苔背蟾蜍 Lv.{level}"
  ],
  [
    "이미 다른 레이드에 참여 중입니다",
    "你已在其他团队副本中"
  ],
  [
    "이미 보낸 초대가 아직 유효합니다",
    "已向该玩家发出邀请，请等待回应"
  ],
  [
    "장비 주머니 x{quantity}",
    "装备袋 x{quantity}"
  ],
  [
    "잿불 도깨비불 Lv.{level}",
    "余烬鬼火 Lv.{level}"
  ],
  [
    "정령사 로브 x{quantity}",
    "唤灵师长袍 x{quantity}"
  ],
  [
    "출석 보상이 우편함에 도착했습니다",
    "每日签到奖励已送达邮箱"
  ],
  [
    "톱니날 수확기 Lv.{level}",
    "齿刃收割机 Lv.{level}"
  ],
  [
    "폐선로 기관장 Lv.{level}",
    "旧铁路幽灵列车长 Lv.{level}"
  ],
  [
    "エリーフの袋 x{quantity}",
    "水晶叶袋 x{quantity}"
  ],
  [
    "お問い合わせ内容を入力してください。",
    "请输入咨询内容。"
  ],
  [
    "クエストの条件が達成されていません。",
    "尚未满足此任务的条件。"
  ],
  [
    "クレパスの袋 x{quantity}",
    "蜡笔袋 x{quantity}"
  ],
  [
    "ゴールドの袋 x{quantity}",
    "金币袋 x{quantity}"
  ],
  [
    "さすらう風精霊 Lv.{level}",
    "游荡风精灵 Lv.{level}"
  ],
  [
    "すでに他のパーティーに所属しています",
    "对方已在其他队伍中"
  ],
  [
    "パーティー最高生存 {score}秒",
    "队伍最长生存 {score}秒"
  ],
  [
    "パーティボーナス +{amount}",
    "队伍加成 +{amount}"
  ],
  [
    "メカカボチャ x{quantity}",
    "机械南瓜 x{quantity}"
  ],
  [
    "ログインボーナスが郵便箱に届きました",
    "每日签到奖励已送达邮箱"
  ],
  [
    "{count} per stack",
    "每层消耗 {count} 支"
  ],
  [
    "{name}님이 사망 상태입니다",
    "{name} 已经倒下"
  ],
  [
    "{name}さんの接続が切れました",
    "{name} 已离线"
  ],
  [
    "+{pct}% per stack",
    "每层 +{pct}%"
  ],
  [
    "薄暮の狼獣人 Lv.{level}",
    "暮色狼人 Lv.{level}"
  ],
  [
    "暴走電力精霊 Lv.{level}",
    "暴走电力精灵 Lv.{level}"
  ],
  [
    "本日の自己ベスト {score}秒",
    "今日最长生存 {score}秒"
  ],
  [
    "本日の自己ベスト {score}m",
    "今日最佳 {score}m"
  ],
  [
    "登録されたパッチノートはありません",
    "暂无更新日志"
  ],
  [
    "封印の祭壇にもっと近づいてください",
    "请靠近封印祭坛"
  ],
  [
    "根絡みの亡霊 Lv.{level}",
    "根缚亡灵 Lv.{level}"
  ],
  [
    "根のゴーレム Lv.{level}",
    "树根魔像 Lv.{level}"
  ],
  [
    "黄昏蝶の妖精 Lv.{level}",
    "暮翼妖精 Lv.{level}"
  ],
  [
    "黄昏花の精霊 Lv.{level}",
    "暮色花精灵 Lv.{level}"
  ],
  [
    "監視眼レンズ Lv.{level}",
    "监视之眼镜片 Lv.{level}"
  ],
  [
    "経験値の袋 x{quantity}",
    "经验袋 x{quantity}"
  ],
  [
    "看板があるマップでのみ入場できます",
    "请在活动立牌所在的地图进入"
  ],
  [
    "黎明の番精霊 Lv.{level}",
    "黎明守护精灵 Lv.{level}"
  ],
  [
    "黎明の竜鱗兵 Lv.{level}",
    "黎明龙鳞兵 Lv.{level}"
  ],
  [
    "竜鱗の守護者 Lv.{level}",
    "龙鳞守卫 Lv.{level}"
  ],
  [
    "墓守の大亡霊 Lv.{level}",
    "守墓大亡灵 Lv.{level}"
  ],
  [
    "森の獣人斥候 Lv.{level}",
    "森林兽人侦察兵 Lv.{level}"
  ],
  [
    "使うと教団へ戻れる帰還アイテムだ。",
    "使用后可返回教团的回城道具。"
  ],
  [
    "所持している通貨が不足しています。",
    "货币不足。"
  ],
  [
    "現在チャット機能は一時停止中です。",
    "聊天功能暂时停用。"
  ],
  [
    "新しいバージョンに更新しています…",
    "正在更新至最新版本…"
  ],
  [
    "信号灯の幽霊 Lv.{level}",
    "信号灯幽灵 Lv.{level}"
  ],
  [
    "野原の風精霊 Lv.{level}",
    "原野风精灵 Lv.{level}"
  ],
  [
    "燠火のトカゲ Lv.{level}",
    "烬火蜥蜴 Lv.{level}"
  ],
  [
    "沼霧の呪杖 x{quantity}",
    "沼雾咒术法杖 x{quantity}"
  ],
  [
    "最大HPの{percent}%回復",
    "恢复最大 HP 的 {percent}%"
  ],
  [
    "Channel {channel}",
    "频道 {channel}"
  ],
  [
    "Choose a Minigame",
    "选择小游戏"
  ],
  [
    "Closest to cursor",
    "优先选择离光标最近的目标"
  ],
  [
    "Contact Developer",
    "联系开发者"
  ],
  [
    "Core Sealed Altar",
    "动力核心封印祭坛"
  ],
  [
    "Crush Press Golem",
    "冲压机魔像"
  ],
  [
    "Duskflower Spirit",
    "暮色花精灵"
  ],
  [
    "EXP gained +{exp}",
    "获得 {exp} 点经验"
  ],
  [
    "Expires in {sec}s",
    "{sec} 秒后过期"
  ],
  [
    "Failed to travel.",
    "城镇传送失败。"
  ],
  [
    "Great Marsh Witch",
    "大沼泽女巫"
  ],
  [
    "HUD非表示（スクリーンショット）",
    "隐藏 HUD（截图）"
  ],
  [
    "No inquiries yet.",
    "暂无咨询。"
  ],
  [
    "No mail received.",
    "没有收到邮件。"
  ],
  [
    "Power Core Depths",
    "动力核心深处"
  ],
  [
    "Press R to revive",
    "按 R 复活"
  ],
  [
    "Received requests",
    "收到的申请"
  ],
  [
    "Requesting entry…",
    "正在进入赛场…"
  ],
  [
    "Returning to town",
    "正在返回城镇"
  ],
  [
    "Scrap Press Golem",
    "废料压缩魔像"
  ],
  [
    "Spiritcaller Robe",
    "唤灵师长袍"
  ],
  [
    "Sunbough Deepwood",
    "阳枝密林"
  ],
  [
    "tap the input box",
    "点按输入框"
  ],
  [
    "Temple Supply Box",
    "教团补给箱"
  ],
  [
    "The party is full",
    "队伍人数已满"
  ],
  [
    "The Sealed Tyrant",
    "被封印的暴君"
  ],
  [
    "Track Cleaner Bot",
    "轨道清扫机器人"
  ],
  [
    "Type your inquiry",
    "请输入反馈内容"
  ],
  [
    "up to {n} targets",
    "最多 {n} 个目标"
  ],
  [
    "Wandering Spirits",
    "游荡的亡灵"
  ],
  [
    "World Tree Temple",
    "世界树教团"
  ],
  [
    "너무 높은 파티원과 사냥중이예요",
    "队友等级远高于你"
  ],
  [
    "노을꽃 정령 Lv.{level}",
    "暮色花精灵 Lv.{level}"
  ],
  [
    "뇌운 와이번 Lv.{level}",
    "雷云飞龙 Lv.{level}"
  ],
  [
    "대습지 마녀 Lv.{level}",
    "大沼泽女巫 Lv.{level}"
  ],
  [
    "도달 거리 {distance}m",
    "已跑 {distance}m"
  ],
  [
    "떠도는 망령 Lv.{level}",
    "游荡亡灵 Lv.{level}"
  ],
  [
    "레이드 정보를 찾을 수 없습니다",
    "找不到该团队副本"
  ],
  [
    "메카 호박 x{quantity}",
    "机械南瓜 x{quantity}"
  ],
  [
    "메카 호박 재소환 대기 중입니다",
    "机械南瓜正在等待重新召唤"
  ],
  [
    "무덤 그림자 Lv.{level}",
    "墓影 Lv.{level}"
  ],
  [
    "선로 청소봇 Lv.{level}",
    "轨道清扫机器人 Lv.{level}"
  ],
  [
    "설맹 그림자 Lv.{level}",
    "雪盲暗影 Lv.{level}"
  ],
  [
    "스파크 정령 Lv.{level}",
    "电火花精灵 Lv.{level}"
  ],
  [
    "신호등 유령 Lv.{level}",
    "信号灯幽灵 Lv.{level}"
  ],
  [
    "안개 그림자 Lv.{level}",
    "雾影 Lv.{level}"
  ],
  [
    "엘프 숲지기 Lv.{level}",
    "精灵守林人 Lv.{level}"
  ],
  [
    "여명 용린병 Lv.{level}",
    "黎明龙鳞兵 Lv.{level}"
  ],
  [
    "여윈 그림자 Lv.{level}",
    "枯瘦暗影 Lv.{level}"
  ],
  [
    "용린 수호자 Lv.{level}",
    "龙鳞守卫 Lv.{level}"
  ],
  [
    "운영팀에서 보상을 지급했습니다.",
    "运营团队向你发放了奖励。"
  ],
  [
    "유효하지 않은 채널 요청입니다.",
    "频道请求无效。"
  ],
  [
    "이미 다른 파티에 속해 있습니다",
    "对方已在其他队伍中"
  ],
  [
    "입간판에 더 가까이 가야 합니다",
    "请再靠近活动立牌一些"
  ],
  [
    "입력하신 내용을 확인해 주세요.",
    "请检查输入内容。"
  ],
  [
    "잉걸 도마뱀 Lv.{level}",
    "烬火蜥蜴 Lv.{level}"
  ],
  [
    "잉걸 새끼용 Lv.{level}",
    "烬火幼龙 Lv.{level}"
  ],
  [
    "자기 자신은 초대할 수 없습니다",
    "不能邀请自己"
  ],
  [
    "장비 슬롯이 일치하지 않습니다.",
    "此物品与装备栏位不匹配。"
  ],
  [
    "잿가루 정령 Lv.{level}",
    "灰尘精灵 Lv.{level}"
  ],
  [
    "전투 중에는 귀환할 수 없습니다",
    "战斗中无法回城"
  ],
  [
    "전투 중에는 입장할 수 없습니다",
    "战斗中无法进入"
  ],
  [
    "지금은 볼 수 없는 파티원이에요",
    "暂时无法观看这名队友"
  ],
  [
    "총 스탯 (Lv {level})",
    "总属性（Lv.{level}）"
  ],
  [
    "최종 도달 거리 {score}m",
    "最终距离 {score}m"
  ],
  [
    "최종 생존 기록 {score}초",
    "最终生存时间 {score}秒"
  ],
  [
    "출석 {day}일차 보상입니다.",
    "这是第 {day} 天的签到奖励。"
  ],
  [
    "코일 거미봇 Lv.{level}",
    "线圈蜘蛛机器人 Lv.{level}"
  ],
  [
    "파티 최고 생존 {score}초",
    "队伍最长生存 {score}秒"
  ],
  [
    "폭주 동력핵 Lv.{level}",
    "暴走动力核心 Lv.{level}"
  ],
  [
    "エルフの森番 Lv.{level}",
    "精灵守林人 Lv.{level}"
  ],
  [
    "このモンスターはレベルが高すぎます",
    "怪物等级远高于你"
  ],
  [
    "さまよう亡霊 Lv.{level}",
    "游荡亡灵 Lv.{level}"
  ],
  [
    "すでに接続しているチャンネルです。",
    "你已在此频道中。"
  ],
  [
    "すでにフレンド申請を送っています。",
    "你已经发送过好友申请。"
  ],
  [
    "スパーク精霊 Lv.{level}",
    "电火花精灵 Lv.{level}"
  ],
  [
    "ヌウリング・バスターズ ランキング",
    "努噜灵大作战 · 今日排行榜"
  ],
  [
    "パーティーリーダーのみ入場できます",
    "只有队长可以开启团队副本"
  ],
  [
    "ポータルの近くまで移動してください",
    "请靠近传送门"
  ],
  [
    "まだ移動できる他の町がありません。",
    "目前没有其他可传送的城镇。"
  ],
  [
    "やせ細った影 Lv.{level}",
    "枯瘦暗影 Lv.{level}"
  ],
  [
    "ランキング — レベルTop100",
    "排行榜 — 等级 Top 100"
  ],
  [
    "レベルアップ!Lv.{level}",
    "升级！Lv.{level}"
  ],
  [
    "{name}님이 전투 중입니다",
    "{name} 正在战斗"
  ],
  [
    "/ 自分の撃破数 {kills}",
    "｜ 我的击杀：{kills}"
  ],
  [
    "☑ Sold out today",
    "☑ 今日售罄"
  ],
  [
    "蒼白の鬼火 Lv.{level}",
    "苍白鬼火 Lv.{level}"
  ],
  [
    "茨藪の獣人 Lv.{level}",
    "荆棘丛兽人 Lv.{level}"
  ],
  [
    "大湿地魔女 Lv.{level}",
    "大沼泽女巫 Lv.{level}"
  ],
  [
    "到達距離 {distance}m",
    "已跑 {distance}m"
  ],
  [
    "古の風精霊 Lv.{level}",
    "远古风精灵 Lv.{level}"
  ],
  [
    "灰火の鬼火 Lv.{level}",
    "余烬鬼火 Lv.{level}"
  ],
  [
    "火傷の獣人 Lv.{level}",
    "焦灼兽人 Lv.{level}"
  ],
  [
    "究極の袋 x{quantity}",
    "终极袋 x{quantity}"
  ],
  [
    "黎明の妖精 Lv.{level}",
    "黎明妖精 Lv.{level}"
  ],
  [
    "溶岩の鬼火 Lv.{level}",
    "熔岩鬼火 Lv.{level}"
  ],
  [
    "霜熊の獣人 Lv.{level}",
    "冰霜熊人 Lv.{level}"
  ],
  [
    "水草の妖精 Lv.{level}",
    "水草妖精 Lv.{level}"
  ],
  [
    "現在のアカウントの復旧コード: ",
    "当前账号的恢复码："
  ],
  [
    "新芽の妖精 Lv.{level}",
    "嫩芽妖精 Lv.{level}"
  ],
  [
    "雪花の妖精 Lv.{level}",
    "雪花妖精 Lv.{level}"
  ],
  [
    "陽花の妖精 Lv.{level}",
    "阳花妖精 Lv.{level}"
  ],
  [
    "油灯の鬼火 Lv.{level}",
    "油灯鬼火 Lv.{level}"
  ],
  [
    "燠火の精霊 Lv.{level}",
    "烬火精灵 Lv.{level}"
  ],
  [
    "燠火の子竜 Lv.{level}",
    "烬火幼龙 Lv.{level}"
  ],
  [
    "運営チームからの報酬が届きました",
    "运营团队的奖励已送达"
  ],
  [
    "沼火の鬼火 Lv.{level}",
    "沼泽鬼火 Lv.{level}"
  ],
  [
    "装備の袋 x{quantity}",
    "装备袋 x{quantity}"
  ],
  [
    "Account Recovery",
    "恢复账号"
  ],
  [
    "Black Marsh Toad",
    "黑沼蟾蜍"
  ],
  [
    "Border Elf Scout",
    "边境精灵斥候"
  ],
  [
    "bottom menu icon",
    "底部菜单图标"
  ],
  [
    "Cutter Automaton",
    "切割自动机"
  ],
  [
    "Dawn Warden Helm",
    "黎明守望者头盔"
  ],
  [
    "Elif x{quantity}",
    "水晶叶 x{quantity}"
  ],
  [
    "Enter a nickname",
    "输入昵称"
  ],
  [
    "Experience Pouch",
    "经验袋"
  ],
  [
    "Gear Enhancement",
    "装备强化"
  ],
  [
    "Gold x{quantity}",
    "金币 x{quantity}"
  ],
  [
    "Highest HP first",
    "优先选择生命值较高的目标"
  ],
  [
    "Molten Slimecore",
    "熔融史莱姆核心"
  ],
  [
    "Moonshadow Witch",
    "月影女巫"
  ],
  [
    "My recovery code",
    "我的恢复码"
  ],
  [
    "Next: {n} stacks",
    "再强化 {n} 层"
  ],
  [
    "No ranking data.",
    "没有排行榜数据。"
  ],
  [
    "No records today",
    "今日尚无人上榜"
  ],
  [
    "No sent requests",
    "暂无已发送的好友申请"
  ],
  [
    "Not enough gold.",
    "金币不足。"
  ],
  [
    "NuruLing Busters",
    "努噜灵大作战"
  ],
  [
    "Quest not found.",
    "找不到任务。"
  ],
  [
    "Raid Recruitment",
    "团队副本招募"
  ],
  [
    "Refresh location",
    "刷新位置"
  ],
  [
    "Resolution scale",
    "分辨率比例"
  ],
  [
    "Select a Channel",
    "选择频道"
  ],
  [
    "Snowblind Shadow",
    "雪盲暗影"
  ],
  [
    "Snowflower Fairy",
    "雪花妖精"
  ],
  [
    "Sunbreeze Forest",
    "晴风森林"
  ],
  [
    "The Ember Valley",
    "烬火山谷"
  ],
  [
    "Time left {time}",
    "剩余时间 {time}"
  ],
  [
    "Twilight Wolfkin",
    "暮色狼人"
  ],
  [
    "Unknown minigame",
    "未知小游戏"
  ],
  [
    "Wandering Spirit",
    "游荡亡灵"
  ],
  [
    "Watcher Eye Lens",
    "监视之眼镜片"
  ],
  [
    "Watching: {name}",
    "观战中：{name}"
  ],
  [
    "개발자의 답변이 도착했습니다.",
    "开发者已回复。"
  ],
  [
    "곡성 유령 Lv.{level}",
    "哀嚎幽灵 Lv.{level}"
  ],
  [
    "낙뢰 정령 Lv.{level}",
    "落雷精灵 Lv.{level}"
  ],
  [
    "눈꽃 요정 Lv.{level}",
    "雪花妖精 Lv.{level}"
  ],
  [
    "닉네임을 먼저 지정해 주세요.",
    "请先设置昵称。"
  ],
  [
    "레벨 {level} 달성 보상",
    "达到 {level} 级的奖励"
  ],
  [
    "레벨 업! Lv.{level}",
    "升级！Lv.{level}"
  ],
  [
    "메카 드론 - 집중 사격 발동",
    "机械无人机：集中射击"
  ],
  [
    "물풀 요정 Lv.{level}",
    "水草妖精 Lv.{level}"
  ],
  [
    "볕꽃 요정 Lv.{level}",
    "阳花妖精 Lv.{level}"
  ],
  [
    "보상은 우편함으로 지급됩니다.",
    "奖励将发送到邮箱。"
  ],
  [
    "보유 크레파스 {count}개",
    "持有金蜡笔 {count} 个"
  ],
  [
    "보유한 귀환 아이템이 없습니다",
    "没有可用的回城道具"
  ],
  [
    "뿌리 골렘 Lv.{level}",
    "树根魔像 Lv.{level}"
  ],
  [
    "새싹 요정 Lv.{level}",
    "嫩芽妖精 Lv.{level}"
  ],
  [
    "숲의 요정 Lv.{level}",
    "森林妖精 Lv.{level}"
  ],
  [
    "안 읽은 문의 {count}건",
    "{count} 条未读反馈"
  ],
  [
    "얼음 정령 Lv.{level}",
    "寒冰精灵 Lv.{level}"
  ],
  [
    "여명 요정 Lv.{level}",
    "黎明妖精 Lv.{level}"
  ],
  [
    "영구 적용 — 한 번 더 클릭",
    "永久强化（再次点击确认）"
  ],
  [
    "온레벨 보너스 {amount}",
    "同等级加成 {amount}"
  ],
  [
    "이동 키는 변경할 수 없습니다",
    "无法更改移动按键"
  ],
  [
    "이미 사용 중인 닉네임입니다.",
    "此昵称已被使用。"
  ],
  [
    "이슬 요정 Lv.{level}",
    "露珠妖精 Lv.{level}"
  ],
  [
    "장착할 수 없는 아이템입니다.",
    "此物品无法装备。"
  ],
  [
    "잿불 정령 Lv.{level}",
    "烬火精灵 Lv.{level}"
  ],
  [
    "존재하지 않는 복구 코드입니다",
    "未找到与此恢复码对应的账号"
  ],
  [
    "지금은 이벤트 기간이 아닙니다",
    "活动尚未开放"
  ],
  [
    "최상급 크레파스가 부족합니다.",
    "金蜡笔不足。"
  ],
  [
    "코드 형식이 올바르지 않습니다",
    "恢复码格式无效"
  ],
  [
    "파티 보너스 +{amount}",
    "队伍加成 +{amount}"
  ],
  [
    "폴리스카 x{quantity}",
    "警车召唤券 x{quantity}"
  ],
  [
    "화상 수인 Lv.{level}",
    "焦灼兽人 Lv.{level}"
  ],
  [
    "エリーフ x{quantity}",
    "水晶叶 x{quantity}"
  ],
  [
    "ゴールド x{quantity}",
    "金币 x{quantity}"
  ],
  [
    "スキルエフェクト発光（ブルーム）",
    "技能特效辉光（Bloom）"
  ],
  [
    "すでに処理されたリクエストです。",
    "此请求已经处理。"
  ],
  [
    "すでに他のミニゲームに参加中です",
    "你已经在其他活动场景中"
  ],
  [
    "すでにフレンドのプレイヤーです。",
    "你们已经是好友。"
  ],
  [
    "そよ風精霊 Lv.{level}",
    "和风精灵 Lv.{level}"
  ],
  [
    "チャンネルの変更に失敗しました。",
    "频道切换失败。"
  ],
  [
    "パーティー最高 {score}m",
    "队伍最佳 {score}m"
  ],
  [
    "ミニゲームに入場できませんでした",
    "入场失败，请稍后再试"
  ],
  [
    "もっと美味しいシナモンキャンディ",
    "比普通肉桂味硬糖更加美味。"
  ],
  [
    "{name}さんが死亡状態です",
    "{name} 已经倒下"
  ],
  [
    "+1 → Lv.{level}",
    "+1 → +{level}"
  ],
  [
    "−1 → Lv.{level}",
    "−1 → +{level}"
  ],
  [
    "1개부터 구매할 수 있습니다",
    "至少需要购买 1 个"
  ],
  [
    "表示できるクエストがありません",
    "没有可显示的任务。"
  ],
  [
    "出席{day}日目の報酬です。",
    "这是第 {day} 天的签到奖励。"
  ],
  [
    "販売中の商品が見つかりません。",
    "找不到正在出售的商品。"
  ],
  [
    "灰塵精霊 Lv.{level}",
    "灰尘精灵 Lv.{level}"
  ],
  [
    "届いた問い合わせはありません。",
    "暂无咨询。"
  ],
  [
    "開発者からの返信が届きました。",
    "开发者已回复。"
  ],
  [
    "哭声幽霊 Lv.{level}",
    "哀嚎幽灵 Lv.{level}"
  ],
  [
    "露の妖精 Lv.{level}",
    "露珠妖精 Lv.{level}"
  ],
  [
    "落雷精霊 Lv.{level}",
    "落雷精灵 Lv.{level}"
  ],
  [
    "墓場の影 Lv.{level}",
    "墓影 Lv.{level}"
  ],
  [
    "強化成功!+{level}達成",
    "强化成功：达到 +{level}！"
  ],
  [
    "森の妖精 Lv.{level}",
    "森林妖精 Lv.{level}"
  ],
  [
    "霜の鬼火 Lv.{level}",
    "冰霜鬼火 Lv.{level}"
  ],
  [
    "所持クレパス {count}個",
    "持有金蜡笔 {count} 个"
  ],
  [
    "現在イベント期間ではありません",
    "活动尚未开放"
  ],
  [
    "現在チャットを送信できません。",
    "目前无法发送聊天消息。"
  ],
  [
    "新しい問い合わせが届きました。",
    "收到新的咨询。"
  ],
  [
    "雪盲の影 Lv.{level}",
    "雪盲暗影 Lv.{level}"
  ],
  [
    "永久適用 — もう一度クリック",
    "永久强化（再次点击确认）"
  ],
  [
    "月影魔女 Lv.{level}",
    "月影女巫 Lv.{level}"
  ],
  [
    "最終到達距離 {score}m",
    "最终距离 {score}m"
  ],
  [
    "最終生存記録 {score}秒",
    "最终生存时间 {score}秒"
  ],
  [
    "Begin Adventure",
    "开始冒险"
  ],
  [
    "Blocked Players",
    "屏蔽列表管理"
  ],
  [
    "Core Watchtower",
    "深处监控塔"
  ],
  [
    "Defense {value}",
    "防御力 {value}"
  ],
  [
    "Duskwood Border",
    "暮色森林边境"
  ],
  [
    "Elven Scout Cap",
    "精灵斥候帽"
  ],
  [
    "Invite to party",
    "邀请组队"
  ],
  [
    "Lowest HP first",
    "优先选择生命值较低的目标"
  ],
  [
    "No record today",
    "今日尚无成绩"
  ],
  [
    "Rail Cart Golem",
    "废弃轨道矿车魔像"
  ],
  [
    "Starlight Flash",
    "星光闪耀"
  ],
  [
    "Waterweed Fairy",
    "水草妖精"
  ],
  [
    "너무 높은 레벨의 몬스터예요",
    "怪物等级远高于你"
  ],
  [
    "랭킹 — 레벨 Top 100",
    "排行榜 — 等级 Top 100"
  ],
  [
    "레이드 입장을 요청했습니다…",
    "正在请求进入团队副本…"
  ],
  [
    "레이드에 입장하지 못했습니다",
    "进入团队副本失败"
  ],
  [
    "문의 내용을 입력해 주세요.",
    "请输入咨询内容。"
  ],
  [
    "보유하지 않은 아이템입니다.",
    "你没有此物品。"
  ],
  [
    "보유한 HP 포션이 없습니다",
    "没有可用的 HP 药水"
  ],
  [
    "어린 용 Lv.{level}",
    "幼龙 Lv.{level}"
  ],
  [
    "엘리프 x{quantity}",
    "水晶叶 x{quantity}"
  ],
  [
    "유효하지 않은 목적지입니다.",
    "目的地无效。"
  ],
  [
    "이미 {label}에 할당됨",
    "该按键已分配给“{label}”"
  ],
  [
    "이미 접속 중인 채널입니다.",
    "你已在此频道中。"
  ],
  [
    "이미 처리 중인 요청입니다.",
    "此请求正在处理中。"
  ],
  [
    "이미 최대 강화 단계입니다.",
    "已达到最高强化等级。"
  ],
  [
    "이미 친구인 플레이어입니다.",
    "你们已经是好友。"
  ],
  [
    "잠시 후 마을로 돌아갑니다…",
    "正在返回城镇…"
  ],
  [
    "지금은 강화할 수 없습니다.",
    "目前无法强化。"
  ],
  [
    "퀘스트를 찾을 수 없습니다.",
    "找不到任务。"
  ],
  [
    "클릭 또는 ESC로 건너뛰기",
    "单击或按 ESC 跳过"
  ],
  [
    "クリックまたはESCでスキップ",
    "单击或按 ESC 跳过"
  ],
  [
    "コードの形式が正しくありません",
    "恢复码格式无效"
  ],
  [
    "サーバーメンテナンスのお知らせ",
    "服务器维护通知"
  ],
  [
    "スタックあたり{count}個",
    "每层消耗 {count} 支"
  ],
  [
    "すでに処理中のリクエストです。",
    "此请求正在处理中。"
  ],
  [
    "ターゲットが有効ではありません",
    "目标无效"
  ],
  [
    "チャンネル {channel}",
    "频道 {channel}"
  ],
  [
    "パーティーの定員がいっぱいです",
    "队伍人数已满"
  ],
  [
    "パーティーメンバー{slot}",
    "队伍成员 {slot}"
  ],
  [
    "パーティーリーダーのみ可能です",
    "只有队长可以执行此操作"
  ],
  [
    "ブロックしたユーザーはいません",
    "暂无已屏蔽玩家"
  ],
  [
    "ポーションの使用に失敗しました",
    "使用药水失败"
  ],
  [
    "ポーションはクールダウン中です",
    "药水正在冷却"
  ],
  [
    "ホットキー({key})で使用",
    "快捷键：{key}"
  ],
  [
    "ミニゲーム情報が見つかりません",
    "未找到小游戏信息"
  ],
  [
    "レイドへの入場を要求しました…",
    "正在请求进入团队副本…"
  ],
  [
    "{count} unread",
    "{count} 条未读反馈"
  ],
  [
    "{name} is dead",
    "{name} 已经倒下"
  ],
  [
    "{name}さんが戦闘中です",
    "{name} 正在战斗"
  ],
  [
    "{time} 후 자동 귀환",
    "将在 {time} 后自动返回"
  ],
  [
    "/ 내 킬수 {kills}",
    "｜ 我的击杀：{kills}"
  ],
  [
    "+1강 → {level}강",
    "+1 → +{level}"
  ],
  [
    "−1강 → {level}강",
    "−1 → +{level}"
  ],
  [
    "氷精霊 Lv.{level}",
    "寒冰精灵 Lv.{level}"
  ],
  [
    "不明なエラーが発生しました。",
    "发生未知错误。"
  ],
  [
    "待機列への参加に失敗しました",
    "匹配失败，请稍后再试"
  ],
  [
    "復旧コードを入力してください",
    "请输入恢复码"
  ],
  [
    "灰亡霊 Lv.{level}",
    "灰烬亡灵 Lv.{level}"
  ],
  [
    "教団（町）へ帰還・HP全回復",
    "返回教团（城镇）并恢复全部生命值"
  ],
  [
    "今は親愛度を上げられません。",
    "目前无法提升好感度。"
  ],
  [
    "看板にもっと近づいてください",
    "请再靠近活动立牌一些"
  ],
  [
    "目的地の町が見つかりません。",
    "找不到目的地城镇。"
  ],
  [
    "送信済みの招待がまだ有効です",
    "已向该玩家发出邀请，请等待回应"
  ],
  [
    "所持ゴールド {count}",
    "金币 {count}"
  ],
  [
    "所持していないアイテムです。",
    "你没有此物品。"
  ],
  [
    "所持している装備がありません",
    "没有此栏位可用的装备。"
  ],
  [
    "偽のカボチャよけ ランキング",
    "南瓜大逃亡 · 今日排行榜"
  ],
  [
    "武器チューニング（デバッグ）",
    "武器调校（调试）"
  ],
  [
    "霧の影 Lv.{level}",
    "雾影 Lv.{level}"
  ],
  [
    "新しいパッチノートがあります",
    "有新的更新日志"
  ],
  [
    "移動する町を選んでください。",
    "请选择目的地。"
  ],
  [
    "幼い竜 Lv.{level}",
    "幼龙 Lv.{level}"
  ],
  [
    "戦闘不能 — 復活案内を確認",
    "已倒下 — 请查看复活提示"
  ],
  [
    "装備スロットが一致しません。",
    "此物品与装备栏位不匹配。"
  ],
  [
    "最上級クレパスが足りません。",
    "金蜡笔不足。"
  ],
  [
    "Ashdust Spirit",
    "灰尘精灵"
  ],
  [
    "Attack {value}",
    "攻击力 {value}"
  ],
  [
    "Change Channel",
    "切换频道"
  ],
  [
    "Cinnamon Candy",
    "肉桂味硬糖"
  ],
  [
    "Click to Start",
    "点击开始"
  ],
  [
    "CLICK TO START",
    "点击开始"
  ],
  [
    "Coil Spiderbot",
    "线圈蜘蛛机器人"
  ],
  [
    "Dawn Elf Guard",
    "黎明精灵守卫"
  ],
  [
    "Duskwing Fairy",
    "暮翼妖精"
  ],
  [
    "Failed to load",
    "加载失败"
  ],
  [
    "Gearfield Moor",
    "齿轮原野"
  ],
  [
    "Halt the Press",
    "停止冲压机"
  ],
  [
    "Invalid target",
    "目标无效"
  ],
  [
    "Item #{itemId}",
    "物品 #{itemId}"
  ],
  [
    "Moonmist Marsh",
    "月雾湿地"
  ],
  [
    "No friends yet",
    "暂无好友"
  ],
  [
    "One Sweet Bite",
    "一颗甜蜜"
  ],
  [
    "Outline effect",
    "轮廓效果"
  ],
  [
    "Press to Start",
    "点击开始"
  ],
  [
    "PRESS TO START",
    "点击开始"
  ],
  [
    "Return to Town",
    "返回城镇"
  ],
  [
    "Rootfall Smash",
    "根落重击"
  ],
  [
    "Sold out today",
    "今日售罄"
  ],
  [
    "Sunbloom Fairy",
    "阳花妖精"
  ],
  [
    "Supreme Crayon",
    "金蜡笔"
  ],
  [
    "Travel to Town",
    "城镇传送"
  ],
  [
    "Ultimate Pouch",
    "终极袋"
  ],
  [
    "게임을 시작할 수 없습니다",
    "无法启动游戏"
  ],
  [
    "골드 x{quantity}",
    "金币 x{quantity}"
  ],
  [
    "그 동료도 쓰러진 상태예요",
    "这名队友也倒下了"
  ],
  [
    "대기열 참가에 실패했습니다",
    "匹配失败，请稍后再试"
  ],
  [
    "대상이 접속 중이 아닙니다",
    "该玩家不在线"
  ],
  [
    "등록된 패치노트가 없습니다",
    "暂无更新日志"
  ],
  [
    "마을 이동에 실패했습니다.",
    "城镇传送失败。"
  ],
  [
    "매칭 완료! 입장하는 중…",
    "匹配成功，正在入场…"
  ],
  [
    "무기 튜닝 (임시 디버그)",
    "武器调校（调试）"
  ],
  [
    "스택당 +{pct}% 증가",
    "每层 +{pct}%"
  ],
  [
    "아이템 수량이 부족합니다.",
    "物品数量不足。"
  ],
  [
    "알 수 없는 미니게임입니다",
    "未知小游戏"
  ],
  [
    "약 3분 주기로 갱신됩니다",
    "约每 3 分钟更新一次"
  ],
  [
    "오늘 하루 기준 순위입니다",
    "仅显示今日成绩"
  ],
  [
    "운영팀 보상이 도착했습니다",
    "运营团队的奖励已送达"
  ],
  [
    "이동할 마을을 선택하세요.",
    "请选择目的地。"
  ],
  [
    "잿망령 Lv.{level}",
    "灰烬亡灵 Lv.{level}"
  ],
  [
    "채널 변경에 실패했습니다.",
    "频道切换失败。"
  ],
  [
    "채널 정보를 불러오는 중…",
    "正在加载频道信息…"
  ],
  [
    "채팅을 보낼 수 없습니다.",
    "目前无法发送聊天消息。"
  ],
  [
    "파티 정원이 가득 찼습니다",
    "队伍人数已满"
  ],
  [
    "파티 최고 {score}m",
    "队伍最佳 {score}m"
  ],
  [
    "파티에 속해 있지 않습니다",
    "你不在队伍中"
  ],
  [
    "판매 중인 상품이 없습니다",
    "没有正在出售的商品。"
  ],
  [
    "현재 계정의 복구 코드: ",
    "当前账号的恢复码："
  ],
  [
    "アイテム #{itemId}",
    "物品 #{itemId}"
  ],
  [
    "アイテムの数量が足りません。",
    "物品数量不足。"
  ],
  [
    "オンボーディング案内を見直す",
    "重新查看新手引导提示"
  ],
  [
    "クエスト報酬を受け取りました",
    "已领取任务奖励。"
  ],
  [
    "ゲームを開始できませんでした",
    "无法启动游戏"
  ],
  [
    "スタックあたり+{pct}%",
    "每层 +{pct}%"
  ],
  [
    "すでに他のレイドに参加中です",
    "你已在其他团队副本中"
  ],
  [
    "チャンネル{channel}",
    "频道 {channel}"
  ],
  [
    "チャンネル情報を読み込み中…",
    "正在加载频道信息…"
  ],
  [
    "パーティー要求に失敗しました",
    "队伍请求失败"
  ],
  [
    "パーティーに所属していません",
    "你不在队伍中"
  ],
  [
    "もっと美味しいガーネットの実",
    "将石榴石果实制成的清甜水果羹，味道更加可口。"
  ],
  [
    "レイドに入場できませんでした",
    "进入团队副本失败"
  ],
  [
    "レベル{level}達成報酬",
    "达到 {level} 级的奖励"
  ],
  [
    "+{amount} EXP",
    "经验值 +{amount}"
  ],
  [
    "報酬支給取り消しのお知らせ",
    "奖励发放取消通知"
  ],
  [
    "報酬を受け取ってください。",
    "请领取奖励。"
  ],
  [
    "本日1日分のランキングです",
    "仅显示今日成绩"
  ],
  [
    "別のアカウントを復旧...",
    "恢复其他账号…"
  ],
  [
    "格納庫防衛ドローン（召喚）",
    "机库防卫无人机（召唤）"
  ],
  [
    "火花を飲み込むインプボット",
    "吞噬火焰的小恶魔机器人"
  ],
  [
    "経験値 +{amount}",
    "经验值 +{amount}"
  ],
  [
    "目標チャンネルは満員です。",
    "目标频道已满员。"
  ],
  [
    "入場をリクエストしました…",
    "正在进入赛场…"
  ],
  [
    "入力内容をご確認ください。",
    "请检查输入内容。"
  ],
  [
    "死亡状態では入場できません",
    "倒地时无法进入"
  ],
  [
    "町の中でのみ移動できます。",
    "只能在城镇内使用传送。"
  ],
  [
    "町への移動に失敗しました。",
    "城镇传送失败。"
  ],
  [
    "無効なチャンネル要求です。",
    "频道请求无效。"
  ],
  [
    "戦闘不能 — Rキーで復活",
    "已倒下 — 按 R 复活"
  ],
  [
    "装備できないアイテムです。",
    "此物品无法装备。"
  ],
  [
    "左クリックターゲットルール",
    "左键选怪规则"
  ],
  [
    "A Sweet Habit",
    "甜蜜的习惯"
  ],
  [
    "Cinder Spirit",
    "烬火精灵"
  ],
  [
    "hotbar button",
    "快捷栏按钮"
  ],
  [
    "Mail claimed.",
    "已领取邮件。"
  ],
  [
    "Mecha Pumpkin",
    "机械南瓜"
  ],
  [
    "Mossback Toad",
    "苔背蟾蜍"
  ],
  [
    "Ner's Regular",
    "尼尔的常客"
  ],
  [
    "Other players",
    "其他玩家"
  ],
  [
    "Petting today",
    "今日抚摸"
  ],
  [
    "Raid Cleared!",
    "团队副本通关！"
  ],
  [
    "Screen layout",
    "画面布局"
  ],
  [
    "Sent requests",
    "已发送的申请"
  ],
  [
    "Shop — {name}",
    "商店 — {name}"
  ],
  [
    "Sprout Uproar",
    "嫩芽的骚动"
  ],
  [
    "To next level",
    "距离下一级"
  ],
  [
    "Wailing Ghost",
    "哀嚎幽灵"
  ],
  [
    "Zone {zoneId}",
    "区域 {zoneId}"
  ],
  [
    "격납고 방위 드론(소환)",
    "机库防卫无人机（召唤）"
  ],
  [
    "경험치 +{amount}",
    "经验值 +{amount}"
  ],
  [
    "낮은 등급부터 자동 선택",
    "优先自动使用品级最低的药水"
  ],
  [
    "닉네임 지정으로 돌아가기",
    "返回昵称设置"
  ],
  [
    "대상을 찾을 수 없습니다",
    "找不到该玩家"
  ],
  [
    "더 맛있는 계피맛 알사탕",
    "比普通肉桂味硬糖更加美味。"
  ],
  [
    "들어온 문의가 없습니다.",
    "暂无咨询。"
  ],
  [
    "메카 드론 - 집중 사격",
    "机械无人机·集中射击"
  ],
  [
    "목표 채널이 만석입니다.",
    "目标频道已满员。"
  ],
  [
    "보유 골드 {count}",
    "金币 {count}"
  ],
  [
    "복구 코드를 입력해주세요",
    "请输入恢复码"
  ],
  [
    "사망 — 부활 안내 확인",
    "已倒下 — 请查看复活提示"
  ],
  [
    "새 문의가 도착했습니다.",
    "收到新的咨询。"
  ],
  [
    "스킬 이펙트 발광(블룸)",
    "技能特效辉光（Bloom）"
  ],
  [
    "아이템 #{itemId}",
    "物品 #{itemId}"
  ],
  [
    "야간 모드(배경 어둡게)",
    "夜间模式（调暗场景）"
  ],
  [
    "이미 처리된 요청입니다.",
    "此请求已经处理。"
  ],
  [
    "일직선상의 모든 적 관통",
    "贯穿直线上的所有敌人"
  ],
  [
    "퀘스트 보상을 받았습니다",
    "已领取任务奖励。"
  ],
  [
    "클릭하여 교체 후보 보기",
    "点击查看可用装备"
  ],
  [
    "타겟이 유효하지 않습니다",
    "目标无效"
  ],
  [
    "파티 요청에 실패했습니다",
    "队伍请求失败"
  ],
  [
    "파티장만 할 수 있습니다",
    "只有队长可以执行此操作"
  ],
  [
    "포션 사용에 실패했습니다",
    "使用药水失败"
  ],
  [
    "표시할 퀘스트가 없습니다",
    "没有可显示的任务。"
  ],
  [
    "핫키({key})로 사용",
    "快捷键：{key}"
  ],
  [
    "획득 경험치 +{exp}",
    "获得 {exp} 点经验"
  ],
  [
    "クエストが見つかりません。",
    "找不到任务。"
  ],
  [
    "ゴールドが不足しています。",
    "金币不足。"
  ],
  [
    "この地域では戦闘できません",
    "无法在此区域战斗"
  ],
  [
    "ショップ — {name}",
    "商店 — {name}"
  ],
  [
    "パーティー参加（1〜4人）",
    "组队入场（1～4人）"
  ],
  [
    "メカドローン・集中射撃発動",
    "机械无人机：集中射击"
  ],
  [
    "ランキング情報がありません",
    "没有排行榜数据。"
  ],
  [
    "リクエストに失敗しました。",
    "请求失败。"
  ],
  [
    "レイド情報が見つかりません",
    "找不到该团队副本"
  ],
  [
    "{level}강 달성!",
    "强化达到 +{level}！"
  ],
  [
    "{sec}秒後に期限切れ",
    "{sec} 秒后过期"
  ],
  [
    "{time}後に自動帰還",
    "将在 {time} 后自动返回"
  ],
  [
    "報酬は郵便箱に届きます。",
    "奖励将发送到邮箱。"
  ],
  [
    "暴走整備ユニット（召喚）",
    "暴走维修单元（召唤）"
  ],
  [
    "販売中の商品がありません",
    "没有正在出售的商品。"
  ],
  [
    "帰還はクールダウン中です",
    "回城正在冷却"
  ],
  [
    "獲得経験値 +{exp}",
    "获得 {exp} 点经验"
  ],
  [
    "既存アカウントを引き継ぐ",
    "继续使用现有账号"
  ],
  [
    "受信した申請がありません",
    "暂无收到的好友申请"
  ],
  [
    "受信した郵便はありません",
    "没有收到邮件。"
  ],
  [
    "送信した申請がありません",
    "暂无已发送的好友申请"
  ],
  [
    "偽のカボチャよけトラック",
    "南瓜大逃亡赛道"
  ],
  [
    "未読 {count} 件",
    "{count} 条未读反馈"
  ],
  [
    "位置の取得に失敗しました",
    "无法加载位置"
  ],
  [
    "夜間モード(背景を暗く)",
    "夜间模式（调暗场景）"
  ],
  [
    "移動キーは変更できません",
    "无法更改移动按键"
  ],
  [
    "約3分周期で更新されます",
    "约每 3 分钟更新一次"
  ],
  [
    "直線上のすべての敵を貫通",
    "贯穿直线上的所有敌人"
  ],
  [
    "自分自身は招待できません",
    "不能邀请自己"
  ],
  [
    "Back to list",
    "返回列表"
  ],
  [
    "Banked {n}pt",
    "已储存材料 {n} pt"
  ],
  [
    "Basic attack",
    "普通攻击"
  ],
  [
    "Basic Attack",
    "普通攻击"
  ],
  [
    "Claim reward",
    "领取奖励"
  ],
  [
    "Click to use",
    "点击使用"
  ],
  [
    "Crayon Pouch",
    "蜡笔袋"
  ],
  [
    "Ember Lizard",
    "烬火蜥蜴"
  ],
  [
    "Emote button",
    "表情按钮"
  ],
  [
    "Enter로 채팅 입력",
    "按 Enter 输入聊天内容"
  ],
  [
    "Enterでチャット入力",
    "按 Enter 输入聊天内容"
  ],
  [
    "Forest Fairy",
    "森林妖精"
  ],
  [
    "Garnet Berry",
    "石榴石果实"
  ],
  [
    "Garnet Punch",
    "石榴石水果羹"
  ],
  [
    "Gaunt Shadow",
    "枯瘦暗影"
  ],
  [
    "HUD 숨김(스크린샷)",
    "隐藏 HUD（截图）"
  ],
  [
    "Next: Lv.{n}",
    "强化至 +{n}"
  ],
  [
    "Out of range",
    "超出攻击范围"
  ],
  [
    "PC 레이아웃으로 전환",
    "切换至 PC 布局"
  ],
  [
    "PCレイアウトに切り替え",
    "切换至 PC 布局"
  ],
  [
    "Reset camera",
    "重置镜头"
  ],
  [
    "Sealed Altar",
    "封印祭坛"
  ],
  [
    "Skill failed",
    "技能施放失败"
  ],
  [
    "Spark Spirit",
    "电火花精灵"
  ],
  [
    "Sprout Fairy",
    "嫩芽妖精"
  ],
  [
    "Stat Upgrade",
    "属性强化"
  ],
  [
    "Time expired",
    "时间已到"
  ],
  [
    "Today's Hunt",
    "今日狩猎"
  ],
  [
    "Unread reply",
    "有未读回复"
  ],
  [
    "View Ranking",
    "今日排行榜"
  ],
  [
    "Web of Coils",
    "线圈蛛网"
  ],
  [
    "Young Dragon",
    "幼龙"
  ],
  [
    "가짜 호박 피하기 랭킹",
    "南瓜大逃亡 · 今日排行榜"
  ],
  [
    "가짜 호박 피하기 트랙",
    "南瓜大逃亡赛道"
  ],
  [
    "관전 중: {name}",
    "观战中：{name}"
  ],
  [
    "남은 시간 {time}",
    "剩余时间 {time}"
  ],
  [
    "더 맛있는 석류석 열매",
    "将石榴石果实制成的清甜水果羹，味道更加可口。"
  ],
  [
    "레이드에 입장하는 중…",
    "正在进入团队副本…"
  ],
  [
    "문의 내용을 입력하세요",
    "请输入反馈内容"
  ],
  [
    "번개철탑 능선에 오르다",
    "登上雷电塔岭"
  ],
  [
    "보상을 수령해 주세요.",
    "请领取奖励。"
  ],
  [
    "보유한 장비가 없습니다",
    "没有此栏位可用的装备。"
  ],
  [
    "스택당 {count}개",
    "每层消耗 {count} 支"
  ],
  [
    "온보딩 안내 다시 보기",
    "重新查看新手引导提示"
  ],
  [
    "외곽선(아웃라인) 효과",
    "轮廓效果"
  ],
  [
    "이미 체력이 가득합니다",
    "HP 已满"
  ],
  [
    "차단한 유저가 없습니다",
    "暂无已屏蔽玩家"
  ],
  [
    "채널 {channel}",
    "频道 {channel}"
  ],
  [
    "최대 강화 단계입니다.",
    "已达到最高强化等级。"
  ],
  [
    "파티 입장 (1~4인)",
    "组队入场（1～4人）"
  ],
  [
    "포탈 근처로 이동하세요",
    "请靠近传送门"
  ],
  [
    "폭주 정비 유닛(소환)",
    "暴走维修单元（召唤）"
  ],
  [
    "クリックで交換候補を表示",
    "点击查看可用装备"
  ],
  [
    "すでに最大強化段階です。",
    "已达到最高强化等级。"
  ],
  [
    "スピキがメモしましたよ!",
    "斯皮奇已经记下来了！"
  ],
  [
    "ゾーン {zoneId}",
    "区域 {zoneId}"
  ],
  [
    "レイドに入場しています…",
    "正在进入团队副本…"
  ],
  [
    "(획득 경험치 감소)",
    "（获得的经验值减少）"
  ],
  [
    "{sec}초 후 만료",
    "{sec} 秒后过期"
  ],
  [
    "{slot}번 파티원",
    "队伍成员 {slot}"
  ],
  [
    "+{level}達成!",
    "强化达到 +{level}！"
  ],
  [
    "本日の報酬回数 無制限",
    "今日奖励次数不限"
  ],
  [
    "本日の記録がありません",
    "今日尚无人上榜"
  ],
  [
    "残り時間 {time}",
    "剩余时间 {time}"
  ],
  [
    "歯車野に足を踏み入れる",
    "踏入齿轮原野"
  ],
  [
    "低グレードから自動選択",
    "优先自动使用品级最低的药水"
  ],
  [
    "読み込みに失敗しました",
    "加载失败"
  ],
  [
    "封印された試作ギガント",
    "封印原型巨像"
  ],
  [
    "工業地帯監督オートマタ",
    "工业区监工自动机"
  ],
  [
    "攻撃力 {value}",
    "攻击力 {value}"
  ],
  [
    "観戦中: {name}",
    "观战中：{name}"
  ],
  [
    "湿地ヒキガエルの使い魔",
    "湿地蟾蜍使魔"
  ],
  [
    "素材が不足しています。",
    "材料不足。"
  ],
  [
    "戦闘中は帰還できません",
    "战斗中无法回城"
  ],
  [
    "戦闘中は入場できません",
    "战斗中无法进入"
  ],
  [
    "招待の期限が切れました",
    "邀请已过期"
  ],
  [
    "Enhancement",
    "强化"
  ],
  [
    "Frame limit",
    "帧率上限"
  ],
  [
    "Gale Pierce",
    "疾风贯穿"
  ],
  [
    "In progress",
    "进行中"
  ],
  [
    "Mist Shadow",
    "雾影"
  ],
  [
    "Music (BGM)",
    "背景音乐（BGM）"
  ],
  [
    "Ner's Stall",
    "尼尔的商店"
  ],
  [
    "Patch Notes",
    "更新日志"
  ],
  [
    "Raid Failed",
    "团队副本失败"
  ],
  [
    "Recommended",
    "推荐"
  ],
  [
    "Soot Impbot",
    "烟灰小恶魔机器人"
  ],
  [
    "Tomb Shadow",
    "墓影"
  ],
  [
    "Unequipped.",
    "已卸下。"
  ],
  [
    "개발자의 호박 지팡이",
    "开发者的南瓜法杖"
  ],
  [
    "공격력 {value}",
    "攻击力 {value}"
  ],
  [
    "구매가 완료되었습니다",
    "购买成功。"
  ],
  [
    "귀환 쿨다운 중입니다",
    "回城正在冷却"
  ],
  [
    "귀환이 취소되었습니다",
    "回城已中断"
  ],
  [
    "누루링 버스터즈 랭킹",
    "努噜灵大作战 · 今日排行榜"
  ],
  [
    "다른 계정 복구...",
    "恢复其他账号…"
  ],
  [
    "떠도는 바람을 붙잡다",
    "捕捉游荡之风"
  ],
  [
    "랭킹 정보가 없습니다",
    "没有排行榜数据。"
  ],
  [
    "미장착 — 효과 없음",
    "尚未装备，属性加成不会生效"
  ],
  [
    "받은 요청이 없습니다",
    "暂无收到的好友申请"
  ],
  [
    "받은 우편이 없습니다",
    "没有收到邮件。"
  ],
  [
    "방어력 {value}",
    "防御力 {value}"
  ],
  [
    "보낸 요청이 없습니다",
    "暂无已发送的好友申请"
  ],
  [
    "보상 지급 취소 안내",
    "奖励发放取消通知"
  ],
  [
    "불꽃을 삼키는 임프봇",
    "吞噬火焰的小恶魔机器人"
  ],
  [
    "사망 — R키로 부활",
    "已倒下 — 按 R 复活"
  ],
  [
    "상점 — {name}",
    "商店 — {name}"
  ],
  [
    "스피키가 적어뒀어요!",
    "斯皮奇已经记下来了！"
  ],
  [
    "아이템을 사용했습니다",
    "已使用物品。"
  ],
  [
    "오늘 기록이 없습니다",
    "今日尚无人上榜"
  ],
  [
    "오늘 보상 수령 완료",
    "今日奖励已领取"
  ],
  [
    "요정나무 견습 지팡이",
    "妖精木学徒法杖"
  ],
  [
    "요정숲 정찰자 지팡이",
    "妖精森林斥候法杖"
  ],
  [
    "이 이름으로 시작하기",
    "使用此昵称开始"
  ],
  [
    "읽지 않은 답변 있음",
    "有未读回复"
  ],
  [
    "입장을 요청했습니다…",
    "正在进入赛场…"
  ],
  [
    "잿가루가 가라앉을 때",
    "当灰烬落定"
  ],
  [
    "초대가 만료되었습니다",
    "邀请已过期"
  ],
  [
    "포션 쿨다운 중입니다",
    "药水正在冷却"
  ],
  [
    "アイテムを使用しました",
    "已使用物品。"
  ],
  [
    "お問い合わせ内容を入力",
    "请输入反馈内容"
  ],
  [
    "クイックマッチ（4人）",
    "四人快速匹配"
  ],
  [
    "さすらう風をつかまえる",
    "捕捉游荡之风"
  ],
  [
    "シナモン健康キャンディ",
    "肉桂味健康硬糖"
  ],
  [
    "すでに体力が満タンです",
    "HP 已满"
  ],
  [
    "その仲間もダウン中です",
    "这名队友也倒下了"
  ],
  [
    "トロッコゴーレムの暴走",
    "失控的废弃轨道矿车魔像"
  ],
  [
    "ニックネーム設定に戻る",
    "返回昵称设置"
  ],
  [
    "ヌウリング・バスターズ",
    "努噜灵大作战"
  ],
  [
    "まもなく町へ戻ります…",
    "正在返回城镇…"
  ],
  [
    "メカドローン・集中射撃",
    "机械无人机·集中射击"
  ],
  [
    "モナティウムからの手紙",
    "来自莫纳提姆的信"
  ],
  [
    "· Assigned",
    "· 已指定"
  ],
  [
    "(獲得経験値が減少)",
    "（获得的经验值减少）"
  ],
  [
    "☑ Sold out",
    "☑ 售罄"
  ],
  [
    "1個から購入できます",
    "至少需要购买 1 个"
  ],
  [
    "本日の報酬は受取済み",
    "今日奖励已领取"
  ],
  [
    "不明なミニゲームです",
    "未知小游戏"
  ],
  [
    "対象が見つかりません",
    "找不到该玩家"
  ],
  [
    "対象がオフラインです",
    "该玩家不在线"
  ],
  [
    "廃線トロッコゴーレム",
    "废弃轨道矿车魔像"
  ],
  [
    "故障した偵察ドローン",
    "故障侦察无人机"
  ],
  [
    "帰還が中断されました",
    "回城已中断"
  ],
  [
    "監視の目を閉じさせろ",
    "闭上监视之眼"
  ],
  [
    "今は強化できません。",
    "目前无法强化。"
  ],
  [
    "開発者のカボチャの兜",
    "开发者的南瓜头盔"
  ],
  [
    "開発者のカボチャの鎧",
    "开发者的南瓜护甲"
  ],
  [
    "開発者のカボチャの杖",
    "开发者的南瓜法杖"
  ],
  [
    "開発者への問い合わせ",
    "联系开发者"
  ],
  [
    "鎌使いの野ねずみ獣人",
    "镰刀田鼠人"
  ],
  [
    "煤まみれインプボット",
    "烟灰小恶魔机器人"
  ],
  [
    "牽引アームオートマタ",
    "牵引钳自动机"
  ],
  [
    "溶接火花インプボット",
    "焊火小恶魔机器人"
  ],
  [
    "湿地魔女のつば広帽子",
    "湿地女巫宽檐帽"
  ],
  [
    "体力 {value}",
    "生命值 {value}"
  ],
  [
    "未装備 — 効果なし",
    "尚未装备，属性加成不会生效"
  ],
  [
    "下部メニューアイコン",
    "底部菜单图标"
  ],
  [
    "巡回ドローン（旧型）",
    "巡逻无人机（旧型）"
  ],
  [
    "妖精団の初心者の上着",
    "妖精团新手上衣"
  ],
  [
    "妖精団の巡回者の上着",
    "妖精团巡逻者上衣"
  ],
  [
    "妖精たちの様子を見て",
    "森林妖精的异动"
  ],
  [
    "郵便を受け取りました",
    "已领取邮件。"
  ],
  [
    "月暈の沼谷のともし火",
    "月环泽谷的灯火"
  ],
  [
    "整備を体に覚えさせる",
    "熟悉整备用品"
  ],
  [
    "Add friend",
    "添加好友"
  ],
  [
    "Ash Wraith",
    "灰烬亡灵"
  ],
  [
    "Attached: ",
    "附件："
  ],
  [
    "Attendance",
    "签到奖励"
  ],
  [
    "Basic Draw",
    "普通抽取"
  ],
  [
    "Block chat",
    "屏蔽聊天"
  ],
  [
    "Burn Scars",
    "灼烧的伤痕"
  ],
  [
    "Consumable",
    "消耗品"
  ],
  [
    "Dawn Fairy",
    "黎明妖精"
  ],
  [
    "Elif Pouch",
    "水晶叶袋"
  ],
  [
    "Gear Pouch",
    "装备袋"
  ],
  [
    "Gold Pouch",
    "金币袋"
  ],
  [
    "HP {value}",
    "生命值 {value}"
  ],
  [
    "Ice Spirit",
    "寒冰精灵"
  ],
  [
    "Item used.",
    "已使用物品。"
  ],
  [
    "Leave Shop",
    "离开商店"
  ],
  [
    "Left Early",
    "提前离场"
  ],
  [
    "MAX 강화 달성!",
    "强化达到 MAX！"
  ],
  [
    "Root Golem",
    "树根魔像"
  ],
  [
    "Speaki RPG",
    "斯皮奇 RPG"
  ],
  [
    "감시의 눈을 감겨라",
    "闭上监视之眼"
  ],
  [
    "개발자의 호박 갑주",
    "开发者的南瓜护甲"
  ],
  [
    "개발자의 호박 투구",
    "开发者的南瓜头盔"
  ],
  [
    "견인 집게 오토마타",
    "牵引钳自动机"
  ],
  [
    "계피맛 건강 알사탕",
    "肉桂味健康硬糖"
  ],
  [
    "고대의 바람 앞에서",
    "直面远古之风"
  ],
  [
    "골드가 부족합니다.",
    "金币不足。"
  ],
  [
    "공단 감독 오토마타",
    "工业区监工自动机"
  ],
  [
    "귀환에 실패했습니다",
    "回城失败"
  ],
  [
    "기존 계정 이어하기",
    "继续使用现有账号"
  ],
  [
    "늪안개 주문 지팡이",
    "沼雾咒术法杖"
  ],
  [
    "다른 플레이어 소리",
    "其他玩家的声音"
  ],
  [
    "달무리 늪골의 불빛",
    "月环泽谷的灯火"
  ],
  [
    "멈추지 않는 수확기",
    "永不停歇的收割机"
  ],
  [
    "방열복 두더지 수인",
    "隔热服鼹鼠人"
  ],
  [
    "보상이 도착했습니다",
    "奖励已送达"
  ],
  [
    "봉인된 시제 기간트",
    "封印原型巨像"
  ],
  [
    "불러오지 못했습니다",
    "加载失败"
  ],
  [
    "서리꽃 결정 지팡이",
    "霜花水晶法杖"
  ],
  [
    "석상 아래 잠든 것",
    "沉睡于石像之下"
  ],
  [
    "습지 두꺼비 사역마",
    "湿地蟾蜍使魔"
  ],
  [
    "어스름을 달리는 것",
    "奔行于暮色之物"
  ],
  [
    "여명빛 거목 지팡이",
    "晨曦巨树法杖"
  ],
  [
    "요정단 순찰자 상의",
    "妖精团巡逻者上衣"
  ],
  [
    "요정단 초심자 상의",
    "妖精团新手上衣"
  ],
  [
    "요청에 실패했습니다",
    "请求失败。"
  ],
  [
    "우편을 수령했습니다",
    "已领取邮件。"
  ],
  [
    "입장하지 못했습니다",
    "入场失败，请稍后再试"
  ],
  [
    "잎갈이 엘프 파수꾼",
    "落叶精灵守卫"
  ],
  [
    "재료가 부족합니다.",
    "材料不足。"
  ],
  [
    "재화가 부족합니다.",
    "货币不足。"
  ],
  [
    "정비를 몸에 익히다",
    "熟悉整备用品"
  ],
  [
    "존 {zoneId}",
    "区域 {zoneId}"
  ],
  [
    "체력 {value}",
    "生命值 {value}"
  ],
  [
    "코어 경비 오토마타",
    "核心守卫自动机"
  ],
  [
    "톱니들녘에 들어서다",
    "踏入齿轮原野"
  ],
  [
    "프레스를 정지시켜라",
    "停止冲压机"
  ],
  [
    "피뢰 기사 오토마타",
    "避雷针骑士自动机"
  ],
  [
    "햇살가지 용린 제단",
    "阳枝龙鳞祭坛"
  ],
  [
    "カボチャ馬車の召喚券",
    "南瓜马车召唤券"
  ],
  [
    "マッチ成立！入場中…",
    "匹配成功，正在入场…"
  ],
  [
    "✓ Claimed",
    "✓ 已领取"
  ],
  [
    "避雷騎士オートマタ",
    "避雷针骑士自动机"
  ],
  [
    "吹雪の中のともし火",
    "暴风雪中的鬼火"
  ],
  [
    "次は{n}スタック",
    "再强化 {n} 层"
  ],
  [
    "購入が完了しました",
    "购买成功。"
  ],
  [
    "帰還に失敗しました",
    "回城失败"
  ],
  [
    "経験値 {exp}",
    "经验值 {exp}"
  ],
  [
    "雷鉄塔の尾根に登る",
    "登上雷电塔岭"
  ],
  [
    "黎明エルフの守護兵",
    "黎明精灵守卫"
  ],
  [
    "利用制限のお知らせ",
    "账号封禁通知"
  ],
  [
    "耐熱服のモグラ獣人",
    "隔热服鼹鼠人"
  ],
  [
    "錆びた番兵ギガント",
    "锈蚀守卫巨像"
  ],
  [
    "取得に失敗しました",
    "查询失败"
  ],
  [
    "溶鉱炉コアゴーレム",
    "熔炉核心魔像"
  ],
  [
    "溶鉄色の煙突地区へ",
    "前往铁辉烟囱区"
  ],
  [
    "石像の下で眠るもの",
    "沉睡于石像之下"
  ],
  [
    "無効な目的地です。",
    "目的地无效。"
  ],
  [
    "圧着プレスゴーレム",
    "冲压机魔像"
  ],
  [
    "妖精樹の見習いの杖",
    "妖精木学徒法杖"
  ],
  [
    "妖精の森の斥候の杖",
    "妖精森林斥候法杖"
  ],
  [
    "戦闘/メニュー切替",
    "切换战斗/菜单"
  ],
  [
    "最大強化段階です。",
    "已达到最高强化等级。"
  ],
  [
    "Checking…",
    "正在检查…"
  ],
  [
    "Congested",
    "拥挤"
  ],
  [
    "Day {day}",
    "第{day}天"
  ],
  [
    "Developer",
    "开发者"
  ],
  [
    "Dew Fairy",
    "露珠妖精"
  ],
  [
    "Ember Orb",
    "余烬火球"
  ],
  [
    "Equipment",
    "装备"
  ],
  [
    "Equipped.",
    "已装备。"
  ],
  [
    "EXP {exp}",
    "经验值 {exp}"
  ],
  [
    "HP Potion",
    "HP 药水"
  ],
  [
    "Inventory",
    "背包"
  ],
  [
    "No record",
    "尚无成绩"
  ],
  [
    "Reconnect",
    "重新连接"
  ],
  [
    "Reviving…",
    "正在救援…"
  ],
  [
    "Ride cart",
    "乘坐马车"
  ],
  [
    "Show code",
    "显示代码"
  ],
  [
    "Unlimited",
    "无限制"
  ],
  [
    "Upgraded.",
    "强化成功。"
  ],
  [
    "Wiped Out",
    "全队倒下"
  ],
  [
    "가짜 호박 피하기",
    "南瓜大逃亡"
  ],
  [
    "격납고 봉인 제단",
    "机库封印祭坛"
  ],
  [
    "견습 마녀의 실험",
    "见习湿地女巫的实验"
  ],
  [
    "경험치 {exp}",
    "经验值 {exp}"
  ],
  [
    "고장난 정찰 드론",
    "故障侦察无人机"
  ],
  [
    "곡성 봉인 지팡이",
    "哀鸣封印法杖"
  ],
  [
    "과부하 배전 정령",
    "过载电路精灵"
  ],
  [
    "광차 골렘의 폭주",
    "失控的废弃轨道矿车魔像"
  ],
  [
    "국경 척후의 시험",
    "边境精灵斥候的试炼"
  ],
  [
    "기본 보상입니다.",
    "这是基础奖励。"
  ],
  [
    "낫잡이 들쥐 수인",
    "镰刀田鼠人"
  ],
  [
    "녹슨 파수 기간트",
    "锈蚀守卫巨像"
  ],
  [
    "눈서리 정령 로브",
    "雪霜精灵长袍"
  ],
  [
    "늪지 마녀 견습장",
    "沼泽女巫导师"
  ],
  [
    "달무리 마녀 로브",
    "月晕女巫长袍"
  ],
  [
    "대습지 마녀 강림",
    "大沼泽女巫降临"
  ],
  [
    "동력핵 봉인 제단",
    "动力核心封印祭坛"
  ],
  [
    "봉인 제단의 용린",
    "封印祭坛的龙鳞"
  ],
  [
    "새 패치노트 있음",
    "有新的更新日志"
  ],
  [
    "서리별 파편 각반",
    "霜星碎片护胫"
  ],
  [
    "서리별 파편 투구",
    "霜星碎片头盔"
  ],
  [
    "쇳물빛 굴뚝지구로",
    "前往铁辉烟囱区"
  ],
  [
    "수인 정찰병 토벌",
    "讨伐森林兽人侦察兵"
  ],
  [
    "순찰 드론(구형)",
    "巡逻无人机（旧型）"
  ],
  [
    "숲 수인 덫사냥꾼",
    "森林兽人陷阱猎手"
  ],
  [
    "심부 감시 관제탑",
    "深处监控塔"
  ],
  [
    "압착 프레스 골렘",
    "冲压机魔像"
  ],
  [
    "어린 용을 달래다",
    "安抚幼龙"
  ],
  [
    "엘프 사냥꾼 각반",
    "精灵猎手护胫"
  ],
  [
    "여명 엘프 수호병",
    "黎明精灵守卫"
  ],
  [
    "여명 파수꾼 각반",
    "黎明守望者护胫"
  ],
  [
    "여명 파수꾼 투구",
    "黎明守望者头盔"
  ],
  [
    "오늘 보상 무제한",
    "今日奖励次数不限"
  ],
  [
    "용광로 코어 골렘",
    "熔炉核心魔像"
  ],
  [
    "용린 각인 지팡이",
    "龙鳞刻纹法杖"
  ],
  [
    "용접 불꽃 임프봇",
    "焊火小恶魔机器人"
  ],
  [
    "일일 로그인 보상",
    "每日登录奖励"
  ],
  [
    "자동매칭 (4인)",
    "四人快速匹配"
  ],
  [
    "잿그늘 상복 로브",
    "灰烬哀悼长袍"
  ],
  [
    "절단기를 해체하라",
    "拆除切割自动机"
  ],
  [
    "좌클릭 타겟 규칙",
    "左键选怪规则"
  ],
  [
    "폐선로 광차 골렘",
    "废弃轨道矿车魔像"
  ],
  [
    "폐선로에 다다르다",
    "抵达旧信号铁路"
  ],
  [
    "하단 메뉴 아이콘",
    "底部菜单图标"
  ],
  [
    "호박 축제 꾸러미",
    "南瓜庆典礼包"
  ],
  [
    "ガーネットの水菓子",
    "石榴石水果羹"
  ],
  [
    "カボチャ祭りの包み",
    "南瓜庆典礼包"
  ],
  [
    "クールダウン中です",
    "技能正在冷却"
  ],
  [
    "コア警備オートマタ",
    "核心守卫自动机"
  ],
  [
    "シナモンキャンディ",
    "肉桂味硬糖"
  ],
  [
    "ニックネームを入力",
    "输入昵称"
  ],
  [
    "プレスを停止させろ",
    "停止冲压机"
  ],
  [
    "フレンドがいません",
    "暂无好友"
  ],
  [
    "ブロックリスト管理",
    "屏蔽列表管理"
  ],
  [
    "{score}s",
    "{score}秒"
  ],
  [
    "{score}초",
    "{score}秒"
  ],
  [
    "☑ 本日売り切れ",
    "☑ 今日售罄"
  ],
  [
    "✓ 受け取り済み",
    "✓ 已领取"
  ],
  [
    "薄暮を駆けるもの",
    "奔行于暮色之物"
  ],
  [
    "報酬が届きました",
    "奖励已送达"
  ],
  [
    "次は+{n}強化",
    "强化至 +{n}"
  ],
  [
    "大湿地魔女の降臨",
    "大沼泽女巫降临"
  ],
  [
    "大樹の根の胸当て",
    "巨树根须胸甲"
  ],
  [
    "動力核の封印祭壇",
    "动力核心封印祭坛"
  ],
  [
    "廃品圧縮ゴーレム",
    "废料压缩魔像"
  ],
  [
    "廃線機関長の幽霊",
    "旧铁路幽灵列车长"
  ],
  [
    "廃線にたどり着く",
    "抵达旧信号铁路"
  ],
  [
    "封印の祭壇の竜鱗",
    "封印祭坛的龙鳞"
  ],
  [
    "復活案内をタップ",
    "点按复活提示"
  ],
  [
    "格納庫の封印祭壇",
    "机库封印祭坛"
  ],
  [
    "国境エルフの斥候",
    "边境精灵斥候"
  ],
  [
    "黒沼のヒキガエル",
    "黑沼蟾蜍"
  ],
  [
    "灰陰の喪服ローブ",
    "灰烬哀悼长袍"
  ],
  [
    "積立 {n}pt",
    "已储存材料 {n} pt"
  ],
  [
    "見習い魔女の実験",
    "见习湿地女巫的实验"
  ],
  [
    "精霊使いのローブ",
    "唤灵师长袍"
  ],
  [
    "冷却散布ドローン",
    "冷却液喷洒无人机"
  ],
  [
    "黎明の番人の脚衣",
    "黎明守望者护胫"
  ],
  [
    "竜族の戦闘かぶと",
    "龙族战斗头盔"
  ],
  [
    "落葉のエルフ森番",
    "落叶精灵守卫"
  ],
  [
    "目覚めたての亡霊",
    "初醒亡灵"
  ],
  [
    "排気清掃ドローン",
    "排气清扫无人机"
  ],
  [
    "切断機オートマタ",
    "切割自动机"
  ],
  [
    "切断機を解体せよ",
    "拆除切割自动机"
  ],
  [
    "溶解スライムコア",
    "熔融史莱姆核心"
  ],
  [
    "溶鉄色の煙突地区",
    "铁辉烟囱区"
  ],
  [
    "獣人戦士のかぶと",
    "兽族战士头盔"
  ],
  [
    "送電監視ドローン",
    "输电监控无人机"
  ],
  [
    "他プレイヤーの音",
    "其他玩家的声音"
  ],
  [
    "苔背のヒキガエル",
    "苔背蟾蜍"
  ],
  [
    "偽のカボチャよけ",
    "南瓜大逃亡"
  ],
  [
    "現在のチャンネル",
    "当前频道"
  ],
  [
    "雪霜精霊のローブ",
    "雪霜精灵长袍"
  ],
  [
    "幼い竜をなだめる",
    "安抚幼龙"
  ],
  [
    "燠火の竜鱗の暴君",
    "烬火龙鳞暴君"
  ],
  [
    "月暈魔女のローブ",
    "月晕女巫长袍"
  ],
  [
    "沼地魔女見習い長",
    "沼泽女巫导师"
  ],
  [
    "止まらない収穫機",
    "永不停歇的收割机"
  ],
  [
    "自分の復旧コード",
    "我的恢复码"
  ],
  [
    "Buy Item",
    "购买物品"
  ],
  [
    "Cleared!",
    "通关！"
  ],
  [
    "Continue",
    "继续"
  ],
  [
    "Graphics",
    "画面"
  ],
  [
    "Interact",
    "互动"
  ],
  [
    "Keybinds",
    "按键绑定"
  ],
  [
    "Language",
    "语言"
  ],
  [
    "MAX強化達成!",
    "强化达到 MAX！"
  ],
  [
    "Moderate",
    "一般"
  ],
  [
    "Monatium",
    "莫纳提姆"
  ],
  [
    "Mute all",
    "全部静音"
  ],
  [
    "Settings",
    "设置"
  ],
  [
    "Sold out",
    "售罄"
  ],
  [
    "Standing",
    "常驻"
  ],
  [
    "Tap here",
    "点按此处"
  ],
  [
    "가로등 공단길로",
    "前往灯火工厂区"
  ],
  [
    "갓 깨어난 망령",
    "初醒亡灵"
  ],
  [
    "거목 뿌리 흉갑",
    "巨树根须胸甲"
  ],
  [
    "교단 보급 상자",
    "教团补给箱"
  ],
  [
    "교단에서 눈뜨다",
    "在教团中醒来"
  ],
  [
    "국경 엘프 척후",
    "边境精灵斥候"
  ],
  [
    "기름등 도깨비불",
    "油灯鬼火"
  ],
  [
    "냉각 살포 드론",
    "冷却液喷洒无人机"
  ],
  [
    "노을숲 국경으로",
    "前往暮色森林边境"
  ],
  [
    "누루링 버스터즈",
    "努噜灵大作战"
  ],
  [
    "눈보라 속 불씨",
    "暴风雪中的鬼火"
  ],
  [
    "다음 {n}스택",
    "再强化 {n} 层"
  ],
  [
    "떠도는 바람정령",
    "游荡风精灵"
  ],
  [
    "레이드 클리어!",
    "团队副本通关！"
  ],
  [
    "마을로 귀환 중",
    "正在返回城镇"
  ],
  [
    "메카 호박 소환",
    "召唤机械南瓜"
  ],
  [
    "모나티엄의 편지",
    "来自莫纳提姆的信"
  ],
  [
    "묘지기 석상망령",
    "守墓石像亡灵"
  ],
  [
    "무덤지기 대망령",
    "守墓大亡灵"
  ],
  [
    "배경음(BGM)",
    "背景音乐（BGM）"
  ],
  [
    "배기 청소 드론",
    "排气清扫无人机"
  ],
  [
    "번개철탑 수호기",
    "雷电塔守护机"
  ],
  [
    "부활 안내창 탭",
    "点按复活提示"
  ],
  [
    "부활시키는 중…",
    "正在救援…"
  ],
  [
    "뿌리 얽힌 망령",
    "根缚亡灵"
  ],
  [
    "사거리 밖입니다",
    "超出攻击范围"
  ],
  [
    "서리별 고대정령",
    "霜星远古精灵"
  ],
  [
    "서버 점검 안내",
    "服务器维护通知"
  ],
  [
    "송전 감시 드론",
    "输电监控无人机"
  ],
  [
    "쇳물빛 굴뚝지구",
    "铁辉烟囱区"
  ],
  [
    "수인 가죽 각반",
    "兽族皮革护胫"
  ],
  [
    "수인 가죽 두건",
    "兽族皮革兜帽"
  ],
  [
    "수인 전사 각반",
    "兽族战士护胫"
  ],
  [
    "수인 전사 투구",
    "兽族战士头盔"
  ],
  [
    "숲 수인 정찰병",
    "森林兽人侦察兵"
  ],
  [
    "습지마녀 챙모자",
    "湿地女巫宽檐帽"
  ],
  [
    "심부 진입 정비",
    "深入前的整备"
  ],
  [
    "안개 속 그림자",
    "迷雾中的暗影"
  ],
  [
    "압축장을 멈춰라",
    "停止压缩场"
  ],
  [
    "어스름 늑대수인",
    "暮色狼人"
  ],
  [
    "오늘 기록 없음",
    "今日尚无成绩"
  ],
  [
    "위치 조회 실패",
    "无法加载位置"
  ],
  [
    "융해 슬라임코어",
    "熔融史莱姆核心"
  ],
  [
    "이용 제한 안내",
    "账号封禁通知"
  ],
  [
    "잉걸 용린 폭군",
    "烬火龙鳞暴君"
  ],
  [
    "잉걸 화심 제단",
    "烬火炎心祭坛"
  ],
  [
    "잿그늘 무덤언덕",
    "灰影墓丘"
  ],
  [
    "잿빛 곡성 유령",
    "灰烬哀嚎幽灵"
  ],
  [
    "잿빛 석관 성소",
    "灰烬石棺圣所"
  ],
  [
    "적립 {n}pt",
    "已储存材料 {n} pt"
  ],
  [
    "전투/메뉴 전환",
    "切换战斗/菜单"
  ],
  [
    "절단기 오토마타",
    "切割自动机"
  ],
  [
    "정령결속 지팡이",
    "精灵缚结法杖"
  ],
  [
    "제한 시간 초과",
    "时间已到"
  ],
  [
    "차단 목록 관리",
    "屏蔽列表管理"
  ],
  [
    "창백한 도깨비불",
    "苍白鬼火"
  ],
  [
    "최상급 크레파스",
    "金蜡笔"
  ],
  [
    "친구가 없습니다",
    "暂无好友"
  ],
  [
    "쿨다운 중입니다",
    "技能正在冷却"
  ],
  [
    "크레파스 주머니",
    "蜡笔袋"
  ],
  [
    "파수정령의 순찰",
    "黎明守护精灵的巡逻"
  ],
  [
    "폐품 압축 골렘",
    "废料压缩魔像"
  ],
  [
    "폭주 전력 정령",
    "暴走电力精灵"
  ],
  [
    "햇살가지 깊은숲",
    "阳枝密林"
  ],
  [
    "호박마차 소환권",
    "南瓜马车召唤券"
  ],
  [
    "효과음(SFX)",
    "音效（SFX）"
  ],
  [
    "アウトライン効果",
    "轮廓效果"
  ],
  [
    "エルフ猟師の脚衣",
    "精灵猎手护胫"
  ],
  [
    "かぼちゃ畑 本日",
    "今日南瓜田"
  ],
  [
    "コイル蜘蛛ボット",
    "线圈蜘蛛机器人"
  ],
  [
    "コイルの蜘蛛の巣",
    "线圈蛛网"
  ],
  [
    "この名前で始める",
    "使用此昵称开始"
  ],
  [
    "チャットブロック",
    "屏蔽聊天"
  ],
  [
    "ニックネーム設定",
    "设置昵称"
  ],
  [
    "ホットバーボタン",
    "快捷栏按钮"
  ],
  [
    "ミニゲームを選択",
    "选择小游戏"
  ],
  [
    "メカカボチャ召喚",
    "召唤机械南瓜"
  ],
  [
    "ランキングを見る",
    "今日排行榜"
  ],
  [
    "ログインボーナス",
    "登录奖励"
  ],
  [
    "{day}日目",
    "第{day}天"
  ],
  [
    "{day}일차",
    "第{day}天"
  ],
  [
    "{rank}位",
    "#{rank}"
  ],
  [
    "{rank}위",
    "#{rank}"
  ],
  [
    "☑ 오늘 매진",
    "☑ 今日售罄"
  ],
  [
    "✓ 수령 완료",
    "✓ 已领取"
  ],
  [
    "報酬を受け取る",
    "领取奖励"
  ],
  [
    "暴走する動力核",
    "暴走动力核心"
  ],
  [
    "本日の記録なし",
    "今日尚无成绩"
  ],
  [
    "歯車刃の収穫機",
    "齿刃收割机"
  ],
  [
    "次のレベルまで",
    "距离下一级"
  ],
  [
    "大地割りの一撃",
    "根落重击"
  ],
  [
    "封印された暴君",
    "被封印的暴君"
  ],
  [
    "封印された竜鱗",
    "被封印的龙鳞"
  ],
  [
    "国境斥候の試練",
    "边境精灵斥候的试炼"
  ],
  [
    "過負荷配電精霊",
    "过载电路精灵"
  ],
  [
    "画面レイアウト",
    "画面布局"
  ],
  [
    "黄昏森の大族長",
    "暮色森林大酋长"
  ],
  [
    "黄昏森の国境へ",
    "前往暮色森林边境"
  ],
  [
    "灰塵が沈むころ",
    "当灰烬落定"
  ],
  [
    "灰色の哭声幽霊",
    "灰烬哀嚎幽灵"
  ],
  [
    "基本報酬です。",
    "这是基础奖励。"
  ],
  [
    "見習い湿地魔女",
    "见习湿地女巫"
  ],
  [
    "教団で目覚めて",
    "在教团中醒来"
  ],
  [
    "街灯工業地区へ",
    "前往灯火工厂区"
  ],
  [
    "解像度スケール",
    "分辨率比例"
  ],
  [
    "雷雲ワイバーン",
    "雷云飞龙"
  ],
  [
    "雷鉄塔の守護機",
    "雷电塔守护机"
  ],
  [
    "黎明光の守護者",
    "曙光守卫"
  ],
  [
    "黎明の大樹の杖",
    "晨曦巨树法杖"
  ],
  [
    "黎明の番人の兜",
    "黎明守望者头盔"
  ],
  [
    "竜族の戦闘脚衣",
    "龙族战斗护胫"
  ],
  [
    "墓守の石像亡霊",
    "守墓石像亡灵"
  ],
  [
    "墓守りのフード",
    "守墓人兜帽"
  ],
  [
    "入力欄をタップ",
    "点按输入框"
  ],
  [
    "森の獣人罠猟師",
    "森林兽人陷阱猎手"
  ],
  [
    "深部監視管制塔",
    "深处监控塔"
  ],
  [
    "深部進入の整備",
    "深入前的整备"
  ],
  [
    "湿地魔女の脚衣",
    "湿地女巫护胫"
  ],
  [
    "獣人斥候の討伐",
    "讨伐森林兽人侦察兵"
  ],
  [
    "獣人戦士の脚衣",
    "兽族战士护胫"
  ],
  [
    "獣人の革の脚衣",
    "兽族皮革护胫"
  ],
  [
    "霜星の古の精霊",
    "霜星远古精灵"
  ],
  [
    "霜星の破片脚衣",
    "霜星碎片护胫"
  ],
  [
    "未読の返信あり",
    "有未读回复"
  ],
  [
    "線路清掃ボット",
    "轨道清扫机器人"
  ],
  [
    "新芽たちの騒ぎ",
    "嫩芽的骚动"
  ],
  [
    "圧縮場を止めろ",
    "停止压缩场"
  ],
  [
    "陽枝の竜鱗祭壇",
    "阳枝龙鳞祭坛"
  ],
  [
    "燠火の火心祭壇",
    "烬火炎心祭坛"
  ],
  [
    "月明かりの鬼火",
    "月光鬼火"
  ],
  [
    "最上級クレパス",
    "金蜡笔"
  ],
  [
    "Account",
    "账号"
  ],
  [
    "Balance",
    "持有"
  ],
  [
    "Channel",
    "频道"
  ],
  [
    "Claimed",
    "已领取"
  ],
  [
    "Confirm",
    "确认"
  ],
  [
    "Current",
    "当前频道"
  ],
  [
    "Decline",
    "拒绝"
  ],
  [
    "Defense",
    "防御力"
  ],
  [
    "Dismiss",
    "关闭"
  ],
  [
    "Friends",
    "好友"
  ],
  [
    "HPポーション",
    "HP 药水"
  ],
  [
    "Loading",
    "加载中"
  ],
  [
    "Mailbox",
    "邮箱"
  ],
  [
    "Monster",
    "怪物"
  ],
  [
    "My rank",
    "我的排名"
  ],
  [
    "No data",
    "无数据"
  ],
  [
    "Offline",
    "离线"
  ],
  [
    "Promote",
    "转让队长"
  ],
  [
    "Ranking",
    "排行榜"
  ],
  [
    "Recover",
    "执行恢复"
  ],
  [
    "Refresh",
    "刷新"
  ],
  [
    "Relaxed",
    "空闲"
  ],
  [
    "Respawn",
    "复活"
  ],
  [
    "Saving…",
    "正在保存…"
  ],
  [
    "Skill 1",
    "技能 1"
  ],
  [
    "Skill 2",
    "技能 2"
  ],
  [
    "Skill 3",
    "技能 3"
  ],
  [
    "Skill 4",
    "技能 4"
  ],
  [
    "Time Up",
    "时间到"
  ],
  [
    "Unblock",
    "解除屏蔽"
  ],
  [
    "Unequip",
    "卸下"
  ],
  [
    "Upgrade",
    "强化"
  ],
  [
    "가시덤불 수인",
    "荆棘丛兽人"
  ],
  [
    "감시 눈알렌즈",
    "监视之眼镜片"
  ],
  [
    "검은늪 두꺼비",
    "黑沼蟾蜍"
  ],
  [
    "견습 습지마녀",
    "见习湿地女巫"
  ],
  [
    "경험치 주머니",
    "经验袋"
  ],
  [
    "계피맛 알사탕",
    "肉桂味硬糖"
  ],
  [
    "고대 바람정령",
    "远古风精灵"
  ],
  [
    "교단의 후원자",
    "教团赞助者"
  ],
  [
    "궁극의 주머니",
    "终极袋"
  ],
  [
    "그을음 임프봇",
    "烟灰小恶魔机器人"
  ],
  [
    "기름등을 끄다",
    "熄灭油灯"
  ],
  [
    "내 복구 코드",
    "我的恢复码"
  ],
  [
    "노을나비 요정",
    "暮翼妖精"
  ],
  [
    "노을숲 대족장",
    "暮色森林大酋长"
  ],
  [
    "늪불 도깨비불",
    "沼泽鬼火"
  ],
  [
    "다른 플레이어",
    "其他玩家"
  ],
  [
    "다음 {n}강",
    "强化至 +{n}"
  ],
  [
    "다음 레벨까지",
    "距离下一级"
  ],
  [
    "달그림자 마녀",
    "月影女巫"
  ],
  [
    "달빛 도깨비불",
    "月光鬼火"
  ],
  [
    "달안개 습지로",
    "前往月雾湿地"
  ],
  [
    "달콤한 한 알",
    "一颗甜蜜"
  ],
  [
    "동력핵 심부로",
    "深入动力核心"
  ],
  [
    "들녘 바람정령",
    "原野风精灵"
  ],
  [
    "무덤지기 각반",
    "守墓人护胫"
  ],
  [
    "무덤지기 후드",
    "守墓人兜帽"
  ],
  [
    "미니게임 선택",
    "选择小游戏"
  ],
  [
    "번개철탑 능선",
    "雷电塔岭"
  ],
  [
    "불잉걸 용암굴",
    "烬火熔岩窟"
  ],
  [
    "뿌리 내려찍기",
    "根落重击"
  ],
  [
    "뿌리굴의 문턱",
    "曙光根穴的入口"
  ],
  [
    "산들 바람정령",
    "和风精灵"
  ],
  [
    "서리 곰 수인",
    "冰霜熊人"
  ],
  [
    "서리 도깨비불",
    "冰霜鬼火"
  ],
  [
    "서리별 고개로",
    "前往霜星雪岭"
  ],
  [
    "서리별 눈언덕",
    "霜星雪岭"
  ],
  [
    "성실한 순례자",
    "勤勉的朝圣者"
  ],
  [
    "숲지기의 시험",
    "守林人的试炼"
  ],
  [
    "스피키 키우기",
    "斯皮奇养成"
  ],
  [
    "습지마녀 각반",
    "湿地女巫护胫"
  ],
  [
    "신호등 폐선로",
    "旧信号铁路"
  ],
  [
    "쓰다듬기 오늘",
    "今日抚摸"
  ],
  [
    "엘리프 주머니",
    "水晶叶袋"
  ],
  [
    "여명 파수정령",
    "黎明守护精灵"
  ],
  [
    "여명빛 뿌리굴",
    "曙光根穴"
  ],
  [
    "여명빛 파수꾼",
    "曙光守卫"
  ],
  [
    "여명의 문지기",
    "黎明守门人"
  ],
  [
    "요정을 살펴라",
    "森林妖精的异动"
  ],
  [
    "용암 도깨비불",
    "熔岩鬼火"
  ],
  [
    "용족 전투각반",
    "龙族战斗护胫"
  ],
  [
    "용족 전투투구",
    "龙族战斗头盔"
  ],
  [
    "위치 새로고침",
    "刷新位置"
  ],
  [
    "이끼등 두꺼비",
    "苔背蟾蜍"
  ],
  [
    "잿불 도깨비불",
    "余烬鬼火"
  ],
  [
    "잿빛 안개묘지",
    "灰雾墓园"
  ],
  [
    "지정하는 중…",
    "正在保存…"
  ],
  [
    "체력 낮은 순",
    "优先选择生命值较低的目标"
  ],
  [
    "체력 높은 순",
    "优先选择生命值较高的目标"
  ],
  [
    "최대 {n}체",
    "最多 {n} 个目标"
  ],
  [
    "클릭하여 사용",
    "点击使用"
  ],
  [
    "톱니날 수확기",
    "齿刃收割机"
  ],
  [
    "폐선로 기관장",
    "旧铁路幽灵列车长"
  ],
  [
    "한 주의 토벌",
    "本周讨伐"
  ],
  [
    "해상도 스케일",
    "分辨率比例"
  ],
  [
    "화면 레이아웃",
    "画面布局"
  ],
  [
    "확인하는 중…",
    "正在检查…"
  ],
  [
    "アカウント復旧",
    "恢复账号"
  ],
  [
    "エモートボタン",
    "表情按钮"
  ],
  [
    "エルフの斥候帽",
    "精灵斥候帽"
  ],
  [
    "カーソル最寄り",
    "优先选择离光标最近的目标"
  ],
  [
    "ガーネットの実",
    "石榴石果实"
  ],
  [
    "カメラリセット",
    "重置镜头"
  ],
  [
    "クリックで使用",
    "点击使用"
  ],
  [
    "コピーしました",
    "已复制"
  ],
  [
    "さすらう風精霊",
    "游荡风精灵"
  ],
  [
    "ショップを出る",
    "离开商店"
  ],
  [
    "ステータス強化",
    "属性强化"
  ],
  [
    "チャンネル変更",
    "切换频道"
  ],
  [
    "チャンネル選択",
    "选择频道"
  ],
  [
    "なでなで 本日",
    "今日抚摸"
  ],
  [
    "ネルの常連さん",
    "尼尔的常客"
  ],
  [
    "パーティー招待",
    "邀请组队"
  ],
  [
    "パトカー召喚券",
    "警车召唤券"
  ],
  [
    "レイドクリア!",
    "团队副本通关！"
  ],
  [
    "· 指定済み",
    "· 已指定"
  ],
  [
    "{sec}s",
    "{sec}秒"
  ],
  [
    "{sec}초",
    "{sec}秒"
  ],
  [
    "☑ 売り切れ",
    "☑ 售罄"
  ],
  [
    "薄暮の狼獣人",
    "暮色狼人"
  ],
  [
    "暴走電力精霊",
    "暴走电力精灵"
  ],
  [
    "本日売り切れ",
    "今日售罄"
  ],
  [
    "動力核深部へ",
    "深入动力核心"
  ],
  [
    "番精霊の巡回",
    "黎明守护精灵的巡逻"
  ],
  [
    "甘いひとつぶ",
    "一颗甜蜜"
  ],
  [
    "根絡みの亡霊",
    "根缚亡灵"
  ],
  [
    "根の洞の敷居",
    "曙光根穴的入口"
  ],
  [
    "根のゴーレム",
    "树根魔像"
  ],
  [
    "古の風の前で",
    "直面远古之风"
  ],
  [
    "黄昏蝶の妖精",
    "暮翼妖精"
  ],
  [
    "黄昏花の精霊",
    "暮色花精灵"
  ],
  [
    "黄昏森の国境",
    "暮色森林边境"
  ],
  [
    "灰の石棺聖所",
    "灰烬石棺圣所"
  ],
  [
    "監視眼レンズ",
    "监视之眼镜片"
  ],
  [
    "教団の補給箱",
    "教团补给箱"
  ],
  [
    "教団の帰還書",
    "教团回城卷轴"
  ],
  [
    "教団の後援者",
    "教团赞助者"
  ],
  [
    "街灯工業地帯",
    "灯火工厂区"
  ],
  [
    "解除しました",
    "已卸下。"
  ],
  [
    "精霊結束の杖",
    "精灵缚结法杖"
  ],
  [
    "哭声封印の杖",
    "哀鸣封印法杖"
  ],
  [
    "雷鉄塔の尾根",
    "雷电塔岭"
  ],
  [
    "黎明光の根洞",
    "曙光根穴"
  ],
  [
    "黎明の番精霊",
    "黎明守护精灵"
  ],
  [
    "黎明の竜鱗兵",
    "黎明龙鳞兵"
  ],
  [
    "竜鱗刻印の杖",
    "龙鳞刻纹法杖"
  ],
  [
    "竜鱗の守護者",
    "龙鳞守卫"
  ],
  [
    "竜鱗の胸当て",
    "龙鳞胸甲"
  ],
  [
    "冒険を始める",
    "开始冒险"
  ],
  [
    "墓守の大亡霊",
    "守墓大亡灵"
  ],
  [
    "墓守りの脚衣",
    "守墓人护胫"
  ],
  [
    "強化しました",
    "强化成功。"
  ],
  [
    "溶解の境界線",
    "熔融边界"
  ],
  [
    "森の獣人斥候",
    "森林兽人侦察兵"
  ],
  [
    "実直な巡礼者",
    "勤勉的朝圣者"
  ],
  [
    "受信した申請",
    "收到的申请"
  ],
  [
    "受け取り済み",
    "已领取"
  ],
  [
    "獣人の革頭巾",
    "兽族皮革兜帽"
  ],
  [
    "霜花結晶の杖",
    "霜花水晶法杖"
  ],
  [
    "霜星の破片兜",
    "霜星碎片头盔"
  ],
  [
    "送信した申請",
    "已发送的申请"
  ],
  [
    "他プレイヤー",
    "其他玩家"
  ],
  [
    "完全ミュート",
    "全部静音"
  ],
  [
    "信号灯の廃線",
    "旧信号铁路"
  ],
  [
    "信号灯の幽霊",
    "信号灯幽灵"
  ],
  [
    "野原の風精霊",
    "原野风精灵"
  ],
  [
    "燠火の溶岩窟",
    "烬火熔岩窟"
  ],
  [
    "燠火のトカゲ",
    "烬火蜥蜴"
  ],
  [
    "月霧の湿地へ",
    "前往月雾湿地"
  ],
  [
    "制限時間切れ",
    "时间已到"
  ],
  [
    "装備しました",
    "已装备。"
  ],
  [
    "最大{n}体",
    "最多 {n} 个目标"
  ],
  [
    "Accept",
    "接受"
  ],
  [
    "Attack",
    "攻击力"
  ],
  [
    "Bottom",
    "下装"
  ],
  [
    "Cancel",
    "取消"
  ],
  [
    "Change",
    "更改"
  ],
  [
    "Choose",
    "选择"
  ],
  [
    "Combat",
    "战斗"
  ],
  [
    "Copied",
    "已复制"
  ],
  [
    "HPが低い順",
    "优先选择生命值较低的目标"
  ],
  [
    "HPが高い順",
    "优先选择生命值较高的目标"
  ],
  [
    "Leader",
    "队长"
  ],
  [
    "Mobile",
    "移动端"
  ],
  [
    "Notice",
    "公告"
  ],
  [
    "Online",
    "在线"
  ],
  [
    "Portal",
    "传送门"
  ],
  [
    "Quests",
    "任务"
  ],
  [
    "Remove",
    "删除"
  ],
  [
    "Result",
    "挑战结果"
  ],
  [
    "R키로 부활",
    "按 R 复活"
  ],
  [
    "Rキーで復活",
    "按 R 复活"
  ],
  [
    "Speaki",
    "斯皮奇"
  ],
  [
    "Travel",
    "传送"
  ],
  [
    "Urgent",
    "紧急"
  ],
  [
    "Weapon",
    "武器"
  ],
  [
    "Weekly",
    "每周"
  ],
  [
    "가로등 공단",
    "灯火工厂区"
  ],
  [
    "강화했습니다",
    "强化成功。"
  ],
  [
    "개발자 문의",
    "联系开发者"
  ],
  [
    "곡성의 근원",
    "哀嚎之源"
  ],
  [
    "골드 주머니",
    "金币袋"
  ],
  [
    "교단 귀환서",
    "教团回城卷轴"
  ],
  [
    "교단의 아침",
    "教团的清晨"
  ],
  [
    "네르의 단골",
    "尼尔的常客"
  ],
  [
    "네르의 상점",
    "尼尔的商店"
  ],
  [
    "노을꽃 정령",
    "暮色花精灵"
  ],
  [
    "노을숲 국경",
    "暮色森林边境"
  ],
  [
    "뇌운 와이번",
    "雷云飞龙"
  ],
  [
    "눈먼 그림자",
    "致盲的暗影"
  ],
  [
    "닉네임 입력",
    "输入昵称"
  ],
  [
    "닉네임 지정",
    "设置昵称"
  ],
  [
    "달무리 늪골",
    "月环泽谷"
  ],
  [
    "달안개 습지",
    "月雾湿地"
  ],
  [
    "달콤한 습관",
    "甜蜜的习惯"
  ],
  [
    "대습지 마녀",
    "大沼泽女巫"
  ],
  [
    "동력핵 심부",
    "动力核心深处"
  ],
  [
    "떠도는 망령",
    "游荡亡灵"
  ],
  [
    "레이드 모집",
    "团队副本招募"
  ],
  [
    "레이드 실패",
    "团队副本失败"
  ],
  [
    "무덤 그림자",
    "墓影"
  ],
  [
    "바람 꿰뚫기",
    "疾风贯穿"
  ],
  [
    "봉인된 용린",
    "被封印的龙鳞"
  ],
  [
    "봉인된 폭군",
    "被封印的暴君"
  ],
  [
    "불러오는 중",
    "加载中"
  ],
  [
    "상점 나가기",
    "离开商店"
  ],
  [
    "새싹의 소란",
    "嫩芽的骚动"
  ],
  [
    "석류석 열매",
    "石榴石果实"
  ],
  [
    "석류석 화채",
    "石榴石水果羹"
  ],
  [
    "선로 청소봇",
    "轨道清扫机器人"
  ],
  [
    "설맹 그림자",
    "雪盲暗影"
  ],
  [
    "세계수 교단",
    "世界树教团"
  ],
  [
    "순례의 보급",
    "朝圣补给"
  ],
  [
    "스파크 정령",
    "电火花精灵"
  ],
  [
    "신호등 유령",
    "信号灯幽灵"
  ],
  [
    "아이템 사기",
    "购买物品"
  ],
  [
    "안개 그림자",
    "雾影"
  ],
  [
    "엘프 숲지기",
    "精灵守林人"
  ],
  [
    "엘프 정찰모",
    "精灵斥候帽"
  ],
  [
    "여명 용린병",
    "黎明龙鳞兵"
  ],
  [
    "여윈 그림자",
    "枯瘦暗影"
  ],
  [
    "오늘의 사냥",
    "今日狩猎"
  ],
  [
    "완전 음소거",
    "全部静音"
  ],
  [
    "용린 수호자",
    "龙鳞守卫"
  ],
  [
    "용비늘 흉갑",
    "龙鳞胸甲"
  ],
  [
    "융해 경계선",
    "熔融边界"
  ],
  [
    "이모트 버튼",
    "表情按钮"
  ],
  [
    "잉걸 골짜기",
    "烬火山谷"
  ],
  [
    "잉걸 도마뱀",
    "烬火蜥蜴"
  ],
  [
    "잉걸 새끼용",
    "烬火幼龙"
  ],
  [
    "장비 주머니",
    "装备袋"
  ],
  [
    "장착했습니다",
    "已装备。"
  ],
  [
    "잿가루 정령",
    "灰尘精灵"
  ],
  [
    "정령사 로브",
    "唤灵师长袍"
  ],
  [
    "카메라 리셋",
    "重置镜头"
  ],
  [
    "코일 거미봇",
    "线圈蜘蛛机器人"
  ],
  [
    "코일 거미줄",
    "线圈蛛网"
  ],
  [
    "클릭 최근접",
    "优先选择离光标最近的目标"
  ],
  [
    "폭주 동력핵",
    "暴走动力核心"
  ],
  [
    "프레임 상한",
    "帧率上限"
  ],
  [
    "피뢰 기사단",
    "避雷针骑士团"
  ],
  [
    "해제했습니다",
    "已卸下。"
  ],
  [
    "호박밭 오늘",
    "今日南瓜田"
  ],
  [
    "アイテム購入",
    "购买物品"
  ],
  [
    "インタラクト",
    "互动"
  ],
  [
    "インベントリ",
    "背包"
  ],
  [
    "ウィークリー",
    "每周"
  ],
  [
    "エリーフの袋",
    "水晶叶袋"
  ],
  [
    "エルフの森番",
    "精灵守林人"
  ],
  [
    "キー割り当て",
    "按键绑定"
  ],
  [
    "グラフィック",
    "画面"
  ],
  [
    "クレパスの袋",
    "蜡笔袋"
  ],
  [
    "コードを表示",
    "显示代码"
  ],
  [
    "ゴールドの袋",
    "金币袋"
  ],
  [
    "ここをタップ",
    "点按此处"
  ],
  [
    "さまよう亡霊",
    "游荡亡灵"
  ],
  [
    "スパーク精霊",
    "电火花精灵"
  ],
  [
    "パッチノート",
    "更新日志"
  ],
  [
    "フレーム上限",
    "帧率上限"
  ],
  [
    "フレンド一覧",
    "好友列表"
  ],
  [
    "フレンド追加",
    "添加好友"
  ],
  [
    "ブロック解除",
    "解除屏蔽"
  ],
  [
    "メカカボチャ",
    "机械南瓜"
  ],
  [
    "モナティウム",
    "莫纳提姆"
  ],
  [
    "やせ細った影",
    "枯瘦暗影"
  ],
  [
    "· 지정됨",
    "· 已指定"
  ],
  [
    "避雷騎士団",
    "避雷针骑士团"
  ],
  [
    "蒼白の鬼火",
    "苍白鬼火"
  ],
  [
    "茨藪の獣人",
    "荆棘丛兽人"
  ],
  [
    "大湿地魔女",
    "大沼泽女巫"
  ],
  [
    "動力核深部",
    "动力核心深处"
  ],
  [
    "読み込み中",
    "加载中"
  ],
  [
    "封印の祭壇",
    "封印祭坛"
  ],
  [
    "復旧を実行",
    "执行恢复"
  ],
  [
    "古の風精霊",
    "远古风精灵"
  ],
  [
    "灰火の鬼火",
    "余烬鬼火"
  ],
  [
    "灰霧の墓地",
    "灰雾墓园"
  ],
  [
    "灰陰の墓丘",
    "灰影墓丘"
  ],
  [
    "火傷の獣人",
    "焦灼兽人"
  ],
  [
    "基本ガチャ",
    "普通抽取"
  ],
  [
    "疾風の貫き",
    "疾风贯穿"
  ],
  [
    "今日の狩り",
    "今日狩猎"
  ],
  [
    "今週の討伐",
    "本周讨伐"
  ],
  [
    "経験値の袋",
    "经验袋"
  ],
  [
    "黎明の門番",
    "黎明守门人"
  ],
  [
    "黎明の妖精",
    "黎明妖精"
  ],
  [
    "馬車に乗る",
    "乘坐马车"
  ],
  [
    "目を奪う影",
    "致盲的暗影"
  ],
  [
    "泣き声の源",
    "哀嚎之源"
  ],
  [
    "溶岩の鬼火",
    "熔岩鬼火"
  ],
  [
    "森番の試練",
    "守林人的试炼"
  ],
  [
    "射程外です",
    "超出攻击范围"
  ],
  [
    "世界樹教団",
    "世界树教团"
  ],
  [
    "霜星の峠へ",
    "前往霜星雪岭"
  ],
  [
    "霜星の雪丘",
    "霜星雪岭"
  ],
  [
    "霜熊の獣人",
    "冰霜熊人"
  ],
  [
    "水草の妖精",
    "水草妖精"
  ],
  [
    "町へ帰還中",
    "正在返回城镇"
  ],
  [
    "位置を更新",
    "刷新位置"
  ],
  [
    "霧の中の影",
    "迷雾中的暗影"
  ],
  [
    "新芽の妖精",
    "嫩芽妖精"
  ],
  [
    "星光の閃き",
    "星光闪耀"
  ],
  [
    "雪花の妖精",
    "雪花妖精"
  ],
  [
    "巡礼の補給",
    "朝圣补给"
  ],
  [
    "陽花の妖精",
    "阳花妖精"
  ],
  [
    "陽枝の深森",
    "阳枝密林"
  ],
  [
    "一覧へ戻る",
    "返回列表"
  ],
  [
    "油灯の鬼火",
    "油灯鬼火"
  ],
  [
    "油灯を消す",
    "熄灭油灯"
  ],
  [
    "燠火の精霊",
    "烬火精灵"
  ],
  [
    "燠火の子竜",
    "烬火幼龙"
  ],
  [
    "月霧の湿地",
    "月雾湿地"
  ],
  [
    "月暈の沼谷",
    "月环泽谷"
  ],
  [
    "再読み込み",
    "刷新"
  ],
  [
    "沼火の鬼火",
    "沼泽鬼火"
  ],
  [
    "沼霧の呪杖",
    "沼雾咒术法杖"
  ],
  [
    "自分の順位",
    "我的排名"
  ],
  [
    "BGM音量",
    "背景音乐（BGM）"
  ],
  [
    "Boost",
    "强化"
  ],
  [
    "Claim",
    "领取"
  ],
  [
    "Close",
    "关闭"
  ],
  [
    "Daily",
    "每日"
  ],
  [
    "Elena",
    "艾琳娜"
  ],
  [
    "Emote",
    "表情动作"
  ],
  [
    "Enter",
    "进入"
  ],
  [
    "Equip",
    "装备"
  ],
  [
    "HP 포션",
    "HP 药水"
  ],
  [
    "Later",
    "稍后"
  ],
  [
    "Leave",
    "退出"
  ],
  [
    "Party",
    "队伍"
  ],
  [
    "Quest",
    "任务"
  ],
  [
    "Retry",
    "重试"
  ],
  [
    "Sound",
    "声音"
  ],
  [
    "Start",
    "开始"
  ],
  [
    "Today",
    "今天"
  ],
  [
    "계정 복구",
    "恢复账号"
  ],
  [
    "곡성 유령",
    "哀嚎幽灵"
  ],
  [
    "골드 자루",
    "金币袋"
  ],
  [
    "기록 없음",
    "尚无成绩"
  ],
  [
    "기본 공격",
    "普通攻击"
  ],
  [
    "기본 뽑기",
    "普通抽取"
  ],
  [
    "낙뢰 정령",
    "落雷精灵"
  ],
  [
    "눈꽃 요정",
    "雪花妖精"
  ],
  [
    "다시 시도",
    "重试"
  ],
  [
    "다시 접속",
    "重新连接"
  ],
  [
    "데인 자국",
    "灼烧的伤痕"
  ],
  [
    "랭킹 보기",
    "今日排行榜"
  ],
  [
    "마을 귀환",
    "返回城镇"
  ],
  [
    "마을 이동",
    "城镇传送"
  ],
  [
    "마차 탑승",
    "乘坐马车"
  ],
  [
    "메카 호박",
    "机械南瓜"
  ],
  [
    "모험 시작",
    "开始冒险"
  ],
  [
    "물풀 요정",
    "水草妖精"
  ],
  [
    "받은 요청",
    "收到的申请"
  ],
  [
    "별빛 섬광",
    "星光闪耀"
  ],
  [
    "볕꽃 요정",
    "阳花妖精"
  ],
  [
    "보낸 요청",
    "已发送的申请"
  ],
  [
    "보상 받기",
    "领取奖励"
  ],
  [
    "복구 실행",
    "执行恢复"
  ],
  [
    "봉인 제단",
    "封印祭坛"
  ],
  [
    "뿌리 골렘",
    "树根魔像"
  ],
  [
    "새싹 요정",
    "嫩芽妖精"
  ],
  [
    "수령 완료",
    "已领取"
  ],
  [
    "숲의 요정",
    "森林妖精"
  ],
  [
    "스킬 실패",
    "技能施放失败"
  ],
  [
    "스탯 강화",
    "属性强化"
  ],
  [
    "시간 종료",
    "时间到"
  ],
  [
    "얼음 정령",
    "寒冰精灵"
  ],
  [
    "여기를 탭",
    "点按此处"
  ],
  [
    "여명 요정",
    "黎明妖精"
  ],
  [
    "오늘 매진",
    "今日售罄"
  ],
  [
    "이슬 요정",
    "露珠妖精"
  ],
  [
    "입력창 탭",
    "点按输入框"
  ],
  [
    "잉걸 화구",
    "余烬火球"
  ],
  [
    "장비 강화",
    "装备强化"
  ],
  [
    "잿불 정령",
    "烬火精灵"
  ],
  [
    "정보 없음",
    "无数据"
  ],
  [
    "제한 없음",
    "无限制"
  ],
  [
    "조회 실패",
    "查询失败"
  ],
  [
    "중도 퇴장",
    "提前离场"
  ],
  [
    "차단 해제",
    "解除屏蔽"
  ],
  [
    "채널 변경",
    "切换频道"
  ],
  [
    "채널 선택",
    "选择频道"
  ],
  [
    "출석 보상",
    "签到奖励"
  ],
  [
    "친구 목록",
    "好友列表"
  ],
  [
    "친구 추가",
    "添加好友"
  ],
  [
    "코드 표시",
    "显示代码"
  ],
  [
    "파티 초대",
    "邀请组队"
  ],
  [
    "핫바 버튼",
    "快捷栏按钮"
  ],
  [
    "햇바람 숲",
    "晴风森林"
  ],
  [
    "현재 채널",
    "当前频道"
  ],
  [
    "화상 수인",
    "焦灼兽人"
  ],
  [
    "アカウント",
    "账号"
  ],
  [
    "オフライン",
    "离线"
  ],
  [
    "オンライン",
    "在线"
  ],
  [
    "キャンセル",
    "取消"
  ],
  [
    "ゴールド袋",
    "金币袋"
  ],
  [
    "スキル失敗",
    "技能施放失败"
  ],
  [
    "スピキ育成",
    "斯皮奇养成"
  ],
  [
    "そよ風精霊",
    "和风精灵"
  ],
  [
    "チャンネル",
    "频道"
  ],
  [
    "ネルの露店",
    "尼尔的商店"
  ],
  [
    "パーティー",
    "队伍"
  ],
  [
    "モンスター",
    "怪物"
  ],
  [
    "ランキング",
    "排行榜"
  ],
  [
    "レイド募集",
    "团队副本招募"
  ],
  [
    "レイド失敗",
    "团队副本失败"
  ],
  [
    "{n}강",
    "+{n}"
  ],
  [
    "☑ 매진",
    "☑ 售罄"
  ],
  [
    "熾火の球",
    "余烬火球"
  ],
  [
    "甘い習慣",
    "甜蜜的习惯"
  ],
  [
    "灰塵精霊",
    "灰尘精灵"
  ],
  [
    "基本攻撃",
    "普通攻击"
  ],
  [
    "記録なし",
    "尚无成绩"
  ],
  [
    "教団の朝",
    "教团的清晨"
  ],
  [
    "究極の袋",
    "终极袋"
  ],
  [
    "哭声幽霊",
    "哀嚎幽灵"
  ],
  [
    "露の妖精",
    "露珠妖精"
  ],
  [
    "落雷精霊",
    "落雷精灵"
  ],
  [
    "売り切れ",
    "售罄"
  ],
  [
    "墓場の影",
    "墓影"
  ],
  [
    "情報なし",
    "无数据"
  ],
  [
    "確認中…",
    "正在检查…"
  ],
  [
    "森の妖精",
    "森林妖精"
  ],
  [
    "焼けた跡",
    "灼烧的伤痕"
  ],
  [
    "設定中…",
    "正在保存…"
  ],
  [
    "時間切れ",
    "时间到"
  ],
  [
    "受け取る",
    "领取"
  ],
  [
    "霜の鬼火",
    "冰霜鬼火"
  ],
  [
    "蘇生中…",
    "正在救援…"
  ],
  [
    "添付: ",
    "附件："
  ],
  [
    "町へ帰還",
    "返回城镇"
  ],
  [
    "町へ移動",
    "城镇传送"
  ],
  [
    "通常攻撃",
    "普通攻击"
  ],
  [
    "途中退場",
    "提前离场"
  ],
  [
    "効果音量",
    "音效（SFX）"
  ],
  [
    "雪盲の影",
    "雪盲暗影"
  ],
  [
    "陽風の森",
    "晴风森林"
  ],
  [
    "引き継ぐ",
    "继续"
  ],
  [
    "燠火の谷",
    "烬火山谷"
  ],
  [
    "月影魔女",
    "月影女巫"
  ],
  [
    "制限なし",
    "无限制"
  ],
  [
    "装備強化",
    "装备强化"
  ],
  [
    "装備の袋",
    "装备袋"
  ],
  [
    "Auto",
    "自动"
  ],
  [
    "BOSS",
    "首领"
  ],
  [
    "BURN",
    "灼烧"
  ],
  [
    "Chan",
    "频道"
  ],
  [
    "Chat",
    "聊天"
  ],
  [
    "Copy",
    "复制"
  ],
  [
    "Elif",
    "水晶叶"
  ],
  [
    "Full",
    "满员"
  ],
  [
    "Gear",
    "装备"
  ],
  [
    "Gold",
    "金币"
  ],
  [
    "Help",
    "帮助"
  ],
  [
    "Jump",
    "跳跃"
  ],
  [
    "Kept",
    "维持"
  ],
  [
    "Kick",
    "踢出"
  ],
  [
    "Mail",
    "邮箱"
  ],
  [
    "Move",
    "移动"
  ],
  [
    "Raid",
    "团队副本"
  ],
  [
    "Rank",
    "排行榜"
  ],
  [
    "Send",
    "发送"
  ],
  [
    "Shop",
    "商店"
  ],
  [
    "감정표현",
    "表情动作"
  ],
  [
    "내 순위",
    "我的排名"
  ],
  [
    "모나티엄",
    "莫纳提姆"
  ],
  [
    "모나티움",
    "莫纳提姆"
  ],
  [
    "목록으로",
    "返回列表"
  ],
  [
    "상호작용",
    "互动"
  ],
  [
    "새로고침",
    "刷新"
  ],
  [
    "스킬 1",
    "技能 1"
  ],
  [
    "스킬 2",
    "技能 2"
  ],
  [
    "스킬 3",
    "技能 3"
  ],
  [
    "스킬 4",
    "技能 4"
  ],
  [
    "시작하기",
    "开始"
  ],
  [
    "어린 용",
    "幼龙"
  ],
  [
    "오프라인",
    "离线"
  ],
  [
    "이어하기",
    "继续"
  ],
  [
    "인벤토리",
    "背包"
  ],
  [
    "진행 중",
    "进行中"
  ],
  [
    "채팅차단",
    "屏蔽聊天"
  ],
  [
    "첨부: ",
    "附件："
  ],
  [
    "클리어!",
    "通关！"
  ],
  [
    "키바인드",
    "按键绑定"
  ],
  [
    "톱니들녘",
    "齿轮原野"
  ],
  [
    "패치노트",
    "更新日志"
  ],
  [
    "폴리스카",
    "警车召唤券"
  ],
  [
    "エモート",
    "表情动作"
  ],
  [
    "エリーフ",
    "水晶叶"
  ],
  [
    "お知らせ",
    "公告"
  ],
  [
    "おすすめ",
    "推荐"
  ],
  [
    "クエスト",
    "任务"
  ],
  [
    "クリア!",
    "通关！"
  ],
  [
    "ゴールド",
    "金币"
  ],
  [
    "サウンド",
    "声音"
  ],
  [
    "ジャンプ",
    "跳跃"
  ],
  [
    "ショップ",
    "商店"
  ],
  [
    "スキル1",
    "技能 1"
  ],
  [
    "スキル2",
    "技能 2"
  ],
  [
    "スキル3",
    "技能 3"
  ],
  [
    "スキル4",
    "技能 4"
  ],
  [
    "チャット",
    "聊天"
  ],
  [
    "デイリー",
    "每日"
  ],
  [
    "フレンド",
    "好友"
  ],
  [
    "ポータル",
    "传送门"
  ],
  [
    "モバイル",
    "移动端"
  ],
  [
    "リーダー",
    "队长"
  ],
  [
    "閉じる",
    "关闭"
  ],
  [
    "氷精霊",
    "寒冰精灵"
  ],
  [
    "歯車野",
    "齿轮原野"
  ],
  [
    "攻撃力",
    "攻击力"
  ],
  [
    "灰亡霊",
    "灰烬亡灵"
  ],
  [
    "進行中",
    "进行中"
  ],
  [
    "開発者",
    "开发者"
  ],
  [
    "始める",
    "开始"
  ],
  [
    "所持品",
    "背包"
  ],
  [
    "霧の影",
    "雾影"
  ],
  [
    "郵便箱",
    "邮箱"
  ],
  [
    "幼い竜",
    "幼龙"
  ],
  [
    "再接続",
    "重新连接"
  ],
  [
    "再試行",
    "重试"
  ],
  [
    "All",
    "全部"
  ],
  [
    "Hat",
    "帽子"
  ],
  [
    "Inv",
    "背包"
  ],
  [
    "Max",
    "最大"
  ],
  [
    "Ner",
    "尼尔"
  ],
  [
    "Set",
    "设置"
  ],
  [
    "Top",
    "上装"
  ],
  [
    "You",
    "我"
  ],
  [
    "개발자",
    "开发者"
  ],
  [
    "공격력",
    "攻击力"
  ],
  [
    "그래픽",
    "画面"
  ],
  [
    "나중에",
    "稍后"
  ],
  [
    "도움말",
    "帮助"
  ],
  [
    "레이드",
    "团队副本"
  ],
  [
    "모바일",
    "移动端"
  ],
  [
    "몬스터",
    "怪物"
  ],
  [
    "방어력",
    "防御力"
  ],
  [
    "복사됨",
    "已复制"
  ],
  [
    "사운드",
    "声音"
  ],
  [
    "소모품",
    "消耗品"
  ],
  [
    "스피키",
    "斯皮奇"
  ],
  [
    "엘레나",
    "艾琳娜"
  ],
  [
    "엘리프",
    "水晶叶"
  ],
  [
    "온라인",
    "在线"
  ],
  [
    "우편함",
    "邮箱"
  ],
  [
    "잿망령",
    "灰烬亡灵"
  ],
  [
    "퀘스트",
    "任务"
  ],
  [
    "あとで",
    "稍后"
  ],
  [
    "エレナ",
    "艾琳娜"
  ],
  [
    "コピー",
    "复制"
  ],
  [
    "すべて",
    "全部"
  ],
  [
    "ヘルプ",
    "帮助"
  ],
  [
    "レイド",
    "团队副本"
  ],
  [
    "本日",
    "今天"
  ],
  [
    "変更",
    "更改"
  ],
  [
    "常時",
    "常驻"
  ],
  [
    "承諾",
    "接受"
  ],
  [
    "出席",
    "签到"
  ],
  [
    "復活",
    "复活"
  ],
  [
    "混雑",
    "拥挤"
  ],
  [
    "火傷",
    "灼烧"
  ],
  [
    "結果",
    "挑战结果"
  ],
  [
    "解除",
    "解除"
  ],
  [
    "緊急",
    "紧急"
  ],
  [
    "拒否",
    "拒绝"
  ],
  [
    "満室",
    "满员"
  ],
  [
    "普通",
    "一般"
  ],
  [
    "強化",
    "强化"
  ],
  [
    "全滅",
    "全队倒下"
  ],
  [
    "確認",
    "确认"
  ],
  [
    "入場",
    "进入"
  ],
  [
    "上衣",
    "上装"
  ],
  [
    "設定",
    "设置"
  ],
  [
    "順位",
    "排行榜"
  ],
  [
    "送信",
    "发送"
  ],
  [
    "所持",
    "持有"
  ],
  [
    "体力",
    "生命值"
  ],
  [
    "脱退",
    "退出队伍"
  ],
  [
    "維持",
    "维持"
  ],
  [
    "委任",
    "转让队长"
  ],
  [
    "下衣",
    "下装"
  ],
  [
    "選択",
    "选择"
  ],
  [
    "削除",
    "删除"
  ],
  [
    "言語",
    "语言"
  ],
  [
    "移動",
    "移动"
  ],
  [
    "郵便",
    "邮箱"
  ],
  [
    "余裕",
    "空闲"
  ],
  [
    "戦闘",
    "战斗"
  ],
  [
    "装備",
    "装备"
  ],
  [
    "追放",
    "踢出"
  ],
  [
    "自動",
    "自动"
  ],
  [
    "自分",
    "我"
  ],
  [
    "HP",
    "生命值"
  ],
  [
    "Me",
    "自己"
  ],
  [
    "강퇴",
    "踢出"
  ],
  [
    "강화",
    "强化"
  ],
  [
    "거절",
    "拒绝"
  ],
  [
    "결과",
    "挑战结果"
  ],
  [
    "계정",
    "账号"
  ],
  [
    "골드",
    "金币"
  ],
  [
    "공지",
    "公告"
  ],
  [
    "긴급",
    "紧急"
  ],
  [
    "네르",
    "尼尔"
  ],
  [
    "닫기",
    "关闭"
  ],
  [
    "랭킹",
    "排名"
  ],
  [
    "리더",
    "队长"
  ],
  [
    "만석",
    "满员"
  ],
  [
    "매진",
    "售罄"
  ],
  [
    "모자",
    "帽子"
  ],
  [
    "무기",
    "武器"
  ],
  [
    "바람",
    "疾风"
  ],
  [
    "변경",
    "更改"
  ],
  [
    "별빛",
    "星光"
  ],
  [
    "보스",
    "首领"
  ],
  [
    "보유",
    "持有"
  ],
  [
    "보통",
    "一般"
  ],
  [
    "복사",
    "复制"
  ],
  [
    "부활",
    "复活"
  ],
  [
    "뿌리",
    "根落"
  ],
  [
    "삭제",
    "删除"
  ],
  [
    "상시",
    "常驻"
  ],
  [
    "상의",
    "上装"
  ],
  [
    "상점",
    "商店"
  ],
  [
    "선택",
    "选择"
  ],
  [
    "설정",
    "设置"
  ],
  [
    "수락",
    "接受"
  ],
  [
    "수령",
    "领取"
  ],
  [
    "언어",
    "语言"
  ],
  [
    "여유",
    "空闲"
  ],
  [
    "오늘",
    "今天"
  ],
  [
    "우편",
    "邮箱"
  ],
  [
    "위임",
    "转让队长"
  ],
  [
    "유지",
    "维持"
  ],
  [
    "이동",
    "移动"
  ],
  [
    "인벤",
    "背包"
  ],
  [
    "일일",
    "每日"
  ],
  [
    "입장",
    "进入"
  ],
  [
    "잉걸",
    "余烬"
  ],
  [
    "자동",
    "自动"
  ],
  [
    "장비",
    "装备"
  ],
  [
    "장착",
    "装备"
  ],
  [
    "전멸",
    "全队倒下"
  ],
  [
    "전송",
    "发送"
  ],
  [
    "전체",
    "全部"
  ],
  [
    "전투",
    "战斗"
  ],
  [
    "점프",
    "跳跃"
  ],
  [
    "주간",
    "每周"
  ],
  [
    "채널",
    "频道"
  ],
  [
    "채팅",
    "聊天"
  ],
  [
    "체력",
    "生命值"
  ],
  [
    "최대",
    "最大"
  ],
  [
    "추천",
    "推荐"
  ],
  [
    "출석",
    "签到"
  ],
  [
    "취소",
    "取消"
  ],
  [
    "친구",
    "好友"
  ],
  [
    "탈퇴",
    "退出队伍"
  ],
  [
    "퇴장",
    "退出"
  ],
  [
    "파티",
    "队伍"
  ],
  [
    "포탈",
    "传送门"
  ],
  [
    "하의",
    "下装"
  ],
  [
    "해제",
    "解除"
  ],
  [
    "혼잡",
    "拥挤"
  ],
  [
    "화상",
    "灼烧"
  ],
  [
    "확인",
    "确认"
  ],
  [
    "ネル",
    "尼尔"
  ],
  [
    "ボス",
    "首领"
  ],
  [
    "나",
    "我"
  ]
];

  // 升级脚本但尚未刷新游戏时，页面上可能仍保留旧版中文；在原位迁移为新版润色文案。
  const LEGACY_ZH_ENTRIES = [
    ["艾蕾娜", "艾琳娜"],
    ["内尔", "尼尔"],
    ["涅尔", "尼尔"],
    ["斯皮基", "斯皮奇"],
    ["埃利芙", "水晶叶"],
    ["埃利芙袋", "水晶叶袋"],
    ["顶级蜡笔", "金蜡笔"],
    ["最高级蜡笔", "金蜡笔"],
    ["进度 {current}/{target}", "进度：{current}/{target}"],
    ["躲避假南瓜", "南瓜大逃亡"],
    ["躲避假南瓜排行榜", "南瓜大逃亡 · 今日排行榜"],
    ["假南瓜躲避赛道", "南瓜大逃亡赛道"],
    ["躲避假南瓜，坚持 5 分钟并尽可能跑得更远。", "躲开滚来的假南瓜，在 5 分钟内尽可能跑得更远！"],
    ["避开假南瓜，尽可能跑得更远", "躲开滚来的假南瓜，坚持到最后并尽可能跑得更远！"],
    ["快速匹配（4 人）", "四人快速匹配"],
    ["队伍进入（1–4 人）", "组队入场（1～4人）"],
    ["查看排行榜", "今日排行榜"],
    ["当前不在活动期间", "活动尚未开放"],
    ["今天暂无记录", "今日尚无成绩"],
    ["今日个人最佳 {score}m", "今日最佳 {score}m"],
    ["正在请求进入…", "正在进入赛场…"],
    ["匹配成功！正在进入…", "匹配成功，正在入场…"],
    ["加入队列失败", "匹配失败，请稍后再试"],
    ["等待中… {count}/{max}", "匹配中… {count}/{max}"],
    ["排名仅统计今天的数据", "仅显示今日成绩"],
    ["最终行进距离 {score}m", "最终距离 {score}m"],
    ["获得经验值 +{exp}", "获得 {exp} 点经验"],
    ["即将返回城镇…", "正在返回城镇…"],
    ["正在复活…", "正在救援…"],
    ["今天的奖励次数已全部用完", "今日奖励次数已用完"],
    ["已倒地 — 等待队友复活你", "你已倒下——等待队友救援"],
    ["你已倒地 — 按数字键 1–4 观看队友视角", "你已倒下——按数字键 1～4 切换队友视角"],
    ["你已倒地 — 点按下方的技能图标观看队友视角", "你已倒下——点击下方队友图标切换视角"],
    ["该队友也已倒地", "这名队友也倒下了"],
    ["目前无法观看该队友", "暂时无法观看这名队友"],
    ["正在观看：{name}", "观战中：{name}"],
    ["下河夏荷，请多多支持 EpidGames。", "哈哈哈哈！请多多支持 Epid Games！"],
  ];

  const NEVER_TRANSLATE_TEXT_SELECTOR = [
    "script",
    "style",
    "noscript",
    "template",
    "svg",
    "canvas",
    "textarea",
    "input",
    "[contenteditable='true']",
    "[data-srzh-ui]",
    "pre",
    "code",
    "kbd",
    "samp",
  ].join(",");

  const NEVER_TRANSLATE_ATTRIBUTE_SELECTOR = [
    "script",
    "style",
    "noscript",
    "template",
    "svg",
    "canvas",
    "[data-srzh-ui]",
    "pre",
    "code",
    "kbd",
    "samp",
  ].join(",");

  // 玩家聊天、昵称和恢复码不是游戏本地化文本，保持原样。
  const USER_CONTENT_SELECTOR = [
    ".sr-chatbox__body-text",
    ".sr-chatbox__sender",
    ".sr-party-target__name",
    ".sr-party-member__name",
    ".sr-party__name",
    ".sr-player-card__name",
    ".sr-raid__name",
    "[class*='friend'] .sr-list-item__title",
    ".sr-code-reveal__text",
    ".sr-tutorial-modal-code-text",
    "[class*='recovery-code']",
    "[data-private]",
  ].join(",");
  const PLACEHOLDER_RE = /\{([A-Za-z0-9_]+)\}/g;

  function normalizeKey(value) {
    return String(value ?? "").trim().replace(/\s+/gu, " ");
  }

  function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  const NUMERIC_PLACEHOLDER_NAMES = new Set([
    "amount", "atk", "attempt", "base", "cap", "capacity", "channel", "count", "current",
    "dailyLimit", "day", "def", "delta", "distance", "down", "equip", "exp", "gold", "heal",
    "hp", "itemId", "keep", "kills", "level", "max", "maxExp", "maxHp", "minLevel", "n", "next", "pct",
    "percent", "playerId", "points", "population", "quantity", "radius", "rank", "remaining", "score",
    "sec", "seconds", "slotCount", "status", "success", "target", "time", "total", "totalLimit",
    "unlockLevels", "upgrade", "value", "x", "z", "zone", "zoneId",
  ]);

  function placeholderCapturePattern(name) {
    // Game HUD joins up to four O/X party slots with non-breaking spaces.
    // Keep this separate from the numeric {status} used by HTTP errors.
    if (name === "partyStatus_status") return "([OX](?:\\s+[OX]){0,3})";
    const leafName = name.replace(/^(?:base|mechanism|cap)_/, "");
    if (!NUMERIC_PLACEHOLDER_NAMES.has(leafName)) return "(.+?)";
    // Dynamic numeric fields may contain signs, grouping, decimals, ratios, percentages, or time colons,
    // but must include a digit and must never consume arbitrary UI sentences.
    return "([+\\-−]?(?=[\\d.,:%/·+\\-−]*\\d)[\\d.,:%/·+\\-−]+)";
  }

  function compileTemplate(source, target) {
    const normalizedSource = normalizeKey(source);
    const normalizedTarget = target.trim();
    const names = [];
    let pattern = "^";
    let cursor = 0;
    let match;

    PLACEHOLDER_RE.lastIndex = 0;
    while ((match = PLACEHOLDER_RE.exec(normalizedSource))) {
      pattern += escapeRegExp(normalizedSource.slice(cursor, match.index)).replace(/ /g, "\\s+");
      pattern += placeholderCapturePattern(match[1]);
      names.push(match[1]);
      cursor = match.index + match[0].length;
    }
    pattern += escapeRegExp(normalizedSource.slice(cursor)).replace(/ /g, "\\s+");
    pattern += "$";

    return {
      prefixKey: normalizedSource.startsWith("{") ? "*" : normalizedSource[0],
      literalLength: normalizedSource.replace(PLACEHOLDER_RE, "").length,
      regex: new RegExp(pattern, "u"),
      render(captures) {
        const values = new Map();
        for (let index = 0; index < names.length; index += 1) {
          const name = names[index];
          const value = captures[index + 1];
          if (values.has(name) && values.get(name) !== value) return null;
          values.set(name, value);
        }
        return normalizedTarget.replace(PLACEHOLDER_RE, (placeholder, name) => {
          const value = values.get(name);
          if (value === undefined) return placeholder;
          // Tutorial legend placeholders contain literal key labels such as
          // Enter, M, and Space. They are controls, not translatable UI text.
          if (name.startsWith("legend_")) return value;
          return exactTranslations.get(normalizeKey(value)) || value;
        });
      },
    };
  }

  const exactTranslations = new Map();
  const templateTranslations = [];
  for (const entries of [LOCALIZED_ENTRIES, LEGACY_ZH_ENTRIES]) {
    for (const [source, target] of entries) {
      if (!source || !target || source === target) continue;
      if (PLACEHOLDER_RE.test(source)) {
        PLACEHOLDER_RE.lastIndex = 0;
        templateTranslations.push(compileTemplate(source, target));
      } else {
        exactTranslations.set(normalizeKey(source), target.trim());
      }
      PLACEHOLDER_RE.lastIndex = 0;
    }
  }
  templateTranslations.sort((left, right) => right.literalLength - left.literalLength);
  const templateBuckets = new Map();
  for (const template of templateTranslations) {
    const bucket = templateBuckets.get(template.prefixKey) || [];
    bucket.push(template);
    templateBuckets.set(template.prefixKey, bucket);
  }

  function translateNormalized(normalized) {
    let translated = exactTranslations.get(normalized);
    if (translated) return translated;

    const candidates = [
      ...(templateBuckets.get(normalized[0]) || []),
      ...(templateBuckets.get("*") || []),
    ];
    for (const template of candidates) {
      const captures = template.regex.exec(normalized);
      if (!captures) continue;
      const rendered = template.render(captures);
      if (rendered) return rendered;
    }
    return null;
  }

  function translateComposite(normalized) {
    // The quest log renders "title — description / progress" as one text node.
    // Translate each official-localization segment without splitting numeric ratios such as 0/15.
    const parts = normalized.split(/(\s+(?:—|\/)\s+)/u);
    if (parts.length < 3) return null;

    let changed = false;
    const translatedParts = parts.map((part, index) => {
      if (index % 2 === 1) return part.includes("/") ? " ｜ " : part;
      const translated = translateNormalized(normalizeKey(part));
      if (!translated) return part;
      changed = true;
      return translated;
    });
    return changed ? translatedParts.join("") : null;
  }

  // High-frequency game labels (cooldowns, HP, status text, canvas popups) are
  // often assigned every frame. Cache both hits and misses so repeated values
  // do not rescan thousands of localized templates.
  const TRANSLATION_CACHE_LIMIT = 8192;
  const translationResultCache = new Map();

  function rememberTranslation(raw, translated) {
    if (translationResultCache.size >= TRANSLATION_CACHE_LIMIT) {
      translationResultCache.delete(translationResultCache.keys().next().value);
    }
    translationResultCache.set(raw, translated);
    return translated;
  }

  function translateOffline(rawValue) {
    const raw = String(rawValue ?? "");
    if (translationResultCache.has(raw)) return translationResultCache.get(raw);
    const core = raw.trim();
    if (!core) return rememberTranslation(raw, raw);

    const leading = raw.slice(0, raw.indexOf(core));
    const trailing = raw.slice(raw.indexOf(core) + core.length);
    const normalized = normalizeKey(core);
    const translated = translateNormalized(normalized) || translateComposite(normalized);

    return rememberTranslation(raw, translated ? `${leading}${translated}${trailing}` : raw);
  }

  // 仅供本地构建测试；正常油猴环境不会进入此分支。
  if (typeof globalThis !== "undefined" && globalThis.__SPEAKIRPG_ZH_TEST__) {
    globalThis.__SPEAKIRPG_ZH_TEST_API__ = {
      compileTemplate,
      normalizeKey,
      translateOffline,
    };
    return;
  }

  const defaultSettings = {
    enabled: true,
    showButton: true,
  };
  const storedSettings = GM_getValue(SETTINGS_KEY, {});
  const settings = { ...defaultSettings, ...(storedSettings && typeof storedSettings === "object" ? storedSettings : {}) };

  let translatedCount = 0;
  let panel = null;
  let statusLine = null;
  let countLine = null;
  let panelUpdateFrame = 0;
  let pendingPanelMessage = "";
  let observer = null;
  let scanEpoch = 0;
  const textFingerprints = new WeakMap();
  const attributeFingerprints = new WeakMap();
  const queuedRoots = new Set();
  const synchronousTranslationCache = new Map();
  let rootFlushTimer = 0;

  function saveSettings() {
    GM_setValue(SETTINGS_KEY, { ...settings });
  }

  function updatePanel(message = "") {
    if (message) pendingPanelMessage = message;
    if (panelUpdateFrame) return;
    panelUpdateFrame = window.requestAnimationFrame(() => {
      panelUpdateFrame = 0;
      if (statusLine) {
        statusLine.textContent = pendingPanelMessage || "本地离线词典模式（不会发送任何页面文本）";
      }
      pendingPanelMessage = "";
      if (countLine) countLine.textContent = `本页已处理 ${translatedCount} 处`;
    });
  }

  function translateCanvasValue(value) {
    if (!settings.enabled || typeof value !== "string" || !value) return value;
    return translateOffline(value);
  }

  function chineseCanvasFont(font) {
    if (!font || /Microsoft YaHei|PingFang SC/u.test(font)) return font;
    return font.replace(/(\d+(?:\.\d+)?px\s+)/u, "$1\"Microsoft YaHei\", \"PingFang SC\", ");
  }

  function installCanvasHooks() {
    const pageWindow = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
    const patchFlag = "__speakirpgZhCnCanvasPatchedV1";
    const prototypes = [
      pageWindow.CanvasRenderingContext2D?.prototype,
      pageWindow.OffscreenCanvasRenderingContext2D?.prototype,
    ].filter(Boolean);

    for (const prototype of new Set(prototypes)) {
      if (prototype[patchFlag]) continue;
      for (const methodName of ["measureText", "fillText", "strokeText"]) {
        const descriptor = Object.getOwnPropertyDescriptor(prototype, methodName);
        const original = descriptor?.value || prototype[methodName];
        if (typeof original !== "function") continue;
        Object.defineProperty(prototype, methodName, {
          ...descriptor,
          configurable: true,
          writable: true,
          value: function translatedCanvasText(text, ...rest) {
            const translated = translateCanvasValue(text);
            if (translated === text) return Reflect.apply(original, this, [text, ...rest]);

            const previousFont = this.font;
            const nextFont = chineseCanvasFont(previousFont);
            if (nextFont !== previousFont) this.font = nextFont;
            try {
              return Reflect.apply(original, this, [translated, ...rest]);
            } finally {
              if (nextFont !== previousFont) this.font = previousFont;
            }
          },
        });
      }
      Object.defineProperty(prototype, patchFlag, { configurable: true, value: true });
    }
  }

  function installNativeDialogHooks() {
    const pageWindow = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
    const bridgeKey = "__speakirpgZhCnDialogBridgeV1";
    const existingBridge = pageWindow[bridgeKey];
    if (existingBridge) {
      existingBridge.translate = translateCanvasValue;
      return;
    }

    const bridge = { translate: translateCanvasValue };
    Object.defineProperty(pageWindow, bridgeKey, { configurable: true, value: bridge });
    for (const methodName of ["alert", "confirm", "prompt"]) {
      const original = pageWindow[methodName];
      if (typeof original !== "function") continue;
      Object.defineProperty(pageWindow, methodName, {
        configurable: true,
        writable: true,
        value(message, ...rest) {
          return Reflect.apply(original, pageWindow, [bridge.translate(message), ...rest]);
        },
      });
    }
  }

  function closestElement(node) {
    if (!node) return null;
    return node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
  }

  function shouldNeverTranslate(node, attributeMode = false) {
    const element = closestElement(node);
    const selector = attributeMode ? NEVER_TRANSLATE_ATTRIBUTE_SELECTOR : NEVER_TRANSLATE_TEXT_SELECTOR;
    return !element
      || (!attributeMode && element.isContentEditable)
      || Boolean(element.closest(selector))
      || Boolean(element.closest(USER_CONTENT_SELECTOR));
  }

  function translateSynchronousTextContent(node, value) {
    if (!settings.enabled || typeof value !== "string" || !/\p{L}/u.test(value) || shouldNeverTranslate(node)) {
      return value;
    }
    // 游戏每 100ms 重写一次技能锁定等级。原生 Lv10 已经清晰，保持原宽度可避免 Lv10/Lv.10 来回位移。
    if (closestElement(node)?.closest?.(".sr-skill-slot__lock-badge")) return value;
    if (synchronousTranslationCache.has(value)) return synchronousTranslationCache.get(value);
    const translated = translateOffline(value);
    if (synchronousTranslationCache.size >= 512) {
      synchronousTranslationCache.delete(synchronousTranslationCache.keys().next().value);
    }
    synchronousTranslationCache.set(value, translated);
    return translated;
  }

  function installSynchronousDomHooks() {
    const pageWindow = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
    const nodePrototype = pageWindow.Node?.prototype;
    if (!nodePrototype) return;

    const bridgeKey = "__speakirpgZhCnTextContentBridgeV1";
    const existingBridge = nodePrototype[bridgeKey];
    if (existingBridge) {
      existingBridge.translate = translateSynchronousTextContent;
      return;
    }

    const descriptor = Object.getOwnPropertyDescriptor(nodePrototype, "textContent");
    if (typeof descriptor?.set !== "function") return;
    const bridge = { translate: translateSynchronousTextContent };
    Object.defineProperty(nodePrototype, bridgeKey, { configurable: true, value: bridge });
    Object.defineProperty(nodePrototype, "textContent", {
      ...descriptor,
      configurable: true,
      set(value) {
        return Reflect.apply(descriptor.set, this, [bridge.translate(this, value)]);
      },
    });
  }

  function translateTextNode(node) {
    if (!settings.enabled || !node?.nodeValue || shouldNeverTranslate(node)) return;
    const original = node.nodeValue;
    const fingerprint = `${scanEpoch}|${original}`;
    if (textFingerprints.get(node) === fingerprint) return;
    textFingerprints.set(node, fingerprint);

    const translated = translateOffline(original);
    if (translated !== original) {
      node.nodeValue = translated;
      textFingerprints.set(node, `${scanEpoch}|${translated}`);
      translatedCount += 1;
      updatePanel();
    }
    markLocalizedPanel(node.parentElement);
  }

  function markLocalizedPanel(titleElement) {
    if (!titleElement?.classList?.contains("sr-panel__title")) return;
    const kind = titleElement.textContent.trim() === "任务"
      ? "quest"
      : titleElement.textContent.trim() === "签到奖励"
        ? "attendance"
        : "";
    if (!kind) return;
    titleElement.closest(".sr-panel")?.setAttribute("data-srzh-panel", kind);
  }

  function translateAttribute(element, attribute) {
    if (!settings.enabled || shouldNeverTranslate(element, true)) return;
    const original = element.getAttribute(attribute);
    if (!original) return;

    let fingerprints = attributeFingerprints.get(element);
    if (!fingerprints) {
      fingerprints = new Map();
      attributeFingerprints.set(element, fingerprints);
    }
    const fingerprint = `${scanEpoch}|${original}`;
    if (fingerprints.get(attribute) === fingerprint) return;
    fingerprints.set(attribute, fingerprint);

    const translated = translateOffline(original);
    if (translated !== original) {
      element.setAttribute(attribute, translated);
      fingerprints.set(attribute, `${scanEpoch}|${translated}`);
      translatedCount += 1;
      updatePanel();
    }
  }

  function scanRoot(root) {
    if (!settings.enabled || !root?.isConnected) return;
    if (root.nodeType === Node.TEXT_NODE) {
      translateTextNode(root);
      return;
    }
    if (root.nodeType !== Node.ELEMENT_NODE) return;

    for (const attribute of TRANSLATABLE_ATTRIBUTES) {
      if (root.hasAttribute(attribute)) translateAttribute(root, attribute);
    }
    if (shouldNeverTranslate(root)) return;

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let textNode;
    while ((textNode = walker.nextNode())) translateTextNode(textNode);

    for (const element of root.querySelectorAll(ATTRIBUTE_SELECTOR)) {
      for (const attribute of TRANSLATABLE_ATTRIBUTES) {
        if (element.hasAttribute(attribute)) translateAttribute(element, attribute);
      }
    }
  }

  function flushQueuedRoots() {
    rootFlushTimer = 0;
    const roots = [...queuedRoots];
    queuedRoots.clear();
    for (const root of roots) scanRoot(root);
  }

  function queueRoot(root) {
    if (!root) return;
    for (const queued of [...queuedRoots]) {
      if (queued === root || (queued.nodeType !== Node.TEXT_NODE && queued.contains?.(root))) return;
      if (root.nodeType !== Node.TEXT_NODE && root.contains?.(queued)) queuedRoots.delete(queued);
    }
    queuedRoots.add(root);
    if (!rootFlushTimer) rootFlushTimer = window.setTimeout(flushQueuedRoots, 0);
  }

  function startObserver() {
    if (observer || !document.documentElement) return;
    observer = new MutationObserver((records) => {
      if (!settings.enabled) return;
      for (const record of records) {
        if (record.type === "characterData") {
          queueRoot(record.target);
        } else if (record.type === "attributes") {
          translateAttribute(record.target, record.attributeName);
        } else {
          for (const node of record.addedNodes) queueRoot(node);
        }
      }
    });
    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: TRANSLATABLE_ATTRIBUTES,
    });
    queueRoot(document.documentElement);
  }

  function setGameSourceToKorean() {
    try {
      const current = JSON.parse(localStorage.getItem("sr1_settings") || "{}");
      localStorage.setItem("sr1_settings", JSON.stringify({ ...current, locale: "ko", localeConfirmed: true }));
      location.reload();
    } catch (error) {
      updatePanel("无法修改游戏源语言；请在游戏设置里选择 한국어");
    }
  }

  function createUi() {
    if (!document.body || document.querySelector("[data-srzh-ui='button']")) return;

    GM_addStyle(`
      :root { --sr-font: "Microsoft YaHei", "PingFang SC", "Noto Sans CJK SC", sans-serif !important; }
      [data-srzh-ui] { font-family: "Microsoft YaHei", "PingFang SC", sans-serif !important; box-sizing: border-box !important; }
      .sr-attendance__day, .sr-attendance__count { white-space: nowrap !important; word-break: keep-all !important; }
      [data-srzh-panel="attendance"] { width: min(40rem, calc(100vw - 2rem)) !important; max-width: calc(100vw - 2rem) !important; }
      [data-srzh-panel="quest"] { width: min(42rem, calc(100vw - 2rem)) !important; max-width: calc(100vw - 2rem) !important; }
      [data-srzh-panel="quest"] .sr-list-item > div:first-child > .sr-list-item__title:first-child { flex: 1 1 auto !important; min-width: 0 !important; }
      [data-srzh-panel="quest"] .sr-list-item > div:first-child > :last-child:not(.sr-list-item__title) { flex: 0 0 auto !important; white-space: nowrap !important; word-break: keep-all !important; }
      #srzh-button { position: fixed; left: 12px; bottom: 12px; z-index: 2147483646; width: 42px; height: 42px; border: 2px solid rgba(255,255,255,.85); border-radius: 50%; color: #fff; background: #e5484d; box-shadow: 0 4px 16px rgba(0,0,0,.35); font-size: 21px; font-weight: 800; cursor: pointer; }
      #srzh-button:hover { transform: translateY(-1px); filter: brightness(1.08); }
      #srzh-panel { position: fixed; left: 12px; bottom: 62px; z-index: 2147483646; width: min(360px, calc(100vw - 24px)); color: #f7f7f7; background: rgba(22,24,29,.96); border: 1px solid rgba(255,255,255,.18); border-radius: 14px; box-shadow: 0 12px 36px rgba(0,0,0,.5); padding: 14px; font-size: 13px; line-height: 1.55; }
      #srzh-panel[hidden] { display: none !important; }
      #srzh-panel h2 { margin: 0 0 8px; font-size: 17px; color: #fff; }
      #srzh-panel p { margin: 6px 0; color: #d5d7dc; }
      #srzh-panel label { display: flex; align-items: center; gap: 8px; margin: 8px 0; cursor: pointer; }
      #srzh-panel input { accent-color: #e5484d; }
      #srzh-panel .srzh-actions { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 10px; }
      #srzh-panel button { border: 1px solid rgba(255,255,255,.22); border-radius: 8px; color: #fff; background: #343842; padding: 6px 9px; cursor: pointer; }
      #srzh-panel button:hover { background: #444a57; }
      #srzh-panel .srzh-warning { color: #ffd18b; font-size: 12px; }
      @media (max-width: 640px) { #srzh-button { width: 36px; height: 36px; font-size: 18px; } #srzh-panel { bottom: 56px; } [data-srzh-panel="attendance"], [data-srzh-panel="quest"] { width: calc(100vw - 1rem) !important; max-width: calc(100vw - 1rem) !important; } }
    `);

    const button = document.createElement("button");
    button.id = "srzh-button";
    button.type = "button";
    button.textContent = "中";
    button.title = "简体中文翻译设置";
    button.dataset.srzhUi = "button";

    panel = document.createElement("section");
    panel.id = "srzh-panel";
    panel.hidden = true;
    panel.dataset.srzhUi = "panel";
    panel.innerHTML = `
      <h2>斯皮奇养成 · 中文翻译</h2>
      <p data-role="status"></p>
      <p data-role="count"></p>
      <label><input data-role="enabled" type="checkbox"> 启用中文翻译</label>
      <p class="srzh-warning">脚本只使用内置离线词典，不会上传页面内容；玩家聊天、昵称和恢复码保持原样。</p>
      <div class="srzh-actions">
        <button data-action="scan" type="button">重新扫描</button>
        <button data-action="korean" type="button">源语言设为韩语</button>
        <button data-action="close" type="button">关闭面板</button>
      </div>
      <p>汉化：小奶茶 · 版本 ${SCRIPT_VERSION}</p>
      <p>关闭翻译后刷新页面可恢复原文。</p>
    `;

    const enabledInput = panel.querySelector("[data-role='enabled']");
    statusLine = panel.querySelector("[data-role='status']");
    countLine = panel.querySelector("[data-role='count']");
    enabledInput.checked = settings.enabled;

    button.addEventListener("click", () => {
      panel.hidden = !panel.hidden;
      updatePanel();
    });
    enabledInput.addEventListener("change", () => {
      settings.enabled = enabledInput.checked;
      scanEpoch += 1;
      saveSettings();
      if (settings.enabled) queueRoot(document.documentElement);
      updatePanel(settings.enabled ? "中文翻译已开启" : "中文翻译已关闭；刷新页面可恢复原文");
    });
    panel.querySelector("[data-action='scan']").addEventListener("click", () => {
      scanEpoch += 1;
      queueRoot(document.documentElement);
    });
    panel.querySelector("[data-action='korean']").addEventListener("click", setGameSourceToKorean);
    panel.querySelector("[data-action='close']").addEventListener("click", () => { panel.hidden = true; });

    document.body.append(panel, button);
    button.hidden = !settings.showButton;
    updatePanel();
  }

  GM_registerMenuCommand("开启/关闭中文翻译（刷新后完全生效）", () => {
    settings.enabled = !settings.enabled;
    saveSettings();
    location.reload();
  });
  GM_registerMenuCommand("显示/隐藏左下角“中”按钮", () => {
    settings.showButton = !settings.showButton;
    saveSettings();
    const button = document.querySelector("[data-srzh-ui='button']");
    if (button) button.hidden = !settings.showButton;
  });
  GM_registerMenuCommand("把游戏源语言切换为韩语", setGameSourceToKorean);

  function boot() {
    if (!document.documentElement) {
      window.setTimeout(boot, 0);
      return;
    }
    startObserver();
    if (document.body) createUi();
    else document.addEventListener("DOMContentLoaded", createUi, { once: true });
  }

  installSynchronousDomHooks();
  installCanvasHooks();
  installNativeDialogHooks();
  boot();
})();
