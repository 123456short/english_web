/* 铁柱英语 · 词库 / 打字句库 / 每日一读素材 */

const WORDS = [
  { id: "abundant", pos: "adj", cn: "丰富的，充裕的", en: "The region is abundant in natural resources." },
  { id: "achieve", pos: "verb", cn: "实现，达到", en: "You can achieve anything if you work hard." },
  { id: "advantage", pos: "noun", cn: "优势，有利条件", en: "Speaking two languages gives you a big advantage." },
  { id: "ambitious", pos: "adj", cn: "有雄心的，野心勃勃的", en: "She is ambitious and hopes to run her own company." },
  { id: "analyze", pos: "verb", cn: "分析", en: "Scientists analyze the data before drawing conclusions." },
  { id: "ancient", pos: "adj", cn: "古代的，古老的", en: "We visited the ancient temple built a thousand years ago." },
  { id: "anxiety", pos: "noun", cn: "焦虑，担忧", en: "He felt a little anxiety before the exam." },
  { id: "apparent", pos: "adj", cn: "明显的，显而易见的", en: "It was apparent that she had been crying." },
  { id: "appreciate", pos: "verb", cn: "感激；欣赏", en: "I really appreciate your help with my English." },
  { id: "approach", pos: "noun", cn: "方法；接近", en: "We need a new approach to this problem." },
  { id: "appropriate", pos: "adj", cn: "恰当的，合适的", en: "Jeans are not appropriate for a formal dinner." },
  { id: "argue", pos: "verb", cn: "争论，辩论", en: "They often argue about politics." },
  { id: "assume", pos: "verb", cn: "假定，认为", en: "I assume you have heard the news already." },
  { id: "attempt", pos: "noun", cn: "尝试，努力", en: "He made his first attempt to climb the mountain." },
  { id: "available", pos: "adj", cn: "可获得的，有空的", en: "The teacher is available after class every day." },
  { id: "avoid", pos: "verb", cn: "避免", en: "Try to avoid making the same mistake twice." },
  { id: "balance", pos: "noun", cn: "平衡；余额", en: "It is hard to keep a balance between work and life." },
  { id: "behavior", pos: "noun", cn: "行为，举止", en: "His behavior at the meeting surprised everyone." },
  { id: "benefit", pos: "noun", cn: "好处，益处", en: "Regular exercise has many benefits." },
  { id: "brilliant", pos: "adj", cn: "才华出众的；极好的", en: "That is a brilliant idea!" },
  { id: "calculate", pos: "verb", cn: "计算，估算", en: "Can you calculate the total cost of the trip?" },
  { id: "capable", pos: "adj", cn: "有能力的", en: "She is capable of finishing the project alone." },
  { id: "challenge", pos: "noun", cn: "挑战", en: "Learning a new language is a big challenge." },
  { id: "circumstance", pos: "noun", cn: "情况，环境", en: "Under no circumstances should you give up." },
  { id: "communicate", pos: "verb", cn: "交流，沟通", en: "We communicate with each other by email." },
  { id: "compare", pos: "verb", cn: "比较", en: "Compare the two pictures and find the differences." },
  { id: "concentrate", pos: "verb", cn: "集中注意力", en: "I cannot concentrate with all this noise." },
  { id: "confident", pos: "adj", cn: "自信的", en: "Be confident and you will do well in the interview." },
  { id: "consider", pos: "verb", cn: "考虑；认为", en: "Please consider my suggestion carefully." },
  { id: "curious", pos: "adj", cn: "好奇的", en: "The curious child asked a lot of questions." },
  { id: "decide", pos: "verb", cn: "决定", en: "You should decide for yourself what to study." },
  { id: "determine", pos: "verb", cn: "决定，下决心", en: "She determined to become a doctor at the age of ten." },
  { id: "develop", pos: "verb", cn: "发展，开发", en: "It takes time to develop a good habit." },
  { id: "eager", pos: "adj", cn: "渴望的，热切的", en: "The students were eager to learn new words." },
  { id: "efficient", pos: "adj", cn: "高效的", en: "This is a more efficient way of memorizing words." },
  { id: "encourage", pos: "verb", cn: "鼓励", en: "My parents always encourage me to try new things." },
  { id: "environment", pos: "noun", cn: "环境", en: "We must protect the environment for future generations." },
  { id: "especially", pos: "adv", cn: "尤其，特别", en: "I love fruit, especially strawberries." },
  { id: "estimate", pos: "verb", cn: "估计，估算", en: "I estimate that the work will take two days." },
  { id: "eventually", pos: "adv", cn: "最终，终于", en: "After many failures, he eventually succeeded." },
  { id: "evidence", pos: "noun", cn: "证据", en: "There is strong evidence for this theory." },
  { id: "familiar", pos: "adj", cn: "熟悉的", en: "This song sounds familiar to me." },
  { id: "frequently", pos: "adv", cn: "频繁地，经常", en: "He frequently visits the library on weekends." },
  { id: "gradually", pos: "adv", cn: "逐渐地", en: "Her English is gradually improving." },
  { id: "however", pos: "adv", cn: "然而，不过", en: "The plan seemed perfect; however, it failed." },
  { id: "improve", pos: "verb", cn: "改进，提高", en: "Reading every day will improve your vocabulary." },
  { id: "instead", pos: "adv", cn: "代替，反而", en: "He did not reply; instead, he walked away." },
  { id: "knowledge", pos: "noun", cn: "知识", en: "Knowledge is power." },
  { id: "obviously", pos: "adv", cn: "显然地", en: "Obviously, she was not interested in the topic." },
  { id: "opportunity", pos: "noun", cn: "机会，时机", en: "Don't miss this golden opportunity." },
  { id: "particular", pos: "adj", cn: "特别的，特定的", en: "Is there any particular word you want to learn?" },
  { id: "perhaps", pos: "adv", cn: "也许，可能", en: "Perhaps we can meet again next week." },
  { id: "prepare", pos: "verb", cn: "准备", en: "Prepare well before the speech." },
  { id: "probably", pos: "adv", cn: "大概，很可能", en: "It will probably rain this afternoon." },
  { id: "purpose", pos: "noun", cn: "目的，意图", en: "The purpose of this app is to make learning fun." },
  { id: "realize", pos: "verb", cn: "意识到；实现", en: "I did not realize how late it was." },
  { id: "recommend", pos: "verb", cn: "推荐，建议", en: "I highly recommend this book to beginners." },
  { id: "remember", pos: "verb", cn: "记得，记住", en: "Remember to review the words every day." },
  { id: "seriously", pos: "adv", cn: "严肃地，认真地", en: "You should take this exam seriously." },
  { id: "similar", pos: "adj", cn: "相似的", en: "Our opinions are similar on this question." },
  { id: "struggle", pos: "verb", cn: "挣扎；奋斗", en: "Many students struggle with grammar at first." },
  { id: "suddenly", pos: "adv", cn: "突然地", en: "Suddenly, the lights went out." },
  { id: "surprise", pos: "noun", cn: "惊讶；惊喜", en: "What a wonderful surprise to see you here!" },
  { id: "through", pos: "prep", cn: "穿过，通过", en: "We walked through the park to school." },
  { id: "toward", pos: "prep", cn: "朝，向", en: "He took a step toward the door." },
  { id: "understand", pos: "verb", cn: "理解，明白", en: "Do you understand what I mean?" },
  { id: "between", pos: "prep", cn: "在……之间", en: "The bank is between the school and the park." },
  { id: "without", pos: "prep", cn: "没有，不带", en: "You cannot learn English without practice." },
  { id: "look forward to", pos: "phrase", cn: "期待，盼望", en: "I look forward to hearing from you soon." },
  { id: "give up", pos: "phrase", cn: "放弃", en: "Never give up on your dreams." },
  { id: "figure out", pos: "phrase", cn: "弄清楚，明白", en: "I cannot figure out this grammar rule." },
  { id: "as long as", pos: "phrase", cn: "只要", en: "As long as you keep practicing, you will improve." },
  { id: "in order to", pos: "phrase", cn: "为了", en: "He gets up early in order to catch the first bus." }
];

