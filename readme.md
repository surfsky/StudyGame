# 连连看学习游戏

基于Trae、phaserjs、nodejs、typescript、vite、豆包等技术创建
在AI的帮助下，核心代码花了两天时间完成。

Author：github.com/surfsky
Last Update：2025-03




## 功能

- 创建一个手机竖屏版本的学习游戏。
- 用户群体为儿童，界面和声效都要有趣一些。
- 欢迎场景显示背景图片、游戏标题，显示“关卡选择”、“开始”、“错题复习”、“重置”按钮。
- 主游戏场景
  - 顶部为工具栏，左边为返回按钮，右边为刷新按钮
  - 左侧为一批英语单词，外观为胶囊型，点击可朗读。
  - 右侧为一批对应的中文，外观为胶囊型，点击可朗读。
  - 右侧中文顺序是打乱的。
  - 按住左侧单词，可连线拖动到右侧中文，若匹配成功则闪烁并消除这一对中英文词汇（并播放消除声效），若连线错误则播放嘟嘟声音。
  - 该关卡单词全部匹配成功后，播放音乐，继续下一关。

## Task



重置时太快显示消息框，这里异步有问题，数据未能完全重置，需要查一下。
实现Control基础类，实现setOrigin等方法

优化主场景
    优化单词worditem
        /水平靠左对齐，垂直居中对齐，超出换行
        超出部分被裁减
        超出部分用省略号表示？
        按住后自动加宽到文字宽度？
    实现过滤：用tab改造，可显示各种mode
    实现排序：学习界面右上角放置一个“排序”图标按钮，点击后可下拉选择单词排序方式：字母顺序、随机、词根、原序
    解决模糊问题
    实现TTS：再测试一下文字朗读功能（手机端不行啊），普通html可以，但是放到ts里面不行？

控件
    用 Dialog 来重构 MessageBox
    创建最普通的 TextBox 控件，可以滚动换行。
    优化 DropDownList 控件，支持绑定对象列表数据。
    实现 Contorl 类的 anchor 属性，随着屏幕resize自动调整位置


换一个温柔的背景音乐
错题复习，弄对三次后消除。


实现和剥离控件库：
    overlay：popup、dialog、view（全屏）、mask、scrollview、
    layout：row、column、grid
    form：button、link、fileSelector、label、switch、image、textbox、radio、checkbox、combobox....
    按照windows form的方式设计api，用事件剥离界面和逻辑、支持绑定数据、支持动画、支持事件、支持样式


## Done

    /用 Dialog 来重构 ImportDialog
    /剥离 uploader 控件（fileSelector）
/优化主场景
    /修正左右单词一样的问题
    /优化拖拽感应区域，更灵敏一些
    /自动调整文字大小手机端太小了。考虑点击 worditem 放大，双击可弹出详情框
/完全用word类来传递数据
/双击单词后会弹窗显示单词卡
/优化重构 StudyDb，创建Db基类，实现基础的 CRUD 泛型方法。
/fixbug 错词复习场景，无法消除数据
/剥离 dialog 控件，参考 ImportDialog
/一首曲子如何控制全局控制播放或关闭。不关就行了
/过关后鼓掌鼓励
/删除从json初始化数据的逻辑，只保留从excel导入
/修正索引 levelId + en 是唯一的，调试正确
/删除和重构 ButtonHelper，完全用 Button 控件
/解决导入数据覆盖问题，levelId + en 是唯一的。一个单词一个transaction的输入数据。
/修正导入excel错误，将所有列都转化为string
/重构初始化逻辑，从excel中导入数据：创建小学词汇、中学词汇、高中词汇、四级词汇、六级词汇、GRE词汇
/优化主游戏场景，胶囊按钮弄宽一点，文字自适应缩小
  /优化dropdownlist控件，添加 dropWidth、dropHeight 属性，支持滚动。
  /剥离 link 控件
/实现导入功能，导入 excel 单词库
/点中单词胶囊后，老的胶囊红外框要清除
/仅错题复习模式才可以消除错题（或者考虑错题要做对几次才能消除）
/优化主场景：减少按钮和文字的大小，一页放多一些单词
/显示统计数据：完成数、总单词数、错误数、完成率、正确率
/当前页面做了几题后，点击下一页或上一页按钮，分页有错误需要刷新。
/如何协调测试页面和手机端的不一致现象。svg设置了width后height后又一致了。
/fix：按钮图标大小网页端和手机端不一致。button.icon 取消iconscale属性，改用iconWidth、iconHeight属性，经测试用width、height无效。不是的，是svg未显式标注width和height
/首次安装数据库后，级别下拉框文本未显示，需要刷新页面才能正确显示，请修正
/按钮点击后显示深一点的颜色（算了，变小吧）
/游戏关卡数据从json文件中读取
/重构关卡数据相关逻辑
  - 关卡文件数据从 /assets/levels/config.json 文件中获取
  - 数据库新建 levels 表（字段：level, title, total, learned），用于保存关卡及学习进度信息。
  - 提供 StudyDb.getLevels(), updateLevel(...) 等方法
  - 修改相关level 代码，统一为base-0
  - 修改其他相关代码
