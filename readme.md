# 连连看学习游戏

基于Trae、phaserjs、nodejs、typescript、vite、豆包等技术创建
在AI的帮助下，核心代码花了两天时间完成。

Author：github.com/surfsky
Last Update：2025-03




## 功能

- 手机竖屏版本的单词学习游戏。
- 用户群体为儿童，界面和声效都要有趣一些。
- 欢迎场景显示背景图片、游戏标题，显示“关卡选择”、“开始”、“错题复习”、“重置”按钮。
- 主游戏场景
  - 顶部为工具栏，左边为返回按钮，右边为刷新按钮
  - 左侧为一批英语单词，外观为胶囊型，点击可朗读。
  - 右侧为一批对应的中文，外观为胶囊型，点击可朗读。
  - 右侧中文顺序是打乱的。
  - 按住左侧单词，可连线拖动到右侧中文，若匹配成功则闪烁并消除这一对中英文词汇（并播放消除声效），若连线错误则播放嘟嘟声音。
  - 该关卡单词全部匹配成功后，播放音乐，继续下一关。
- 特点
  - 每个单词都有以下属性：ID、英文、中文、词根、音标、主题
  - 关卡数据从excel导入，可自定义关卡。
  - 主游戏场景有：学习模式、游戏模式、错题复习模式。
    - 学习模式：左右单词对称，用户可通过拖拽连线的方式来匹配单词。
    - 游戏模式：左右单词不对称，用户可通过拖拽连线的方式来匹配单词。
    - 错题复习模式：用户可通过拖拽连线的方式来匹配单词，匹配成功后会被消除。
  - 单词的排序方式有：字母顺序、随机、词根、原序。更方便批量主题方式背诵。
  - 单词卡详细信息从 AI 获取（英文、中文、音标、词根、词性、例句、翻译、图片、音频）

## 附属UI库

基础能力
    支持样式
    支持动画
    支持单向数据绑定
    用事件剥离界面和逻辑（为实现设计器做准备，显示外框、禁止所有事件，可拖拽放置）

- basic
    [*] Control: theme, draw, bounds
    [*] Panel: scroll panel
    [*] Rect
    [*] Label
    [*] Img
    [*] Tag
    [*] ProgressBar
- button
    [*] Button
    [*] GameButton
    [*] GroupButton
    [*] FileButton
    [*] ImageButton
- form：
    [*] Link
    [*] Switcher
    [*] CheckBox
    [*] RadioBox
    [*] Textbox (全部由PhaserJs实现有困难（输入法、换行、光标、滚动等），内置一个html input，用样式控制)
    [ ] Calendar
    [ ] DatePicker
    [ ] TimePicker
- data
    [*] DropdownList
    [*] ListBox
    [ ] Combobox = textbox + listbox
    [*] Table
    [-] Tree
    [ ] SliderView
    [ ] ListView
    [ ] Pager
- overlay
    [*] mask
    [*] popup: modal, closebutton, closeWhenClickOutside
    [*] dialog
    [*] messagebox
    [*] toast
    [*] tooltip
- layout：
    [*] Row
    [*] Column
    [*] Grid
- app
    [-] View（全屏），可左右滑动
    [ ] TitleBar
    [ ] TabBar
    [ ] IconBar
    [ ] ActionSheet(Popup anchor=button)
    [ ] DatePickerSheet


控件Task
    实现 View/ViewManager
    实现图片双指缩放功能
    优化 Button 的 bounders
    测试优化layout控件
    响应式布局
    TextBox 多行控件可以滚动换行。
    优化面板
        实现拖拽面板移动
        实现面板调整大小能力
    实现组合控件
        实现listview，可用于替代 Dropdownlist 的下拉面板部分。
        实现树控件treeview
        实现下拉控件，可下拉任何东西
        实现日历控件
    优化 Control 基类
        实现Control基础类setOrigin相关逻辑（容后容后，或者改用Rectangle+Container方式实现，接口先不变）
        实现 Contorl 类的 anchor 属性，随着屏幕resize自动调整位置
    用 Popup、Dialog 来重构 MessageBox
    实现界面设计器


## Task

***测试文字朗读功能（手机端仅浙政钉可以，是不是浏览器或哪里有设置可以开启），普通html可以，但是放到ts里面不行？
增加单词Scope（如动物、植物、食物、颜色、数字、时间、地点、人物、交通工具等），这个比较固定，以json对象就好
    每个单词课归属于多个主题
    可根据主题过滤单词
fixbug：重置时太快显示消息框，这里异步有问题，数据未能完全重置，需要查一下。

优化主场景
    优化单词worditem
        /水平靠左对齐，垂直居中对齐，超出换行
        超出部分被裁减
        超出部分用省略号表示？
        按住后自动加宽到文字宽度？
    实现过滤：用tab改造，可显示各种mode
    实现排序：学习界面右上角放置一个“排序”图标按钮，点击后可下拉选择单词排序方式：字母顺序、随机、词根、原序
    解决模糊问题


换一个温柔的背景音乐
错题复习，弄对三次后消除。
修正Button的边框，修改button让其基于左上角坐标进行定位


## Done

/实现 Img 控件，可异步加载图片
/实现 GroupButton 控件
/实现panel的惯性滑动功能。
/完善 Style
    /实现scene的背景色
    /修正checkbox、radiobox的文本样式
/实现 Popup 拖动
/实现 Toast 控件
/默认数据插入顺序不可靠，需要设置Id自增字段，插入数据时自动生成。
/实现词根方式排序
        /按照windows form的方式设计api，用事件剥离界面和逻辑、支持绑定数据、支持动画、支持事件、支持样式
        /实现绘制control外框
/实现控件样式
    /TestControl 页面绘制一条基准线，用于测试偏移和Origin
    /优化 DropDownList 控件，支持绑定对象列表数据。
/实现学习模式，左右单词对称。
/实现排序方法 SortType
/实现 Switcher
/实现 CheckBox
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
