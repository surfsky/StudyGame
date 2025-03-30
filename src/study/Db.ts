/**
 * Store 装饰器用于定义表名
 * @param name 表名
 */
export function Store(name: string) {
    return function (target: Function) {
        target.prototype.storeName = name;
    }
}


/**数据库基类，封装了ORM的一些操作 
 * @example
 * @Store('words')
 * class Word {
 *     levelId: number;
 *     en: string;
 *     cn: string;
 * }
 *
 * const db = StudyDb.getInstance();
 * const word = await db.get<Word>("word", [levelId, en]);
 * const word = await db.get<Word>([levelId, en]);  // 尚未未实现
 }
*/
export class Db{
    protected db: IDBDatabase | null = null;

    /** 获取对象的仓库名称（使用装饰器）
    */
    protected getStoreName<T>(target: new (...args: any[]) => T): string {
        const prototype = target.prototype;
        if (!prototype.storeName) {
            throw new Error('Store name not found. Did you forget to add @Store decorator?');
        }
        return prototype.storeName;
    }

    /**泛型方法，获取单个数据
     * @param [index=''] 索引名称
     * @example
     * var word = await db.get<Word>('words', [levelId, en], 'levelEn');
    */
    async get<T>(storeName: string, key: IDBValidKey | IDBKeyRange, index=''): Promise<T | undefined> {
        if (!this.db) throw new Error('Database not initialized');
        return new Promise((resolve, reject) => {
            const store = this.db!.transaction(storeName,'readonly').objectStore(storeName);
            const request = (index=='') ? store.get(key) : store.index(index).get(key);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        })
    }

    /**泛型方法，获取所有数据 
     * @example
     * var words = await db.getAll<Word>('words', 1, 'levelId');
    */
    async getAll<T>(storeName: string, key: IDBValidKey | IDBKeyRange | null=null, index=''): Promise<T[]> {
        if (!this.db) throw new Error('Database not initialized');
        return new Promise((resolve, reject) => {
            const request = this.query<T>(storeName, key, index);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        })
    }

    /**构建查询表达式 */
    private query<T>(storeName: string, key: IDBValidKey | IDBKeyRange | null=null, index: string='') {
        const store = this.db!.transaction(storeName, 'readonly').objectStore(storeName);
        if (key == null)      return store.getAll();
        else if (index == '') return store.getAll(key);
        else                  return store.index(index).getAll(key);
    }

    /**泛型方法，过滤获取数据 
     * @example
     * var words = await db.search<Word>('words', (word) => word.levelId == 1));
    */
    async filter<T>(storeName: string, filter?: (item: T) => boolean): Promise<T[]> {
        if (!this.db) throw new Error('Database not initialized');
        return new Promise((resolve, reject) => {
            const store = this.db!.transaction(storeName,'readonly').objectStore(storeName);
            const request = store.getAll();
            request.onsuccess = () => {
                const items = request.result as T[];
                const filteredItems = filter ? items.filter(filter) : items;
                resolve(filteredItems);
            }
            request.onerror = () => reject(request.error);
        })
    }

    /**泛型方法，过滤获取数据。先用索引过滤掉一批数据，再用过滤条件过滤数据
     * @example
     * var words = await db.search<Word>('words', 1, 'levelId', (word) => word.Name == 'apple'));
    */
    async search<T>(storeName: string, key: IDBValidKey | IDBKeyRange | null=null, index='', filter?: (item: T) => boolean): Promise<T[]> {
        if (!this.db) throw new Error('Database not initialized');
        return new Promise((resolve, reject) => {
            const request = this.query<T>(storeName, key, index);
            request.onsuccess = () => {
                const items = request.result as T[];
                const filteredItems = filter ? items.filter(filter) : items;
                resolve(filteredItems);
            }
            request.onerror = () => reject(request.error);
        })
    }


    /**泛型方法，添加数据 
     * @example
     * var word = await db.add<Word>('words', {levelId: 1, en: 'hello', cn: '你好'});
    */
    async add<T>(storeName: string, data: T): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');
        return new Promise((resolve, reject) => {
            const store = this.db!.transaction(storeName,'readwrite').objectStore(storeName);
            const request = store.add(data);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        })
    }

    /**泛型方法，更新数据 
     * @example
     * var word = await db.put<Word>('words', {levelId: 1, en: 'hello', cn: '你好'});
    */
    async put<T>(storeName: string, data: T): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');
        return new Promise((resolve, reject) => {
            const store = this.db!.transaction(storeName,'readwrite').objectStore(storeName);
            const request = store.put(data);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        })
    }

    /**泛型方法，删除数据 
     * @example
     * var word = await db.delete<Word>('words', [levelId, en]);
    */
    async delete(storeName: string, key: IDBValidKey | IDBKeyRange): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');
        return new Promise((resolve, reject) => {
            const store = this.db!.transaction(storeName,'readwrite').objectStore(storeName);
            const request = store.delete(key);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        })
    }


    //------------------------------------------------------
    // list operations
    //------------------------------------------------------
    /**从列表中获取指定页数据 */
    public getPageItems(items: any[], pageSize: number, pageId: number): any[] {
        const startIndex = pageId * pageSize;
        const endIndex = startIndex + pageSize;
        return items.slice(startIndex, endIndex);
    }

    /**获取列表的总页数 */
    public getPageCount(items: any[], pageSize: number): number {
        return Math.ceil(items.length / pageSize);
    }

    /**获取列表最前面一个 */
    public getFirst(items: any[]): any {
        return items[0];
    }

    /**获取列表最后一个 */
    public getLast(items: any[]): any {
        return items[items.length - 1];
    }

    /**获取随机打乱的列表 */
    public getShuffled(items: any[]): any[] {
        return items.sort(() => Math.random() - 0.5);
    }

    /**根据自定义的表达式排序 */
    public sort<T>(items: T[], expression: (a: T, b: T) => number): T[] {
        return items.sort(expression);
    }

    /**根据某个字段进行排序 */
    public sortByField(items: any[], field: string, sortDirection:boolean): any[] {
        if (sortDirection)
            return items.sort((a, b) => b[field] - a[field]);
        else
            return items.sort((a, b) => a[field] - b[field]);
    }

}