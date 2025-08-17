const tableBody = document.getElementById('tableBody');
let curCardList = [];

// ファイル名用の変換関数（スペース削除）
function formatCardName(name) {
  return name.replace(/\s+/g, '');
}
// ファイル名用の変換関数（スペースをアンダースコア）
function formatItemName(name) {
  return name.replace(/\s+/g, '');
}

// アイテムブロック生成
function createItemBlock(name) {
  const div = document.createElement('div');
  div.className = 'item-block';
  const img = document.createElement('img');
  img.src = `images/${formatItemName(name)}.jpg`;
  img.onerror = () => { div.textContent = name; };
  div.appendChild(img);
  return div;
}

// Minimum Lvl列生成
function createLevelCell(levelArr, cardList) {
  const td = document.createElement('td');
  td.className = 'level-cell';
  const wrapper = document.createElement('div');
  wrapper.className = 'level-wrapper';

  // levelArrが配列の配列ならそのまま、そうでなければ単一配列として扱う
  let arrs = [];
  if (Array.isArray(levelArr) && Array.isArray(levelArr[0])) {
    arrs = levelArr;
  } else if (Array.isArray(levelArr)) {
    arrs = [levelArr];
  } else {
    arrs = [];
  }

  if (arrs.length === 0 || arrs.every(a => a.length === 0)) {
    td.appendChild(wrapper);
    return td;
  }

  arrs.forEach((arr, idx) => {
    arr.forEach((lvl, i) => {
      if (lvl <= 0 || !cardList[i]) return;
      const div = document.createElement('div');
      div.className = 'level-block';

      const img = document.createElement('img');
      const cardName = cardList[i] || `Unknown Card ${i}`;
      img.src = `images/${formatCardName(cardName)}.jpg`;
      img.onerror = () => { div.textContent = cardList[i] + ' Lv.' + lvl; };
      div.appendChild(img);

      const lvText = document.createElement('div');
      lvText.className = 'level-text';
      lvText.textContent = 'Lv.' + lvl;
      div.appendChild(lvText);

      wrapper.appendChild(div);
    });
    // OR文字追加（最後以外）
    if (idx < arrs.length - 1) {
      const orDiv = document.createElement('div');
      orDiv.className = 'level-or';
      orDiv.textContent = 'OR';
      orDiv.style = "align-self: center; font-weight: bold; margin: 0 0px; color: #d2b48c;";
      wrapper.appendChild(orDiv);
    }
  });

  td.appendChild(wrapper);
  return td;
}

// Deck列生成（rankArrを追加）
function createDeckCell(deckArr, cardList, rankArr, infoStr) {
  const td = document.createElement('td');
  td.className = 'deck-cell';
  const wrapper = document.createElement('div');
  wrapper.className = 'deck-wrapper';

  if (!Array.isArray(deckArr) || deckArr.length === 0) {
    const noneDiv = document.createElement('div');
    noneDiv.className = 'deck-block';
    noneDiv.textContent = 'None';
    wrapper.appendChild(noneDiv);
    td.appendChild(wrapper);
    return td;
  }

  deckArr.forEach((count, idx) => {
    if (!cardList[idx]) return;
    for (let i = 0; i < count; i++) {
      const div = document.createElement('div');
      div.className = 'deck-block';
      const img = document.createElement('img');
      cardName = cardList[idx] || `Unknown Card ${idx}`;
      img.src = `images/${formatCardName(cardName)}.jpg`;
      img.onerror = () => { 
        div.textContent = cardList[idx]; 
      };
      div.appendChild(img);
      wrapper.appendChild(div);
    }
  });

  // ★ランク確率表示を追加
  if (Array.isArray(rankArr) && rankArr.length > 0) {
    
    const isMulti = Array.isArray(rankArr[0]);
    if (isMulti) {
      rankArrs = rankArr;
    } else {
      rankArrs = [rankArr];
    }
    rankArrs.forEach((rankArr) => {
      const rankTable = document.createElement('table');
      rankTable.className = 'rank-block-table';
      rankArr.forEach((p, i) => {
        const row = document.createElement('tr');
        const iconCell = document.createElement('td');
        iconCell.className = 'icon-cell';
        if (i > 0) {
          for (let j = 0; j < i; j++) {
            const rankIcon = document.createElement('img');
            rankIcon.src = `images/rank-icon.png`;
            rankIcon.style.height = '1em';
            iconCell.appendChild(rankIcon);
          }
        } else {
          iconCell.textContent = '-';
        }
        const percentCell = document.createElement('td');
        percentCell.textContent = `${p}%`;
        row.appendChild(iconCell);
        row.appendChild(percentCell);
        rankTable.appendChild(row);
      });
      wrapper.appendChild(rankTable);
    });
  }

  td.appendChild(wrapper);
  if (infoStr !== undefined && infoStr.trim() !== '') {
    const infoDiv = document.createElement('div');
    infoDiv.className = 'item-info';
    infoDiv.textContent = infoStr;
    infoDiv.style = "font-size: 1em; color: #f5f5f5; margin-top: 4px; text-align: left;";
    td.appendChild(infoDiv);
  }
  return td;
}

