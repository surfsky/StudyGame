import * as XLSX from 'xlsx';

export interface Word {
    en: string;
    cn: string;
    levelId: number;
    root?: string;
    is_learn?: boolean;
    is_error?: boolean;
}

export interface Level {
    levelId: number;
    title: string;
    total: number;
    learned: number;
}

export class StudyDb {
    private static instance: StudyDb;
    private configFile = 'assets/levels/words.xlsx';
    private readonly DB_NAME = 'study_game';
    private readonly DB_VERSION = 5; // 更新数据库版本以触发结构变更
    private db: IDBDatabase | null = null;
    

    private constructor() {}

    /**检查数据库是否存在 */
    public async checkDatabaseExists(): Promise<boolean> {
        return new Promise((resolve) => {
            const request = indexedDB.open(this.DB_NAME);
            request.onsuccess = () => {
                const db = request.result;
                const exists = db.objectStoreNames.contains('words') && db.objectStoreNames.contains('levels');
                db.close();
                resolve(exists);
            };
            request.onerror = () => resolve(false);
        });
    }

    /**获取数据库实例（若未创建则创建） */
    static getInstance(): StudyDb {
        if (!StudyDb.instance) {
            StudyDb.instance = new StudyDb();
        }
        return StudyDb.instance;
    }

    //-------------------------------------------------------
    // 初始化数据库（从配置文件中初始化数据库）
    //-------------------------------------------------------
    /**重置数据库 */
    async resetDb(): Promise<void> {
        // 关闭现有数据库连接
        if (this.db) {
            this.db.close();
            this.db = null;
        }

        // 删除数据库
        return new Promise((resolve, reject) => {
            const deleteRequest = indexedDB.deleteDatabase(this.DB_NAME);

            deleteRequest.onerror = () => {
                reject(new Error('删除数据库失败'));
            };

            deleteRequest.onsuccess = async () => {
                try {
                    // 重新初始化数据库并加载数据
                    await this.initDatabase(this.configFile);
                    resolve();
                } catch (error) {
                    reject(error);
                }
            };
        });
    }

