import { SortType, StudyDb, Word } from './StudyDb';

/**
 * 游戏关卡数据和逻辑管理类
 */
export class StudyDoc {
    private levelId: number = 0;
    private totalPages: number = 1;
    public pageSize: number = 10;
    public pageId: number = 0;
    private matchCount: number = 0;
    private pageWords: Array<Word> = [];  // 当前页单词清单
    private matchWord: Word | null = null;
    public mode: 'all' | 'unlearned' | 'error' = 'all';

    // 回调函数
    onMatchSuccess?: () => void;
    onMatchFail?: () => void;
    onPageComplete?: () => void;

    /**初始化关卡数据*/
    async init(
        levelId: number, 
        mode: 'all' | 'unlearned' | 'error' = 'all', 
        sortType: SortType,
        pageSize: number = 10, pageId:number
    ) {
        this.pageSize = pageSize;
        this.levelId = levelId;
        this.matchCount = 0;
        this.pageId = pageId;
        this.mode = mode;
        
        // 该等级下的所有数据
        const db = await StudyDb.getInstance();
        switch(mode) {
            case 'unlearned':
                this.pageWords = await db.getUnlearnedWords(levelId, sortType, pageSize, pageId);
                break;
            case 'error':
                this.pageWords = await db.getErrorWords(levelId, sortType, pageSize, pageId);
                break;
            default:
                this.pageWords = await db.getWords(levelId, sortType, pageSize, pageId);
        }
    }

    /**检测是否配对 */
    async checkMatch(enWord: string, cnWord: string): Promise<boolean> {
        const pair = this.pageWords.find(w => w.en === enWord && w.cn === cnWord);
        this.matchWord = pair || null;
        const db = await StudyDb.getInstance();
        if (pair) {
            // 匹配成功
            this.matchCount++;
            await db.setWordLearn({ en: enWord, cn: cnWord, levelId: this.levelId, is_learn: true }, true);
            if (this.mode == 'error')
                await db.setWordError({ en: enWord, cn: cnWord, levelId: this.levelId, is_error: false }, false);  // 仅错题模式才运行删除错题记录，便于复习
            if (this.onMatchSuccess) 
                this.onMatchSuccess();

            // 检测关卡是否结束
            if (this.matchCount === this.pageWords.length) {
                if (this.onPageComplete) {
                    this.onPageComplete();
                }
            }
            return true;
        } else {
            // 匹配失败
            const correctPair = this.pageWords.find(w => w.en === enWord || w.cn === cnWord);
            if (correctPair) 
                await db.setWordError({ en: correctPair.en, cn: correctPair.cn, levelId: this.levelId, is_error: true }, true);
            if (this.onMatchFail) 
                this.onMatchFail();
            return false;
        }
    }

    /**获取当前页码*/
    getPageId(): number {
        return this.pageId;
    }

    /**获取总页数*/
    getPages(): number {
        return this.totalPages;
    }

    /**获取学习统计信息*/
    async getStat(): Promise<{learned: number, error: number, total: number}> {
        const db = await StudyDb.getInstance();
        const total = await db.getWordCount(this.levelId, this.mode);
        const allWords = await db.getWords(this.levelId, SortType.Raw, total, 0);
        
        // 统计已学习和错误的单词数
        const learned = allWords.filter(word => word.is_learn === true).length;
        const error = allWords.filter(word => word.is_error === true).length;
        return { learned, error, total };
    }
    
    /**异步计算并更新总页数*/
    async calcPages(): Promise<number> {
        try {
            // 获取数据库中该等级的所有单词数量
            const db = await StudyDb.getInstance();
            const totalWords = await db.getWordCount(this.levelId, this.mode);
            
            // 计算总页数 = 向上取整(总单词数 / 每页单词数)
            this.totalPages = Math.ceil(totalWords / this.pageSize);
            return this.totalPages;
        } catch (error) {
            console.error('获取总页数时出错:', error);
            this.totalPages = 1; // 出错时返回默认值
            return 1;
        }
    }
    
    /**获取英文单词列表*/
    getEnWords(sortType: 'raw' | 'alphabet' | 'random' = 'raw'): Word[] {
        let words = [...this.pageWords];
        switch (sortType) {
            case 'alphabet':
                return words.sort((a, b) => a.en.localeCompare(b.en));
            case 'random':
                return words.sort(() => Math.random() - 0.5);
            default:
                return words;
        }
    }

    /**获取中文单词列表*/
    getCnWords(shuffle: boolean): Word[] {
        if (shuffle)
            return [...this.pageWords].sort(() => Math.random() - 0.5);
        return this.pageWords;
    }

    /**获取当前匹配的单词*/
    getMatchWord(): Word | null {
        return this.matchWord;
    }

    /**获取当前页面的单词列表*/
    getWords(): Array<Word> {
        return this.pageWords;
    }
}