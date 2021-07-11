export class Orca {
  private defaultName_ = `orca-convert-${Math.round(Math.random() * 99)}`;
  private inputTxt_ = <HTMLElement>document.querySelector('#txt');
  private inputJSON_ = <HTMLElement>document.querySelector('#json');
  private inputOrca_ = <HTMLElement>document.querySelector('#orca');
  private downloadButtons_ = <NodeListOf<HTMLButtonElement>>document.querySelectorAll('.button__download');

  constructor() {
    this.attach_();
  }

  /**
   * Converts Orca.json to Orca.txt.
   * @returns Orca string data.
   */
  fromJSONtoStr(): string {
    const jsonStr = this.inputJSON_.innerText.trim();
    let str = '';

    if (jsonStr.length > 0) {
      const json = JSON.parse(jsonStr);

      for(let y in json[3]) {
        for (let x in json[3][y]) {
          str += json[3][y][x];
        }
        str += '\n';
      }

      this.inputTxt_.innerText = str.trim();
    }

    return str.trim();
  }

  /**
   * Converts Orca.orca to txt string.
   * @returns String from Orca.orca Lua table data.
   */
  fromLuatoStr(): string {
    const luaStr = this.inputOrca_.innerText.trim()
    const result = luaStr
      .replace(/return \{/g, '')
      .replace(/\}$/g, '')
      .replace(/\{/g, '[')
      .replace(/\}/g, ']')
      .replace(/\-\-.+/g, '')
      .replace(/\[0\].+/g, '');

    const func = new Function(`"use strict"; return [${result}]`);
    // const arr = (0, eval)(func());
    // const arr = eval(func());
    const arr = func();

    let out = '';
    arr.forEach((line: string, index: number) => {
      if (index > 1) {
        Array.from(line).forEach((char: string) => {
          out += `${char}`;
        });
        out += `\r`;
      }
    });

    this.inputTxt_.innerText = out.trim();

    return this.inputTxt_.innerText;
  }

  /**
   * Converts Orca txt to Orca.json.
   * @returns JSON from Orca string data.
   */
  fromTXTtoJSON(): string {
    const lines = this.inputTxt_.innerText.split('\n');
    let orcaArr: Array<string | number | string[][]> = [];

    if (lines.length > 0) {
      let cell: string[][] = [];
      for (let line of lines) {
        let chars = [];
        for (let i in Array.from(line)) {
          chars.push(line[i]);
        }
        cell.push(chars);
      }

      orcaArr = [
        this.defaultName_,
        lines[0].length - 1,
        lines.length - 1,
        cell,
      ];

      this.inputJSON_.innerText = JSON.stringify(orcaArr, null, 2);
    }

    return JSON.stringify(orcaArr);
  }

  /**
   * Converts Orca txt to Orca.orca.
   * @returns Luta tables from Orca string data.
   */
  fromTXTtoLua() {
    const lines = this.inputTxt_.innerText.trim().split('\n');
    let out = `return {\r`;

    if (lines.length > 0) {
      out += `-- Table: {1}\r`;
      out += `{\r`;
      out += `  "${this.defaultName_}",\r`,
      out += `  ${lines[0].length - 1},\r`;
      out += `  ${lines.length - 1},\r`;
      out += `  {2},\r`;
      out += `},\r`;

      out += `-- Table: {2}\r`;
      out += `{\r`;
      let i = 3
      for (i; i < 28; i++) {
        out += `  {${i}},\r`;
      }
      out += `  [0]={${i}},\r`;
      out += `},\r`;

      lines.forEach((line, index) => {
        out += `-- Table: {${index + 3}}\r`
        out += `{\r`;
        for (let char of line) {
          out += `  "${char}",\r`;
        }
        out += `  [0]=".",\r`
        out += `},\r`;
      });
    }

    out += `}`;
    this.inputOrca_.innerText = out.trim();

    return out.trim();
  }

  /** Downloads given text strings as file. */
  private download_(filename: string, text: string) {
    const element = document.createElement('a');
    element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`);
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  /** Attaches event listeners. */
  private attach_() {
    this.inputTxt_.addEventListener('input', () => {
      this.fromTXTtoJSON();
      this.fromTXTtoLua();
    });

    this.inputJSON_.addEventListener('input', () => {
      this.fromJSONtoStr();
      this.fromTXTtoLua();
    });

    this.inputOrca_.addEventListener('input', () => {
      this.fromLuatoStr();
      this.fromTXTtoJSON();
    });

    Array.from(this.downloadButtons_).forEach((button: HTMLButtonElement) => {
      button.addEventListener('click', (event: Event) => {
        const target = <HTMLButtonElement>event.target;
        const extension = target.dataset.ext;
        const content = <HTMLElement>document.querySelector(`#${extension}`);

        if (content.innerText) {
          this.download_(`${this.defaultName_}.${extension}`, content.innerText);
        }
      });
    });

    window.addEventListener('paste', (event) => {
      event.preventDefault();
      const pasteEvent = <ClipboardEvent>event;
      const text = pasteEvent.clipboardData?.getData('text/plain') || '';
      document.execCommand('insertHTML', false, text.trim());
    });
  }
}