    /**初始化数据库 */
    public async initDatabase(configFile: string): Promise<void> {
        this.configFile = configFile;
        return new Promise((resolve, reject) => {
            // open db
            const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
            request.onerror = () => { reject(request.error);};
            request.onsuccess = () => { this.db = request.result; resolve(); };
            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                const transaction = (event.target as IDBOpenDBRequest).transaction;

                // 创建或更新words表（levelId, en, cn, root, is_learn, is_error）
                if (!db.objectStoreNames.contains('words')) {
                    const wordsStore = db.createObjectStore('words', { keyPath: ['levelId', 'en'] });  // 由levelId和en字段组成复合键
                    //const wordsStore = db.createObjectStore('words');  // 导入单词 Saturn 失败: DataError: Failed to execute 'add' on 'IDBObjectStore': The object store uses out-of-line keys and has no key generator and the key parameter was not provided.
                    wordsStore.createIndex('levelEn', ['levelId', 'en'], { unique: true });
                    wordsStore.createIndex('levelId', 'levelId', { unique: false });
                    wordsStore.createIndex('en', 'en', { unique: false });
                    wordsStore.createIndex('is_learn', 'is_learn', { unique: false });
                    wordsStore.createIndex('is_error', 'is_error', { unique: false });
                }

                // 创建或更新levels表(levelId, title, total, learned)
                if (!db.objectStoreNames.contains('levels')) {
                    const levelsStore = db.createObjectStore('levels', { keyPath: 'levelId' });
                    levelsStore.createIndex('title', 'title', { unique: false });
                }

                // 数据库结构创建完成后，在transaction完成时加载配置数据
                transaction!.oncomplete = () => {
                    this.db = db;
                    this.importFromExcel(configFile)
                        .then(() => resolve())
                        .catch(reject)
                        ;
                };
            };
        });
    }

    //-------------------------------------------------------
    // 从 Excel 中初始化数据库
    //-------------------------------------------------------
    /**加载配置数据 */
    private async importFromExcel(configFile: string): Promise<void> {
        try {
            const response = await fetch(configFile);
            const buffer = await response.arrayBuffer();
            const data = await new Uint8Array(buffer);
            StudyDb.importExcelData(data);
        } catch (error) {
            console.error('加载配置文件失败:', error);
            throw error;
        }
    }  

    
    /**
     * 导入Excel文件
     * @param file HTML File对象
     */
    public static async importExcelFile(file: File): Promise<{ name: string; count: number }[]> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const data = new Uint8Array(e.target?.result as ArrayBuffer);
                    const results = await StudyDb.importExcelData(data);
                    resolve(results);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = (e) => {
                reject(new Error('文件读取错误'));
            };
            reader.readAsArrayBuffer(file);
        });
    }

    /**导入Excel 文件数据 */
    public static async importExcelData(data: Uint8Array<ArrayBuffer>) {
        const db = StudyDb.getInstance();
        const results: { name: string; count: number; }[] = [];
        const workbook = XLSX.read(data, { type: 'array' });
        for (const sheetName of workbook.SheetNames) {
            const sheet = workbook.Sheets[sheetName];
            const count = await db.importExcelSheet(sheet, sheetName);
            results.push({ name: sheetName, count });
            console.log(`导入 ${sheetName} 成功，共导入 ${count} 条数据`);
        }
        return results;
    }

    /**导入Excel sheet 数据 */
    async importExcelSheet(sheet: XLSX.WorkSheet, sheetName: string): Promise<number> {
        const jsonData = XLSX.utils.sheet_to_json(sheet) as any[];
        if (!this.db) throw new Error('Database not initialized');
        const levels = await this.getLevels();
        const maxLevelId = levels.length > 0 ? Math.max(...levels.map(l => l.levelId)) : -1;
        const newLevelId = maxLevelId + 1;
    
        // 插入levels表
        try {
            const level: Level = {
                levelId: newLevelId,
                title: `${sheetName}`,
                total: jsonData.length,
                learned: 0
            };
            const levelsStore = this.db.transaction(['levels'], 'readwrite').objectStore('levels');
            await new Promise<void>((resolve, reject) => {
                const request = levelsStore.put(level);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('创建关卡失败:', error);
            throw error;
        }

        // 导入单词数据
        let importedCount = 0;
        for (const row of jsonData) {
            const word: Word = {
                en:   String(row['英文']) || String(row['English']) || '',
                cn:   String(row['中文']) || String(row['Chinese']) || '',
                root: String(row['词根']) || String(row['Root'])    || '',
                levelId: newLevelId,
                is_learn: false,
                is_error: false
            };
            
            if (word.en && word.cn) {
                try {
                    // 为每个单词创建独立的事务
                    const transaction = this.db.transaction(['words'], 'readwrite');
                    const wordsStore = transaction.objectStore('words');
                    
                    await new Promise<void>((resolve, reject) => {
                        const request = wordsStore.add(word);
                        request.onsuccess = () => {
                            importedCount++;
                            console.log(`导入单词 ${word.en} 成功`);
                            resolve();
                        };
                        request.onerror = () => {
                            if (request.error?.name === 'ConstraintError') {
                                console.warn(`单词 ${word.en} 在关卡 ${newLevelId} 中已存在，跳过导入`);
                            } else {
                                console.error(`导入单词 ${word.en} 失败:`, request.error);
                            }
                            resolve(); // 跳过错误继续处理
                        };
                    });
                } catch (error) {
                    console.error(`导入单词 ${word.en} 失败:`, error);
                    continue;
                }
            }
        }
        
        return importedCount;
    }    
    


    //-------------------------------------------------------
    // 关卡表操作
    //-------------------------------------------------------
    /**获取所有关卡信息 */
    async getLevels(): Promise<Level[]> {
        if (!this.db) {
            await this.initDatabase(this.configFile);
            if (!this.db) throw new Error('Database initialization failed');
        }
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction('levels', 'readonly');
            const store = transaction.objectStore('levels');
            const request = store.getAll();

            request.onsuccess = () => {
                resolve(request.result);
            };
            request.onerror = () => reject(request.error);
        });
    }

    /**更新关卡信息 */
    async updateLevel(level: Level): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction('levels', 'readwrite');
            const store = transaction.objectStore('levels');
            const request = store.put(level);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    //-------------------------------------------------------
    // 单词表操作
    //-------------------------------------------------------
    /**获取某个级别的所有单词 */
    async getWords(level: number, pageSize: number, pageId: number): Promise<Word[]> {
        if (!this.db) throw new Error('Database not initialized');
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction('words', 'readonly');
            const store = transaction.objectStore('words');
            const index = store.index('levelId');
            const request = index.getAll(level);

            request.onsuccess = () => {
                const words = request.result.sort((a: Word, b: Word) => 
                    a.en.localeCompare(b.en));
                const startIndex = pageId * pageSize;
                const paginatedWords = words.slice(startIndex, startIndex + pageSize);
                resolve(paginatedWords);
            };
            request.onerror = () => reject(request.error);
        });
    }

    /**获取某个级别的未学习单词 */
    async getUnlearnedWords(level: number, pageSize: number, pageId: number): Promise<Word[]> {
        if (!this.db) throw new Error('Database not initialized');
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction('words', 'readonly');
            const store = transaction.objectStore('words');
            const index = store.index('levelId');
            const request = index.getAll(level);

            request.onsuccess = () => {
                const allWords = request.result.filter((word: Word) => !word.is_learn);
                const startIndex = pageId * pageSize;
                const words = allWords.slice(startIndex, startIndex + pageSize);
                resolve(words);
            };
            request.onerror = () => reject(request.error);
        });
    }

    /**获取某个级别的错误单词 */
    async getErrorWords(level: number, pageSize: number, pageId: number): Promise<Word[]> {
        if (!this.db) throw new Error('Database not initialized');
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction('words', 'readonly');
            const store = transaction.objectStore('words');
            const index = store.index('levelId');
            const request = index.getAll(level);

            request.onsuccess = () => {
                const allWords = request.result.filter((word: Word) => word.is_error);
                const startIndex = pageId * pageSize;
                const words = allWords.slice(startIndex, startIndex + pageSize);
                resolve(words);
            };
            request.onerror = () => reject(request.error);
        });
    }

    /**获取某个级别的总单词数 */
    async getWordCount(level: number, mode: 'all' | 'unlearned' | 'error' | 'learned'): Promise<number> {
        if (!this.db) throw new Error('Database not initialized');
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction('words', 'readonly');
            const store = transaction.objectStore('words');
            const levelIndex = store.index('levelId');
            const request = levelIndex.getAll(level);

            request.onsuccess = () => {
                const words = request.result;
                let count = 0;
                switch(mode) {
                    case 'learned':    count = words.filter(word => word.is_learn).length;  break;
                    case 'unlearned':  count = words.filter(word => !word.is_learn).length; break;
                    case 'error':      count = words.filter(word => word.is_error).length;  break;
                    default:           count = words.length;
                }
                resolve(count);
            };
            request.onerror = () => reject(request.error);
        });
    }

    /**设置某个单词的学习状态 */
    async setWordLearn(word: Word, b: boolean): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['words', 'levels'], 'readwrite');
            const wordsStore = transaction.objectStore('words');

            // 更新单词状态
            //wordsStore.index('levelEn').openCursor(IDBKeyRange.only(word.levelId)).onsuccess = (event) => {
            //    const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
            //    if (cursor) {
            //        const updatedWord = {...cursor.value, is_learn: b, is_error: cursor.value?.is_error || false };
            //        cursor.update(updatedWord);
            //        cursor.continue();
            //    }
            //}
            //const levelIndex = wordsStore.index('levelEn');
            wordsStore.get([word.levelId, word.en]).onsuccess = (event) => {
                const word = (event.target as IDBRequest<Word>).result;
                if (word) {
                    const updatedWord = {...word, is_learn: b, is_error: word?.is_error || false };
                    wordsStore.put(updatedWord);
                    // 更新关卡学习进度
                    if (b) {
                        const levelsStore = transaction.objectStore('levels');
                        const levelRequest = levelsStore.get(word.levelId);
                        levelRequest.onsuccess = () => {
                            const level = levelRequest.result;
                            level.learned = (level.learned || 0) + 1;
                            levelsStore.put(level);
                        };
                    }
                }
            }

            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    }

    /**设置某个单词的错误状态 */
    async setWordError(word: Word, b: boolean): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction('words', 'readwrite');
            const store = transaction.objectStore('words');

            const request = store.get([word.levelId, word.en]);
            request.onsuccess = () => {
                const updatedWord = { ...request.result, is_error: b };
                store.put(updatedWord);
                console.log(`更新单词错误状态: ${word.levelId}, ${word.en}, is_error=${b}`);
                resolve();
            };
            request.onerror = () => reject(request.error);
        });
    }

}