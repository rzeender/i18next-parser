import BaseLexer from './base-lexer';
import JavascriptLexer from './javascript-lexer';
import cheerio from 'cheerio'

export default class HTMLLexer extends BaseLexer {
  constructor(options = {}) {
    super(options)

    this.attr = options.attr || 'data-bind'
    this.optionAttr = options.optionAttr || 'data-i18n-options'
  }

  parse(str) {
    let result = [], item = '', depth = 0;
  
    function push() { if (item) result.push(item); item = ''; }
  
    for (let i = 0, c; c = str[i], i < str.length; i++) {
      if (!depth && c === ',') push();
      else {
        item += c;
        if (c === '{') depth++;
        if (c === '}') depth--;
      }
    }
    
    push();
    return result;
  }

  extract(content) {
    const that = this
    const $ = cheerio.load(content, {
      xml: {
        normalizeWhitespace: true,
      }
    })

    const $$ = cheerio.load(content);

    $$('script[type="text/javascript"]:not([src])').each((index, node) => {
      const $node = $(node);
      $node[0].children.forEach(x => {
        const jsLexer = new JavascriptLexer({sourceType: 'script'});
        //strip mustache tags
        let sanitized = x.data
          .replace(/{{{(#|\^).*?}}}|{{(#|\^).*?}}/g, '')
          .replace(/{{{\/.*?}}}|{{\/.*?}}/g, '')
          .replace(/({{{[^#\^]*?}}}|{{[^#\^]*?}})/g, undefined);

        const keys = jsLexer.extract(sanitized);
        this.keys = this.keys.concat(keys);
      });
    })

    $(`[${that.attr}]`).each((index, node) => {
      let attr = node.attribs[that.attr];
      const pattern = /("|')?i18n("|')?\s*?:/;      
      const htmlTag = /^\[[a-zA-Z0-9_-]*\]/;

      if(!pattern.test(attr)) {
        return;
      } else if(attr.trim().startsWith('{') && attr.trim().endsWith('}')) {
        attr = attr.trim().substr(1).slice(0, -1).trim();
      }

      const i18nChunk = this.parse(attr).filter(x => pattern.test(x)).shift();            
      const arr = i18nChunk.split(pattern);    
      
      const expression = arr[arr.length - 1].trim();             
      let rawKey; 
      let val;

      try {        
          val = new Function('return (' + expression + ');')();        
      } catch (e) {}
      
      if (typeof val === 'string') {
        rawKey = val;
      } else if (Object.prototype.toString.call(val) === '[object Object]') {        
        rawKey = val.key;
      } else {
        return;
      }                

      const $node = cheerio.load(node)

      // the attribute can hold multiple keys
      const keys = rawKey.split(';')
      let options = node.attribs[that.optionAttr]

      if (options) {
        try {
          options = JSON.parse(options)
        }
        finally {}
      }

      for (let key of keys) {
        const isHtml = new RegExp(htmlTag).test(key);
        // remove any leading [] in the key
        key = key.replace(htmlTag, '')

        // if empty grab innerHTML from regex
        key = key || $node.text()        

        if (key) {
          this.keys.push({ ...options, key, defaultValue: (( isHtml ? $(node).html() : $node.text()) || '').trim() })
        }
      }
    })
    
    return this.keys
  }
}