const POS_LABELS = {
  noun: "名词", verb: "动词", adj: "形容词", adv: "副词", prep: "介词", phrase: "词组"
};

/* 打字练习句库 */
const TYPING_SENTENCES = [
  { text: "Practice makes perfect.", cn: "熟能生巧。" },
  { text: "The early bird catches the worm.", cn: "早起的鸟儿有虫吃。" },
  { text: "Where there is a will, there is a way.", cn: "有志者事竟成。" },
  { text: "A journey of a thousand miles begins with a single step.", cn: "千里之行始于足下。" },
  { text: "Reading is to the mind what exercise is to the body.", cn: "读书之于头脑，如同锻炼之于身体。" },
  { text: "Actions speak louder than words.", cn: "行动胜于言语。" },
  { text: "Knowledge is the best investment.", cn: "知识是最好的投资。" },
  { text: "Rome was not built in a day.", cn: "罗马不是一天建成的。" },
  { text: "The secret of getting ahead is getting started.", cn: "领先的秘诀就是开始行动。" },
  { text: "Learn something new every day.", cn: "每天学点新东西。" },
  { text: "Small steps every day lead to big changes.", cn: "每天一小步，带来大改变。" },
  { text: "Your future is created by what you do today.", cn: "你的未来由今天的行动创造。" }
];

