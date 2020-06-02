import BaseLexer from './base-lexer';

export default class JSONLexer extends BaseLexer {
    constructor(options = {}) {
        super(options)
    }

    recurse(obj, arr, path) {
        Object.keys(obj).forEach(key =>
            Object.prototype.toString.apply(obj[key]) === '[object Object]' ? 
                this.recurse(obj[key], arr, path ? path + '.' + key : key) :
                arr.push({ 
                    key: path ? path + '.' + key : key,
                    value: obj[key]
                })
        )

        return arr;
    }

    extract(content) {
        const json = JSON.parse(content);                    
        
        return this.recurse(json, []).map(x => ({
            key: x.key,
            defaultValue: x.value
        }));
    }
}