class Splitter {
  split(str: string, splitSize: number) {
    const length = str.length;
    const partSize = Math.floor(length / splitSize);  // 各部分の基本サイズ
    const remainder = length % splitSize;  // 余り

    return Array(splitSize).fill('').reduce((acc, _, i) => {
      // 各部分の終わりのインデックスを計算
      const start = acc.lastIndex;
      const end = start + partSize + (i < remainder ? 1 : 0);

      // 部分文字列を追加し、最後のインデックスを更新
      acc.parts.push(str.slice(start, end));
      acc.lastIndex = end;

      return acc;
    }, { parts: [], lastIndex: 0 }).parts;
  }
  concat(parts: string[]) {
    return parts.reduce((acc, part) => acc.concat(part), '');
  }
}
export const splitter = new Splitter();