/* 每日一读素材：按日期轮换 */
const READINGS = [
  {
    title: "The Power of Daily Reading",
    tag: "每日英语 · 第 1 篇",
    paragraphs: [
      "Reading a little every day is perhaps the best way to learn English. When you read, you meet words in their natural environment, and you remember them without hard work.",
      "Maria, a college student, could not understand English articles at first. She felt anxious about it. Then she started to read one short passage every morning. Step by step, her vocabulary grew, and reading became a pleasure instead of a struggle.",
      "Now Maria reads English news every day. She says the secret is simple: start small, keep going, and never give up."
    ],
    trans: [
      "每天读一点，也许是学英语最好的方式。阅读时，你会在自然的语境中遇见单词，不需要死记硬背就能记住它们。",
      "大学生玛丽亚起初读不懂英语文章，为此感到焦虑。后来她开始每天早晨读一篇短文。渐渐地，她的词汇量增长了，阅读也从挣扎变成了一种乐趣。",
      "现在玛丽亚每天都读英语新闻。她说秘诀很简单：从小处开始，坚持下去，永不放弃。"
    ]
  },
  {
    title: "The Morning Runner",
    tag: "每日英语 · 第 2 篇",
    paragraphs: [
      "Every morning before the sun rises, Ken puts on his running shoes and goes out. He runs through the quiet park between the library and the river.",
      "Two years ago, Ken was always tired and his health was poor. His doctor told him to take exercise seriously. At first, he could only run for five minutes. However, he gradually improved.",
      "Now Ken is stronger and more confident. Running in the morning gives him energy for the whole day. He recommends it to everyone."
    ],
    trans: [
      "每天清晨，太阳升起之前，肯穿上跑鞋出门。他跑步穿过图书馆和河流之间那个安静的公园。",
      "两年前，肯总是疲惫不堪，身体也不好。医生让他认真锻炼。起初他只能跑五分钟，但他逐渐进步了。",
      "现在肯更强壮也更自信了。晨跑给了他一整天的活力。他把这个习惯推荐给了所有人。"
    ]
  },
  {
    title: "A Letter from an Old Friend",
    tag: "每日英语 · 第 3 篇",
    paragraphs: [
      "Yesterday I received a letter from Li Hua, an old friend from middle school. We have not seen each other for almost ten years.",
      "In the letter, he told me about his life in Chengdu. He works as a software engineer and enjoys his job. On weekends, he climbs mountains with his family and takes photos of ancient temples.",
      "His words brought back many sweet memories. We both look forward to meeting each other again soon."
    ],
    trans: [
      "昨天我收到了初中老朋友李华的一封信。我们几乎十年没有见面了。",
      "信里，他讲述了他在成都的生活。他是一名软件工程师，很喜欢自己的工作。周末他会和家人一起去爬山，拍摄古老的寺庙。",
      "他的话唤起了许多甜蜜的回忆。我们都盼望着早日再见面。"
    ]
  }
];