// アイテム行生成
function createItemRow(itemName, levelArr, deckArr, rankArr, infoStr, cardList, isSameAsPrev) {
  const tr = document.createElement('tr');

  const tdItem = document.createElement('td');
  tdItem.className = 'item-cell';

  if (!isSameAsPrev) {
    tdItem.appendChild(createItemBlock(itemName));
    tr.classList.add('item-first'); // 区切り線用クラス
  } else {
    tr.classList.add('item-continued'); // 続き用クラス
  }

  tr.appendChild(tdItem);
  tr.appendChild(createLevelCell(levelArr, cardList));
  tr.appendChild(createDeckCell(deckArr, cardList, rankArr, infoStr));

  tableBody.appendChild(tr);
}

let workplaces = {}; // { name: { cardList: [...], items: [...] } }
let currentWorkplace = '';

// items.txt読み込み
function parseItems() {
  fetch('items.txt') // ← ここを絶対パスに
    .then(res => res.text())
    .then(text => {
      const lines = text.split('\n');
      let workplace = '';
      let cardList = [];
      workplaces = {};
      let versionStr = '';
      let lastUpdatedStr = '';

      // VersionとLast updatedを取得
      for (let line of lines) {
        line = line.trim();
        if (line.startsWith('# Version')) {
          versionStr = line.split('=')[1]?.trim();
        }
        if (line.startsWith('# Last updated')) {
          lastUpdatedStr = line.split('=')[1]?.trim();
        }
        if (versionStr && lastUpdatedStr) break;
      }

      // ヘッダーに表示
      const versionEl = document.getElementById('version');
      versionEl.textContent = versionStr;
      const infoEl = document.getElementById('lastUpdated');
      let infoHtml = '';
      // if (versionStr) infoHtml += `Version: <strong>${versionStr}</strong> &nbsp; `;
      if (lastUpdatedStr) infoHtml += `Last updated: <strong>${lastUpdatedStr}</strong>`;
      infoEl.innerHTML = infoHtml;

      lines.forEach(line => {
        line = line.trim();
        if (!line) return;

        // Workplace名
        if (line.startsWith('## Workplace')) {
          workplace = line.split('=')[1].trim();
          workplaces[workplace] = { cardList: [], items: [] };
          return;
        }
        // card_list
        if (line.startsWith('## card_list')) {
          cardList = JSON.parse(line.split('=')[1].trim());
          if (workplace) workplaces[workplace].cardList = cardList;
          return;
        }
        // コメント行はスキップ
        if (line.startsWith('#')) return;

        // アイテム行
        const [itemName, levelStr, deckStr, rankStr, infoStr] = line.split('|').map(s => s.trim());
        if (!itemName || !workplace) return;
        let levelArr = [], deckArr = [], rankArr = [];
        try { levelArr = JSON.parse(levelStr || '[]'); } catch {}
        try { deckArr = JSON.parse(deckStr || '[]'); } catch {}
        try { rankArr = JSON.parse(rankStr || '[]'); } catch {}

        workplaces[workplace].items.push({
          itemName, levelArr, deckArr, rankArr, infoStr
        });
      });

      // Workplaceナビ生成
      createWorkplaceNav();
    });
}

function workplaceToPath(name) {
  return name.toLowerCase().replace(/\s+/g, '-');
}
function pathToWorkplace(path) {
  return Object.keys(workplaces).find(
    w => workplaceToPath(w) === path
  );
}

// Workplaceナビ生成
function createWorkplaceNav() {
  const nav = document.getElementById('workplaceNav');
  nav.innerHTML = '';

  // ALLタブ
  const allBtn = document.createElement('button');
  allBtn.textContent = 'ALL';
  allBtn.className = 'workplace-tab';
  // allBtn.onclick = () => page.show('/');
  allBtn.onclick = () => showWorkplace('ALL');
  nav.appendChild(allBtn);

  Object.keys(workplaces).forEach(name => {
    const btn = document.createElement('button');
    btn.textContent = name;
    btn.className = 'workplace-tab';
    // btn.onclick = () => page.redirect('/' + workplaceToPath(name));
    btn.onclick = () => showWorkplace(name);
    nav.appendChild(btn);
  });
  // 初期表示はALL
  currentWorkplace = 'ALL';
  showWorkplace('ALL');
}

function showWorkplace(name) {
  tableBody.innerHTML = '';
  let items = [];
  if (name === 'ALL') {
    Object.values(workplaces).forEach(wp => {
      wp.items.forEach(item => {
        items.push({ ...item, cardList: wp.cardList });
      });
    });
  } else {
    const wp = workplaces[name];
    if (!wp) return;
    items = wp.items.map(item => ({ ...item, cardList: wp.cardList }));
  }

  let prevItemName = null;
  items.forEach(({ itemName, levelArr, deckArr, rankArr, infoStr, cardList }) => {
    const isSameAsPrev = (itemName === prevItemName);
    createItemRow(itemName, levelArr, deckArr, rankArr, infoStr, cardList, isSameAsPrev);
    prevItemName = itemName;
  });

  // タブのactive切り替え
  document.querySelectorAll('.workplace-tab').forEach(tab => {
    tab.classList.toggle('active', tab.textContent === name);
  });
}

parseItems();

document.getElementById('captureBtn').addEventListener('click', () => {
  const btn = document.getElementById('captureBtn');
  btn.style.display = 'none'; // 一時的に非表示

  html2canvas(document.body, {
    useCORS: true,
    scale: 2
  }).then(canvas => {
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'process_card_deck_builds.png';
    link.click();
    btn.style.display = ''; // キャプチャ後に再表示
  });
});
